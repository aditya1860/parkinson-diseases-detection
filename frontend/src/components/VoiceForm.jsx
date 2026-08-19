import React, { useState } from 'react';
import { HelpCircle, UserCheck, UserX, Upload, Sparkles, Sliders, RefreshCw } from 'lucide-react';
import { fetchPreset } from '../api/client';

export const FEATURE_GROUPS = [
  {
    category: 'Vocal Frequency Measures',
    description: 'Fundamental frequency pitches measured in Hertz (Hz)',
    fields: [
      { key: 'MDVP:Fo(Hz)', label: 'MDVP:Fo (Hz)', tooltip: 'Average vocal fundamental frequency', step: '0.001', defaultVal: 119.992 },
      { key: 'MDVP:Fhi(Hz)', label: 'MDVP:Fhi (Hz)', tooltip: 'Maximum vocal fundamental frequency', step: '0.001', defaultVal: 157.302 },
      { key: 'MDVP:Flo(Hz)', label: 'MDVP:Flo (Hz)', tooltip: 'Minimum vocal fundamental frequency', step: '0.001', defaultVal: 74.997 },
    ]
  },
  {
    category: 'Jitter Variation Measures',
    description: 'Cycle-to-cycle variations in vocal frequency pitch',
    fields: [
      { key: 'MDVP:Jitter(%)', label: 'Jitter (%)', tooltip: 'MDVP percentage frequency variation', step: '0.00001', defaultVal: 0.00784 },
      { key: 'MDVP:Jitter(Abs)', label: 'Jitter (Abs)', tooltip: 'Absolute jitter in microseconds', step: '0.000001', defaultVal: 0.00007 },
      { key: 'MDVP:RAP', label: 'MDVP:RAP', tooltip: 'Relative amplitude perturbation', step: '0.00001', defaultVal: 0.00370 },
      { key: 'MDVP:PPQ', label: 'MDVP:PPQ', tooltip: 'Five-point period perturbation quotient', step: '0.00001', defaultVal: 0.00554 },
      { key: 'Jitter:DDP', label: 'Jitter:DDP', tooltip: 'Average absolute difference of differences between jitter cycles', step: '0.00001', defaultVal: 0.01109 },
    ]
  },
  {
    category: 'Shimmer Amplitude Measures',
    description: 'Variations in vocal amplitude and voice intensity',
    fields: [
      { key: 'MDVP:Shimmer', label: 'MDVP:Shimmer', tooltip: 'MDVP local shimmer amplitude variation', step: '0.00001', defaultVal: 0.04374 },
      { key: 'MDVP:Shimmer(dB)', label: 'Shimmer (dB)', tooltip: 'MDVP local shimmer measured in decibels', step: '0.001', defaultVal: 0.426 },
      { key: 'Shimmer:APQ3', label: 'Shimmer:APQ3', tooltip: 'Three-point amplitude perturbation quotient', step: '0.00001', defaultVal: 0.02182 },
      { key: 'Shimmer:APQ5', label: 'Shimmer:APQ5', tooltip: 'Five-point amplitude perturbation quotient', step: '0.00001', defaultVal: 0.03130 },
      { key: 'MDVP:APQ', label: 'MDVP:APQ', tooltip: 'MDVP 11-point amplitude perturbation quotient', step: '0.00001', defaultVal: 0.02971 },
      { key: 'Shimmer:DDA', label: 'Shimmer:DDA', tooltip: 'Average absolute difference between consecutive amplitude differences', step: '0.00001', defaultVal: 0.06545 },
    ]
  },
  {
    category: 'Harmonics & Nonlinear Complexity',
    description: 'Noise ratios and fractal/entropy dynamical complexity measures',
    fields: [
      { key: 'NHR', label: 'NHR', tooltip: 'Noise-to-harmonics ratio', step: '0.00001', defaultVal: 0.02211 },
      { key: 'HNR', label: 'HNR', tooltip: 'Harmonics-to-noise ratio in voice', step: '0.001', defaultVal: 21.033 },
      { key: 'RPDE', label: 'RPDE', tooltip: 'Recurrence period density entropy (0 to 1)', step: '0.00001', defaultVal: 0.414783 },
      { key: 'DFA', label: 'DFA', tooltip: 'Detrended fluctuation analysis signal exponent', step: '0.00001', defaultVal: 0.815285 },
      { key: 'spread1', label: 'Spread1', tooltip: 'Nonlinear measure of fundamental frequency variation 1', step: '0.00001', defaultVal: -4.813031 },
      { key: 'spread2', label: 'Spread2', tooltip: 'Nonlinear measure of fundamental frequency variation 2', step: '0.00001', defaultVal: 0.266482 },
      { key: 'D2', label: 'D2', tooltip: 'Correlation dimension dynamical complexity', step: '0.00001', defaultVal: 2.301442 },
      { key: 'PPE', label: 'PPE', tooltip: 'Pitch period entropy measure', step: '0.00001', defaultVal: 0.284654 },
    ]
  }
];

export default function VoiceForm({ onSubmit, loading }) {
  // Flatten initial state
  const initialValues = {};
  FEATURE_GROUPS.forEach(group => {
    group.fields.forEach(f => {
      initialValues[f.key] = f.defaultVal;
    });
  });

  const [formData, setFormData] = useState(initialValues);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [presetLoading, setPresetLoading] = useState(false);

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value === '' ? '' : parseFloat(value)
    }));
  };

  const handleLoadPreset = async (presetType) => {
    setPresetLoading(true);
    try {
      const data = await fetchPreset(presetType);
      setFormData(data);
    } catch (err) {
      console.error("Failed to load preset", err);
    } finally {
      setPresetLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md relative overflow-hidden">
      {/* Preset Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-600" />
            Biomedical Voice Measurements
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Input 22 acoustic voice parameters or load standard patient baseline presets.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleLoadPreset('healthy')}
            disabled={presetLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold transition"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Load Healthy Preset</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoadPreset('parkinsons')}
            disabled={presetLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Load Parkinson's Preset</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {FEATURE_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <div className="border-l-3 border-cyan-600 pl-3">
              <h3 className="text-sm font-bold text-slate-900">{group.category}</h3>
              <p className="text-xs text-slate-500">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {group.fields.map(field => (
                <div key={field.key} className="relative group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveTooltip(field.key)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      className="text-slate-400 hover:text-cyan-600 transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="number"
                    step={field.step}
                    value={formData[field.key] ?? ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white focus:ring-1 focus:ring-cyan-600 transition font-mono"
                  />

                  {activeTooltip === field.key && (
                    <div className="absolute z-20 top-full mt-1 right-0 w-60 bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl pointer-events-none">
                      {field.tooltip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-cyan-600/20 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running ML Prediction & SHAP Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Diagnostic Prediction</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
