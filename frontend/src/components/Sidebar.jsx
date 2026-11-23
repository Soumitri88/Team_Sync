import React from 'react';
import {
  LayoutDashboard,
  Flame,
  Network,
  Activity,
  ShieldCheck,
  Radio,
  Bug,
  FileCheck2,
  FileText,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';

export const Sidebar = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();
  const { stats, startDemo, demoActive } = useSecurity();

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { id: 'simulation', label: 'Attack Simulator', path: '/simulation', icon: Flame },
    { id: 'tracegraph', label: 'Attack Path (Graph)', path: '/tracegraph', icon: Network },
    { id: 'blast-radius', label: 'Impact & Blast Radius', path: '/blast-radius', icon: Activity },
    { id: 'incident-response', label: 'Incident Response', path: '/incident-response', icon: ShieldCheck },
  ];

  const secondaryNav = [
    { id: 'canary-twin', label: 'Decoy Traps (Canary)', path: '/canary-twin', icon: Bug },
    { id: 'events', label: 'Event Logs', path: '/events', icon: Radio },
    { id: 'evidence', label: 'Evidence Hashes', path: '/evidence', icon: FileCheck2 },
    { id: 'reports', label: 'Investigation Report', path: '/reports', icon: FileText },
    { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
  ];

  const isThreat = stats?.overall_status === 'CRITICAL_THREAT' || stats?.overall_status === 'ELEVATED_RISK';

  return (
    <aside className="w-60 min-w-[15rem] bg-[#0c1220] border-r border-slate-800 flex flex-col h-screen select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
              <span>PLOY<span className="text-cyan-400">WEB</span></span>
            </div>
            <p className="text-[10px] text-slate-400">Cyber Investigation SOC</p>
          </div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">System Status:</span>
        <span className={`flex items-center gap-1.5 font-semibold text-[11px] ${
          isThreat ? 'text-red-400' : 'text-emerald-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isThreat ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
          {isThreat ? 'Threat Active' : 'Protected'}
        </span>
      </div>

      {/* Demo Button */}
      <div className="p-3">
        <button
          onClick={startDemo}
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            demoActive
              ? 'bg-purple-600 text-white shadow-md animate-pulse'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{demoActive ? 'Demo Active' : 'Run Demo Attack'}</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {/* Core Nav */}
        <div className="space-y-0.5">
          <div className="px-2.5 pb-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Main Features
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            );
          })}
        </div>

        {/* Forensic & Evidence Nav */}
        <div className="space-y-0.5 pt-2 border-t border-slate-800/60">
          <div className="px-2.5 pb-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Forensics & Audit
          </div>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300">
            {user?.avatar || 'AV'}
          </div>
          <div className="truncate text-left">
            <div className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Alex Vance'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.role || 'Incident Analyst'}</div>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
