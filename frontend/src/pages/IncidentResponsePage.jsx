import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  UserX,
  Slash,
  Search,
  Bug,
  FileText,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  KeyRound,
  Lock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';

export function IncidentResponsePage({ onNavigate }) {
  const { actions, executeResponseAction, runProtectionDemo, stats } = useSecurity();
  const { user } = useAuth();
  const [selectedTarget, setSelectedTarget] = useState({
    review_logins: 'david.webb',
    revoke_session: 'david.webb',
    password_change: 'david.webb',
    enable_mfa: 'david.webb',
    quarantine_host: 'WS-ENGINEERING-07',
    generate_report: 'IR-AUTONOMOUS-CASE-01'
  });
  const [executing, setExecuting] = useState(null);
  const [isRunningProtectionDemo, setIsRunningProtectionDemo] = useState(false);
  const [lastActionResult, setLastActionResult] = useState(null);
  const [protectionDemoSuccess, setProtectionDemoSuccess] = useState(null);

  const responsePlaybooks = [
    {
      id: 'review_logins',
      title: '1. Review Suspicious Login Activity',
      desc: 'Conduct automated forensic audit of all interactive sessions, authentication protocols (RDP/SSH/VPN), and IP geolocations for flagged credentials.',
      icon: Search,
      color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
      defaultTarget: 'david.webb',
      options: ['david.webb', 'sarah.connor', 'admin', 'SYSTEM']
    },
    {
      id: 'revoke_session',
      title: '2. Revoke Simulated Sessions',
      desc: 'Purge active OAuth refresh tokens, invalidate Kerberos TGT tickets, and terminate active interactive RDP/WinRM user sessions.',
      icon: UserX,
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
      defaultTarget: 'david.webb',
      options: ['david.webb', 'sarah.connor', 'svc_backup']
    },
    {
      id: 'password_change',
      title: '3. Recommend Password Change',
      desc: 'Issue automated mandatory credential reset flag in directory services, enforcing high-entropy password requirements across domain controllers.',
      icon: KeyRound,
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      defaultTarget: 'david.webb',
      options: ['david.webb', 'sarah.connor', 'admin']
    },
    {
      id: 'enable_mfa',
      title: '4. Recommend Enabling Multi-Factor Auth',
      desc: 'Enforce mandatory conditional access MFA requirement for all external and internal subnet authentication requests.',
      icon: Lock,
      color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
      defaultTarget: 'david.webb',
      options: ['david.webb', 'sarah.connor', 'SYSTEM']
    },
    {
      id: 'quarantine_host',
      title: '5. Isolate Device (Simulation Sandbox Only)',
      desc: 'Applies simulated VLAN containment to sever lateral connectivity to finance and storage subnets while keeping forensic memory intact.',
      icon: Server,
      color: 'border-red-500/40 bg-red-950/20 text-red-300',
      defaultTarget: 'WS-ENGINEERING-07',
      options: ['WS-ENGINEERING-07', 'SRV-FINANCE-01', 'MOBILE-PIXEL-08', 'IPHONE-CORP-15']
    },
    {
      id: 'generate_report',
      title: '6. Generate Incident Report',
      desc: 'Compiles end-to-end investigation dossier with MITRE ATT&CK mapping, timeline reconstruct, and SHA-256 evidence digests.',
      icon: FileText,
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
      defaultTarget: 'IR-AUTONOMOUS-CASE-01',
      options: ['IR-AUTONOMOUS-CASE-01']
    }
  ];

  const handleExecute = async (actionType) => {
    const target = selectedTarget[actionType] || 'WS-ENGINEERING-07';
    const operator = user?.name || 'SOC-Commander';
    setExecuting(actionType);
    try {
      const record = await executeResponseAction(actionType, target, operator);
      setLastActionResult(record);
      if (actionType === 'generate_report' && onNavigate) {
        setTimeout(() => onNavigate('/reports'), 1200);
      }
    } finally {
      setExecuting(null);
    }
  };

  const handleRunProtectionDemo = async () => {
    setIsRunningProtectionDemo(true);
    setProtectionDemoSuccess(null);
    try {
      const result = await runProtectionDemo();
      setProtectionDemoSuccess(result);
    } finally {
      setIsRunningProtectionDemo(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner with RUN PROTECTION DEMO Button */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-[#0d1629] to-[#090e1a] border border-cyan-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/50 bg-cyan-950 text-cyan-300">
                SECURITY RESPONSE CENTER
              </span>
              <h1 className="text-base sm:text-lg font-extrabold text-white">
                Autonomous Protective Playbooks
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
              Suggested protective actions generated automatically following multi-stage attack detection.
            </p>
          </div>
        </div>

        {/* Action Button: RUN PROTECTION DEMO */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
          <button
            onClick={handleRunProtectionDemo}
            disabled={isRunningProtectionDemo}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-black text-black" />
            <span>{isRunningProtectionDemo ? 'RUNNING CONTAINMENT...' : 'RUN PROTECTION DEMO'}</span>
          </button>
        </div>
      </div>

      {/* Safety Notice: Non-destructive Environment Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-cyan-300">Authorized Containment Safety Policy:</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Never execute potentially disruptive protection actions on a real device without explicit authorization. In PloyWeb, all isolation, session revocation, and quarantine operations are executed safely within the simulation sandbox environment without modifying production host hardware or networks.
          </p>
        </div>
      </div>

      {/* Protection Demo Success Alert */}
      {protectionDemoSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm text-white">Threat Successfully Contained & Device Protected!</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
              STATUS: {protectionDemoSuccess.device_status}
            </span>
          </div>
          <p className="text-[11px] text-emerald-300/90">
            {protectionDemoSuccess.message} In simulation sandbox, sessions were revoked, MFA was enforced, and host WS-ENGINEERING-07 was quarantined.
          </p>
        </div>
      )}

      {/* Execution Alert Toast */}
      {lastActionResult && (
        <div className="p-3.5 rounded-xl bg-cyan-950/90 border border-cyan-500/80 text-cyan-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Playbook Executed Successfully: </span>
              <span className="text-white">{lastActionResult.action_type}</span> on{' '}
              <span className="text-cyan-300">{lastActionResult.target}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono self-end sm:self-auto">
            Hash: {lastActionResult.integrity_hash?.slice(0, 16)}...
          </span>
        </div>
      )}

      {/* Playbooks Grid: 6 Suggested Protective Actions */}
      <div>
        <h2 className="text-xs sm:text-sm font-bold text-white mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>Recommended Protective Actions</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {responsePlaybooks.map((pb) => {
            const Icon = pb.icon;
            const isRunning = executing === pb.id;

            return (
              <div
                key={pb.id}
                className={`p-5 rounded-2xl border ${pb.color} flex flex-col justify-between transition-all duration-200 bg-slate-900/60 hover:border-cyan-500/60`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-current" />
                    </div>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      PLAYBOOK #{pb.id.slice(0, 3)}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white mt-1">
                    {pb.title}
                  </h3>
                  <p className="text-xs text-slate-300 my-2 leading-relaxed">
                    {pb.desc}
                  </p>

                  {/* Target Selector */}
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Action Target Entity:
                    </label>
                    <select
                      value={selectedTarget[pb.id] || pb.defaultTarget}
                      onChange={(e) =>
                        setSelectedTarget({ ...selectedTarget, [pb.id]: e.target.value })
                      }
                      className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    >
                      {pb.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Execution Button */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">
                    Safe Simulation
                  </span>
                  <button
                    onClick={() => handleExecute(pb.id)}
                    disabled={isRunning}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                  >
                    <span>{isRunning ? 'Executing...' : 'Execute Action'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Response Audit Log Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white">Containment Action Audit Trail</h3>
            <p className="text-xs text-slate-400">Cryptographically hashed record of all protective interventions</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {actions.length} Executed
          </span>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-xs font-mono min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {actions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No containment playbooks triggered yet. Click "RUN PROTECTION DEMO" above or select a playbook.
                  </td>
                </tr>
              ) : (
                actions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {act.timestamp ? act.timestamp.slice(11, 19) : '--'} UTC
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300 font-semibold whitespace-nowrap">
                      {act.action_type}
                    </td>
                    <td className="py-2.5 px-3 text-white font-bold whitespace-nowrap">
                      {act.target}
                    </td>
                    <td className="py-2.5 px-3 text-purple-300 whitespace-nowrap">
                      {act.operator}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                        {act.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 text-[10px] whitespace-nowrap">
                      {act.integrity_hash?.slice(0, 14)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
