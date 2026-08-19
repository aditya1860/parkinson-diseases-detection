import React from 'react';
import { Github, Database, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 px-4 text-xs text-slate-500 mt-16 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-800">Parkinson's Disease Detection System (UCI Voice Biomarkers ML)</p>
          <p className="mt-1 text-slate-500">Built with Python, FastAPI, XGBoost, SMOTE, SHAP & React</p>
        </div>
        <div className="flex items-center space-x-6 text-slate-600">
          <a
            href="https://archive.ics.uci.edu/ml/datasets/parkinsons"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 hover:text-cyan-700 transition"
          >
            <Database className="w-4 h-4 text-cyan-600" />
            <span>UCI Dataset Citation</span>
          </a>
          <span className="flex items-center space-x-1 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Production ML Pipeline</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
