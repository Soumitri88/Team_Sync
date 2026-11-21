import React, { useState } from 'react';
import { 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  ShieldCheck, 
  Terminal, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FastForward,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const SimulationPage = ({ onNavigate, onInspectEvidence }) => {
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
  const [speed, setSpeed] = useState(1.0);

  const scenariosList = [
    {
      id: 'multi_stage',
      title: '5. Multi-Stage APT Kill-Chain (Full Attack Progression)',
      desc: 'Complete 5-stage adversarial campaign: External Credential Spray -> Suspicious RDP Login -> WinRM Lateral Pivot -> Token Privilege Escalation -> Canary Decoy Detonation.',
      mitre: 'T1110, T1078, T1021, T1068, T1005',
      stagesCount: 5,
      severity: 'Critical',
      recommended: true
    },
    {
      id: 'brute_force',
      title: '1. Brute-Force Login Simulation',
      desc: 'Simulates credential guessing against Edge Gateway from external adversary IP, triggering threshold alerts and simulated account lockout.',
      mitre: 'T1110 (Brute Force: Password Guessing)',
      stagesCount: 1,
      severity: 'High'
    },
    {
      id: 'suspicious_login_lateral',
      title: '2. Suspicious Login & Lateral Movement',
      desc: 'Simulates stolen credentials used from an anomalous geographical location, scanning the local /24 subnet and pivoting to internal database server.',
      mitre: 'T1078, T1046, T1021',
      stagesCount: 2,
      severity: 'Critical'
    },
    {
      id: 'privilege_escalation',
      title: '3. Privilege Escalation Simulation',
      desc: 'Simulates standard user token enumeration and privilege elevation to NT AUTHORITY\\SYSTEM via token impersonation and mimikatz simulation.',
      mitre: 'T1057, T1134, T1068',
      stagesCount: 3,
      severity: 'Critical'
    },
    {
      id: 'suspicious_file_access',
      title: '4. Suspicious File & Canary Decoy Access',
      desc: 'Simulates unauthorized directory traversal through confidential finance share and opening deception canary files.',
      mitre: 'T1083, T1005 (Decoy Canary Breach)',
      stagesCount: 3,
      severity: 'Critical'
    }
  ];

  const isRunning = simState?.status === 'running';
  const isPaused = simState?.status === 'paused';
  const progressPct = simState?.progress_pct || 0;

  const handleStart = () => {
    startSimulation(selectedScenario, speed);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Disclaimer Guarantee Banner */}
      <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs font-mono">
          <span className="font-bold text-cyan-300 uppercase">SAFE SYNTHETIC SIMULATION ENVIRONMENT:</span>
          <p className="text-slate-300 mt-0.5">
            This module generates controlled synthetic security telemetry strictly within the PloyWeb virtual sandbox. It does <span className="text-cyan-400 font-bold">never</span> exploit, damage, encrypt, or modify your physical host operating system, local network, or files.
          </p>
        </div>
      </div>

      {/* Control Console */}
      <div className="cyber-card p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b2a47] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold font-mono text-white">
                Autonomous Attack Simulation Controller
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Launch pre-configured adversarial campaigns and stream real-time telemetry to TraceGraph
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Simulator Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                isRunning
                  ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                  : isPaused
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              }`}
            >
              {simState?.status || 'IDLE'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
            <span>Simulation Progression</span>
            <span>
              Step {simState?.current_step || 0} / {simState?.total_steps || 0} ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-red-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Action Controls & Speed Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Main Simulation Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isRunning ? (
              <button
                onClick={isPaused ? resumeSimulation : handleStart}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs font-mono flex items-center gap-2 shadow-neon-cyan transition-all"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>{isPaused ? 'Resume Simulation' : 'Start Simulation'}</span>
              </button>
            ) : (
              <button
                onClick={pauseSimulation}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs font-mono flex items-center gap-2 transition-all"
              >
                <Pause className="w-4 h-4 fill-black" />
                <span>Pause Simulation</span>
              </button>
            )}

            <button
              onClick={stepSimulation}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              <span>Step Forward</span>
            </button>

            <button
              onClick={resetSimulation}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-400 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset & Clear</span>
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Pacing Speed:</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[0.5, 1.0, 2.0, 5.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    speed === s
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div>
        <h3 className="text-sm font-bold font-mono text-white mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Predefined Attack Scenarios</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {scenariosList.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-neon-cyan'
                    : 'cyber-card hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold font-mono text-white">
                      {sc.title}
                    </span>
                    {sc.recommended && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 flex-shrink-0">
                        DEMO READY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                    {sc.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1b2a47] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-purple-300 truncate max-w-[170px]" title={sc.mitre}>
                    MITRE: {sc.mitre}
                  </span>
                  <span
                    className={`font-bold uppercase ${
                      isSelected ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    {isSelected ? '✓ SELECTED' : 'SELECT'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Synthetic Telemetry Stream Output Terminal */}
      <div className="cyber-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-[#1b2a47] pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono text-white">
              Generated Synthetic Security Logs Stream
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            LIVE SIMULATION FEED
          </span>
        </div>

        <div className="bg-black/80 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto max-h-72 space-y-2 select-text">
          {events.length === 0 ? (
            <div className="text-slate-500 italic py-6 text-center">
              No simulated events generated yet. Select a scenario above and click "Start Simulation".
            </div>
          ) : (
            events.slice(0, 12).map((e) => (
              <div
                key={e.id}
                onClick={() => onInspectEvidence && onInspectEvidence(e)}
                className="p-2 rounded bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800/80 hover:border-cyan-500/40 transition-colors cursor-pointer flex items-start gap-2.5"
              >
                <span className="text-slate-500 whitespace-nowrap text-[11px]">
                  [{e.timestamp ? e.timestamp.slice(11, 19) : '00:00:00'}]
                </span>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold whitespace-nowrap ${
                    e.severity === 'critical'
                      ? 'bg-red-950 text-red-400 border border-red-500/40'
                      : e.severity === 'high'
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {e.severity}
                </span>
                <span className="text-cyan-400 font-semibold whitespace-nowrap">
                  {e.device_name || 'UNKNOWN-DEV'}
                </span>
                <span className="text-purple-300 font-mono whitespace-nowrap">
                  [{e.username}]
                </span>
                <span className="text-slate-300 flex-1 truncate">
                  {e.event_description}
                </span>
                <span className="text-slate-600 text-[10px] whitespace-nowrap">
                  {e.mitre_id || ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
