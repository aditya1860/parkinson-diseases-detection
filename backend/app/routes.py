import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from typing import Dict, Any, List

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.schemas import (
    VoiceInput, PredictionOutput, ModelInfoOutput, HealthResponse,
    HEALTHY_SAMPLE, PARKINSONS_SAMPLE
)
from ml.data_loader import FEATURE_COLUMNS
from ml.explain import ModelExplainer
from ml.train import MODEL_FILE
from ml.evaluate import REPORT_FILE

router = APIRouter()

# Global state holders for model, scaler, explainer
MODEL_BUNDLE = None
EXPLAINER = None

def load_model_bundle():
    global MODEL_BUNDLE, EXPLAINER
    if os.path.exists(MODEL_FILE):
        try:
            MODEL_BUNDLE = joblib.load(MODEL_FILE)
            model = MODEL_BUNDLE["model"]
            EXPLAINER = ModelExplainer(model)
            print(f"Loaded model artifact from {MODEL_FILE}")
        except Exception as e:
            print(f"Error loading model artifact: {e}")
            MODEL_BUNDLE = None
            EXPLAINER = None
    else:
        print(f"Model file not found at {MODEL_FILE}. Run run_training.py first.")

# Initial load
load_model_bundle()

@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        model_loaded=MODEL_BUNDLE is not None,
        version="1.0.0"
    )

@router.get("/presets/{preset_type}")
def get_sample_preset(preset_type: str):
    if preset_type.lower() in ["healthy", "normal"]:
        return HEALTHY_SAMPLE
    elif preset_type.lower() in ["parkinsons", "patient"]:
        return PARKINSONS_SAMPLE
    else:
        raise HTTPException(status_code=400, detail="Invalid preset type. Use 'healthy' or 'parkinsons'.")

@router.get("/model-info", response_model=ModelInfoOutput)
def get_model_info():
    if not os.path.exists(REPORT_FILE):
        raise HTTPException(status_code=404, detail="Model report not found. Train model first.")
    
    try:
        with open(REPORT_FILE, "r") as f:
            report_data = json.load(f)
        
        return ModelInfoOutput(
            model_name=report_data.get("model_name", "Tuned Model"),
            metrics=report_data.get("metrics", {}),
            confusion_matrix=report_data.get("confusion_matrix", {}),
            rf_metrics=report_data.get("rf_metrics", report_data.get("metrics", {})),
            rf_confusion_matrix=report_data.get("rf_confusion_matrix", report_data.get("confusion_matrix", {})),
            svm_metrics=report_data.get("svm_metrics", report_data.get("metrics", {})),
            svm_confusion_matrix=report_data.get("svm_confusion_matrix", report_data.get("confusion_matrix", {})),
            feature_names=FEATURE_COLUMNS,
            global_shap_importance=report_data.get("global_shap_importance", {}),
            training_meta=report_data.get("training_meta", {}),
            data_stats=report_data.get("data_stats", {})
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read model info: {str(e)}")

@router.post("/predict", response_model=PredictionOutput)
def predict_single_sample(input_data: VoiceInput):
    global MODEL_BUNDLE, EXPLAINER
    if MODEL_BUNDLE is None or EXPLAINER is None:
        load_model_bundle()
        if MODEL_BUNDLE is None:
            raise HTTPException(status_code=53, detail="ML Model artifact not available. Please train model.")

    model = MODEL_BUNDLE["model"]
    scaler = MODEL_BUNDLE["scaler"]
    model_name = MODEL_BUNDLE.get("metadata", {}).get("best_model_name", type(model).__name__)

    # Convert input to DataFrame using feature names order
    input_dict = input_data.model_dump(by_alias=True)
    
    row_values = []
    for col in FEATURE_COLUMNS:
        if col not in input_dict:
            raise HTTPException(status_code=422, detail=f"Missing feature: {col}")
        row_values.append(float(input_dict[col]))

    raw_sample = np.array(row_values).reshape(1, -1)
    scaled_sample = scaler.transform(raw_sample)

    # Inference
    prediction_label = int(model.predict(scaled_sample)[0])
    
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(scaled_sample)[0]
        prob_healthy = float(probabilities[0])
        prob_parkinsons = float(probabilities[1])
    else:
        prob_parkinsons = 1.0 if prediction_label == 1 else 0.0
        prob_healthy = 1.0 - prob_parkinsons

    prediction_text = "Parkinson's Detected" if prediction_label == 1 else "Healthy"
    confidence = prob_parkinsons if prediction_label == 1 else prob_healthy

    # Dual SHAP + LIME Attribution
    shap_dict, lime_exp, top_features = EXPLAINER.explain_sample(scaled_sample)

    # Clinical Summary Construction
    top_3_str = ", ".join(top_features)
    if prediction_label == 1:
        summary = (
            f"High likelihood of Parkinson's detected ({confidence * 100:.1f}% confidence using {model_name}). "
            f"The primary biomarkers driving this risk calculation are {top_3_str}, reflecting "
            f"increased vocal perturbation and pitch period entropy."
        )
    else:
        summary = (
            f"Vocal profile indicates Healthy parameters ({confidence * 100:.1f}% confidence using {model_name}). "
            f"Key metrics including {top_3_str} fall within expected physiological baselines."
        )

    return PredictionOutput(
        prediction=prediction_text,
        prediction_label=prediction_label,
        confidence=round(confidence, 4),
        model_used=model_name,
        probability_parkinsons=round(prob_parkinsons, 4),
        probability_healthy=round(prob_healthy, 4),
        shap_values=shap_dict,
        lime_explanation=lime_exp,
        top_features=top_features,
        clinical_summary=summary
    )

@router.post("/predict-csv")
async def predict_csv_batch(file: UploadFile = File(...)):
    global MODEL_BUNDLE, EXPLAINER
    if MODEL_BUNDLE is None or EXPLAINER is None:
        load_model_bundle()
        if MODEL_BUNDLE is None:
            raise HTTPException(status_code=503, detail="ML Model artifact not available.")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a .csv file.")

    model = MODEL_BUNDLE["model"]
    scaler = MODEL_BUNDLE["scaler"]
    model_name = MODEL_BUNDLE.get("metadata", {}).get("best_model_name", type(model).__name__)

    try:
        df = pd.read_csv(file.file)
        df.columns = [c.strip() for c in df.columns]

        missing_cols = [col for col in FEATURE_COLUMNS if col not in df.columns]
        if missing_cols:
            raise HTTPException(status_code=400, detail=f"CSV missing required columns: {missing_cols}")

        X_raw = df[FEATURE_COLUMNS].values
        X_scaled = scaler.transform(X_raw)

        preds = model.predict(X_scaled)
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_scaled)[:, 1]
        else:
            probs = preds.astype(float)

        results = []
        for i in range(len(df)):
            label = int(preds[i])
            prob_p = float(probs[i])
            prob_h = 1.0 - prob_p
            pred_text = "Parkinson's Detected" if label == 1 else "Healthy"
            conf = prob_p if label == 1 else prob_h
            
            sample_shap, sample_lime, top_feats = EXPLAINER.explain_sample(X_scaled[i:i+1])

            results.append({
                "row_index": i,
                "prediction": pred_text,
                "prediction_label": label,
                "confidence": round(conf, 4),
                "model_used": model_name,
                "probability_parkinsons": round(prob_p, 4),
                "probability_healthy": round(prob_h, 4),
                "top_features": top_feats,
                "shap_values": sample_shap,
                "lime_explanation": sample_lime
            })

        return {
            "total_rows": len(results),
            "parkinsons_count": sum(1 for r in results if r["prediction_label"] == 1),
            "healthy_count": sum(1 for r in results if r["prediction_label"] == 0),
            "results": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")
