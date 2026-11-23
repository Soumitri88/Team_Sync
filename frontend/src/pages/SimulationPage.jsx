import React, { useState } from 'react';
import { 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  ShieldCheck 
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const SimulationPage = ({ onInspectEvidence }) => {
  const {
    simState,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    stepSimulation,
    events
  } = useSecurity();

  const [selectedScenario, setSelectedScenario] = useState('multi_stage');

  const scenariosList = [
    {
      id: 'multi_stage',
      title: 'Full Multi-Stage Attack (Recommended)',
      desc: 'Complete attack progression: Initial Password Spray → Login → Jump to Internal PC → Admin Privilege Escalation → Decoy Trap Tripped.',
      badge: 'All-in-One Demo',
      severity: 'Critical'
    },
    {
      id: 'brute_force',
      title: 'Password Guessing (Brute Force)',
      desc: 'Adversary repeatedly guesses credentials against the VPN gateway until the account is locked.',
      badge: 'Phase 1',
      severity: 'Medium'
    },
    {
      id: 'suspicious_login_lateral',
      title: 'Suspicious Login & Pivot',
      desc: 'Compromised user logs in from an anomalous country and scans the network for internal database servers.',
      badge: 'Phase 2',
      severity: 'High'
    },
    {
      id: 'privilege_escalation',
      title: 'Privilege Escalation',
      desc: 'Attacker exploits token impersonation on a workstation to elevate to full SYSTEM administrator rights.',
      badge: 'Phase 3',
      severity: 'Critical'
    },
    {
      id: 'suspicious_file_access',
      title: 'Decoy File Access (Canary)',
      desc: 'Attacker looks through confidential file shares and opens a fake honey-token file, triggering an instant alarm.',
      badge: 'Phase 4',
      severity: 'Critical'
    }
  ];

  const statusText = simState && simState.status ? String(simState.status).toUpperCase() : 'IDLE';
  const isRunning = simState && simState.status === 'running';
  const isPaused = simState && simState.status === 'paused';
  const progressPct = simState && typeof simState.progress_pct === 'number' ? simState.progress_pct : 0;
  const currentStep = simState && typeof simState.current_step === 'number' ? simState.current_step : 0;
  const totalSteps = simState && typeof simState.total_steps === 'number' ? simState.total_steps : 0;

  const handleStart = () => {
    startSimulation(selectedScenario, 1.0);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Attack Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an attack scenario to safely generate live security telemetry for analysis
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Status:</span>
          <span
            className={
              isRunning
                ? 'px-2.5 py-0.5 rounded-full font-semibold uppercase bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                : 'px-2.5 py-0.5 rounded-full font-semibold uppercase bg-slate-800 text-slate-300'
            }
          >
            {statusText}
          </span>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          <strong>100% Safe Virtual Simulation:</strong> All attacks run inside a virtual simulation model. No real files or operating system settings are modified.
        </span>
      </div>

      {/* Simulation Controller Box */}
      <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
            <span>Simulation Progress</span>
            <span>Step {currentStep} / {totalSteps} ({progressPct}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          {!isRunning ? (
            <button
              onClick={isPaused ? resumeSimulation : handleStart}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{isPaused ? 'Resume Attack' : 'Start Simulation'}</span>
            </button>
          ) : (
            <button
              onClick={pauseSimulation}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Pause className="w-3.5 h-3.5 fill-black" />
              <span>Pause Attack</span>
            </button>
          )}

          <button
            onClick={stepSimulation}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step Next Event</span>
          </button>

          <button
            onClick={resetSimulation}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Choose a Scenario to Simulate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {scenariosList.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={
                  isSelected
                    ? 'p-4 rounded-xl border cursor-pointer transition-all bg-cyan-950/30 border-cyan-500 shadow-sm'
                    : 'p-4 rounded-xl border cursor-pointer transition-all cyber-card border-slate-800 hover:border-slate-700'
                }
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-xs font-bold text-white">{sc.title}</div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                    {sc.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  {sc.desc}
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span
                    className={
                      sc.severity === 'Critical'
                        ? 'text-[10px] font-bold uppercase text-red-400'
                        : 'text-[10px] font-bold uppercase text-amber-400'
                    }
                  >
                    {sc.severity} Severity
                  </span>
                  <span className={isSelected ? 'font-semibold text-xs text-cyan-400' : 'font-semibold text-xs text-slate-500'}>
                    {isSelected ? '✓ Selected' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Logs Preview */}
      <div className="cyber-card p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Live Generated Telemetry Logs
          </h3>
          <span className="text-[11px] text-slate-400">
            {events.length} events emitted
          </span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
          {events.length === 0 ? (
            <div className="text-slate-500 italic py-4 text-center">
              No simulation logs yet. Click "Start Simulation" above.
            </div>
          ) : (
            events.slice(0, 8).map((e) => (
              <div
                key={e.id}
                onClick={() => onInspectEvidence && onInspectEvidence(e)}
                className="p-2 rounded bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 hover:bg-slate-800/60 cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={
                      e.severity === 'critical'
                        ? 'text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-red-950 text-red-400'
                        : 'text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-800 text-slate-300'
                    }
                  >
                    {e.severity}
                  </span>
                  <span className="text-slate-200 truncate">{e.event_description}</span>
                </div>
                <span className="text-slate-500 text-[10px] whitespace-nowrap">
                  {e.device_name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
