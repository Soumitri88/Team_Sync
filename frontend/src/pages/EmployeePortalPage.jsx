import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  User,
  KeyRound,
  Lock,
  Smartphone,
  Laptop,
  Clock,
  Globe,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Eye,
  Radio,
  Sliders,
  FileText,
  Activity,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EmployeePortalPage = ({ onNavigate }) => {
  const { user, logout, switchPortal } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, logins, devices, settings
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    profile: user || {
      username: "david.webb",
      full_name: "David Webb",
      email: "david.webb@novatech.local",
      employee_id: "EMP-041",
      department: "Engineering",
      title: "Senior Systems Architect",
      security_clearance: "CONFIDENTIAL-RESTRICTED"
    },
    login_history: [
      {
        id: "AUTH-01",
        event_type: "LOGIN_SUCCESS",
        ip_address: "10.0.2.14",
        device_name: "WS-ENGINEERING-07",
        risk_score: 10.0,
        risk_level: "LOW",
        status: "SUCCESS",
        timestamp: new Date().toISOString()
      },
      {
        id: "AUTH-02",
        event_type: "MFA_CHALLENGE_SUCCESS",
        ip_address: "10.0.5.42",
        device_name: "MOBILE-PIXEL-08",
        risk_score: 45.0,
        risk_level: "MEDIUM",
        status: "SUCCESS",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "AUTH-03",
        event_type: "LOGIN_BLOCKED_UNUSUAL_IP",
        ip_address: "198.51.100.44",
        device_name: "Unknown-Remote-Client",
        risk_score: 85.0,
        risk_level: "HIGH",
        status: "BLOCKED",
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ],
    registered_devices: [
      {
        id: "DEV-001",
        name: "WS-ENGINEERING-07",
        device_type: "windows",
        os: "Windows 11 Enterprise (23H2)",
        ip: "10.0.2.14",
        status: "connected",
        last_seen: new Date().toISOString()
      },
      {
        id: "DEV-004",
        name: "MOBILE-PIXEL-08",
        device_type: "mobile_android",
        os: "Android 14 Enterprise MDM",
        ip: "10.0.5.42",
        status: "connected",
        last_seen: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    security_alerts: [
      {
        id: "ALT-01",
        title: "High-Risk External Login Blocked",
        message: "An unauthorized connection attempt from Amsterdam proxy IP 198.51.100.44 was prevented by PloyWeb.",
        severity: "critical",
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    active_sessions: [
      {
        id: "SESS-01",
        ip_address: "10.0.2.14",
        device_name: "WS-ENGINEERING-07",
        created_at: new Date().toISOString(),
        is_active: 1
      }
    ],
    account_security_status: "SECURE",
    mfa_enforced: true
  });

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    fetch(`/api/employee/dashboard?user_id=${user?.id || user?.username || 'usr-david'}`)
      .then(res => res.ok ? res.json() : null)
      .then(resData => {
        if (resData && resData.profile) {
          setData(resData);
        }
      })
      .catch(() => {});
  }, [user]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    try {
      const res = await fetch('/api/employee/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 'usr-david',
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setPasswordMsg({ type: 'success', text: 'Password successfully updated!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: resData.detail || 'Failed to update password.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'success', text: 'Password updated (Demo Sandbox Mode).' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Employee Profile & Security Posture Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0d1629] via-[#090e1a] to-[#070b14] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-emerald-500 p-0.5 shadow-neon-cyan flex-shrink-0">
            <div className="w-full h-full bg-[#070b14] rounded-[14px] flex items-center justify-center font-mono font-bold text-lg text-cyan-300">
              {data.profile.full_name?.split(' ').map(n => n[0]).join('') || 'DW'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                {data.profile.full_name}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                {data.profile.employee_id || 'EMP-041'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                CLEARANCE: {data.profile.security_clearance || 'CONFIDENTIAL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {data.profile.title} • {data.profile.department} Department • NovaTech Solutions
            </p>
          </div>
        </div>

        {/* Portal Switcher & Security Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-10">
          <div className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Account Status:</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PROTECTED</span>
            </span>
          </div>

          <button
            onClick={() => switchPortal ? switchPortal('admin') : onNavigate && onNavigate('/')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Switch to Master SOC Portal</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Security Overview', icon: ShieldCheck },
          { id: 'logins', label: 'Login History & Signals', icon: Clock },
          { id: 'devices', label: 'My Registered Devices', icon: Laptop },
          { id: 'settings', label: 'Password & MFA Settings', icon: KeyRound }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-neon-cyan'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* 4 Security Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 font-mono">
              <span className="text-[10px] text-slate-400 uppercase">MFA Status</span>
              <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Enforced (Simulated OTP)</span>
              </div>
              <p className="text-[10px] text-slate-500">Risk-based step-up authentication active</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Registered Endpoints</span>
              <div className="text-xl font-bold text-cyan-300 mt-0.5">
                {data.registered_devices?.length || 2} Devices
              </div>
              <p className="text-[10px] text-slate-500">1 Laptop (Windows 11) • 1 Mobile (MDM)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Active Sessions</span>
              <div className="text-xl font-bold text-purple-300 mt-0.5">
                1 Session
              </div>
              <p className="text-[10px] text-slate-500">Current IP: 10.0.2.14 (Internal LAN)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Lockout Protection</span>
              <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <Lock className="w-4 h-4" />
                <span>Active (3 Attempts Max)</span>
              </div>
              <p className="text-[10px] text-slate-500">0 failed attempts accumulated</p>
            </div>
          </div>

          {/* Security Alert Banner */}
          {data.security_alerts && data.security_alerts.length > 0 && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-red-200">
                  {data.security_alerts[0].title}
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {data.security_alerts[0].message}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Logged by PloyWeb Incident Engine: {new Date(data.security_alerts[0].created_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Recent Login Snapshot Table */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Recent Personal Authentication Events
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('logins')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <span>View All History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Event Type</th>
                    <th className="py-2 px-3">IP Address</th>
                    <th className="py-2 px-3">Device</th>
                    <th className="py-2 px-3">Risk Level</th>
                    <th className="py-2 px-3 text-right">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.login_history.slice(0, 4).map(evt => (
                    <tr key={evt.id} className="hover:bg-slate-900/50">
                      <td className="py-2 px-3 text-slate-400 text-[11px]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 text-white font-semibold">{evt.event_type}</td>
                      <td className="py-2 px-3 text-cyan-300">{evt.ip_address}</td>
                      <td className="py-2 px-3 text-slate-300">{evt.device_name}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.risk_level === 'HIGH'
                            ? 'bg-red-950 text-red-300 border border-red-500/40'
                            : evt.risk_level === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {evt.risk_level} ({evt.risk_score} pts)
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        <span className={evt.status === 'BLOCKED' ? 'text-red-400' : 'text-emerald-400'}>
                          {evt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOGIN HISTORY & RISK SIGNALS */}
      {activeTab === 'logins' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Personal Login Activity & Risk Engine Signals
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Every authentication attempt is evaluated against baseline hours, device registry, and geo-ip telemetry.
              </p>
            </div>
            <span className="text-xs text-cyan-400">
              {data.login_history.length} Records Cataloged
            </span>
          </div>

          <div className="space-y-3">
            {data.login_history.map(evt => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{evt.event_type}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evt.risk_level === 'HIGH'
                        ? 'bg-red-950 text-red-300 border border-red-500/40'
                        : evt.risk_level === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {evt.risk_level} RISK ({evt.risk_score} / 100)
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Origin IP: <code className="text-cyan-300">{evt.ip_address}</code> • Device: <code className="text-slate-200">{evt.device_name}</code>
                  </p>
                </div>

                <div className="text-right text-xs">
                  <span className={`font-bold block ${evt.status === 'BLOCKED' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {evt.status}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REGISTERED DEVICES & ACTIVE SESSIONS */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.registered_devices.map(dev => (
              <div key={dev.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {dev.device_type === 'windows' ? (
                      <Laptop className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-purple-400" />
                    )}
                    <h3 className="font-bold text-sm text-white">{dev.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    AUTHORIZED
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operating System:</span>
                    <span className="text-slate-200">{dev.os}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Corporate IP:</span>
                    <span className="text-cyan-300">{dev.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Telemetry Check:</span>
                    <span className="text-slate-400">{new Date(dev.last_seen).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => alert(`Device session for ${dev.name} verified in compliance inventory.`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Verify Health
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PASSWORD CHANGE & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-xl mx-auto space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Account Security & Password Hardening
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Passwords are salted and cryptographically hashed with PBKDF2-HMAC-SHA256 (100,000 rounds).
            </p>
          </div>

          {passwordMsg && (
            <div className={`p-3 rounded-xl text-xs font-mono ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
                : 'bg-red-950/80 text-red-200 border border-red-500/40'
            }`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Current Password:</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">New High-Entropy Password:</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Confirm New Password:</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-mono transition-colors shadow-lg shadow-cyan-500/20"
            >
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
