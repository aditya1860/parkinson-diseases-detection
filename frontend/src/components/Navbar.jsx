import React from 'react';
import { Activity, BarChart2, BookOpen, Stethoscope } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'prediction', label: 'Diagnostic Studio', icon: Stethoscope },
    { id: 'model-info', label: 'Model Benchmark & SHAP', icon: BarChart2 },
    { id: 'guide', label: 'Vocal Biomarker Guide', icon: BookOpen },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('prediction')}>
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white font-bold shadow-md shadow-cyan-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              NeuroVoice <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-semibold border border-cyan-200">ML AI</span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Parkinson's Disease Detection Platform</p>
          </div>
        </div>

        <nav className="flex space-x-1 sm:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
