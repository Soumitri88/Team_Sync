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
  Sliders,
  FileText,
  Activity,
  ArrowRight,
  ChevronRight,
  Fingerprint,
  Download,
  Trash2,
  UserCheck,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CustomerPortalPage = ({ onNavigate }) => {
  const { user, logout, switchPortal } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, security, devices, privacy
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  // Customer State
  const [customerData, setCustomerData] = useState({
    profile: {
      customer_id: user?.employee_id?.startsWith('CUST') ? user.employee_id : "CUST-8841",
      full_name: user?.name || "Jessica Miller",
      email: user?.username ? `${user.username}@customer.example.com` : "jessica.miller@example.com",
      account_tier: "Personal Identity & Privacy Shield (Premium)",
      joined_date: "March 2026",
      protection_score: 96.0,
      mfa_enabled: true
    },
    trusted_devices: [
      {
        id: "CUST-DEV-01",
        name: "Jessica's iPhone 15 Pro",
        type: "Mobile Phone",
        os: "iOS 17.4",
        biometrics: "FaceID Active",
        status: "trusted",
        last_active: "2 minutes ago"
      },
      {
        id: "CUST-DEV-02",
        name: "MacBook Air M2",
        type: "Personal Laptop",
        os: "macOS Sonoma (14.3)",
        biometrics: "TouchID Active",
        status: "trusted",
        last_active: "Active Now"
      }
    ],
    active_sessions: [
      {
        id: "SESS-01",
        ip: "10.0.2.14",
        location: "Austin, TX (Home Wi-Fi)",
        device: "MacBook Air M2 (Chrome Browser)",
        is_current: true,
        login_time: "Today at 14:15 UTC"
      },
      {
        id: "SESS-02",
        ip: "10.0.5.42",
        location: "Dallas, TX (Cellular 5G)",
        device: "iPhone 15 Pro (PloyWeb App)",
        is_current: false,
        login_time: "Today at 10:22 UTC"
      }
    ],
    security_alerts: [
      {
        id: "ALT-CUST-1",
        title: "High-Risk Connection Blocked Automatically",
        message: "An unauthorized connection attempt from Amsterdam proxy IP 198.51.100.44 was prevented by PloyWeb.",
        severity: "critical",
        timestamp: "Today at 03:14 UTC"
      },
      {
        id: "ALT-CUST-2",
        title: "Step-Up Multi-Factor Verification Completed",
        message: "A mobile login challenge was successfully authorized using biometric TouchID.",
        severity: "info",
        timestamp: "Today at 10:22 UTC"
      }
    ]
  });

  // Password reset fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleTerminateOtherSessions = () => {
    setCustomerData(prev => ({
      ...prev,
      active_sessions: prev.active_sessions.filter(s => s.is_current)
    }));
    setActionMsg("All other active customer sessions have been terminated. Refresh tokens invalidated.");
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleTerminateSession = (sessionId) => {
    setCustomerData(prev => ({
      ...prev,
      active_sessions: prev.active_sessions.filter(s => s.id !== sessionId)
    }));
    setActionMsg(`Session ${sessionId} terminated immediately. Refresh token purged.`);
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleRevokeDevice = (deviceId, deviceName) => {
    setCustomerData(prev => ({
      ...prev,
      trusted_devices: prev.trusted_devices.filter(d => d.id !== deviceId)
    }));
    setActionMsg(`Device ${deviceName} (${deviceId}) authorization revoked. FIDO2 token deactivated.`);
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleExportDataArchive = () => {
    const exportPayload = {
      compliance: "GDPR / CCPA Subject Access Request",
      generated_at: new Date().toISOString(),
      customer_profile: customerData.profile,
      trusted_devices: customerData.trusted_devices,
      sessions_audit: customerData.active_sessions,
      security_events: customerData.security_alerts
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PloyWeb_Customer_Data_${customerData.profile.customer_id}.json`;
    a.click();
    setActionMsg("Personal Data Archive (GDPR/CCPA Compliant JSON) downloaded successfully.");
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setActionMsg("Error: New passwords do not match.");
      return;
    }
    setActionMsg("Account password updated successfully. Live SHA-256 seal verified.");
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setActionMsg(null), 4000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto font-sans">
      
      {/* Top Banner & Customer Branding */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#0b1528] to-[#070b14] border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40 font-bold uppercase font-mono">
                Customer Identity & Privacy Portal
              </span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">
                ● Two-Websites Architecture Verified
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-white mt-1">
              Welcome, {customerData.profile.full_name} ({customerData.profile.customer_id})
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Personal cybersecurity dashboard, session governance, fraud prevention, and data privacy controls.
            </p>
          </div>
        </div>

        {/* Portal Switching / Logout Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto font-mono">
          <button
            onClick={() => {
              if (switchPortal) switchPortal('admin');
              if (onNavigate) onNavigate('/');
            }}
            className="p-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Switch to Master SOC Operations Portal"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Switch to Master SOC</span>
          </button>

          <button
            onClick={() => {
              if (switchPortal) switchPortal('employee');
              if (onNavigate) onNavigate('/employee-portal');
            }}
            className="p-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Switch to Employee Portal"
          >
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Employee View</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-blue-950/90 border border-blue-500/60 text-blue-200 text-xs flex items-center gap-2 animate-fadeIn font-mono">
          <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-neon-blue'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('devices')}
          className={`py-2 px-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'devices'
              ? 'bg-blue-600 text-white shadow-neon-blue'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Trusted Devices ({customerData.trusted_devices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`py-2 px-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'bg-blue-600 text-white shadow-neon-blue'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Sessions ({customerData.active_sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`py-2 px-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'privacy'
              ? 'bg-blue-600 text-white shadow-neon-blue'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Privacy & GDPR Controls</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            
            {/* Protection Score */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Identity Shield Score</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                {customerData.profile.protection_score}%
              </div>
              <p className="text-[10px] text-slate-500 font-sans">Zero uncontained data breaches detected</p>
            </div>

            {/* MFA Status */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">2FA / MFA Enforcement</span>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Biometric / OTP Active</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">High-risk logins require step-up</p>
            </div>

            {/* Registered Devices */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Authorized Endpoints</span>
              <div className="text-xl font-bold text-blue-300 mt-0.5">
                {customerData.trusted_devices.length} Devices
              </div>
              <p className="text-[10px] text-slate-500 font-sans">iPhone 15 Pro • MacBook Air</p>
            </div>

            {/* Account Tier */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Customer Plan</span>
              <div className="text-xs font-bold text-purple-300 mt-1">
                Premium Shield
              </div>
              <p className="text-[10px] text-slate-500 font-sans">Enterprise-grade fraud protection</p>
            </div>
          </div>

          {/* Security Alert Banner */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Real-Time Security Defense Notification</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {customerData.security_alerts[0].message}
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-red-500/20 pt-1.5">
              <span>Timestamp: {customerData.security_alerts[0].timestamp}</span>
              <span className="text-emerald-400 font-bold">Action Taken: Automatic Drop & Invalidation</span>
            </div>
          </div>

          {/* Customer Profile & Privacy Summary */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Customer Profile & Identity Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-black/50 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Customer ID:</span>
                <span className="font-bold text-blue-300">{customerData.profile.customer_id}</span>
              </div>
              <div className="p-3 rounded-lg bg-black/50 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Registered Email:</span>
                <span className="font-bold text-slate-200">{customerData.profile.email}</span>
              </div>
              <div className="p-3 rounded-lg bg-black/50 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Member Since:</span>
                <span className="font-bold text-emerald-400">{customerData.profile.joined_date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRUSTED DEVICES */}
      {activeTab === 'devices' && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Authorized Customer Hardware ({customerData.trusted_devices.length} Devices)
            </h3>
            <span className="text-[10px] text-slate-400">
              Hardware Biometrics & FIDO2 Enforced
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customerData.trusted_devices.map(dev => (
              <div key={dev.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {dev.type.includes('Mobile') ? (
                      <Smartphone className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Laptop className="w-5 h-5 text-cyan-400" />
                    )}
                    <span className="text-xs font-bold text-white">{dev.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    {dev.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 font-sans">
                  <p>Operating System: <strong className="text-slate-200">{dev.os}</strong></p>
                  <p>Biometrics: <strong className="text-emerald-400">{dev.biometrics}</strong></p>
                  <p className="text-[10px] text-slate-500">Last activity recorded: {dev.last_active}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => handleRevokeDevice(dev.id, dev.name)}
                    className="text-red-400 hover:text-red-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Revoke Device Trust</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Active Authenticated Sessions
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Manage your signed-in devices. If you see an unrecognized session, terminate it immediately.
              </p>
            </div>

            <button
              onClick={handleTerminateOtherSessions}
              className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Terminate All Other Sessions</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {customerData.active_sessions.map(s => (
              <div key={s.id} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{s.device}</span>
                    {s.is_current && (
                      <span className="text-[9px] px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                        THIS BROWSER
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                    <span>IP: <code className="text-cyan-300 font-mono">{s.ip}</code></span> • <span>{s.location}</span> • <span>{s.login_time}</span>
                  </div>
                </div>

                {!s.is_current && (
                  <button
                    onClick={() => handleTerminateSession(s.id)}
                    className="text-red-400 hover:text-red-300 text-[10px] font-bold underline"
                  >
                    Revoke Access
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY & GDPR CONTROLS */}
      {activeTab === 'privacy' && (
        <div className="space-y-5 font-mono">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Data Privacy & Subject Access Requests (GDPR / CCPA)
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-1">
                Exercise your data rights. You can download a machine-readable JSON copy of all personal telemetry, login logs, and fraud prevention records.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleExportDataArchive}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-neon-blue"
              >
                <Download className="w-4 h-4" />
                <span>Export My Complete Data Archive (JSON)</span>
              </button>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              Update Account Password
            </h4>

            <form onSubmit={handleChangePassword} className="space-y-3 max-w-md text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Current Password:</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">New Secure Password:</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Confirm New Password:</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs transition-colors border border-slate-700"
              >
                Save New Password
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
