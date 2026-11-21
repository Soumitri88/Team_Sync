import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  UserCheck, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  ArrowRight, 
  KeyRound,
  Fingerprint,
  Cpu,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onLoginSuccess }) => {
  const { login, DEMO_USERS } = useAuth();
  const [selectedRole, setSelectedRole] = useState('commander');
  const [customName, setCustomName] = useState('');
  const [accessKey, setAccessKey] = useState('SOC-SIGMA-8842');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e) => {
    e?.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      login(selectedRole, customName);
      setIsAuthenticating(false);
      if (onLoginSuccess) onLoginSuccess();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Cyber Grid Lines & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-xl bg-[#090e1a]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Top SOC Banner */}
        <div className="p-6 bg-gradient-to-b from-[#0d1527] to-[#090e1a] border-b border-[#1b2a47] text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-neon-cyan mb-3">
            <div className="w-full h-full bg-[#070b14] rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider text-white">
            PLOY<span className="text-cyan-400">WEB</span>
          </h1>
          <p className="text-xs font-mono text-cyan-300 mt-1 uppercase tracking-widest">
            Autonomous Cyber Investigation & Attack Graph Reconstruction
          </p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>ENTERPRISE SOC ENVIRONMENT READY</span>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 tracking-wider block mb-2">
              Select Operator Clearance Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {Object.entries(DEMO_USERS).map(([key, u]) => {
                const isSelected = selectedRole === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedRole(key);
                      setCustomName('');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 relative ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-neon-cyan'
                        : 'bg-[#0d1527]/70 border-slate-800 hover:border-slate-700 hover:bg-[#101b33]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="w-6 h-6 rounded bg-slate-900 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 flex items-center justify-center">
                        {u.avatar}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-neon-cyan" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white truncate">{u.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{u.role}</div>
                    <span className="text-[9px] font-mono mt-1.5 inline-block px-1.5 py-0.2 rounded bg-slate-900/80 text-purple-300 border border-purple-500/30">
                      {u.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Name (Optional Override) */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>Or Custom SOC Operator Call-Sign</span>
              <span className="text-[10px] text-slate-500">Optional</span>
            </div>
            <div className="relative">
              <Terminal className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Commander Shepard"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  setSelectedRole('custom');
                }}
                className="w-full bg-[#070b14] border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Access Key Simulation */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Cryptographic Session Token / Access Key
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-neon-cyan flex items-center justify-center gap-2 transition-all duration-200"
          >
            {isAuthenticating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Biometric & Cryptographic Seals...</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4" />
                <span>Initialize SOC Investigation Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#070b14]/70 border-t border-[#1b2a47] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Non-destructive AI Simulation Sandbox</span>
          <span className="text-cyan-400/80">SHA-256 Ledger Verified</span>
        </div>
      </div>
    </div>
  );
};
