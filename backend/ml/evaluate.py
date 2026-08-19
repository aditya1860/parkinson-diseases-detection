import os
import json
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from typing import Dict, Any

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
REPORT_FILE = os.path.join(REPORTS_DIR, "model_report.json")

def get_single_model_metrics(model: Any, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
    y_pred = model.predict(X_test)
    
    if hasattr(model, "predict_proba"):
        y_proba = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, "decision_function"):
        y_proba = model.decision_function(X_test)
    else:
        y_proba = y_pred

    accuracy = float(accuracy_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    
    try:
        roc_auc = float(roc_auc_score(y_test, y_proba))
    except Exception:
        roc_auc = 0.0

    cm = confusion_matrix(y_test, y_pred).tolist()

    return {
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4)
        },
        "confusion_matrix": {
            "true_negative": cm[0][0],
            "false_positive": cm[0][1],
            "false_negative": cm[1][0],
            "true_positive": cm[1][1],
            "matrix_2d": cm
        },
        "classification_report": classification_report(y_test, y_pred, output_dict=True)
    }

def evaluate_models(
    winning_model: Any,
    rf_model: Any,
    svm_model: Any,
    X_test: np.ndarray,
    y_test: np.ndarray,
    winning_model_name: str,
    save_path: str = REPORT_FILE
) -> Dict[str, Any]:
    """
    Evaluates both Random Forest and SVM on test dataset and saves side-by-side JSON report.
    """
    rf_report = get_single_model_metrics(rf_model, X_test, y_test)
    svm_report = get_single_model_metrics(svm_model, X_test, y_test)
    winner_report = get_single_model_metrics(winning_model, X_test, y_test)

    report_data = {
        "model_name": winning_model_name,
        "metrics": winner_report["metrics"],
        "confusion_matrix": winner_report["confusion_matrix"],
        "rf_metrics": rf_report["metrics"],
        "rf_confusion_matrix": rf_report["confusion_matrix"],
        "svm_metrics": svm_report["metrics"],
        "svm_confusion_matrix": svm_report["confusion_matrix"],
    }

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(save_path, "w") as f:
        json.dump(report_data, f, indent=2)

    print(f"Side-by-side model evaluation report saved to {save_path}")
    print(f"[Random Forest Test] Acc: {rf_report['metrics']['accuracy']:.4f} | F1: {rf_report['metrics']['f1_score']:.4f} | ROC-AUC: {rf_report['metrics']['roc_auc']:.4f}")
    print(f"[SVM Test]           Acc: {svm_report['metrics']['accuracy']:.4f} | F1: {svm_report['metrics']['f1_score']:.4f} | ROC-AUC: {svm_report['metrics']['roc_auc']:.4f}")

    return report_data
