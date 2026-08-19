import React, { useEffect, useState } from 'react';
import { fetchModelInfo } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, BarChart3, CheckCircle, Cpu, RefreshCw, Sparkles, Target, Layers, ArrowUpRight } from 'lucide-react';

export default function ModelInfo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const info = await fetchModelInfo();
        setData(info);
      } catch (err) {
        setError('Failed to fetch model evaluation metrics. Ensure model is trained.');
      } finally {
        setLoading(false);
      }
    };
    loadInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin" />
        <p className="text-slate-600 text-sm font-medium">Loading Model Comparison Metrics & SHAP Summary...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-700 shadow-sm">
        <p>{error || 'Model report unavailable.'}</p>
      </div>
    );
  }

  const {
    metrics, confusion_matrix, rf_metrics, rf_confusion_matrix,
    svm_metrics, svm_confusion_matrix, global_shap_importance,
    training_meta, data_stats
  } = data;

  const winnerName = data.model_name;

  // Prepare Global SHAP chart data
  const globalShapChart = Object.entries(global_shap_importance || {})
    .map(([feature, importance]) => ({ feature, importance }))
    .slice(0, 15);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-cyan-700 font-bold uppercase tracking-wider mb-1">
          <Award className="w-4 h-4" />
          <span>Production Classifier Benchmark</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Random Forest vs. SVM Model Benchmark
        </h1>
        <p className="text-slate-600 text-sm mt-1 font-medium">
          Active Serving Model: <span className="text-cyan-700 font-bold">{winnerName}</span> (Selected via 5-Fold Stratified Cross Validation & GridSearchCV tuning).
        </p>
      </div>

      {/* Side-by-Side Model Comparison Cards (Random Forest vs SVM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Random Forest Card */}
        <div className={`bg-white border rounded-2xl p-6 shadow-md space-y-4 relative ${
          winnerName.includes('Random Forest') ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-600" />
              Random Forest Classifier
            </h3>
            {winnerName.includes('Random Forest') && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10px] uppercase font-bold">
                Serving Winner
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Accuracy</span>
              <p className="text-lg font-black text-slate-900">{((rf_metrics?.accuracy || 0) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">F1-Score</span>
              <p className="text-lg font-black text-cyan-600">{((rf_metrics?.f1_score || 0) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Precision</span>
              <p className="text-lg font-black text-slate-900">{((rf_metrics?.precision || 0) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">ROC-AUC</span>
              <p className="text-lg font-black text-purple-600">{((rf_metrics?.roc_auc || 0) * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* RF Confusion Matrix Grid */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-2">Confusion Matrix (RF Test Split):</span>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-teal-50 border border-teal-200 p-2 rounded-lg">
                <span className="text-[10px] text-teal-800 font-bold">TN: {rf_confusion_matrix?.true_negative}</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg">
                <span className="text-[10px] text-rose-800 font-bold">FP: {rf_confusion_matrix?.false_positive}</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg">
                <span className="text-[10px] text-rose-800 font-bold">FN: {rf_confusion_matrix?.false_negative}</span>
              </div>
              <div className="bg-teal-50 border border-teal-200 p-2 rounded-lg">
                <span className="text-[10px] text-teal-800 font-bold">TP: {rf_confusion_matrix?.true_positive}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SVM Card */}
        <div className={`bg-white border rounded-2xl p-6 shadow-md space-y-4 relative ${
          winnerName.includes('SVM') ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600" />
              SVM Classifier (GridSearch Tuned)
            </h3>
            {winnerName.includes('SVM') && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10px] uppercase font-bold">
                Serving Winner
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Accuracy</span>
              <p className="text-lg font-black text-slate-900">{((svm_metrics?.accuracy || 0) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">F1-Score</span>
              <p className="text-lg font-black text-cyan-600">{((svm_metrics?.f1_score || 0) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Precision</span>
              <p className="text-lg font-black text-slate-900">{((svm_metrics?.precision || 0) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase">ROC-AUC</span>
              <p className="text-lg font-black text-purple-600">{((svm_metrics?.roc_auc || 0) * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* SVM Confusion Matrix Grid */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-2">Confusion Matrix (SVM Test Split):</span>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-teal-50 border border-teal-200 p-2 rounded-lg">
                <span className="text-[10px] text-teal-800 font-bold">TN: {svm_confusion_matrix?.true_negative}</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg">
                <span className="text-[10px] text-rose-800 font-bold">FP: {svm_confusion_matrix?.false_positive}</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg">
                <span className="text-[10px] text-rose-800 font-bold">FN: {svm_confusion_matrix?.false_negative}</span>
              </div>
              <div className="bg-teal-50 border border-teal-200 p-2 rounded-lg">
                <span className="text-[10px] text-teal-800 font-bold">TP: {svm_confusion_matrix?.true_positive}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global SHAP Importance Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            Global Feature Importance (Mean |SHAP|)
          </h3>
          <p className="text-xs text-slate-500">
            Identifies overall top vocal biomarkers across the entire dataset driving Parkinson's disease classification.
          </p>
        </div>

        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={globalShapChart} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <XAxis type="number" stroke="#64748b" tick={{ fill: '#334155', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="feature"
                stroke="#64748b"
                tick={{ fill: '#0f172a', fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }}
                width={100}
              />
              <Tooltip
                formatter={(val) => [`${val}`, 'Mean |SHAP| Value']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a' }}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {globalShapChart.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#0284c7" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
