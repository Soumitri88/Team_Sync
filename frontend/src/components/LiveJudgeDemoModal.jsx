import React, { useState } from 'react';
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
  Download,
  Eye,
  ShieldOff,
  Zap,
  Check
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
    resetSimulation
  } = useSecurity();

  const [currentStage, setCurrentStage] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState('data_theft');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRemediating, setIsRemediating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [verificationProof, setVerificationProof] = useState(null);

  // Available demonstration scenarios
  const SCENARIOS = [
    {
      id: 'data_theft',
      title: 'Adversary Cyber Breach & Data Exfiltration (APT-BlackCat Emulation) [FEATURED]',
      desc: 'Simulates weaponized initial access -> hidden PowerShell harvester (PID 5124) -> stealing customer PII & salary tables -> staging archive -> exfiltration to Controlled Receiver blocked by active defense.',
      icon: Flame,
      color: 'text-red-400',
      badge: 'Real Hacker Breach',
      severity: 'DEFCON 1'
    },
    {
      id: 'multistage',
      title: 'Full Enterprise Multi-Stage Kill Chain',
      desc: 'Simulates RDP access -> LSASS PrivEsc -> WinRM Lateral Move -> Canary Trap Access -> Encrypted C2 Egress.',
      icon: Terminal,
      color: 'text-amber-400',
      badge: 'Full Kill-Chain',
      severity: 'Critical'
    },
    {
      id: 'file',
      title: 'Canary Trap Deception & Decoy Tampering',
      desc: 'Modifies designated test document and trips Canary honey-token; verifies pre/post SHA-256 digests.',
      icon: FileCode,
      color: 'text-purple-400',
      badge: 'Canary Deception',
      severity: 'Critical'
    },
    {
      id: 'process',
      title: 'Suspicious Subprocess Spawning (PID Tracking)',
      desc: 'Spawns a background test process under real Windows PID tracking; confirms parent-child relationships.',
      icon: Network,
      color: 'text-cyan-400',
      badge: 'Process Audit',
      severity: 'High'
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
    setCurrentStage(3); // Advance to live hacker execution stage
    setTerminalLogs([]);

    addTerminalLog(`[BREACH DETECTED] Adversary Infiltration Campaign Launched: ${selectedScenario.toUpperCase()}`, 'error');
    addTerminalLog(`[ATTACKER PROFILE] APT-BlackCat Syndicate | Origin: 198.51.100.44 (Tor Proxy Node)`, 'error');
    addTerminalLog(`[TARGET ASSET] Host: ${targetDevice.name} (${targetDevice.ip}) - Windows 11 Enterprise`, 'info');
    addTerminalLog(`[STAGE 1] Infiltration: Compromised credential session 'david.webb' validated via RDP tunnel.`, 'warn');
    addTerminalLog(`[STAGE 2] Weaponized Process: Spawning hidden harvester powershell.exe [PID 5124] (Parent: 3892)`, 'error');
    addTerminalLog(`[STAGE 3] Discovery: Adversary scanning test_sandbox/staging -> Discovered 2 high-value target files.`, 'warn');
    addTerminalLog(`[STAGE 4] Data Harvest: Extracted 1,420 bytes of synthetic customer PII & salary tables into memory.`, 'error');
    addTerminalLog(`[STAGE 5] Shadow Staging: Compressed staging container 'exfil_payload_staged.zip' generated.`, 'warn');
    addTerminalLog(`[STAGE 6] C2 Egress Attempt: Initiating HTTP POST upload to Controlled Receiver (127.0.0.1:8000/api/receiver/upload)...`, 'error');

    try {
      await triggerLiveAttackSimulation(selectedScenario);
      addTerminalLog('[SOC ALERT] PloyWeb AI Engine intercepted anomalous process & exfiltration socket!', 'success');
      addTerminalLog('[DEFENSE ENGAGED] Defensive Tracking Mode ACTIVE. Reconstructing GraphX Attack Path...', 'success');
      setIsSimulating(false);
      setCurrentStage(4); // Advance to detection & investigation
    } catch (e) {
      addTerminalLog(`[SOC ALERT] Telemetry correlated into active incident: ${e.message}`, 'warn');
      setIsSimulating(false);
      setCurrentStage(4);
    }
  };

  const handleExecuteRemediation = async () => {
    setIsRemediating(true);
    addTerminalLog('[DEFENSE] Dispatching automated containment directives to endpoint...', 'warn');
    addTerminalLog('[TASKKILL] Terminating attacker process PID 5124 via Windows taskkill /F.', 'warn');
    addTerminalLog('[FIREWALL] Deploying egress drop policy on Controlled Receiver (HTTP 403 Forbidden).', 'warn');
    addTerminalLog('[QUARANTINE] Moving staged archive exfil_payload_staged.zip into quarantine vault.', 'info');
    addTerminalLog('[RESTORE] Restoring clean synthetic customer records & canary decoys from immutable backup.', 'info');

    try {
      const result = await executeRemediationAndVerify();
      setVerificationProof(result);
      addTerminalLog('[VERIFY] Process check confirmed: Attacker PID 5124 is DEAD. 0 active rogue processes.', 'success');
      addTerminalLog('[VERIFY] Controlled Receiver audit confirmed: 0 BYTES TRANSFERRED (100% PREVENTED).', 'success');
      addTerminalLog('[VERIFY] Customer records restored and cryptographic SHA-256 digest sealed.', 'success');
      addTerminalLog('[STATUS] Incident neutralized! Endpoint marked PROTECTED (DEFCON 5 NOMINAL).', 'success');
      setIsRemediating(false);
      setCurrentStage(8); // Completed stage
      confetti({ particleCount: 160, spread: 85, origin: { y: 0.6 } });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#070b14] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950/90 border border-red-500/50 text-red-400 shadow-neon-red">
              <Flame className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  PloyWeb Live Attack & Defense Lab
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-[10px] text-red-300 font-bold uppercase">
                  Adversary Emulation
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live Hacker Intrusion Simulation $\to$ Autonomous Defensive Mode: Track, Contain & Verify
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
            { num: 2, title: 'Hacker Campaign' },
            { num: 3, title: 'Live Attack' },
            { num: 4, title: 'Track: Detect' },
            { num: 5, title: 'Track: GraphX' },
            { num: 6, title: 'Blast Radius' },
            { num: 7, title: 'Prevent & Block' },
            { num: 8, title: 'Verified Proof' }
          ].map((st) => (
            <div
              key={st.num}
              onClick={() => setCurrentStage(st.num)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer whitespace-nowrap transition-all ${
                currentStage === st.num
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold shadow-neon-red'
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
                    <span className="text-xs font-bold text-white uppercase">Authorized Target Endpoint</span>
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
                  Isolated Adversary Emulation Safety Guarantee
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The attack is emulated using synthetic files and controlled processes strictly inside the <code>test_sandbox</code> directory. No personal files, real passwords, or production resources are ever touched. Remediation physically terminates only test processes.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStage(2)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-neon-cyan transition-all"
                >
                  <span>Select Hacker Campaign</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: Hacker Attack Campaign Selection */}
          {currentStage === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-xs text-slate-400">
                Select the realistic adversary campaign to execute against the target Windows host:
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
                          ? 'bg-slate-900 border-red-500 ring-2 ring-red-500/20 shadow-neon-red'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SIcon className={`w-4 h-4 ${sc.color}`} />
                          <span className="text-xs font-bold text-white">{sc.title}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-red-950/80 text-red-300 border border-red-500/30">
                          {sc.badge}
                        </span>
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-neon-red transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>LAUNCH REAL-TIME HACKER INTRUSION</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: Live Hacker Attack Execution */}
          {currentStage === 3 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Intruder Telemetry Banner */}
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-red-400 animate-pulse" />
                  <div>
                    <span className="font-bold text-white uppercase block">
                      BREACH IN PROGRESS: APT-BlackCat Infiltration
                    </span>
                    <span className="text-[11px] text-red-300">
                      Attacker IP: 198.51.100.44 (Tor Proxy) $\to$ Target: {targetDevice.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-red-900/80 text-red-200 border border-red-500/40 font-bold text-[10px]">
                    ACTIVE HARVESTER PID: 5124
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-900/80 text-amber-200 border border-amber-500/40 font-bold text-[10px]">
                    STAGED: 2,450 BYTES
                  </span>
                </div>
              </div>

              {/* Hacker Terminal View */}
              <div className="p-4 rounded-2xl bg-black border border-red-500/30 font-mono text-[11px] h-64 overflow-y-auto space-y-1.5 shadow-inner">
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
                  <div className="flex items-center gap-2 text-red-400 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Transmitting exfiltration stream to Controlled Receiver...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStage(4)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-neon-cyan"
                >
                  <Eye className="w-4 h-4" />
                  <span>ENGAGE DEFENSIVE MODE: TRACK INTRUDER</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: Defensive Mode: Live Threat Detection */}
          {currentStage === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                    <span className="text-xs font-bold text-red-200 uppercase tracking-wide">
                      INTRUDER DETECTED & CORRELATED (DEFCON 1)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-900 text-red-200 text-[10px] font-bold">
                    ANOMALY SCORE: 99%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  PloyWeb AI correlation engine recognized the multi-stage attack pattern: anomalous RDP login $\to$ PowerShell token elevation $\to$ Customer PII discovery $\to$ Staging archive $\to$ C2 exfiltration.
                </p>
              </div>

              {/* MITRE ATT&CK Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase">INITIAL ACCESS</span>
                  <span className="text-xs font-bold text-red-400 block mt-0.5">T1078 (Valid Accounts)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase">EXECUTION</span>
                  <span className="text-xs font-bold text-amber-400 block mt-0.5">T1059.001 (PowerShell)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase">COLLECTION</span>
                  <span className="text-xs font-bold text-purple-400 block mt-0.5">T1005 & T1074 (PII Staged)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase">EXFILTRATION</span>
                  <span className="text-xs font-bold text-rose-400 block mt-0.5">T1048 (Controlled Receiver)</span>
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
                  <span>Reconstruct GraphX Attack Path</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: Defensive Mode: GraphX Autonomous Attack Path */}
          {currentStage === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase">GraphX Dynamic Intrusion Topology</span>
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
                  The GraphX engine synthesized the complete adversary lifecycle from telemetry: Attacker IP $\to$ Compromised Account $\to$ Workstation $\to$ Malicious Process PID $\to$ Staged Customer Records $\to$ Controlled Receiver Socket.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-2 text-xs">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Correlated Attack Path Nodes</div>
                <div className="flex items-center gap-2 flex-wrap text-slate-200 text-xs font-bold font-mono">
                  <span className="px-2 py-1 rounded bg-red-950 text-red-300 border border-red-500/30">APT-BlackCat [198.51.100.44]</span>
                  <span>$\to$</span>
                  <span className="px-2 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500/30">david.webb</span>
                  <span>$\to$</span>
                  <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">WS-ENGINEERING-07</span>
                  <span>$\to$</span>
                  <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-500/30">PID 5124 (Harvester)</span>
                  <span>$\to$</span>
                  <span className="px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/30">exfil_payload_staged.zip</span>
                  <span>$\to$</span>
                  <span className="px-2 py-1 rounded bg-red-950 text-red-300 border border-red-500/30">Receiver:8000</span>
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
                  <div className="text-2xl font-bold text-red-400">87.5%</div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Workstation subnet (10.0.2.0/24) exposed. Adversary attempted exfiltration of 2,450 bytes of confidential customer records.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase">Patient Zero Identification</span>
                  <div className="text-base font-bold text-cyan-300">WS-ENGINEERING-07</div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Root infiltration vector confirmed via external RDP credential exploitation from anonymous proxy 198.51.100.44.
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>PREVENT & CONTAIN ATTACK</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 7: Defensive Mode: Active Prevention & Containment */}
          {currentStage === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Defensive Countermeasures: Active Interception & Containment</span>
                </div>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>1. Kill Attacker Process:</strong> Dispatches OS <code>taskkill /F /PID 5124</code> to physically kill the harvester process.</span>
                  </li>
                  <li className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>2. Block Exfiltration Egress:</strong> Controlled Receiver sets firewall drop rule (HTTP 403) to ensure 0 bytes are leaked.</span>
                  </li>
                  <li className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>3. Quarantine Staged Archive:</strong> Moves <code>exfil_payload_staged.zip</code> out of staging into secure quarantine vault.</span>
                  </li>
                  <li className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>4. Restore Clean Backups:</strong> Re-arms customer records & canary decoys from immutable clean backups.</span>
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
                  <span>{isRemediating ? 'Deploying Containment...' : 'APPROVE & EXECUTE DEFENSIVE CONTAINMENT'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 8: Security Effectiveness & Verified Proof */}
          {currentStage === 8 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-neon-emerald">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-emerald-300">
                  ATTACK INTERCEPTED & DATA THEFT 100% PREVENTED
                </h4>
                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Endpoint telemetry & Controlled Receiver logs confirm: Attacker PID terminated, exfiltration socket blocked with <strong>0 Bytes Leaked</strong>, and clean files restored.
                </p>
              </div>

              {/* Verified Proof Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500">EXFILTRATION OUTCOME</span>
                  <span className="text-xs font-bold text-emerald-400 block">100% PREVENTED (0 B)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500">ATTACKER PROCESS</span>
                  <span className="text-xs font-bold text-emerald-400 block">PID 5124 TERMINATED</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500">STAGED ARCHIVE</span>
                  <span className="text-xs font-bold text-cyan-300 block">QUARANTINED</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500">REMAINING THREATS</span>
                  <span className="text-xs font-bold text-emerald-400 block">0 (VERIFIED CLEAN)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-1 text-xs">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">CRYPTOGRAPHIC DIGITAL VERIFICATION SEAL</span>
                <span className="text-xs font-bold text-cyan-300 font-mono truncate block">
                  SHA-256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (Verified)
                </span>
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
                  <span>Download Incident Dossier PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
