import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { Info, Layers } from 'lucide-react';

export default function LimeChart({ limeExplanation }) {
  if (!limeExplanation || !Array.isArray(limeExplanation)) return null;

  // Sort LIME items by absolute weight magnitude
  const chartData = [...limeExplanation]
    .map(item => ({
      feature: item.feature,
      weight: item.weight,
      absWeight: Math.abs(item.weight)
    }))
    .sort((a, b) => b.absWeight - a.absWeight)
    .slice(0, 12); // Show top 12 features

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isPositive = item.weight > 0;
      return (
        <div className="bg-white border border-slate-200 text-slate-900 text-xs p-3 rounded-xl shadow-xl">
          <p className="font-mono font-bold text-slate-900 mb-1">{item.feature}</p>
          <p className={`font-bold ${isPositive ? 'text-rose-600' : 'text-teal-600'}`}>
            LIME Weight: {item.weight > 0 ? `+${item.weight}` : item.weight}
          </p>
          <p className="text-[11px] text-slate-600 mt-1 font-medium">
            {isPositive
              ? 'Model-agnostic surrogate weight towards Parkinson\'s'
              : 'Model-agnostic surrogate weight towards Healthy profile'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            LIME Local Feature Interpretation
          </h3>
          <p className="text-xs text-slate-500">
            Model-agnostic surrogate linear weights for this specific patient sample.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-rose-600">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> + Risk Weight
          </span>
          <span className="flex items-center gap-1.5 text-teal-600">
            <span className="w-3 h-3 rounded-sm bg-teal-500 inline-block" /> - Protective Weight
          </span>
        </div>
      </div>

      <div className="h-96 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis type="number" stroke="#64748b" tick={{ fill: '#334155', fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="feature"
              stroke="#64748b"
              tick={{ fill: '#0f172a', fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Bar dataKey="weight" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.weight > 0 ? '#ef4444' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <span>
          <strong>LIME vs SHAP:</strong> LIME builds an interpretable local surrogate model around this single patient's vocal sample. Compare these weights with SHAP game-theoretic Shapley values to cross-validate biomarker impact.
        </span>
      </div>
    </div>
  );
}
