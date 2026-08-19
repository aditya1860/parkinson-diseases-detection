import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Activity, Info, ShieldAlert, Cpu, Sparkles, Layers } from 'lucide-react';
import ShapChart from './ShapChart';
import LimeChart from './LimeChart';

export default function PredictionResults({ result, onReset }) {
  if (!result) return null;

  const [activeExplainTab, setActiveExplainTab] = useState('both'); // 'both' | 'shap' | 'lime'
  const isParkinsons = result.prediction_label === 1;
  const confidencePct = Math.round(result.confidence * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner Status Card */}
      <div className={`border rounded-2xl p-6 shadow-md relative overflow-hidden ${
        isParkinsons
          ? 'bg-gradient-to-r from-white via-rose-50/70 to-white border-rose-200'
          : 'bg-gradient-to-r from-white via-teal-50/70 to-white border-teal-200'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3.5 rounded-2xl shrink-0 ${
              isParkinsons
                ? 'bg-rose-100 text-rose-600 border border-rose-200'
                : 'bg-teal-100 text-teal-600 border border-teal-200'
            }`}>
              {isParkinsons ? <ShieldAlert className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isParkinsons
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-teal-100 text-teal-800 border border-teal-200'
                }`}>
                  ML Diagnosis Result
                </span>
                <span className="text-xs text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-600" /> Active Model: {result.model_used || 'Winning Model'}
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                {result.prediction}
              </h2>
              <p className="text-xs text-slate-700 mt-1 max-w-2xl leading-relaxed font-medium">
                {result.clinical_summary}
              </p>
            </div>
          </div>

          {/* Confidence Score Meter */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shrink-0 w-full md:w-44 shadow-sm">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
              Model Confidence
            </span>
            <div className="text-3xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-1">
              <span className={isParkinsons ? 'text-rose-600' : 'text-teal-600'}>
                {confidencePct}%
              </span>
            </div>
            
            {/* Mini Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${isParkinsons ? 'bg-rose-500' : 'bg-teal-500'}`}
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top Feature Biomarker Badges */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-600 font-semibold">Primary Driving Biomarkers:</span>
          {result.top_features.map((feature, i) => (
            <span
              key={i}
              className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-cyan-800"
            >
              #{i + 1} {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Dual Explanation View Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-600" />
          Dual Model Explainability (SHAP & LIME)
        </h3>

        <div className="bg-slate-200/70 p-1 rounded-xl flex space-x-1 border border-slate-300/60">
          <button
            onClick={() => setActiveExplainTab('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeExplainTab === 'both'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side-by-Side Dual View
          </button>
          <button
            onClick={() => setActiveExplainTab('shap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeExplainTab === 'shap'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SHAP Only
          </button>
          <button
            onClick={() => setActiveExplainTab('lime')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeExplainTab === 'lime'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            LIME Only
          </button>
        </div>
      </div>

      {/* SHAP & LIME Charts Rendering */}
      {activeExplainTab === 'both' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
            <ShapChart shapValues={result.shap_values} />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
            <LimeChart limeExplanation={result.lime_explanation} />
          </div>
        </div>
      ) : activeExplainTab === 'shap' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
          <ShapChart shapValues={result.shap_values} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
          <LimeChart limeExplanation={result.lime_explanation} />
        </div>
      )}
    </div>
  );
}
