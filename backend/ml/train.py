import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import StratifiedKFold, cross_validate, GridSearchCV
from typing import Dict, Any, Tuple

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ml.data_loader import FEATURE_COLUMNS, fetch_and_load_data
from ml.preprocess import preprocess_data

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
MODEL_FILE = os.path.join(MODELS_DIR, "parkinsons_model.joblib")

def train_and_select_best_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    random_state: int = 42
) -> Tuple[Any, Any, Dict[str, Any]]:
    """
    Trains Random Forest and SVM Classifiers, performs GridSearchCV hyperparameter tuning on SVM,
    cross-validates both, and selects the winner based on F1-score & ROC-AUC.
    Returns:
        winning_model, trained_rf_model, trained_svm_model, training_metadata
    """
    # 1. Base Models
    rf_base = RandomForestClassifier(random_state=random_state, n_estimators=100, max_depth=10)
    svm_base = SVC(random_state=random_state, probability=True)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)

    # 2. Cross Validation Comparison
    print("\n--- 5-Fold Stratified Cross-Validation Benchmark ---")
    
    # Evaluate Random Forest
    rf_cv = cross_validate(rf_base, X_train, y_train, cv=cv, scoring=['accuracy', 'precision', 'recall', 'f1', 'roc_auc'])
    rf_summary = {
        "mean_accuracy": float(np.mean(rf_cv['test_accuracy'])),
        "mean_precision": float(np.mean(rf_cv['test_precision'])),
        "mean_recall": float(np.mean(rf_cv['test_recall'])),
        "mean_f1": float(np.mean(rf_cv['test_f1'])),
        "mean_roc_auc": float(np.mean(rf_cv['test_roc_auc']))
    }
    print(f"[Random Forest] Acc: {rf_summary['mean_accuracy']:.4f} | F1: {rf_summary['mean_f1']:.4f} | ROC-AUC: {rf_summary['mean_roc_auc']:.4f}")

    # Evaluate Base SVM
    svm_cv = cross_validate(svm_base, X_train, y_train, cv=cv, scoring=['accuracy', 'precision', 'recall', 'f1', 'roc_auc'])
    svm_summary = {
        "mean_accuracy": float(np.mean(svm_cv['test_accuracy'])),
        "mean_precision": float(np.mean(svm_cv['test_precision'])),
        "mean_recall": float(np.mean(svm_cv['test_recall'])),
        "mean_f1": float(np.mean(svm_cv['test_f1'])),
        "mean_roc_auc": float(np.mean(svm_cv['test_roc_auc']))
    }
    print(f"[SVM Base]       Acc: {svm_summary['mean_accuracy']:.4f} | F1: {svm_summary['mean_f1']:.4f} | ROC-AUC: {svm_summary['mean_roc_auc']:.4f}")

    # 3. Hyperparameter Tuning for SVM via GridSearchCV
    print("\n[Tuning] Running GridSearchCV on SVM...")
    svm_param_grid = {
        "C": [0.1, 1, 10, 50],
        "gamma": ['scale', 'auto', 0.01, 0.1],
        "kernel": ['rbf', 'linear']
    }
    svm_grid = GridSearchCV(estimator=svm_base, param_grid=svm_param_grid, cv=cv, scoring='f1', n_jobs=-1)
    svm_grid.fit(X_train, y_train)
    
    tuned_svm_model = svm_grid.best_estimator_
    tuned_svm_score = float(svm_grid.best_score_)
    print(f"[SVM Tuned]      Best CV F1: {tuned_svm_score:.4f} with params: {svm_grid.best_params_}")

    # Fit Random Forest on full training set
    rf_base.fit(X_train, y_train)

    # Compare Tuned SVM vs Random Forest
    rf_score = rf_summary['mean_f1']

    if tuned_svm_score >= rf_score:
        winning_model = tuned_svm_model
        winning_model_name = "SVM (Tuned)"
        winning_score = tuned_svm_score
    else:
        winning_model = rf_base
        winning_model_name = "Random Forest"
        winning_score = rf_score

    print(f"\n[WINNER] Selected: [{winning_model_name}] (CV F1: {winning_score:.4f})")

    cv_results = {
        "Random Forest": rf_summary,
        "SVM (Tuned)": {
            "mean_accuracy": float(svm_grid.cv_results_['mean_test_score'][svm_grid.best_index_]),
            "mean_f1": tuned_svm_score,
            "best_params": {k: (int(v) if isinstance(v, (np.integer, int)) else float(v) if isinstance(v, (np.floating, float)) else str(v)) for k, v in svm_grid.best_params_.items()}
        }
    }

    training_metadata = {
        "cv_results": cv_results,
        "best_model_name": winning_model_name,
        "rf_summary": rf_summary,
        "svm_summary": {
            "best_cv_f1": tuned_svm_score,
            "best_params": svm_grid.best_params_
        }
    }

    return winning_model, rf_base, tuned_svm_model, training_metadata

def save_artifact(winning_model: Any, rf_model: Any, svm_model: Any, scaler: Any, metadata: Dict[str, Any], file_path: str = MODEL_FILE):
    """
    Saves model bundle (winning_model, rf_model, svm_model, scaler, feature_names, metadata) to joblib artifact.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    payload = {
        "model": winning_model,
        "rf_model": rf_model,
        "svm_model": svm_model,
        "scaler": scaler,
        "feature_names": FEATURE_COLUMNS,
        "metadata": metadata
    }
    joblib.dump(payload, file_path)
    print(f"Saved production model artifact bundle to {file_path}")
