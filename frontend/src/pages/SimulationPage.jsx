import React, { useState } from 'react';
import { 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  ShieldCheck,
  Laptop,
  Smartphone,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Zap,
  Activity
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const SimulationPage = ({ onNavigate, onInspectEvidence }) => {
  const { 
    simState, 
    startSimulation, 
    pauseSimulation, 
    resumeSimulation, 
    stepSimulation, 
    resetSimulation, 
    events,
    stats 
  } = useSecurity();

  const [selectedScenario, setSelectedScenario] = useState('windows_pc');

  const TARGET_PLATFORMS = [
    {
      id: 'windows_pc',
      name: 'Windows Computer',
      target: 'WS-ENGINEERING-07',
      os: 'Windows 11 Enterprise (23H2)',
      icon: Laptop,
      desc: 'Enterprise Windows kill-chain: RDP credential abuse -> LSASS token elevation -> WinRM lateral traversal -> Canary breach -> C2 exfiltration -> Service persistence.',
      badge: '6 Stages',
      severity: 'Critical'
    },
    {
      id: 'android_mobile',
      name: 'Android Mobile Device',
      target: 'MOBILE-PIXEL-08',
      os: 'Android 14 (Google Pixel 8)',
      icon: Smartphone,
      desc: 'Mobile enterprise chain: Sideloaded APK authentication -> Binder token privesc -> Subnet discovery -> Honey-token Canary -> C2 exfiltration -> Boot receiver persistence.',
      badge: '6 Stages',
      severity: 'Critical'
    },
    {
      id: 'ios_mobile',
      name: 'iOS Mobile Device (Simulation Mode)',
      target: 'IPHONE-CORP-15',
      os: 'iOS 17.4 (Sandbox Simulation)',
      icon: Smartphone,
      desc: 'Safe iOS sandbox simulation: MDM configuration exploit -> WebKit JIT escape -> Container traversal -> Decoy confidential file access -> DNS tunneling exfil -> Kernel flag.',
      badge: '6 Stages',
      severity: 'High'
    },
    {
      id: 'judge_demo',
      name: 'Hackathon Judge Demo',
      target: 'WS-ENGINEERING-07',
      os: 'Out-Of-Order Telemetry Stream',
      icon: Sparkles,
      desc: 'Intentionally delivers logs out of order to demonstrate PloyWeb temporal correlation engine, dynamic TraceGraph reconstruction, and SHA-256 evidence integrity.',
      badge: 'Judge Special',
      severity: 'Critical'
    }
  ];

  const KILL_CHAIN_STAGES = [
    { stage: 1, name: 'Suspicious Login Attempt', desc: 'Anomalous credential abuse / initial access' },
    { stage: 2, name: 'Privilege Escalation Indicator', desc: 'Token elevation / sandbox breakout' },
    { stage: 3, name: 'Lateral Movement Indicator', desc: 'Pivot to internal subnets / storage' },
    { stage: 4, name: 'Suspicious File Access', desc: 'Canary decoy trap accessed' },
    { stage: 5, name: 'Data Exfiltration Indicator', desc: 'Covert egress / C2 channel' },
    { stage: 6, name: 'Privilege Escalation Alert', desc: 'Root persistence / daemon scheduled' }
  ];

  const statusText = simState && simState.status ? String(simState.status).toUpperCase() : 'IDLE';
  const isRunning = simState && simState.status === 'running';
  const isPaused = simState && simState.status === 'paused';
  const progressPct = simState && typeof simState.progress_pct === 'number' ? simState.progress_pct : 0;
  const currentStep = simState && typeof simState.current_step === 'number' ? simState.current_step : 0;
  const totalSteps = simState && typeof simState.total_steps === 'number' ? simState.total_steps : 6;

  const handleStart = () => {
    startSimulation(selectedScenario, 1.0);
  };

  const getStageStatus = (stageNum) => {
    if (progressPct >= (stageNum / 6) * 100) return 'completed';
    if (progressPct >= ((stageNum - 1) / 6) * 100 && isRunning) return 'in_progress';
    return 'pending';
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-cyan-400" />
            <h1 className="text-lg sm:text-xl font-bold text-white">
              Attack Simulation Lab
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Safe, non-destructive enterprise and mobile threat demonstration powered by controlled telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Status:</span>
            <span
              className={
                isRunning
                  ? 'px-3 py-1 rounded-full font-bold uppercase text-[11px] bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'px-3 py-1 rounded-full font-bold uppercase text-[11px] bg-slate-800 text-slate-300 border border-slate-700'
              }
            >
              {statusText}
            </span>
          </div>

          {events.length > 0 && onNavigate && (
            <button
              onClick={() => onNavigate('/tracegraph')}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>View in TraceGraph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Safety & Non-destructive Guarantee Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-cyan-300">Non-Destructive Simulation Guarantee:</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            All simulated scenarios generate harmless synthetic telemetry and read authorized test logs. PloyWeb never installs malware, executes exploits, steals credentials, encrypts files, or damages physical devices.
          </p>
        </div>
      </div>

      {/* Target Device Selection Tabs */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step 1: Select Target Device & Simulation Scenario
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {TARGET_PLATFORMS.map((platform) => {
            const isSelected = selectedScenario === platform.id;
            const Icon = platform.icon;
            return (
              <div
                key={platform.id}
                onClick={() => setSelectedScenario(platform.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`} />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {platform.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white">{platform.name}</h3>
                    <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{platform.target}</p>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">{platform.desc}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase text-red-400">
                    {platform.severity}
                  </span>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {isSelected ? '✓ Selected' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Controller Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Step 2: Control Simulation & Ingestion Stream
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Launch real-time telemetry stream or step through events sequentially.
            </p>
          </div>

          <div className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-500/30">
            Progress: Step {currentStep} / {totalSteps} ({Math.round(progressPct)}%)
          </div>
        </div>

        {/* Real-time Progress Bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Controller Buttons: Prominent START SAFE ATTACK SIMULATION */}
        <div className="flex flex-wrap items-center gap-3">
          {!isRunning ? (
            <button
              onClick={isPaused ? resumeSimulation : handleStart}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{isPaused ? 'RESUME SIMULATION' : 'START SAFE ATTACK SIMULATION'}</span>
            </button>
          ) : (
            <button
              onClick={pauseSimulation}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Pause className="w-4 h-4 fill-black" />
              <span>PAUSE SIMULATION</span>
            </button>
          )}

          <button
            onClick={stepSimulation}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <SkipForward className="w-4 h-4 text-cyan-400" />
            <span>Step Forward</span>
          </button>

          <button
            onClick={resetSimulation}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-red-950/50 text-slate-400 hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Simulation</span>
          </button>
        </div>
      </div>

      {/* 6-Stage Visual Kill-Chain Stepper */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Kill-Chain Progression: 6 Reconstructed Attack Stages
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KILL_CHAIN_STAGES.map((s) => {
            const stageStatus = getStageStatus(s.stage);
            return (
              <div
                key={s.stage}
                className={`p-3.5 rounded-xl border transition-all ${
                  stageStatus === 'completed'
                    ? 'bg-cyan-950/30 border-cyan-500/60'
                    : stageStatus === 'in_progress'
                    ? 'bg-amber-950/30 border-amber-500/60 animate-pulse'
                    : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      stageStatus === 'completed'
                        ? 'bg-cyan-500 text-black'
                        : stageStatus === 'in_progress'
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {s.stage}
                    </span>
                    <h3 className="font-bold text-xs text-white">Stage {s.stage}</h3>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                    stageStatus === 'completed'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : stageStatus === 'in_progress'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {stageStatus === 'completed' ? 'Detected' : stageStatus === 'in_progress' ? 'Occurring' : 'Pending'}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-200 mt-1">{s.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Generated Telemetry Feed */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Reconstructed Telemetry Feed
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {events.length} events logged
          </span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="text-slate-500 text-xs py-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              No events generated yet. Click "START SAFE ATTACK SIMULATION" above to stream telemetry.
            </div>
          ) : (
            events.slice(-8).reverse().map((e) => (
              <div
                key={e.id}
                onClick={() => onInspectEvidence && onInspectEvidence(e)}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer text-xs transition-colors"
              >
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase flex-shrink-0 ${
                      e.severity === 'critical'
                        ? 'bg-red-950 text-red-400 border border-red-500/40'
                        : e.severity === 'high'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {e.severity}
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-200 font-medium truncate">{e.event_description}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {e.mitre_id} ({e.mitre_name}) • {e.username || 'System'}
                    </p>
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between text-[10px] text-slate-400 font-mono flex-shrink-0">
                  <span className="text-cyan-400">{e.device_name}</span>
                  <span className="text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
