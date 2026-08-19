import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from typing import Tuple, Dict, Any

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ml.data_loader import FEATURE_COLUMNS, TARGET_COLUMN

def preprocess_data(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42,
    use_smote: bool = True
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, StandardScaler, Dict[str, Any]]:
    """
    Extracts features/target, performs stratified train/test split,
    applies StandardScaler and SMOTE oversampling to training set.
    """
    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].values.astype(int)

    # Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    # Standard Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Handle Class Imbalance with SMOTE on training data
    if use_smote:
        smote = SMOTE(random_state=random_state)
        X_train_res, y_train_res = smote.fit_resample(X_train_scaled, y_train)
    else:
        X_train_res, y_train_res = X_train_scaled, y_train

    # Convert dict keys/values to native Python types for JSON serialization
    orig_distribution = {int(k): int(v) for k, v in dict(pd.Series(y_train).value_counts()).items()}
    res_distribution = {int(k): int(v) for k, v in dict(pd.Series(y_train_res).value_counts()).items()}
    test_distribution = {int(k): int(v) for k, v in dict(pd.Series(y_test).value_counts()).items()}

    stats = {
        "original_train_class_counts": orig_distribution,
        "resampled_train_class_counts": res_distribution,
        "test_class_counts": test_distribution,
        "total_samples": int(len(df)),
        "train_samples": int(len(X_train_res)),
        "test_samples": int(len(X_test))
    }

    return X_train_res, y_train_res, X_test_scaled, y_test, scaler, stats
