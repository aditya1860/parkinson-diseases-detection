import os
import sys
import pytest
import pandas as pd
import numpy as np

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ml.data_loader import fetch_and_load_data, FEATURE_COLUMNS, TARGET_COLUMN
from ml.preprocess import preprocess_data

def test_data_loader():
    df = fetch_and_load_data()
    assert isinstance(df, pd.DataFrame)
    assert not df.empty
    assert TARGET_COLUMN in df.columns
    for col in FEATURE_COLUMNS:
        assert col in df.columns

def test_preprocess_shapes_and_smote():
    df = fetch_and_load_data()
    X_train, y_train, X_test, y_test, scaler, stats = preprocess_data(df, test_size=0.2, use_smote=True)
    
    # Verify features count matches 22
    assert X_train.shape[1] == len(FEATURE_COLUMNS)
    assert X_test.shape[1] == len(FEATURE_COLUMNS)

    # Verify SMOTE class balance (class 0 count == class 1 count in training set)
    counts = dict(pd.Series(y_train).value_counts())
    assert counts[0] == counts[1]

    # Verify scaling mean is approx 0
    assert abs(np.mean(X_train)) < 1.0
