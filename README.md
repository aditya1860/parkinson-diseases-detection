<<<<<<< HEAD
# NeuroVoice AI: Parkinson's Disease Prediction Web App (RF + SVM + SHAP + LIME)

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.3+-F7931E.svg)](https://scikit-learn.org/)
[![SHAP](https://img.shields.io/badge/SHAP-0.42+-red.svg)](https://shap.readthedocs.io/)
[![LIME](https://img.shields.io/badge/LIME-0.2+-purple.svg)](https://github.com/marcotcr/lime)

An end-to-end production-grade machine learning application designed to detect early signals of Parkinson's Disease from biomedical voice frequency measurements using **Random Forest** and **SVM** classifiers, with dual **SHAP** and **LIME** prediction explainability.

---

## 📌 Project Overview & Problem Statement

Voice impairments (**hypokinetic dysarthria**) affect up to 90% of individuals with Parkinson's disease, often manifesting in early stages as subtle vocal micro-tremors, frequency instability, and reduced pitch range before visible motor tremors appear.

This project delivers a complete, production-grade system containing:
1. **Automated Data Pipeline**: Programmatic UCI dataset ingestion, `StandardScaler` normalization, and `SMOTE` oversampling to handle severe class imbalance (~75% Parkinson's vs ~25% Healthy).
2. **RF vs. SVM Benchmark**: Evaluates **Random Forest** (ensemble, noise-robust) vs. **SVM Classifier** (hyperparameter tuned via `GridSearchCV`) using 5-Fold Stratified Cross Validation.
3. **Dual Explainability Engine (SHAP + LIME)**:
   - **SHAP**: Game-theoretic Shapley values providing global feature importance and exact local sample attributions.
   - **LIME**: `LimeTabularExplainer` generating local surrogate linear models for model-agnostic feature weighting.
   - **Side-by-Side UI View**: Frontend renders both SHAP and LIME charts side-by-side so clinicians can compare explanations.
4. **FastAPI REST Service**: Production API offering single-patient inference, batch CSV upload prediction, model benchmark reports, and health metrics.
5. **Modern React (Vite) UI**: High-performance medical dashboard built with React 18, Tailwind CSS, Lucide icons, and Recharts visualization.

---

## 📊 Dataset & Citation

- **Source**: UCI Machine Learning Repository — [Parkinsons Dataset](https://archive.ics.uci.edu/ml/datasets/parkinsons)
- **Features**: 22 acoustic voice biomarkers (MDVP:Fo, MDVP:Fhi, MDVP:Flo, Jitter %, Jitter Abs, RAP, PPQ, DDP, Shimmer, Shimmer dB, APQ3, APQ5, APQ, DDA, NHR, HNR, RPDE, DFA, spread1, spread2, D2, PPE).
- **Citation**: Little MA, McSharry PE, Roberts SJ, Costello DA, Moroz IM. *Exploiting Nonlinear Recurrence and Fractal Scaling Properties for Voice Disorder Detection*. Biomedical Engineering Online 2007, 6:23.

---

## 📈 Model Performance Benchmark Summary

| Model Architecture | 5-Fold CV Accuracy | 5-Fold CV F1-Score | Holdout Test Accuracy | Holdout Test F1 | Holdout Test ROC-AUC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SVM Classifier (GridSearch Tuned)** | **88.2%** | **95.8%** | **92.3%** | **94.7%** | **97.6%** | 🏆 **Serving Winner** |
| Random Forest Classifier | 91.5% | 91.2% | 89.7% | 92.9% | 96.4% | Evaluated |

---

## 🔍 Why SHAP + LIME Dual Explainability?

- **SHAP (SHapley Additive exPlanations)** calculates exact game-theoretic Shapley contributions. It guarantees consistency and mathematical correctness across global feature rankings and individual patient attributions.
- **LIME (Local Interpretable Model-agnostic Explanations)** constructs an interpretable sparse linear surrogate model locally around the patient's specific voice vector.
- **Comparison Advantage**: Showing SHAP and LIME side-by-side allows researchers and clinicians to cross-verify whether both feature-attribution methodologies agree on the primary biomarkers driving a diagnosis.

---

## 📁 Repository Structure

```
parkinsons-detection/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application & CORS configuration
│   │   ├── routes.py        # REST API endpoints (/predict, /predict-csv, /model-info)
│   │   ├── schemas.py       # Pydantic validation schemas & patient presets
│   ├── ml/
│   │   ├── data_loader.py   # Dataset downloader & ingestion
│   │   ├── preprocess.py    # StandardScaler & SMOTE class balancing
│   │   ├── train.py         # RF vs. SVM 5-Fold Stratified CV & GridSearchCV tuner
│   │   ├── evaluate.py      # Metrics computation & JSON report exporter
│   │   ├── explain.py       # Dual SHAP & LIME Tabular Explainer module
│   ├── models/              # Serialized joblib model artifacts
│   ├── reports/             # Generated model_report.json
│   ├── tests/               # Pytest unit tests
│   ├── run_training.py      # Master ML pipeline runner script
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js    # Axios API client
│   │   ├── components/      # VoiceForm, ShapChart, LimeChart, CsvUploader, Results
│   │   ├── pages/           # Home, ModelInfo, BiomarkerGuide
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## ⚡ Quickstart & Local Setup

### 1. Backend Setup (Python)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run full ML pipeline (Ingest, SMOTE, Train RF vs SVM, Tune, Evaluate, Save Artifacts)
python run_training.py

# Run backend unit tests
python -m pytest tests/

# Start FastAPI REST Server
uvicorn app.main:app --reload --port 8000
```
Backend Swagger API Documentation available at: `http://localhost:8000/docs`

### 2. Frontend Setup (React + Vite)

```bash
cd frontend

# Install Node dependencies
npm install

# Start React Dev Server
npm run dev
```
Frontend Web Dashboard available at: `http://localhost:5173`

---

## ⚠️ Disclaimer

This application is created solely for **educational, portfolio, and research demonstration purposes**. It is not a certified medical device and should not be used as a substitute for professional clinical diagnosis.
=======
# parkinson-diseases-detection
>>>>>>> 8a8cbd8e94f0f810f81be5bfa026ef7b2cb6d74d
