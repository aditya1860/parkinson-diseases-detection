from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional

class VoiceInput(BaseModel):
    mdvp_fo: float = Field(..., alias="MDVP:Fo(Hz)", description="Average vocal fundamental frequency (Hz)")
    mdvp_fhi: float = Field(..., alias="MDVP:Fhi(Hz)", description="Maximum vocal fundamental frequency (Hz)")
    mdvp_flo: float = Field(..., alias="MDVP:Flo(Hz)", description="Minimum vocal fundamental frequency (Hz)")
    
    mdvp_jitter_pct: float = Field(..., alias="MDVP:Jitter(%)", description="MDVP percentage jitter")
    mdvp_jitter_abs: float = Field(..., alias="MDVP:Jitter(Abs)", description="MDVP absolute jitter in microseconds")
    mdvp_rap: float = Field(..., alias="MDVP:RAP", description="MDVP relative amplitude perturbation")
    mdvp_ppq: float = Field(..., alias="MDVP:PPQ", description="MDVP five-point period perturbation quotient")
    jitter_ddp: float = Field(..., alias="Jitter:DDP", description="Average absolute difference of differences between jitter cycles")
    
    mdvp_shimmer: float = Field(..., alias="MDVP:Shimmer", description="MDVP local shimmer")
    mdvp_shimmer_db: float = Field(..., alias="MDVP:Shimmer(dB)", description="MDVP local shimmer in dB")
    shimmer_apq3: float = Field(..., alias="Shimmer:APQ3", description="Three-point amplitude perturbation quotient")
    shimmer_apq5: float = Field(..., alias="Shimmer:APQ5", description="Five-point amplitude perturbation quotient")
    mdvp_apq: float = Field(..., alias="MDVP:APQ", description="MDVP 11-point amplitude perturbation quotient")
    shimmer_dda: float = Field(..., alias="Shimmer:DDA", description="Average absolute difference between consecutive amplitude differences")
    
    nhr: float = Field(..., alias="NHR", description="Noise-to-harmonics ratio")
    hnr: float = Field(..., alias="HNR", description="Harmonics-to-noise ratio")
    
    rpde: float = Field(..., alias="RPDE", description="Recurrence period density entropy")
    dfa: float = Field(..., alias="DFA", description="Detrended fluctuation analysis signal exponent")
    
    spread1: float = Field(..., alias="spread1", description="Nonlinear measure of fundamental frequency variation 1")
    spread2: float = Field(..., alias="spread2", description="Nonlinear measure of fundamental frequency variation 2")
    d2: float = Field(..., alias="D2", description="Correlation dimension dynamical complexity measure")
    ppe: float = Field(..., alias="PPE", description="Pitch period entropy")

    class Config:
        populate_by_name = True

class LimeItem(BaseModel):
    feature: str
    weight: float

class PredictionOutput(BaseModel):
    prediction: str  # "Parkinson's Detected" | "Healthy"
    prediction_label: int  # 1 | 0
    confidence: float
    model_used: str  # e.g., "Random Forest" | "SVM (Tuned)"
    probability_parkinsons: float
    probability_healthy: float
    shap_values: Dict[str, float]
    lime_explanation: List[LimeItem]
    top_features: List[str]
    clinical_summary: str

class ModelInfoOutput(BaseModel):
    model_name: str
    metrics: Dict[str, float]
    confusion_matrix: Dict[str, Any]
    rf_metrics: Dict[str, float]
    rf_confusion_matrix: Dict[str, Any]
    svm_metrics: Dict[str, float]
    svm_confusion_matrix: Dict[str, Any]
    feature_names: List[str]
    global_shap_importance: Dict[str, float]
    training_meta: Dict[str, Any]
    data_stats: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str = "1.0.0"

# Preset patient samples for demo
HEALTHY_SAMPLE = {
    "MDVP:Fo(Hz)": 197.07600,
    "MDVP:Fhi(Hz)": 206.89600,
    "MDVP:Flo(Hz)": 192.05500,
    "MDVP:Jitter(%)": 0.00289,
    "MDVP:Jitter(Abs)": 0.00001,
    "MDVP:RAP": 0.00166,
    "MDVP:PPQ": 0.00168,
    "Jitter:DDP": 0.00498,
    "MDVP:Shimmer": 0.01098,
    "MDVP:Shimmer(dB)": 0.09700,
    "Shimmer:APQ3": 0.00563,
    "Shimmer:APQ5": 0.00680,
    "MDVP:APQ": 0.00802,
    "Shimmer:DDA": 0.01689,
    "NHR": 0.00339,
    "HNR": 26.77500,
    "RPDE": 0.422229,
    "DFA": 0.741367,
    "spread1": -7.348300,
    "spread2": 0.177551,
    "D2": 1.743867,
    "PPE": 0.085569
}

PARKINSONS_SAMPLE = {
    "MDVP:Fo(Hz)": 119.99200,
    "MDVP:Fhi(Hz)": 157.30200,
    "MDVP:Flo(Hz)": 74.99700,
    "MDVP:Jitter(%)": 0.00784,
    "MDVP:Jitter(Abs)": 0.00007,
    "MDVP:RAP": 0.00370,
    "MDVP:PPQ": 0.00554,
    "Jitter:DDP": 0.01109,
    "MDVP:Shimmer": 0.04374,
    "MDVP:Shimmer(dB)": 0.42600,
    "Shimmer:APQ3": 0.02182,
    "Shimmer:APQ5": 0.03130,
    "MDVP:APQ": 0.02971,
    "Shimmer:DDA": 0.06545,
    "NHR": 0.02211,
    "HNR": 21.03300,
    "RPDE": 0.414783,
    "DFA": 0.815285,
    "spread1": -4.813031,
    "spread2": 0.266482,
    "D2": 2.301442,
    "PPE": 0.284654
}
