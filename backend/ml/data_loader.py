import os
import urllib.request
import pandas as pd
import numpy as np

UCI_PARKINSONS_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/parkinsons/parkinsons.data"
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DATA_FILE = os.path.join(DATA_DIR, "parkinsons.csv")

FEATURE_COLUMNS = [
    "MDVP:Fo(Hz)", "MDVP:Fhi(Hz)", "MDVP:Flo(Hz)",
    "MDVP:Jitter(%)", "MDVP:Jitter(Abs)", "MDVP:RAP", "MDVP:PPQ", "Jitter:DDP",
    "MDVP:Shimmer", "MDVP:Shimmer(dB)", "Shimmer:APQ3", "Shimmer:APQ5", "MDVP:APQ", "Shimmer:DDA",
    "NHR", "HNR",
    "RPDE", "DFA",
    "spread1", "spread2", "D2", "PPE"
]

TARGET_COLUMN = "status"

def fetch_and_load_data(data_path: str = DATA_FILE) -> pd.DataFrame:
    """
    Downloads UCI Parkinson's dataset if not cached locally, loads and cleans data.
    """
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    
    if not os.path.exists(data_path):
        print(f"Downloading UCI Parkinson's dataset from {UCI_PARKINSONS_URL}...")
        urllib.request.urlretrieve(UCI_PARKINSONS_URL, data_path)
        print("Download complete.")
        
    df = pd.read_csv(data_path)
    
    # Clean whitespace in column names if any
    df.columns = [col.strip() for col in df.columns]
    
    # Drop identifier column if present
    if "name" in df.columns:
        df = df.drop(columns=["name"])
        
    # Check for missing values and handle if needed
    if df.isnull().sum().sum() > 0:
        df = df.fillna(df.median())
        
    # Ensure numeric types
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        
    return df

if __name__ == "__main__":
    df = fetch_and_load_data()
    print(f"Dataset shape: {df.shape}")
    print(f"Class distribution:\n{df[TARGET_COLUMN].value_counts()}")
