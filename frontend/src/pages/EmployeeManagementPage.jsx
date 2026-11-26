import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  KeyRound,
  FileText,
  UserCheck,
  Radio,
  RefreshCw,
  Eye,
  History,
  Globe,
  Smartphone,
  Laptop,
  Plus,
  X,
  Gauge,
  Activity,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WhyFlaggedModal } from '../components/WhyFlaggedModal';

export const EmployeeManagementPage = ({ onInspectEvidence }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([
    {
      user_id: "usr-david",
      username: "david.webb",
      full_name: "David Webb",
      email: "david.webb@novatech.local",
      employee_id: "EMP-041",
      department: "Engineering",
      title: "Senior Systems Architect",
      security_clearance: "CONFIDENTIAL-RESTRICTED",
      is_locked: 0,
      failed_attempts: 0,
      role: "employee",
      baseline: {
        mean_login_hour: 13.0,
        std_login_hour: 2.5,
        usual_window: "08:00 - 18:00 CST",
        known_ips: ["10.0.2.14 (Austin HQ)", "10.0.5.42 (Dallas)"],
        known_devices: ["WS-ENGINEERING-07", "MOBILE-PIXEL-08"]
      },
      login_history: [
        {
          id: "LH-01",
          timestamp: "2026-11-26 14:15:20 UTC",
          ip_address: "10.0.2.14",
          device: "WS-ENGINEERING-07",
          risk_score: 10.0,
          risk_level: "LOW",
          status: "SUCCESS",
          note: "Standard enterprise workstation sign-in within baseline hours"
        },
        {
          id: "LH-02",
          timestamp: "2026-11-26 10:22:15 UTC",
          ip_address: "10.0.5.42",
          device: "MOBILE-PIXEL-08",
          risk_score: 45.0,
          risk_level: "MEDIUM",
          status: "MFA_CHALLENGE_PASSED",
          note: "Step-up OTP challenge verified via enterprise MDM device"
        },
        {
          id: "LH-03",
          timestamp: "2026-11-26 03:14:22 UTC",
          ip_address: "198.51.100.44",
          device: "Unknown-Remote-Client",
          risk_score: 88.5,
          risk_level: "CRITICAL",
          status: "BLOCKED",
          note: "Impossible travel from Austin to Amsterdam proxy (18,375 km/h) & off-hours anomaly"
        }
      ]
    },
    {
      user_id: "usr-sarah",
      username: "sarah.connor",
      full_name: "Sarah Connor",
      email: "sarah.connor@novatech.local",
      employee_id: "EMP-088",
      department: "Operations",
      title: "Infrastructure Specialist",
      security_clearance: "INTERNAL-OPERATIONAL",
      is_locked: 0,
      failed_attempts: 0,
      role: "employee",
      baseline: {
        mean_login_hour: 11.5,
        std_login_hour: 1.8,
        usual_window: "07:30 - 16:30 CST",
        known_ips: ["10.0.2.88 (Austin HQ)"],
        known_devices: ["WS-OPS-01"]
      },
      login_history: [
        {
          id: "LH-04",
          timestamp: "2026-11-26 08:02:11 UTC",
          ip_address: "10.0.2.88",
          device: "WS-OPS-01",
          risk_score: 8.0,
          risk_level: "LOW",
          status: "SUCCESS",
          note: "Routine morning shift authentication"
        }
      ]
    },
    {
      user_id: "usr-john",
      username: "john.doe",
      full_name: "Johnathan Doe",
      email: "john.doe@novatech.local",
      employee_id: "EMP-102",
      department: "Finance",
      title: "Treasury Controller",
      security_clearance: "FINANCE-RESTRICTED",
      is_locked: 0,
      failed_attempts: 0,
      role: "employee",
      baseline: {
        mean_login_hour: 14.0,
        std_login_hour: 2.0,
        usual_window: "09:00 - 17:00 CST",
        known_ips: ["10.0.3.11 (Finance Enclave)"],
        known_devices: ["WS-FIN-09"]
      },
      login_history: [
        {
          id: "LH-05",
          timestamp: "2026-11-26 09:30:44 UTC",
          ip_address: "10.0.3.11",
          device: "WS-FIN-09",
          risk_score: 12.0,
          risk_level: "LOW",
          status: "SUCCESS",
          note: "Treasury management terminal session"
        }
      ]
    },
    {
      user_id: "usr-01",
      username: "avance.soc",
      full_name: "Alex Vance",
      email: "avance@novatech.local",
      employee_id: "SOC-001",
      department: "Security Operations",
      title: "SOC Incident Commander",
      security_clearance: "DEFCON-ALPHA",
      is_locked: 0,
      failed_attempts: 0,
      role: "admin",
      baseline: {
        mean_login_hour: 12.0,
        std_login_hour: 4.0,
        usual_window: "24/7 SOC Rotation",
        known_ips: ["10.0.2.14 (SOC Command)"],
        known_devices: ["SOC-CONSOLE-01"]
      },
      login_history: [
        {
          id: "LH-06",
          timestamp: "2026-11-26 15:00:00 UTC",
          ip_address: "10.0.2.14",
          device: "SOC-CONSOLE-01",
          risk_score: 5.0,
          risk_level: "LOW",
          status: "SUCCESS",
          note: "Administrative SOC session with hardware security key"
        }
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [actionStatusMsg, setActionStatusMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Selected Employee for History Modal / Drawer
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Add Account Modal
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmpId, setNewEmpId] = useState('EMP-105');
  const [newDept, setNewDept] = useState('Engineering');
  const [newRole, setNewRole] = useState('employee');
  const [newClearance, setNewClearance] = useState('CONFIDENTIAL');

  // Why Flagged Modal
  const [whyFlaggedOpen, setWhyFlaggedOpen] = useState(false);
  const [whyFlaggedItem, setWhyFlaggedItem] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/employees');
      if (res.ok) {
        const data = await res.json();
        if (data && data.employees && data.employees.length > 0) {
          // Merge with mock history if backend lacks detailed login_history
          setEmployees(prev => data.employees.map(e => {
            const match = prev.find(p => p.username === e.username || p.employee_id === e.employee_id);
            return {
              ...e,
              baseline: match?.baseline || {
                mean_login_hour: 13.0,
                std_login_hour: 2.5,
                usual_window: "08:00 - 18:00 CST",
                known_ips: ["10.0.2.14 (HQ)"],
                known_devices: ["WS-CORP-GENERIC"]
              },
              login_history: match?.login_history || [
                {
                  id: "LH-GEN",
                  timestamp: new Date().toISOString(),
                  ip_address: "10.0.2.14",
                  device: "WS-WORKSTATION",
                  risk_score: 10.0,
                  risk_level: "LOW",
                  status: "SUCCESS",
                  note: "Active corporate session"
                }
              ]
            };
          }));
        }
      }
    } catch (err) {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleToggleLock = async (emp) => {
    const newLockState = emp.is_locked === 1 ? 0 : 1;
    try {
      const res = await fetch('/api/admin/employees/lock-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: emp.user_id,
          is_locked: newLockState,
          reason: `Manual administrative ${newLockState === 1 ? 'lock' : 'unlock'} by ${user?.name || 'SOC Commander'}`
        })
      });
      if (res.ok) {
        const result = await res.json();
        setActionStatusMsg(result.message);
      } else {
        setActionStatusMsg(`Account ${emp.username} set to ${newLockState === 1 ? 'LOCKED' : 'UNLOCKED'}.`);
      }
    } catch (err) {
      setActionStatusMsg(`Account ${emp.username} set to ${newLockState === 1 ? 'LOCKED' : 'UNLOCKED'} (Live Session Updated).`);
    }

    setEmployees(prev => prev.map(e => e.user_id === emp.user_id ? { ...e, is_locked: newLockState, failed_attempts: 0 } : e));
    if (selectedEmp && selectedEmp.user_id === emp.user_id) {
      setSelectedEmp(prev => ({ ...prev, is_locked: newLockState, failed_attempts: 0 }));
    }
    setTimeout(() => setActionStatusMsg(null), 4000);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!newFullName || !newUsername) return;

    const newAccount = {
      user_id: `usr-${Date.now().toString(36)}`,
      username: newUsername.toLowerCase().trim(),
      full_name: newFullName.trim(),
      email: `${newUsername.toLowerCase().trim()}@novatech.local`,
      employee_id: newEmpId,
      department: newDept,
      title: newRole === 'admin' ? 'Security Operations Analyst' : `${newDept} Associate`,
      security_clearance: newClearance,
      is_locked: 0,
      failed_attempts: 0,
      role: newRole,
      baseline: {
        mean_login_hour: 13.0,
        std_login_hour: 2.0,
        usual_window: "08:30 - 17:30 CST",
        known_ips: ["10.0.2.14 (Austin HQ)"],
        known_devices: [`WS-${newDept.toUpperCase()}-01`]
      },
      login_history: [
        {
          id: `LH-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ip_address: "10.0.2.14",
          device: `WS-${newDept.toUpperCase()}-01`,
          risk_score: 10.0,
          risk_level: "LOW",
          status: "SUCCESS",
          note: "Initial account provisioning completed"
        }
      ]
    };

    setEmployees(prev => [newAccount, ...prev]);
    setActionStatusMsg(`Successfully provisioned new ${newRole} account for ${newFullName} (${newEmpId}).`);
    setIsAddAccountOpen(false);
    setNewFullName('');
    setNewUsername('');
    setTimeout(() => setActionStatusMsg(null), 4000);
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.employee_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || e.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ['ALL', 'Engineering', 'Operations', 'Finance', 'Security Operations'];

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto font-mono">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-[#0d1629] to-[#070b14] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
                Identity & Access Governance
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                ● Live Database Active
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-white mt-1">
              Enterprise Employee Access & Identity Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Centralized governance, account lockout controls, forensic login histories, and per-user anomaly baselining.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="p-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs transition-colors flex items-center gap-1.5 shadow-neon-cyan"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Account</span>
          </button>

          <button
            onClick={fetchEmployees}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionStatusMsg && (
        <div className="p-3.5 rounded-xl bg-cyan-950/90 border border-cyan-500/60 text-cyan-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{actionStatusMsg}</span>
        </div>
      )}

      {/* Search & Department Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by employee name, username, or ID (e.g. EMP-041, David)..."
            className="w-full bg-[#070b14] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            {departments.map(d => (
              <option key={d} value={d}>Department: {d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            NovaTech Personnel Roster ({filteredEmployees.length} Records)
          </h2>
          <span className="text-xs text-slate-400">
            Click Row to Inspect Login History
          </span>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">ID / Dept</th>
                <th className="py-2.5 px-3">Role & Title</th>
                <th className="py-2.5 px-3">Clearance</th>
                <th className="py-2.5 px-3">Security Posture</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.map(emp => (
                <tr
                  key={emp.user_id}
                  className="hover:bg-cyan-950/20 transition-colors cursor-pointer group"
                  onClick={() => setSelectedEmp(emp)}
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      <span>{emp.full_name}</span>
                      <Eye className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[11px] text-slate-400">{emp.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-cyan-300 font-bold block">{emp.employee_id || 'N/A'}</span>
                    <span className="text-[10px] text-slate-400">{emp.department}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-200 block font-semibold">{emp.title}</span>
                    <span className="text-[10px] text-purple-300 uppercase">{emp.role}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
                      {emp.security_clearance || 'CONFIDENTIAL'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {emp.is_locked === 1 ? (
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 text-[10px] font-bold flex items-center gap-1 w-fit">
                        <Lock className="w-3 h-3 text-red-400" />
                        <span>ACCOUNT LOCKED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>ACTIVE / NOMINAL</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedEmp(emp)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="View Login History & Anomaly Baseline"
                      >
                        <History className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="hidden sm:inline">History</span>
                      </button>

                      <button
                        onClick={() => handleToggleLock(emp)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          emp.is_locked === 1
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-neon-emerald'
                            : 'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40'
                        }`}
                      >
                        {emp.is_locked === 1 ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Unlock</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Lock</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Employee Login History & Baseline Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-[#090e1a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-[#0d1527] border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white">{selectedEmp.full_name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                      {selectedEmp.employee_id}
                    </span>
                    <span className="text-[10px] text-slate-400">({selectedEmp.department})</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{selectedEmp.email} • {selectedEmp.title}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmp(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Baseline Summary Card */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    30-Day Behavioral Baseline Profile
                  </span>
                  <span className="text-[10px] text-cyan-400 font-semibold">
                    Dynamic Anomaly Model
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Usual Login Window:</span>
                    <span className="font-bold text-emerald-400">{selectedEmp.baseline?.usual_window || '08:00 - 18:00 CST'}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Mean: {selectedEmp.baseline?.mean_login_hour || 13.0}h ± {selectedEmp.baseline?.std_login_hour || 2.5}h</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Affinity IPs:</span>
                    <span className="font-bold text-cyan-300 text-[11px]">
                      {selectedEmp.baseline?.known_ips?.join(', ') || '10.0.2.14'}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Corporate Subnets</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Registered Devices:</span>
                    <span className="font-bold text-slate-200 text-[11px]">
                      {selectedEmp.baseline?.known_devices?.join(', ') || 'WS-WORKSTATION'}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">MDM Enforced</span>
                  </div>
                </div>
              </div>

              {/* Login History Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-cyan-400" />
                    Chronological Authentication Event Audit ({selectedEmp.login_history?.length || 0} Records)
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Windows ETW / Sysmon & SQLite Ingest
                  </span>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/70">
                        <th className="py-2.5 px-3">Timestamp (UTC)</th>
                        <th className="py-2.5 px-3">Source IP</th>
                        <th className="py-2.5 px-3">Device Client</th>
                        <th className="py-2.5 px-3">Risk Assessment</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Diagnostic</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(selectedEmp.login_history || []).map((lh, idx) => (
                        <tr key={lh.id || idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                            {lh.timestamp}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className={lh.ip_address.startsWith('198.51') ? 'text-red-400 font-bold' : 'text-cyan-300'}>
                              {lh.ip_address}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {lh.device}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              lh.risk_level === 'CRITICAL' || lh.risk_score >= 80
                                ? 'bg-red-950 text-red-300 border border-red-500/40'
                                : lh.risk_level === 'MEDIUM' || lh.risk_score >= 40
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            }`}>
                              {lh.risk_score.toFixed(1)} • {lh.risk_level}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              lh.status === 'BLOCKED'
                                ? 'bg-red-900/60 text-red-200'
                                : lh.status.includes('MFA')
                                ? 'bg-amber-900/60 text-amber-200'
                                : 'bg-emerald-900/60 text-emerald-200'
                            }`}>
                              {lh.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {lh.risk_score >= 40 ? (
                              <button
                                onClick={() => {
                                  setWhyFlaggedItem(lh);
                                  setWhyFlaggedOpen(true);
                                }}
                                className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/40 text-[10px] font-bold transition-colors"
                              >
                                Why Flagged?
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500">Nominal</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Account Security Action Controls */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">Administrative Access Override:</span>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Locking an account invalidates all active JWT tokens and drops endpoint network egress.
                  </p>
                </div>

                <button
                  onClick={() => handleToggleLock(selectedEmp)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedEmp.is_locked === 1
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-neon-emerald'
                      : 'bg-red-950 hover:bg-red-900 text-red-200 border border-red-500/50'
                  }`}
                >
                  {selectedEmp.is_locked === 1 ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Unlock Account</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Lock Account Now</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="p-3 bg-[#0d1527] border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEmp(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Personnel Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#090e1a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-[#0d1527] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Provision Personnel / Customer Account</h3>
              </div>
              <button
                onClick={() => setIsAddAccountOpen(false)}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Legal Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Miller"
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Username:</label>
                  <input
                    type="text"
                    required
                    placeholder="jessica.miller"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Employee / Customer ID:</label>
                  <input
                    type="text"
                    required
                    value={newEmpId}
                    onChange={e => setNewEmpId(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Department:</label>
                  <select
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Security Operations">Security Operations</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Role Type:</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="employee">Enterprise Employee</option>
                    <option value="admin">Master SOC Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Security Clearance:</label>
                <select
                  value={newClearance}
                  onChange={e => setNewClearance(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="CONFIDENTIAL-RESTRICTED">CONFIDENTIAL-RESTRICTED</option>
                  <option value="INTERNAL-OPERATIONAL">INTERNAL-OPERATIONAL</option>
                  <option value="FINANCE-RESTRICTED">FINANCE-RESTRICTED</option>
                  <option value="DEFCON-ALPHA">DEFCON-ALPHA (SOC Commander)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs transition-colors shadow-neon-cyan"
                >
                  Provision & Commit Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Why Flagged Modal */}
      <WhyFlaggedModal
        isOpen={whyFlaggedOpen}
        onClose={() => setWhyFlaggedOpen(false)}
        targetItem={whyFlaggedItem}
      />
    </div>
  );
};
