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
  AlertTriangle, 
  Clock, 
  Lock, 
  Terminal, 
  ExternalLink,
  ChevronRight,
  Flame,
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
      color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300',
      defaultTarget: '198.51.100.44',
      options: ['198.51.100.44', '203.0.113.89', '198.51.100.220']
    },
    {
      id: 'review_logins',
      title: '4. Review Suspicious Login Events',
      desc: 'Initiates deep authentication forensics across the 48-hour event window to trace concurrent sessions and lateral hops.',
      icon: Search,
      color: 'border-blue-500/50 bg-blue-950/20 text-blue-300',
      defaultTarget: 'sarah.connor',
      options: ['sarah.connor', 'david.webb', 'admin']
    },
    {
      id: 'investigate_canaries',
      title: '5. Investigate Accessed Canary Files',
      desc: 'Extracts memory honey-token dumps for accessed deception canary files to identify process lineage and adversary tooling.',
      icon: Bug,
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300',
      defaultTarget: 'Finance_Report_Canary.txt',
      options: ['Finance_Report_Canary.txt', 'Admin_Credentials_Canary.txt', 'Backup_Configuration_Canary.txt']
    },
    {
      id: 'generate_report',
      title: '6. Generate Autonomous Incident Dossier',
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
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-[#0d1527] to-[#090e1a] border border-cyan-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/50 bg-cyan-950 text-cyan-300">
                ACTIVE MITIGATION CENTER
              </span>
              <h2 className="text-base font-extrabold font-mono text-white">
                Incident Response Playbook Actions
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
              Execute standardized SOC containment playbooks. All interventions are simulated safely inside the PloyWeb containment sandbox without touching real operating systems or network infrastructure.
            </p>
          </div>
        </div>

        {/* Action Count Pill */}
        <div className="px-4 py-2.5 rounded-xl bg-[#070b14] border border-[#1b2a47] font-mono text-xs flex items-center gap-3">
          <span className="text-slate-400">Executed Actions:</span>
          <span className="text-cyan-400 font-extrabold text-sm">{actions.length}</span>
        </div>
      </div>

      {/* Execution Alert Toast */}
      {lastActionResult && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 font-mono text-xs flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-bold uppercase text-white">
                Playbook Executed: {lastActionResult.title}
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">{lastActionResult.details}</p>
            </div>
          </div>
          <button
            onClick={() => setLastActionResult(null)}
            className="text-emerald-400 hover:text-white px-2 py-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Playbooks Grid */}
      <div>
        <h3 className="text-sm font-bold font-mono text-white mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Recommended Incident Response Playbooks</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {responsePlaybooks.map((pb) => {
            const Icon = pb.icon;
            const isRunning = executing === pb.id;

            return (
              <div
                key={pb.id}
                className={`p-5 rounded-2xl border ${pb.color} flex flex-col justify-between transition-all duration-200 cyber-card`}
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

                  <h4 className="text-sm font-bold font-mono text-white mt-1">
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
                <div className="mt-4 pt-3 border-t border-[#1b2a47] flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500">
                    Simulation Only
                  </span>
                  <button
                    onClick={() => handleExecute(pb.id)}
                    disabled={isRunning}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                  >
                    <span>{isRunning ? 'Executing...' : 'Execute Countermeasure'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Audit Ledger Table */}
      <div className="cyber-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1b2a47]">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Incident Response Execution Ledger & Audit Trail</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Immutable log of defensive interventions with operator signatures
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {actions.length} Actions Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1b2a47] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Action ID</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Playbook Action</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Mitigation Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2a47]/60">
              {actions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No response actions executed yet. Select a playbook above and click "Execute Countermeasure".
                  </td>
                </tr>
              ) : (
                actions.map((act) => (
                  <tr key={act.id} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="py-2.5 px-3 text-cyan-400 font-semibold whitespace-nowrap">
                      {act.id}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {act.timestamp ? act.timestamp.replace('T', ' ').slice(0, 19) : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-white font-bold whitespace-nowrap">
                      {act.title}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300 font-semibold whitespace-nowrap">
                      {act.target}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold">
                        EXECUTED_SIMULATED
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-purple-300 whitespace-nowrap">
                      {act.operator}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-sm truncate" title={act.details}>
                      {act.mitigation_impact}
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
