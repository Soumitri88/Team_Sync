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
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
      role: "employee"
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
      role: "employee"
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
      role: "employee"
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
      role: "admin"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [actionStatusMsg, setActionStatusMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/employees');
      if (res.ok) {
        const data = await res.json();
        if (data && data.employees && data.employees.length > 0) {
          setEmployees(data.employees);
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
        setActionStatusMsg(`Account ${emp.username} set to ${newLockState === 1 ? 'LOCKED' : 'UNLOCKED'} (Demo Mode).`);
      }
    } catch (err) {
      setActionStatusMsg(`Account ${emp.username} set to ${newLockState === 1 ? 'LOCKED' : 'UNLOCKED'} (Demo Mode).`);
    }

    setEmployees(prev => prev.map(e => e.user_id === emp.user_id ? { ...e, is_locked: newLockState, failed_attempts: 0 } : e));
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
            <h1 className="text-base sm:text-lg font-extrabold text-white">
              Enterprise Employee Access & Identity Management
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Centralized identity governance, account lockout controls, security clearance verification, and forensic access audit.
            </p>
          </div>
        </div>

        <button
          onClick={fetchEmployees}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 self-start md:self-auto transition-colors flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
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
            placeholder="Search by employee name, username, or ID (e.g. EMP-041)..."
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
            NovaTech Solutions Personnel Roster ({filteredEmployees.length} Records)
          </h2>
          <span className="text-xs text-slate-400">
            RBAC Enforced
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
                <th className="py-2.5 px-3 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.map(emp => (
                <tr key={emp.user_id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{emp.full_name}</div>
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
                        <Lock className="w-3 h-3" />
                        <span>ACCOUNT LOCKED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        <span>ACTIVE / NOMINAL</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleLock(emp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto ${
                        emp.is_locked === 1
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-neon-emerald'
                          : 'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40'
                      }`}
                    >
                      {emp.is_locked === 1 ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock Account</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Lock Account</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
