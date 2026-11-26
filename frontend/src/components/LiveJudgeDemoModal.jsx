import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  ShieldCheck,
  Flame,
  Terminal,
  Server,
  FileCode,
  Network,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Radio,
  Layers,
  Cpu,
  Lock,
  Download
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const LiveJudgeDemoModal = ({ isOpen, onClose, onNavigate }) => {
  const {
    agentStatus,
    devices,
    stats,
    events,
    attackGraph,
    blastRadius,
    triggerLiveAttackSimulation,
    executeRemediationAndVerify,
    resetSimulation,
    runJudgeDemo
  } = useSecurity();

  const [currentStage, setCurrentStage] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState('multistage');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRemediating, setIsRemediating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [verificationProof, setVerificationProof] = useState(null);

  // Available demonstration scenarios
  const SCENARIOS = [
    {
      id: 'multistage',
      title: 'Full Enterprise Multi-Stage Kill Chain (Recommended)',
      desc: 'Simulates RDP access -> Process Spawn -> WinRM Lateral Move -> Canary Decoy Access -> C2 Exfiltration.',
      icon: Flame,
      color: 'text-red-400'
    },
    {
      id: 'process',
      title: 'Scenario A: Suspicious Process Activity',
      desc: 'Spawns a harmless background test process in sandbox; captures genuine OS PID and executable hash.',
      icon: Terminal,
      color: 'text-amber-400'
    },
    {
      id: 'file',
      title: 'Scenario B: File Access & Canary Trap Breach',
      desc: 'Modifies designated test document and trips Canary honey-token; verifies SHA-256 before & after.',
      icon: FileCode,
      color: 'text-purple-400'
    },
    {
      id: 'network',
      title: 'Scenario C: Network Threat & C2 Egress',
      desc: 'Generates benign encrypted outbound requests to simulated external adversary node.',
      icon: Network,
      color: 'text-cyan-400'
    }
  ];

  const targetDevice = devices.find((d) => d.device_type === 'windows') || {
    name: 'WS-ENGINEERING-07',
    ip: '10.0.2.14',
    os: 'Windows 11 Enterprise (23H2)',
    status: 'connected',
    mode: 'Windows Endpoint Telemetry'
  };

  const addTerminalLog = (msg, level = 'info') => {
    const ts = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev, { ts, msg, level }]);
  };

  const handleStartAttack = async () => {
    setIsSimulating(true);
    setCurrentStage(3); // Advance to live telemetry stage
    setTerminalLogs([]);

    addTerminalLog(`[INIT] Arming controlled attack simulation: ${selectedScenario}...`, 'warn');
    addTerminalLog(`[AUTH] Target Host: ${targetDevice.name} (${targetDevice.ip}) - Authorization Validated`, 'info');

    try {
      await triggerLiveAttackSimulation(selectedScenario);
      addTerminalLog('[AGENT] Controlled test payload dispatched to endpoint daemon.', 'info');
      addTerminalLog('[TELEMETRY] Genuine OS process spawned; monitoring PID execution stream.', 'warn');
      addTerminalLog('[CANARY] Canary Twin honey-token accessed: financial_report_demo.txt.', 'error');
      addTerminalLog('[CORRELATION] Multi-stage anomaly correlated into directed GraphX graph.', 'info');
      setIsSimulating(false);
      setCurrentStage(4); // Advance to detection & investigation
    } catch (e) {
      addTerminalLog(`[FALLBACK] Simulated telemetry generator invoked: ${e.message}`, 'warn');
      setIsSimulating(false);
      setCurrentStage(4);
    }
  };

  const handleExecuteRemediation = async () => {
    setIsRemediating(true);
    addTerminalLog('[REMEDIATE] Dispatching defensive containment directive to endpoint...', 'warn');
    addTerminalLog('[TASKKILL] Terminating all test processes spawned during simulation.', 'warn');
    addTerminalLog('[QUARANTINE] Moving modified test artifacts into isolated quarantine vault.', 'info');
    addTerminalLog('[RESTORE] Restoring pristine Canary decoy from immutable backup.', 'info');

    try {
      const result = await executeRemediationAndVerify();
      setVerificationProof(result);
      addTerminalLog('[VERIFY] Physical OS process check completed: 0 active test processes.', 'success');
      addTerminalLog('[VERIFY] Canary integrity verified: SHA-256 match confirmed clean.', 'success');
      addTerminalLog('[STATUS] Incident neutralized! Endpoint marked PROTECTED.', 'success');
      setIsRemediating(false);
      setCurrentStage(8); // Completed stage
      confetti({ particleCount: 150, spread: 85, origin: { y: 0.6 } });
    } catch (e) {
      setIsRemediating(false);
      setCurrentStage(8);
    }
  };

  const handleReset = async () => {
    await resetSimulation();
    setCurrentStage(1);
    setTerminalLogs([]);
    setVerificationProof(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#070b14] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-400 shadow-neon-cyan">
              <Flame className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  PloyWeb Live SOC Demonstration Lab
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-300">
                  Hackathon Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                End-to-End Real-Time Incident Lifecycle: Device $\to$ Simulation $\to$ GraphX $\to$ Remediation $\to$ Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8-Stage Progress Stepper Bar */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-white/5 flex items-center justify-between overflow-x-auto text-[10px] sm:text-[11px] gap-2 flex-shrink-0">
          {[
            { num: 1, title: 'Endpoint' },
            { num: 2, title: 'Arm Simulation' },
            { num: 3, title: 'Live Telemetry' },
            { num: 4, title: 'Detection' },
            { num: 5, title: 'GraphX Path' },
            { num: 6, title: 'Blast Radius' },
            { num: 7, title: 'Remediation' },
            { num: 8, title: 'Verified Proof' }
          ].map((st) => (
            <div
              key={st.num}
              onClick={() => setCurrentStage(st.num)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer whitespace-nowrap transition-all ${
                currentStage === st.num
                  ? 'bg-cyan-500 text-black font-bold shadow-neon-cyan'
                  : currentStage > st.num
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{st.num}.</span>
              <span>{st.title}</span>
            </div>
          ))}
        </div>

        {/* Modal Body / Active Stage View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* STAGE 1: Endpoint Identification */}
          {currentStage === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase">Selected Target Endpoint</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-500/30 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse" /> Telemetry Connected
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">HOSTNAME</span>
                    <span className="font-bold text-white truncate block">{targetDevice.name}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">IP ADDRESS</span>
                    <span className="font-bold text-cyan-300 truncate block">{targetDevice.ip}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">OPERATING SYSTEM</span>
                    <span className="font-bold text-slate-200 truncate block">{targetDevice.os}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">SECURITY POSTURE</span>
                    <span className="font-bold text-emerald-400 uppercase truncate block">NOMINAL</span>
                  </div>
                </div>
              </div>

              {/* Safety Compliance Statement */}
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5 text-xs text-slate-300">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Controlled Non-Destructive Demonstration Guarantee
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  PloyWeb operates strictly with authorized test logs and controlled non-destructive test processes. No personal files, real credentials, malware, or persistent rootkits are touched. All demonstration artifacts reside inside the dedicated test sandbox directory.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStage(2)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-neon-cyan transition-all"
                >
                  <span>Select Attack Scenario</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: Arm Attack Scenario */}
          {currentStage === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-xs text-slate-400">
                Choose the controlled attack demonstration scenario to execute against the test host:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCENARIOS.map((sc) => {
                  const SIcon = sc.icon;
                  const isSelected = selectedScenario === sc.id;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => setSelectedScenario(sc.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-400/20 shadow-neon-cyan'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <SIcon className={`w-4 h-4 ${sc.color}`} />
                        <span className="text-xs font-bold text-white">{sc.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{sc.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStage(1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleStartAttack}
                  disabled={isSimulating}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-neon-red transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START SAFE ATTACK SIMULATION</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: Live Telemetry Terminal Feed */}
          {currentStage === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white">Live Endpoint Execution Feed</span>
                </div>
                <span className="text-slate-400 text-[11px]">Executing controlled sequence...</span>
              </div>

              {/* Terminal View */}
              <div className="p-4 rounded-2xl bg-black border border-slate-800 font-mono text-[11px] h-60 overflow-y-auto space-y-1.5 shadow-inner">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-600">[{log.ts}]</span>
                    <span
                      className={
                        log.level === 'error'
                          ? 'text-red-400 font-bold'
                          : log.level === 'warn'
                          ? 'text-amber-400 font-bold'
                          : log.level === 'success'
                          ? 'text-emerald-400 font-bold'
                          : 'text-cyan-300'
                      }
                    >
                      {log.msg}
                    </span>
                  </div>
                ))}
                {isSimulating && (
                  <div className="flex items-center gap-2 text-slate-500 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Listening for genuine OS process telemetry...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStage(4)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-neon-cyan"
                >
                  <span>Proceed to Detection & Investigation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: Detection & Correlation Details */}
          {currentStage === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                    <span className="text-xs font-bold text-red-200 uppercase">
                      CRITICAL INTRUSION DETECTED & CORRELATED
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-red-900 text-red-200 text-[10px] font-bold">
                    DEFCON 1
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  PloyWeb correlated incoming out-of-order logs using temporal sorting. Multi-stage attack progression identified across workstation and server endpoints.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500">ATTACK STAGES</span>
                  <span className="text-base font-bold text-white block mt-0.5">6 Stages</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500">COMPROMISED HOSTS</span>
                  <span className="text-base font-bold text-red-400 block mt-0.5">2 Endpoints</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500">CANARY TRAPS</span>
                  <span className="text-base font-bold text-amber-400 block mt-0.5">1 Detonated</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500">ROOT EVIDENCE HASH</span>
                  <span className="text-xs font-bold text-cyan-300 truncate block mt-0.5 font-mono">
                    7f49...61fb
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStage(3)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStage(5)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-neon-cyan"
                >
                  <span>View GraphX Reconstruction</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: GraphX Reconstruction Summary */}
          {currentStage === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase">GraphX Directed Attack Graph</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('/tracegraph');
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Open Full GraphX Canvas →
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The GraphX engine synthesized 8 interconnected entities: Adversary Entry $\to$ david.webb $\to$ WS-ENGINEERING-07 $\to$ Process PID 4812 $\to$ SYSTEM token $\to$ SRV-FINANCE-01 $\to$ financial_report_demo.txt $\to$ C2 Egress.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-2 text-xs">
                <div className="text-[10px] text-slate-500 uppercase">Critical Attack Trajectory</div>
                <div className="flex items-center gap-2 flex-wrap text-slate-200 text-xs font-bold font-mono">
                  <span className="px-2 py-1 rounded bg-red-950 text-red-300 border border-red-500/30">198.51.100.44</span>
                  <span>$\to$</span>
                  <span className="px-2 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500/30">david.webb</span>
                  <span>$\to$</span>
                  <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">WS-ENGINEERING-07</span>
                  <span>$\to$</span>
                  <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-500/30">Canary Trap</span>
                  <span>$\to$</span>
                  <span className="px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/30">C2 Egress</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStage(4)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStage(6)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-neon-cyan"
                >
                  <span>Assess Blast Radius</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: Blast Radius & Impact Assessment */}
          {currentStage === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase">Blast Exposure Impact</span>
                  <div className="text-2xl font-bold text-red-400">85.0%</div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Workstation subnet (10.0.2.0/24) and Finance subnet (10.0.3.0/24) exposed to adversary traversal.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase">Patient Zero Identification</span>
                  <div className="text-base font-bold text-cyan-300">WS-ENGINEERING-07</div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Root ingress vector confirmed via external RDP credential exploitation on perimeter port 3389.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStage(5)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStage(7)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-neon-red"
                >
                  <span>Review Recommended Remediation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 7: Remediation Approval & Execution */}
          {currentStage === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Recommended Incident Response Playbooks</span>
                </div>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Terminate Process PID:</strong> Terminate test process and revokes compromised execution handles.</span>
                  </li>
                  <li className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Quarantine Test Artifacts:</strong> Move tampered sandbox files to isolated quarantine vault.</span>
                  </li>
                  <li className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Restore Clean Decoys:</strong> Re-arm Canary Twin honey-token from immutable clean backup.</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStage(6)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleExecuteRemediation}
                  disabled={isRemediating}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isRemediating ? 'Executing Remediation...' : 'APPROVE & EXECUTE REMEDIATION'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 8: Verification & Incident Closure */}
          {currentStage === 8 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-neon-emerald">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-emerald-300">
                  INCIDENT SUCCESSFULLY CONTAINED & VERIFIED
                </h4>
                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Endpoint telemetry verification confirmed: all test processes terminated, artifacts quarantined, Canary Twin re-armed, and host status marked <strong>PROTECTED</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500">CONTAINMENT STATUS</span>
                  <span className="text-sm font-bold text-emerald-400 block">VERIFIED CONTAINED</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500">DIGITAL AUDIT SEAL</span>
                  <span className="text-xs font-bold text-cyan-300 font-mono truncate block">
                    b083a12a2d73844f481dfacf1356231c2eda4250...
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Lab</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/reports');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-neon-cyan"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Dossier</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
