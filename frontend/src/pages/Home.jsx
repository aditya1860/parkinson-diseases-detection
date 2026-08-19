import React, { useState } from 'react';
import { Sliders, Upload, RotateCcw, AlertCircle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import VoiceForm from '../components/VoiceForm';
import CsvUploader from '../components/CsvUploader';
import PredictionResults from '../components/PredictionResults';
import { predictSingleSample } from '../api/client';

export default function Home() {
  const [inputMode, setInputMode] = useState('manual'); // 'manual' | 'csv'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState(null);

  const handlePredict = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictSingleSample(formData);
      setResult(res);
      setBatchResults(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Prediction request failed. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchResults = (data) => {
    setBatchResults(data);
    setResult(null);
  };

  const handleReset = () => {
    setResult(null);
    setBatchResults(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
        <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
          Biomedical Voice Biomarker Intelligence
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Early Parkinson's Disease Detection System
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed font-medium">
          Screen vocal pitch stability, jitter, shimmer, and acoustic entropy using production Machine Learning models with explainable SHAP feature attributions.
        </p>
      </div>

      {/* Input Mode Selector */}
      <div className="flex justify-center">
        <div className="bg-slate-200/80 p-1 rounded-2xl flex space-x-1 border border-slate-300/60 shadow-inner">
          <button
            onClick={() => setInputMode('manual')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              inputMode === 'manual'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Interactive Voice Input</span>
          </button>

          <button
            onClick={() => setInputMode('csv')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              inputMode === 'csv'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Batch CSV Upload</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-rose-700 hover:underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content View */}
      {result ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 shadow-sm transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Test Another Sample</span>
            </button>
          </div>
          <PredictionResults result={result} onReset={handleReset} />
        </div>
      ) : batchResults ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              Batch CSV Processing Summary
            </h3>
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 shadow-sm transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Batch Results</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Total Analyzed</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{batchResults.total_rows}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Parkinson's Flagged</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{batchResults.parkinsons_count}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Healthy Samples</p>
              <p className="text-2xl font-black text-teal-600 mt-1">{batchResults.healthy_count}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Row #</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Top Driver Biomarkers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {batchResults.results.map((row) => (
                  <tr key={row.row_index} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-semibold">#{row.row_index + 1}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold ${
                        row.prediction_label === 1
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-teal-100 text-teal-800 border border-teal-200'
                      }`}>
                        {row.prediction_label === 1 ? <ShieldAlert className="w-3 h-3 text-rose-600" /> : <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                        {row.prediction}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">{Math.round(row.confidence * 100)}%</td>
                    <td className="py-3 px-4 font-mono text-cyan-800 font-semibold">
                      {row.top_features.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          {inputMode === 'manual' ? (
            <VoiceForm onSubmit={handlePredict} loading={loading} />
          ) : (
            <CsvUploader onBatchResults={handleBatchResults} />
          )}
        </div>
      )}
    </div>
  );
}
