import React, { useState } from 'react';
import { 
  Activity, 
  Server, 
  User, 
  ShieldAlert, 
  ArrowRight, 
  AlertTriangle, 
  Lock, 
  CheckCircle2, 
  Flame, 
  Radio, 
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const BlastRadiusPage = ({ onNavigate }) => {
  const { blastRadius, executeResponseAction } = useSecurity();
  const [quarantineSuccess, setQuarantineSuccess] = useState('');

  const patientZero = blastRadius?.patient_zero || 'GW-VPN-EDGE-01';
  const impactScore = blastRadius?.impact_score || 87.5;
  const confirmedDevs = blastRadius?.compromised_devices || [];
  const confirmedAccs = blastRadius?.compromised_accounts || [];
  const reachableDevs = blastRadius?.reachable_devices || [];
  const commPaths = blastRadius?.communication_paths || [];
  const priorities = blastRadius?.containment_priorities || [];

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
    <div className="space-y-6 pb-12">
      {/* Top Banner & Impact Score Meter */}
      <div className="cyber-card p-6 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-6 border-cyan-500/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold font-mono text-white">
              Autonomous Blast Radius & Exposure Analysis
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans max-w-2xl leading-relaxed">
            Correlates active attack telemetry against enterprise network topology to distinguish between <span className="text-red-400 font-semibold">confirmed compromise</span> and <span className="text-amber-400 font-semibold">suspected at-risk blast propagation</span>.
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs font-mono">
            <span className="text-slate-400">Patient Zero (Origin Host):</span>
            <span className="px-2.5 py-1 rounded-md bg-red-950 text-red-300 border border-red-500/60 font-bold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-red-400" />
              {patientZero}
            </span>
          </div>
        </div>

        {/* Gauge Card */}
        <div className="p-4 rounded-xl bg-[#070b14] border border-[#1b2a47] flex items-center gap-4 flex-shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#1b2a47"
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
              <span className="text-base font-extrabold text-white">{impactScore}%</span>
              <span className="text-[8px] text-red-400 uppercase">Impact</span>
            </div>
          </div>
          <div className="space-y-1 font-mono text-xs">
            <div className="text-red-400 font-bold uppercase tracking-wider">CRITICAL RISK LEVEL</div>
            <div className="text-[11px] text-slate-400">4 Confirmed Hosts Exposed</div>
            <div className="text-[11px] text-amber-400">8 Reachable High-Value Targets</div>
          </div>
        </div>
      </div>

      {/* Quarantine Success Toast */}
      {quarantineSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 font-mono text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{quarantineSuccess}</span>
          </div>
          <button
            onClick={() => onNavigate('/incident-response')}
            className="text-[11px] text-cyan-300 underline"
          >
            Review in Response Center →
          </button>
        </div>
      )}

      {/* Distinction Grid: Confirmed Compromised vs Suspected At-Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: CONFIRMED COMPROMISE */}
        <div className="cyber-card p-5 rounded-2xl border-red-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2a47] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm font-bold font-mono text-white">
                Confirmed Compromised Entities ({confirmedDevs.length + confirmedAccs.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40">
              EVIDENCE VERIFIED
            </span>
          </div>

          {/* Compromised Devices List */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Compromised Endpoints & Servers</span>
            {confirmedDevs.map((dev) => (
              <div
                key={dev.name}
                className="p-3 rounded-xl bg-[#070b14] border border-red-500/30 flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-red-950/80 border border-red-500/50 text-red-400">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{dev.name}</span>
                      {dev.is_patient_zero && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">
                          PATIENT ZERO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">IP: {dev.ip} • Stage {dev.stage}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleIsolate(dev.name)}
                  className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[11px] font-semibold transition-colors"
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
                className="p-3 rounded-xl bg-[#070b14] border border-purple-500/30 flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-purple-950/80 border border-purple-500/50 text-purple-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">{acc.username}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">Privilege: {acc.privilege}</div>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                  Breached
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: SUSPECTED AT-RISK IMPACT */}
        <div className="cyber-card p-5 rounded-2xl border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2a47] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold font-mono text-white">
                Suspected At-Risk Assets ({reachableDevs.length || 6})
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
              TOPOLOGY EXPOSURE
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
              { name: 'AZURE-AD-CONNECT', origin: 'DC-CORP-01', risk: 'Cloud Identity Pivot', exposure: 'Federation Token Exfiltration' },
            ]).map((rDev) => (
              <div
                key={rDev.name}
                className="p-3 rounded-xl bg-[#070b14] border border-amber-500/20 flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-amber-950/80 border border-amber-500/40 text-amber-400">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">{rDev.name}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Vector: {rDev.origin || rDev.origin_vector || 'Compromised Subnet'} • {rDev.risk || 'High Exposure'}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                  {rDev.exposure || 'At Risk'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Containment Priority Queue */}
      <div className="cyber-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1b2a47]">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Recommended Containment Priority Queue</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Actionable prioritization sequence to break attack chains before lateral expansion
            </p>
          </div>

          <button
            onClick={handleQuarantineAll}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-neon-red transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Quarantine All Confirmed Hosts</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {[
            { rank: 1, target: 'WS-ENGINEERING-07', type: 'Endpoint Isolation', urgency: 'URGENT - DEFCON 1', reason: 'Active pivot workstation with NT AUTHORITY\\SYSTEM token privilege', action: 'isolate_device' },
            { rank: 2, target: 'GW-VPN-EDGE-01', type: 'Perimeter Boundary Drop', urgency: 'CRITICAL', reason: 'Ingress foothold allowing external brute-force spray from 198.51.100.44', action: 'block_ip' },
            { rank: 3, target: 'david.webb', type: 'Account Suspension', urgency: 'HIGH', reason: 'Valid user session abused for lateral Pass-The-Hash movement', action: 'disable_account' },
            { rank: 4, target: 'SRV-FINANCE-01', type: 'Share Access Lock', urgency: 'HIGH', reason: 'Finance share breached; Decoy canary opened by attacker', action: 'isolate_device' },
          ].map((item) => (
            <div
              key={item.rank}
              className="p-3.5 rounded-xl bg-[#070b14] border border-[#1b2a47] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-slate-900 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center flex-shrink-0">
                  #{item.rank}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.target}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 font-semibold">
                      {item.urgency}
                    </span>
                    <span className="text-[10px] text-purple-300 font-semibold">
                      [{item.type}]
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 font-sans">
                    {item.reason}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleIsolate(item.target)}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center gap-1.5 flex-shrink-0 transition-colors self-end sm:self-center"
              >
                <span>Execute Playbook</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
