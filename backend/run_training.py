import os
import sys
import json
import joblib
import pandas as pd

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ml.data_loader import fetch_and_load_data, FEATURE_COLUMNS
from ml.preprocess import preprocess_data
from ml.train import train_and_select_best_model, save_artifact, MODEL_FILE
from ml.evaluate import evaluate_models, REPORT_FILE
from ml.explain import ModelExplainer

def run_pipeline():
    print("=" * 60)
    print("  PARKINSON'S DISEASE ML PIPELINE (RF vs SVM + SHAP & LIME) ")
    print("=" * 60)

    # 1. Ingestion
    print("\n[Step 1] Loading & cleaning UCI Parkinson's dataset...")
    df = fetch_and_load_data()
    print(f"Loaded dataset: {df.shape[0]} records x {df.shape[1]} columns.")

    # 2. Preprocessing & SMOTE
    print("\n[Step 2] Preprocessing features & applying SMOTE class balancing...")
    X_train, y_train, X_test, y_test, scaler, stats = preprocess_data(df)
    print(f"Training distribution (after SMOTE): {stats['resampled_train_class_counts']}")
    print(f"Test samples: {stats['test_samples']}")

    # 3. Model Training & Cross-Validation & Tuning (RF vs SVM)
    print("\n[Step 3] Training Random Forest vs. SVM with GridSearchCV tuning...")
    best_model, rf_model, svm_model, train_meta = train_and_select_best_model(X_train, y_train)

    # 4. Evaluation
    print("\n[Step 4] Evaluating both models on holdout test dataset...")
    report_data = evaluate_models(
        winning_model=best_model,
        rf_model=rf_model,
        svm_model=svm_model,
        X_test=X_test,
        y_test=y_test,
        winning_model_name=train_meta["best_model_name"],
        save_path=REPORT_FILE
    )

    # 5. SHAP & LIME Explainability Setup
    print("\n[Step 5] Initializing SHAP & LIME Tabular Explainers...")
    explainer = ModelExplainer(best_model, X_train)
    global_shap = explainer.get_global_importance(X_test)
    
    # Attach global SHAP and metadata to report JSON
    report_data["global_shap_importance"] = global_shap
    report_data["training_meta"] = train_meta
    report_data["data_stats"] = stats

    with open(REPORT_FILE, "w") as f:
        json.dump(report_data, f, indent=2)

    # 6. Save Model Bundle Artifact
    print("\n[Step 6] Serializing production artifact bundle...")
    save_artifact(
        winning_model=best_model,
        rf_model=rf_model,
        svm_model=svm_model,
        scaler=scaler,
        metadata={
            "best_model_name": train_meta["best_model_name"],
            "metrics": report_data["metrics"],
            "rf_metrics": report_data["rf_metrics"],
            "svm_metrics": report_data["svm_metrics"],
            "data_stats": stats,
            "global_shap_importance": global_shap
        },
        file_path=MODEL_FILE
    )

    print("\n" + "=" * 60)
    print(" SUCCESS: ML Training Pipeline Complete!")
    print(f" Selected Winner: {train_meta['best_model_name']}")
    print(f" Test Accuracy:  {report_data['metrics']['accuracy']:.4f}")
    print(f" Test F1-Score:  {report_data['metrics']['f1_score']:.4f}")
    print(f" Test ROC-AUC:   {report_data['metrics']['roc_auc']:.4f}")
    print("=" * 60)

if __name__ == "__main__":
    run_pipeline()
