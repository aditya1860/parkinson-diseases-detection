import React from 'react';
import { BookOpen, Activity, Info, ShieldCheck } from 'lucide-react';
import { FEATURE_GROUPS } from '../components/VoiceForm';

export default function BiomarkerGuide() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center space-x-2 text-xs text-teal-700 font-bold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4 text-teal-600" />
          <span>Acoustic Clinical Reference</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Vocal Biomarker Clinical Guide
        </h1>
        <p className="text-slate-600 text-sm mt-1 font-medium">
          Understanding acoustic measurements used in early detection of Parkinson's Disease (dysphonia & vocal tremor).
        </p>
      </div>

      <div className="space-y-6">
        {FEATURE_GROUPS.map((group, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
            <div className="border-l-4 border-cyan-600 pl-3">
              <h3 className="text-base font-bold text-slate-900">{group.category}</h3>
              <p className="text-xs text-slate-500">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {group.fields.map(field => (
                <div key={field.key} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-800">{field.key}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">Baseline ~ {field.defaultVal}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{field.label}</p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1 font-medium">{field.tooltip}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-start space-x-3 text-xs text-slate-600 shadow-sm">
        <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 block mb-1">Clinical Context of Dysphonia in Parkinson's:</strong>
          Voice impairments (hypokinetic dysarthria) affect up to 90% of individuals with Parkinson's disease, often manifesting as reduced volume, monotone pitch, breathiness, and increased micro-tremors (jitter/shimmer). Machine learning allows automated, non-invasive screening prior to severe motor symptom onset.
        </div>
      </div>
    </div>
  );
}
