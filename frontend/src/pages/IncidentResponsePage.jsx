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
  RotateCcw
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';

export const IncidentResponsePage = ({ onNavigate }) => {
  const { actions, executeResponseAction, stats } = useSecurity();
  const { user } = useAuth();
  const [selectedTarget, setSelectedTarget] = useState({
    isolate_device: 'WS-ENGINEERING-07',
    disable_account: 'david.webb',
    block_ip: '198.51.100.44',
    review_logins: 'sarah.connor',
    investigate_canaries: 'Finance_Report_Canary.txt',
    generate_report: 'IR-AUTONOMOUS-CASE-01'
  });
  const [executing, setExecuting] = useState(null);
  const [lastActionResult, setLastActionResult] = useState(null);

  const responsePlaybooks = [
    {
      id: 'isolate_device',
      title: '1. Isolate Affected Device',
      desc: 'Applies simulated 802.1X VLAN quarantine to halt lateral propagation while preserving memory state for forensic capture.',
      icon: Server,
      color: 'border-red-500/50 bg-red-950/20 text-red-300',
      defaultTarget: 'WS-ENGINEERING-07',
      options: ['WS-ENGINEERING-07', 'GW-VPN-EDGE-01', 'SRV-FINANCE-01', 'WS-MARKETING-02']
    },
    {
      id: 'disable_account',
      title: '2. Disable Compromised Account',
      desc: 'Simulates Active Directory account suspension and purges active Kerberos TGT tickets across domain controllers.',
      icon: UserX,
      color: 'border-purple-500/50 bg-purple-950/20 text-purple-300',
      defaultTarget: 'david.webb',
      options: ['david.webb', 'sarah.connor', 'svc_backup', 'admin']
    },
    {
      id: 'block_ip',
      title: '3. Block Suspicious Adversary IP',
      desc: 'Injects simulated boundary firewall ACL rule on edge gateway: DROP all ingress handshakes from external threat origin.',
      icon: Slash,
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300',
      defaultTarget: '198.51.100.44',
      options: ['198.51.100.44', '203.0.113.88', '192.0.2.14']
    },
    {
      id: 'review_logins',
      title: '4. Deep Session & Token Audit',
      desc: 'Enforces forced re-authentication and revokes OAuth refresh tokens across SSO IdP providers for affected accounts.',
      icon: Search,
      color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300',
      defaultTarget: 'sarah.connor',
      options: ['sarah.connor', 'david.webb', 'finance_auditor']
    },
    {
      id: 'investigate_canaries',
      title: '5. Tripwire Forensics & File Capture',
      desc: 'Captures file handle locks and forensic hashes on tripwire decoys breached by adversary tools.',
      icon: Bug,
      color: 'border-pink-500/50 bg-pink-950/20 text-pink-300',
      defaultTarget: 'Finance_Report_Canary.txt',
      options: ['Finance_Report_Canary.txt', 'Admin_Credentials_Canary.txt', 'Backup_Configuration_Canary.txt']
    },
    {
      id: 'generate_report',
      title: '6. Generate Incident Dossier',
      desc: 'Finalizes investigation summary narrative, maps MITRE matrix, validates SHA-256 evidence chain, and seals dossier.',
      icon: FileText,
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
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
      if (actionType === 'generate_report') {
        setTimeout(() => onNavigate('/reports'), 1200);
      }
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-[#0d1527] to-[#090e1a] border border-cyan-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/50 bg-cyan-950 text-cyan-300">
                ACTIVE MITIGATION
              </span>
              <h2 className="text-sm sm:text-base font-extrabold font-mono text-white">
                Incident Response Playbooks
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
              Execute standardized SOC containment playbooks. All interventions are simulated safely inside the PloyWeb containment sandbox without touching real operating systems or network infrastructure.
            </p>
          </div>
        </div>

        {/* Action Count Pill */}
        <div className="px-3.5 py-2 rounded-xl bg-[#070b14] border border-[#1b2a47] font-mono text-xs flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <span className="text-slate-400">Executed Actions:</span>
          <span className="text-cyan-400 font-extrabold text-sm">{actions.length}</span>
        </div>
      </div>

      {/* Execution Alert Toast */}
      {lastActionResult && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-neon-cyan animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Playbook Executed Successfully: </span>
              <span className="text-white">{lastActionResult.action_type}</span> on{' '}
              <span className="text-cyan-300">{lastActionResult.target}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 self-end sm:self-auto">
            Hash: {lastActionResult.integrity_hash?.slice(0, 16)}...
          </span>
        </div>
      )}

      {/* Playbooks Grid */}
      <div>
        <h3 className="text-xs sm:text-sm font-bold font-mono text-white mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>Recommended Incident Response Playbooks</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {responsePlaybooks.map((pb) => {
            const Icon = pb.icon;
            const isRunning = executing === pb.id;

            return (
              <div
                key={pb.id}
                className={`p-4 sm:p-5 rounded-2xl border ${pb.color} flex flex-col justify-between transition-all duration-200 cyber-card`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-current" />
                    </div>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      PLAYBOOK #{pb.id.slice(0, 3)}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold font-mono text-white mt-1">
                    {pb.title}
                  </h4>
                  <p className="text-xs text-slate-300 font-sans my-2 leading-relaxed">
                    {pb.desc}
                  </p>

                  {/* Target Selector */}
                  <div className="mt-3 pt-3 border-t border-[#1b2a47]">
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
                <div className="mt-4 pt-3 border-t border-[#1b2a47] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[9px] font-mono text-slate-500">
                    Safe Simulation
                  </span>
                  <button
                    onClick={() => handleExecute(pb.id)}
                    disabled={isRunning}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
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
      <div className="cyber-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold font-mono text-white">Containment Action Audit Trail</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 font-sans">Cryptographically hashed record of all mitigation interventions</p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            {actions.length} Executed
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs font-mono min-w-[500px]">
            <thead>
              <tr className="border-b border-[#1b2a47] text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2a47]/60">
              {actions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No containment playbooks triggered yet. Select a playbook above to simulate intervention.
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
};
