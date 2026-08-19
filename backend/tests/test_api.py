import os
import sys
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.schemas import HEALTHY_SAMPLE, PARKINSONS_SAMPLE

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_preset_endpoint():
    response = client.get("/api/presets/healthy")
    assert response.status_code == 200
    healthy_data = response.json()
    assert "MDVP:Fo(Hz)" in healthy_data

def test_predict_endpoint_healthy_shap_and_lime():
    response = client.post("/api/predict", json=HEALTHY_SAMPLE)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "confidence" in data
    assert "model_used" in data
    assert "shap_values" in data
    assert "lime_explanation" in data
    assert isinstance(data["lime_explanation"], list)
    assert len(data["lime_explanation"]) > 0
    assert "feature" in data["lime_explanation"][0]
    assert "weight" in data["lime_explanation"][0]

def test_model_info_rf_vs_svm():
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "rf_metrics" in data
    assert "svm_metrics" in data
    assert "rf_confusion_matrix" in data
    assert "svm_confusion_matrix" in data
