import React, { useState } from 'react';
import { 
  Activity, 
  Server, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight,
  GitBranch,
  Hash,
  Key,
  Skull,
  Terminal,
  FileCode,
  Check,
  Copy,
  ExternalLink,
  Flame,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const BlastRadiusPage = ({ onNavigate, onInspectEvidence }) => {
  const { blastRadius, executeResponseAction } = useSecurity();
  const [quarantineSuccess, setQuarantineSuccess] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);

  const patientZero = blastRadius?.patient_zero || 'WS-ENGINEERING-07';
  const impactScore = blastRadius?.impact_score || 87.5;
  const confirmedDevs = blastRadius?.compromised_devices || [];
  const confirmedAccs = blastRadius?.compromised_accounts || [];
  const reachableDevs = blastRadius?.reachable_devices || [];
  const priorities = blastRadius?.containment_priorities || [];

  const rootCauseSteps = [
    {
      step: 1,
      phase: "Initial Infiltration",
      vector: "Valid Accounts: Compromised Credentials (T1078)",
      actor: "APT-SIM-409 (Controlled)",
      source_ip: "198.51.100.44",
      target_host: "WS-ENGINEERING-07 (Patient Zero)",
      account: "david.webb",
      evidence_hash: "b083a12a2d73844f481dfacf1356231c2eda4250ce20db516c3220e64d3161bc",
      summary: "Adversary gained interactive RDP session on workstation WS-ENGINEERING-07 using stolen credentials of user david.webb from external Tor exit node."
    },
    {
      step: 2,
      phase: "Privilege Escalation",
      vector: "Exploitation for Privilege Escalation (T1068)",
      actor: "APT-SIM-409",
      source_ip: "10.0.2.14",
      target_host: "WS-ENGINEERING-07",
      account: "SYSTEM",
      evidence_hash: "8a4f1071da56d8174f76cc3837ea81bfaeb51e847df34a41f62c0e95ff1cb209",
      summary: "Spawned hidden harvester powershell.exe with PID 5124 abusing SeDebugPrivilege to escalate token to NT AUTHORITY\\SYSTEM."
    },
    {
      step: 3,
      phase: "Lateral Movement",
      vector: "Remote Services: WinRM (T1021)",
      actor: "APT-SIM-409",
      source_ip: "10.0.2.14",
      target_host: "SRV-FINANCE-01",
      account: "SYSTEM",
      evidence_hash: "3c988b4923e20d2d3a37b09c256038166fa867f08e5832a2f86641b658d53862",
      summary: "Executed lateral WinRM remote invocation from engineering PC to internal core finance repository SRV-FINANCE-01 via port 5985."
    },
    {
      step: 4,
      phase: "Canary Detonation",
      vector: "Data from Local System: Decoy Canary Breach (T1005)",
      actor: "APT-SIM-409",
      source_ip: "10.0.2.14",
      target_host: "SRV-FINANCE-01",
      account: "david.webb",
      evidence_hash: "7f4955c4d6fba5f98cf85d9bf73295f7ecbe9fa161fb975a5c68f182c611488c",
      summary: "Adversary opened financial_report_demo.txt, detonating the Canary Twin deception tripwire and registering DEFCON 1 alert."
    },
    {
      step: 5,
      phase: "Data Staging",
      vector: "Data Staged: Local Staging Archive Created (T1074.001)",
      actor: "APT-SIM-409",
      source_ip: "10.0.2.14",
      target_host: "WS-ENGINEERING-07",
      account: "david.webb",
      evidence_hash: "8f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      summary: "Harvested synthetic customer and payroll records, compressing 2,450 bytes into staging archive exfil_payload_staged.zip."
    },
    {
      step: 6,
      phase: "Exfiltration / Response",
      vector: "Exfiltration Over Alternative Protocol (T1048)",
      actor: "APT-SIM-409",
      source_ip: "10.0.2.14",
      target_host: "Controlled Receiver (:8000)",
      account: "SOC-Commander",
      evidence_hash: "c281df6fa8ff23e19277d3fecaa21021bc782921eead8421b8b8095111bb9e32",
      summary: "Outbound egress socket opened toward controlled test receiver. Containment triggered: 0 bytes leaked, PID 5124 terminated."
    }
  ];

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleIsolate = async (target) => {
    await executeResponseAction('isolate_device', target);
    setQuarantineSuccess(`Simulated containment playbook executed for ${target}`);
    setTimeout(() => setQuarantineSuccess(''), 4000);
  };

  const handleQuarantineAll = async () => {
    for (const dev of confirmedDevs) {
      await executeResponseAction('isolate_device', dev.name);
    }
    setQuarantineSuccess('All confirmed compromised endpoints successfully isolated!');
    setTimeout(() => setQuarantineSuccess(''), 5000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner & Impact Score Meter */}
      <div className="cyber-card p-4 sm:p-6 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 border-cyan-500/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <h2 className="text-sm sm:text-base font-bold font-mono text-white">
              Autonomous Blast Radius & Exposure Analysis
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans max-w-2xl leading-relaxed">
            Correlates active attack telemetry against enterprise network topology to distinguish between <span className="text-red-400 font-semibold">confirmed compromise</span> and <span className="text-amber-400 font-semibold">suspected at-risk blast propagation</span>.
          </p>
          <div className="flex items-center gap-2 sm:gap-3 pt-2 text-xs font-mono flex-wrap">
            <span className="text-slate-400">Patient Zero (Origin Host):</span>
            <span className="px-2.5 py-1 rounded-md bg-red-950 text-red-300 border border-red-500/60 font-bold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-red-400" />
              {patientZero}
            </span>
          </div>
        </div>

        {/* Gauge Card */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#070b14] border border-[#1b2a47] flex items-center gap-3 sm:gap-4 flex-shrink-0 w-full sm:w-auto">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#1e293b"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#ef4444"
                strokeWidth="6"
                strokeDasharray={`${(impactScore / 100) * 213} 213`}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-sm sm:text-base font-extrabold text-white">{impactScore}%</span>
              <span className="text-[8px] text-red-400 uppercase">Impact</span>
            </div>
          </div>
          <div className="space-y-1 font-mono text-xs">
            <div className="text-red-400 font-bold uppercase tracking-wider text-[11px] sm:text-xs">CRITICAL RISK LEVEL</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400">4 Confirmed Hosts Exposed</div>
            <div className="text-[10px] sm:text-[11px] text-amber-400">8 Reachable High-Value Targets</div>
          </div>
        </div>
      </div>

      {/* Quarantine Toast */}
      {quarantineSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{quarantineSuccess}</span>
          </div>
          <button
            onClick={() => onNavigate('/incident-response')}
            className="text-[11px] text-cyan-300 underline self-start sm:self-auto"
          >
            Review in Response Center →
          </button>
        </div>
      )}

      {/* ==================== EVIDENCE-LINKED ROOT CAUSE ANALYSIS ==================== */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#090e1a]/95 border border-cyan-500/40 shadow-2xl space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  Evidence-Linked Root Cause Analysis
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                  DETERMINISTIC CAUSALITY CHAIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Every breach transition is linked directly to a verified SHA-256 cryptographic proof digest.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate && onNavigate('/tracegraph')}
              className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>View in NetworkX Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Patient Zero Root Assessment Summary */}
        <div className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Root Origin (Patient Zero):</span>
            <span className="text-red-400 font-bold flex items-center gap-1">
              <Server className="w-3.5 h-3.5" /> WS-ENGINEERING-07
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Initial Attack Vector:</span>
            <span className="text-purple-300 font-bold">T1078 (Compromised Creds)</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Adversary Source IP:</span>
            <span className="text-cyan-300 font-bold">198.51.100.44 (Tor Exit)</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Compromised User:</span>
            <span className="text-amber-300 font-bold">david.webb (EMP-041)</span>
          </div>
        </div>

        {/* 6-Hop Root Cause Causality Timeline */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
            Cryptographic Causality Chain (Hops 1 → 6):
          </span>

          <div className="space-y-2">
            {rootCauseSteps.map((s) => (
              <div
                key={s.step}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-1.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-[10px]">
                      {s.step}
                    </span>
                    <span className="font-bold text-white text-xs">{s.phase}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                      {s.vector}
                    </span>
                  </div>

                  {/* Evidence Hash Pill with Copy & Inspect */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-[10px] text-slate-400">SHA-256:</span>
                    <button
                      onClick={() => handleCopy(s.evidence_hash)}
                      className="text-[10px] px-2 py-0.5 rounded bg-black/60 text-cyan-300 hover:text-white border border-cyan-500/30 flex items-center gap-1 font-mono transition-colors"
                      title="Click to copy hash"
                    >
                      <span>{s.evidence_hash.slice(0, 10)}...{s.evidence_hash.slice(-6)}</span>
                      {copiedHash === s.evidence_hash ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                    {onInspectEvidence && (
                      <button
                        onClick={() => onInspectEvidence({
                          id: `EVT-ROOT-${s.step}`,
                          label: `${s.phase} (${s.vector})`,
                          severity: s.step === 4 ? 'critical' : 'high',
                          evidence_hash: s.evidence_hash,
                          description: s.summary,
                          metadata: {
                            source_ip: s.source_ip,
                            target_host: s.target_host,
                            account: s.account,
                            actor: s.actor
                          }
                        })}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Inspect Evidence Dossier"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {s.summary}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5 flex-wrap">
                  <span>Host: <strong className="text-slate-200">{s.target_host}</strong></span>
                  <span>User: <strong className="text-slate-200">{s.account}</strong></span>
                  <span>Actor: <strong className="text-slate-200">{s.actor}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distinction Grid: Confirmed Compromised vs Suspected At-Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Section 1: CONFIRMED COMPROMISE */}
        <div className="cyber-card p-4 sm:p-5 rounded-2xl border-red-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2a47] pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold font-mono text-white truncate">
                Confirmed Compromised ({confirmedDevs.length + confirmedAccs.length})
              </h3>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 whitespace-nowrap">
              EVIDENCE VERIFIED
            </span>
          </div>

          {/* Compromised Devices List */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Compromised Endpoints & Servers</span>
            {confirmedDevs.map((dev) => (
              <div
                key={dev.name}
                className="p-3 rounded-xl bg-[#070b14] border border-red-500/30 flex items-center justify-between gap-2 font-mono text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded bg-red-950/80 border border-red-500/50 text-red-400 flex-shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white truncate">{dev.name}</span>
                      {dev.is_patient_zero && (
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">
                          PATIENT ZERO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">IP: {dev.ip} • Stage {dev.stage}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleIsolate(dev.name)}
                  className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[11px] font-semibold transition-colors flex-shrink-0"
                >
                  Quarantine
                </button>
              </div>
            ))}
          </div>

          {/* Compromised Accounts List */}
          <div className="space-y-2 pt-2 border-t border-[#1b2a47]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Compromised User Accounts</span>
            {confirmedAccs.map((acc) => (
              <div
                key={acc.username}
                className="p-3 rounded-xl bg-[#070b14] border border-purple-500/30 flex items-center justify-between gap-2 font-mono text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded bg-purple-950/80 border border-purple-500/50 text-purple-400 flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white truncate block">{acc.username}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">Privilege: {acc.privilege}</div>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 flex-shrink-0">
                  Breached
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: SUSPECTED AT-RISK IMPACT */}
        <div className="cyber-card p-4 sm:p-5 rounded-2xl border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2a47] pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold font-mono text-white truncate">
                Suspected At-Risk Assets ({reachableDevs.length || 6})
              </h3>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 whitespace-nowrap">
              EXPOSURE
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            Directly routable from compromised hosts via local subnets or cached domain credentials.
          </p>

          <div className="space-y-2">
            {(reachableDevs.length > 0 ? reachableDevs : [
              { name: 'DC-CORP-01', origin: 'WS-ENGINEERING-07', risk: 'Critical Domain Controller', exposure: 'Pass-The-Hash Reachable' },
              { name: 'BACKUP-VAULT-01', origin: 'SRV-FINANCE-01', risk: 'Ransomware High Risk', exposure: 'SMB Port 445 Open' },
              { name: 'SRV-DATABASE-02', origin: 'WS-ENGINEERING-07', risk: 'Customer Data SQL', exposure: 'WinRM Remoting Port 5985' },
              { name: 'WS-EXECUTIVE-01', origin: 'GW-VPN-EDGE-01', risk: 'High-Value Executive PC', exposure: 'Lateral RDP Exposure' }
            ]).map((asset) => (
              <div
                key={asset.name}
                className="p-3 rounded-xl bg-[#070b14] border border-amber-500/30 flex items-center justify-between gap-2 font-mono text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300 truncate">{asset.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{asset.risk}</div>
                  <div className="text-[10px] text-slate-500 truncate">Vulnerability vector: {asset.exposure}</div>
                </div>
                <button
                  onClick={() => handleIsolate(asset.name)}
                  className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[11px] font-semibold transition-colors flex-shrink-0"
                >
                  Preemptive Isolate
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Containment Priority Checklist */}
      <div className="cyber-card p-4 sm:p-5 rounded-2xl border-purple-500/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2a47] pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold font-mono text-white">Recommended Containment Priorities</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 font-sans">Automated AI priority sequencing to minimize business interruption</p>
          </div>
          <button
            onClick={handleQuarantineAll}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all shadow-sm w-full sm:w-auto text-center"
          >
            Quarantine All Compromised Assets
          </button>
        </div>

        <div className="space-y-2">
          {(priorities.length > 0 ? priorities : [
            { step: 1, action: 'Isolate WS-ENGINEERING-07', reason: 'High-privilege lateral jump host with active SYSTEM beacon', impact: 'Prevents DC-CORP-01 escalation' },
            { step: 2, action: 'Suspend david.webb in Active Directory', reason: 'Compromised identity used across multiple workstations', impact: 'Terminates unauthorized Kerberos tickets' },
            { step: 3, action: 'Drop 198.51.100.44 at perimeter firewall', reason: 'Adversary command & control ingress source', impact: 'Severs external adversary persistence' }
          ]).map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-slate-100 truncate">{p.action}</div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">{p.reason}</div>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 self-end sm:self-auto whitespace-nowrap">{p.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
