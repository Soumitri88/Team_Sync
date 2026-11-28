import React from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  X
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const DemoTourBar = ({ onNavigate }) => {
  const { 
    demoActive, 
    demoStep, 
    demoStepsList, 
    currentDemoStep, 
    nextDemoStep, 
    prevDemoStep, 
    exitDemo
  } = useSecurity();

  if (!demoActive || !currentDemoStep) return null;

  const handleAdvance = () => {
    const listLen = demoStepsList?.length || 9;
    if (demoStep < listLen) {
      const nextIdx = demoStep; // 0-indexed next step
      nextDemoStep();
      if (demoStepsList && demoStepsList[nextIdx]) {
        const target = demoStepsList[nextIdx].targetPath;
        if (target && onNavigate) onNavigate(target);
      }
    } else {
      nextDemoStep();
    }
  };

  const handlePrevious = () => {
    if (demoStep > 1) {
      const prevIdx = demoStep - 2; // 0-indexed prev step
      prevDemoStep();
      if (demoStepsList && demoStepsList[prevIdx]) {
        const target = demoStepsList[prevIdx].targetPath;
        if (target && onNavigate) onNavigate(target);
      }
    }
  };

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-[#0d1527]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-2xl p-2.5 sm:p-3.5 text-slate-100 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        {/* Step Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {demoStep}/9
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {currentDemoStep.title}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1">
              {currentDemoStep.description}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 flex-shrink-0 pt-1 sm:pt-0 border-t border-slate-800/80 sm:border-0">
          <button
            onClick={handlePrevious}
            disabled={demoStep === 1}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-slate-300 transition-colors"
            title="Previous Step"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleAdvance}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>{demoStep === 9 ? 'Finish' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={exitDemo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
