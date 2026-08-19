import React, { useState } from 'react';
import DisclaimerBanner from './components/DisclaimerBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ModelInfo from './pages/ModelInfo';
import BiomarkerGuide from './pages/BiomarkerGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState('prediction');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <DisclaimerBanner />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'prediction' && <Home />}
        {activeTab === 'model-info' && <ModelInfo />}
        {activeTab === 'guide' && <BiomarkerGuide />}
      </main>

      <Footer />
    </div>
  );
}
