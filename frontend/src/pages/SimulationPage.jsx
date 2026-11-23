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
    stepSimulation, 
    resetSimulation, 
    events 
  } = useSecurity();

  const [selectedScenario, setSelectedScenario] = useState('full_killchain');

  const scenariosList = [
    {
      id: 'full_killchain',
      title: '1. Multi-Stage Enterprise Intrusion (Kill-Chain)',
      desc: 'Simulates VPN password spraying, initial access, privilege escalation, lateral pivot to engineering workstations, and decoy canary document breach.',
      severity: 'Critical',
      badge: '5 Stages'
    },
    {
      id: 'ransomware_canary',
      title: '2. Ransomware Staging & Canary Trip',
      desc: 'Adversary stages batch encryptor scripts in shared file storage and triggers an active tripwire canary trap.',
      severity: 'Critical',
      badge: '3 Stages'
    },
    {
      id: 'credential_dump',
      title: '3. LSASS Memory Injection & Credential Theft',
      desc: 'Post-compromise memory dump of LSASS subsystem on a secondary workstation and Kerberos ticket extraction.',
      severity: 'High',
      badge: '2 Stages'
    },
    {
      id: 'insider_exfil',
      title: '4. Insider Threat & Sensitive Data Exfiltration',
      desc: 'Simulated authorized engineer accessing abnormal financial database files and staging external transfer.',
      severity: 'High',
      badge: '3 Stages'
    },
    {
      id: 'cloud_token_abuse',
      title: '5. Cloud IAM Metadata Token Abuse',
      desc: 'Workload identity exploitation retrieving short-lived AWS/GCP session credentials from an exposed microservice.',
      severity: 'Critical',
      badge: '3 Stages'
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
    <div className="space-y-4 sm:space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              Attack Simulator
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
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

      {/* Controller Card */}
      <div className="cyber-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
            <span>Simulation Progress</span>
            <span>Step {currentStep} / {totalSteps} ({progressPct}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 pt-1 w-full sm:w-auto">
          {!isRunning ? (
            <button
              onClick={isPaused ? resumeSimulation : handleStart}
              className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{isPaused ? 'Resume Attack' : 'Start Simulation'}</span>
            </button>
          ) : (
            <button
              onClick={pauseSimulation}
              className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Pause className="w-3.5 h-3.5 fill-black" />
              <span>Pause Attack</span>
            </button>
          )}

          <button
            onClick={stepSimulation}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Step Next Event</span>
            <span className="sm:hidden">Step Next</span>
          </button>

          <button
            onClick={resetSimulation}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div>
        <h3 className="text-xs sm:text-sm font-bold text-white mb-3">Choose a Scenario to Simulate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {scenariosList.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={
                  isSelected
                    ? 'p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all bg-cyan-950/30 border-cyan-500 shadow-sm'
                    : 'p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all cyber-card border-slate-800 hover:border-slate-700'
                }
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-xs font-bold text-white">{sc.title}</div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold flex-shrink-0">
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
      <div className="cyber-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Live Generated Telemetry Logs
          </h3>
          <span className="text-[11px] text-slate-400">
            {events.length} events emitted
          </span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-slate-500 text-xs py-4 text-center">
              No logs generated yet. Click "Start Simulation" to stream events.
            </div>
          ) : (
            events.slice(-6).reverse().map((e) => (
              <div
                key={e.id}
                onClick={() => onInspectEvidence && onInspectEvidence(e)}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 hover:bg-slate-800/60 cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={
                      e.severity === 'critical'
                        ? 'text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-red-950 text-red-400 flex-shrink-0'
                        : 'text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300 flex-shrink-0'
                    }
                  >
                    {e.severity}
                  </span>
                  <span className="text-slate-200 truncate">{e.event_description}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex-shrink-0">
                  {e.device_name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
