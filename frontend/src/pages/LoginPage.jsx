import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  User,
  Lock,
  KeyRound,
  ArrowRight,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Check,
  Fingerprint,
  Smartphone,
  Info
} from 'lucide-react';
import { useAuth, DEMO_ADMINS, DEMO_EMPLOYEES } from '../context/AuthContext';

export const LoginPage = ({ onLoginSuccess }) => {
  const { loginDemoPersona, loginWithCredentials, verifyMFA } = useAuth();
  const [portalType, setPortalType] = useState('admin'); // 'admin' | 'employee'

  // Manual credentials state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // MFA Challenge State
  const [mfaChallenge, setMfaChallenge] = useState(null); // { session_id, simulated_otp, risk_score, risk_signals }
  const [mfaCode, setMfaCode] = useState('');

  // Selected persona for quick login
  const [selectedAdmin, setSelectedAdmin] = useState('commander');
  const [selectedEmployee, setSelectedEmployee] = useState('david');

  const handleManualLogin = async (e) => {
    e?.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username/Employee ID and password.');
      return;
    }
    setErrorMsg(null);
    setIsAuthenticating(true);

    try {
      const res = await loginWithCredentials(username, password);
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else if (res.mfa_required) {
        setMfaChallenge(res);
        setMfaCode(res.simulated_otp || '');
      } else {
        setErrorMsg(res.error || 'Authentication failed.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to backend auth engine.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleVerifyMFA = async (e) => {
    e?.preventDefault();
    if (!mfaCode || !mfaChallenge) return;
    setIsAuthenticating(true);
    setErrorMsg(null);

    try {
      const res = await verifyMFA(mfaChallenge.session_id, mfaCode);
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setErrorMsg(res.error || 'Invalid verification code.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickPersonaLogin = (key) => {
    loginDemoPersona(key, portalType);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden select-none">
      {/* Ambient Grid Lines & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-xl bg-[#090e1a]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#0d1527] to-[#090e1a] border-b border-[#1b2a47] text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-neon-cyan mb-2.5">
            <div className="w-full h-full bg-[#070b14] rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white">
            PLOY<span className="text-cyan-400">WEB</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-mono text-cyan-300 mt-1 uppercase tracking-widest">
            Autonomous Cyber Investigation & Threat Detection Platform
          </p>

          {/* Dual Portal Switcher Tabs */}
          <div className="mt-4 p-1 rounded-xl bg-black/60 border border-white/10 flex items-center gap-1 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setPortalType('admin');
                setErrorMsg(null);
                setMfaChallenge(null);
                setUsername('avance.soc');
                setPassword('PloyWeb@2026!');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                portalType === 'admin'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-neon-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Master Admin / SOC</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalType('employee');
                setErrorMsg(null);
                setMfaChallenge(null);
                setUsername('david.webb');
                setPassword('Employee@2026!');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                portalType === 'employee'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Employee / Customer Portal</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Error / Lockout Alert Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Authentication Notice:</span>
                <span className="text-[11px] leading-relaxed">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* MFA Challenge Screen (if triggered by Risk Engine) */}
          {mfaChallenge ? (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-3 font-mono animate-fadeIn">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-bold text-amber-200 uppercase">
                  Step-Up MFA Challenge Triggered
                </h3>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {mfaChallenge.message}
              </p>

              {/* Explainable Signals */}
              <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1 text-[10px]">
                <span className="text-slate-400 font-bold block uppercase">Risk Engine Signals (Score: {mfaChallenge.risk_score} pts):</span>
                {(mfaChallenge.risk_signals || []).map((s, idx) => (
                  <div key={idx} className="flex justify-between text-amber-300">
                    <span>• {s.signal}</span>
                    <span>+{s.weight} pts</span>
                  </div>
                ))}
              </div>

              {/* Simulated Demo OTP Box */}
              <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-300 block">SIMULATED OTP (DEMO MODE):</span>
                  <span className="text-base font-extrabold text-white tracking-widest">{mfaChallenge.simulated_otp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMfaCode(mfaChallenge.simulated_otp)}
                  className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px]"
                >
                  Auto-Fill OTP
                </button>
              </div>

              <form onSubmit={handleVerifyMFA} className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Enter 6-Digit OTP:</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={e => setMfaCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-[#070b14] border border-amber-500/50 rounded-xl px-3 py-2 text-center text-lg font-bold tracking-widest text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMfaChallenge(null)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-colors"
                  >
                    {isAuthenticating ? 'Verifying...' : 'Verify MFA & Complete Login'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Normal Login Form */
            <>
              {/* Quick Persona Selector for Hackathon Judges */}
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 tracking-wider block mb-2">
                  {portalType === 'admin' ? 'Select SOC Operator Persona' : 'Select Employee Persona (NovaTech Solutions)'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {portalType === 'admin'
                    ? Object.entries(DEMO_ADMINS).slice(0, 2).map(([k, u]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleQuickPersonaLogin(k)}
                          className="p-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-[#0d1527]/70 hover:bg-[#101b33] text-left transition-all font-mono"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-xs">{u.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                              {u.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{u.role_label}</div>
                        </button>
                      ))
                    : Object.entries(DEMO_EMPLOYEES).map(([k, u]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleQuickPersonaLogin(k)}
                          className="p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-[#0d1527]/70 hover:bg-[#101b33] text-left transition-all font-mono"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-xs">{u.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                              {u.employee_id}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{u.department} • {u.role_label}</div>
                        </button>
                      ))}
                </div>
              </div>

              {/* Or Manual Credentials Login */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2 text-center">
                  Or Sign In with Corporate Credentials
                </span>

                <form onSubmit={handleManualLogin} className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">
                      {portalType === 'admin' ? 'Operator Username:' : 'Employee ID or Username:'}
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder={portalType === 'admin' ? 'avance.soc' : 'david.webb or EMP-041'}
                      className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Account Password:</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password (e.g. Employee@2026!)"
                      className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Lockout rule: 3 failed attempts max</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername(portalType === 'admin' ? 'avance.soc' : 'david.webb');
                        setPassword(portalType === 'admin' ? 'PloyWeb@2026!' : 'Employee@2026!');
                      }}
                      className="text-cyan-400 hover:underline"
                    >
                      Fill Demo Credentials
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                      portalType === 'admin'
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    }`}
                  >
                    <span>{isAuthenticating ? 'AUTHENTICATING...' : `LOG IN TO ${portalType.toUpperCase()} PORTAL`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
