import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  RotateCcw
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
    exitDemo,
    reseedDemo 
  } = useSecurity();

  if (!demoActive || !currentDemoStep) return null;

  const handleAdvance = () => {
    nextDemoStep();
    const nextIdx = demoStep;
    if (nextIdx < demoStepsList.length) {
      const nextTarget = demoStepsList[nextIdx].targetPath;
      if (nextTarget) {
        onNavigate(nextTarget);
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl bg-[#0d1527]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-2xl p-3.5 text-slate-100 transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        {/* Step Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {demoStep}/9
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{currentDemoStep.title}</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-1 max-w-md">
              {currentDemoStep.description}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={prevDemoStep}
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
            <span>{demoStep === 9 ? 'Finish' : 'Next Step'}</span>
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
