import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  Flame, 
  ExternalLink,
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

  const handleStepJump = (targetPath) => {
    if (targetPath) {
      onNavigate(targetPath);
    }
  };

  const handleAdvance = () => {
    nextDemoStep();
    const nextIdx = demoStep; // next is demoStep because 0-indexed in array is demoStep
    if (nextIdx < demoStepsList.length) {
      const nextTarget = demoStepsList[nextIdx].targetPath;
      if (nextTarget) {
        onNavigate(nextTarget);
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl bg-[#090e1a]/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(0,242,254,0.25)] p-4 text-slate-100 transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1b2a47]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                PloyWeb Autonomous Demo Tour
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Phase {demoStep} of 9
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Live automated kill-chain reconstruction & response validation
            </p>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {demoStepsList.map((s) => (
            <div
              key={s.step}
              onClick={() => {
                onNavigate(s.targetPath);
              }}
              title={s.title}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                s.step === demoStep
                  ? 'w-7 bg-gradient-to-r from-cyan-400 to-purple-400 shadow-neon-cyan'
                  : s.step < demoStep
                  ? 'w-2.5 bg-emerald-500'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={exitDemo}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Exit Demo Mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Info */}
      <div className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
              {currentDemoStep.title}
            </span>
            <button
              onClick={() => handleStepJump(currentDemoStep.targetPath)}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 underline underline-offset-2"
            >
              Open module ({currentDemoStep.targetPath})
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {currentDemoStep.description}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={prevDemoStep}
            disabled={demoStep === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-mono text-slate-300 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <button
            onClick={handleAdvance}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 shadow-neon-cyan transition-all"
          >
            <span>{demoStep === 9 ? 'Finish Demo' : currentDemoStep.actionLabel || 'Advance'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={reseedDemo}
            title="Reset & Reseed Demo Data"
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:text-cyan-400 hover:border-cyan-500/40 text-slate-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
