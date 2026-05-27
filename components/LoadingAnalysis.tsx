'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { label: 'Gathering profiles across platforms…', icon: '🔍' },
  { label: 'Analyzing content & political alignment…', icon: '🧠' },
  { label: 'Scoring audience reach & engagement…', icon: '📊' },
  { label: 'Ranking results with AI agent…', icon: '⚡' },
];

export function LoadingAnalysis() {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 2200);
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => {
      clearInterval(stepInterval);
      clearInterval(dotInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-8" />
      <h3 className="text-xl font-bold text-white mb-2">AI Agent Running{dots}</h3>
      <p className="text-slate-400 mb-8 text-sm">Llama 3.3 70B is analyzing influencer profiles</p>
      <div className="w-full max-w-sm space-y-3">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-500 ${
              i < currentStep
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : i === currentStep
                ? 'bg-gold/10 text-gold border border-gold/30 font-medium'
                : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
            }`}
          >
            <span className="text-base">{step.icon}</span>
            <span>{step.label}</span>
            {i < currentStep && <span className="ml-auto">✓</span>}
            {i === currentStep && <span className="ml-auto animate-pulse">●</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
