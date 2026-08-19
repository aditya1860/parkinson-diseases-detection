import os
import sys
import numpy as np
import pandas as pd
import shap
from lime.lime_tabular import LimeTabularExplainer
from typing import Dict, Any, List, Tuple

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ml.data_loader import FEATURE_COLUMNS

class ModelExplainer:
    def __init__(self, model: Any, X_background: np.ndarray = None):
        """
        Initializes both SHAP and LIME tabular explainers.
        """
        self.model = model
        self.model_type = type(model).__name__

        # 1. Initialize SHAP Explainer
        if "Forest" in self.model_type or "XGB" in self.model_type or "GradientBoosting" in self.model_type:
            self.shap_explainer = shap.TreeExplainer(model)
            self.is_tree = True
        elif "Logistic" in self.model_type or "Linear" in self.model_type:
            if X_background is not None:
                self.shap_explainer = shap.LinearExplainer(model, X_background)
            else:
                self.shap_explainer = shap.LinearExplainer(model, np.zeros((1, len(FEATURE_COLUMNS))))
            self.is_tree = False
        else:
            # Fallback to KernelExplainer with background sample summary
            if X_background is not None:
                bg_summary = shap.kmeans(X_background, min(10, len(X_background)))
            else:
                bg_summary = np.zeros((1, len(FEATURE_COLUMNS)))
            
            predict_fn = getattr(model, "predict_proba", model.predict)
            self.shap_explainer = shap.KernelExplainer(predict_fn, bg_summary)
            self.is_tree = False

        # 2. Initialize LIME Tabular Explainer
        if X_background is not None:
            training_data = X_background
        else:
            training_data = np.zeros((10, len(FEATURE_COLUMNS)))

        self.lime_explainer = LimeTabularExplainer(
            training_data=training_data,
            feature_names=FEATURE_COLUMNS,
            class_names=['Healthy', "Parkinson's"],
            mode='classification',
            random_state=42
        )

    def explain_sample(self, scaled_sample: np.ndarray) -> Tuple[Dict[str, float], List[Dict[str, Any]], List[str]]:
        """
        Computes both SHAP feature attributions AND LIME local feature weights for a single prediction.
        Returns:
            shap_dict: { feature_name: contribution_value }
            lime_explanation: [ { "feature": feature_name, "weight": weight_value }, ... ]
            top_features: list of top 3 key features driving prediction
        """
        if scaled_sample.ndim == 1:
            scaled_sample = scaled_sample.reshape(1, -1)

        sample_1d = scaled_sample[0]

        # --- A. SHAP Values ---
        try:
            raw_shap = self.shap_explainer.shap_values(scaled_sample)
            if isinstance(raw_shap, list):
                vals = raw_shap[1][0]
            elif isinstance(raw_shap, np.ndarray):
                if raw_shap.ndim == 3:
                    vals = raw_shap[0, :, 1]
                elif raw_shap.ndim == 2:
                    vals = raw_shap[0]
                else:
                    vals = raw_shap
            else:
                vals = np.zeros(len(FEATURE_COLUMNS))
        except Exception as e:
            print(f"Warning in SHAP computation: {e}")
            vals = np.zeros(len(FEATURE_COLUMNS))

        vals = np.array(vals, dtype=float).flatten()

        shap_dict = {
            col: round(float(val), 5)
            for col, val in zip(FEATURE_COLUMNS, vals)
        }

        # --- B. LIME Explanation ---
        predict_fn = getattr(self.model, "predict_proba", self.model.predict)
        
        lime_explanation = []
        try:
            exp = self.lime_explainer.explain_instance(
                data_row=sample_1d,
                predict_fn=predict_fn,
                num_features=len(FEATURE_COLUMNS)
            )
            
            # Map LIME output tuples into clean feature weights
            raw_lime = exp.as_list()
            lime_weights = {}
            
            for cond_str, weight in raw_lime:
                # Find matching feature name inside condition string
                matched_feature = None
                for col in FEATURE_COLUMNS:
                    if col in cond_str:
                        matched_feature = col
                        break
                if matched_feature:
                    lime_weights[matched_feature] = round(float(weight), 5)

            # Ensure all 22 features are represented
            for col in FEATURE_COLUMNS:
                if col not in lime_weights:
                    lime_weights[col] = 0.0

            lime_explanation = [
                {"feature": col, "weight": lime_weights[col]}
                for col in FEATURE_COLUMNS
            ]

        except Exception as e:
            print(f"Warning in LIME computation: {e}")
            lime_explanation = [
                {"feature": col, "weight": 0.0}
                for col in FEATURE_COLUMNS
            ]

        # Sort features by absolute SHAP magnitude to identify top 3 drivers
        sorted_features = sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)
        top_features = [item[0] for item in sorted_features[:3]]

        return shap_dict, lime_explanation, top_features

    def get_global_importance(self, X_dataset: np.ndarray) -> Dict[str, float]:
        """
        Computes mean absolute SHAP value for each feature across dataset.
        """
        try:
            raw_shap = self.shap_explainer.shap_values(X_dataset)
            if isinstance(raw_shap, list):
                vals = raw_shap[1]
            elif isinstance(raw_shap, np.ndarray) and raw_shap.ndim == 3:
                vals = raw_shap[:, :, 1]
            else:
                vals = raw_shap

            mean_abs_shap = np.mean(np.abs(vals), axis=0).flatten()
        except Exception:
            mean_abs_shap = np.zeros(len(FEATURE_COLUMNS))

        global_importance = {
            col: round(float(val), 5)
            for col, val in zip(FEATURE_COLUMNS, mean_abs_shap)
        }

        sorted_importance = dict(sorted(global_importance.items(), key=lambda x: x[1], reverse=True))
        return sorted_importance
