import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Flame,
  Radio,
  Network,
  Bug,
  Activity,
  ShieldCheck,
  FileCheck2,
  FileText,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';

export const Sidebar = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();
  const { stats, startDemo, demoActive } = useSecurity();

  const navItems = [
    { id: 'dashboard', label: 'Security Dashboard', path: '/', icon: LayoutDashboard },
    { id: 'simulation', label: 'Attack Simulator', path: '/simulation', icon: Flame, badge: '5 Scenarios' },
    { id: 'events', label: 'Live Security Events', path: '/events', icon: Radio, count: stats?.total_events },
    { id: 'tracegraph', label: 'TraceGraph Reconstruction', path: '/tracegraph', icon: Network, highlight: true },
    { id: 'canary-twin', label: 'Canary Twin (Deception)', path: '/canary-twin', icon: Bug, count: stats?.tripped_canaries_count, countColor: 'text-red-400 bg-red-950/80' },
    { id: 'blast-radius', label: 'Blast Radius Analysis', path: '/blast-radius', icon: Activity },
    { id: 'incident-response', label: 'Incident Response', path: '/incident-response', icon: ShieldCheck },
    { id: 'evidence', label: 'Evidence Ledger (SHA-256)', path: '/evidence', icon: FileCheck2 },
    { id: 'reports', label: 'Investigation Reports', path: '/reports', icon: FileText },
    { id: 'settings', label: 'Settings & Config', path: '/settings', icon: Settings },
  ];

  const getDefconBadge = () => {
    const status = stats?.overall_status || 'SECURE';
    if (status === 'CRITICAL_THREAT') {
      return { text: 'DEFCON 1 // BREACH', bg: 'bg-red-500/20 text-red-400 border-red-500/40', dot: 'bg-red-500' };
    }
    if (status === 'ELEVATED_RISK') {
      return { text: 'DEFCON 2 // HIGH ALERT', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', dot: 'bg-amber-500' };
    }
    return { text: 'DEFCON 5 // SECURE', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', dot: 'bg-emerald-400' };
  };

  const defcon = getDefconBadge();

  return (
    <aside className="w-64 min-w-[16rem] bg-[#090e1a] border-r border-[#1b2a47] flex flex-col h-screen select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1b2a47] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-neon-cyan flex items-center justify-center">
            <div className="w-full h-full bg-[#070b14] rounded-[7px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white">PLOY<span className="text-cyan-400">WEB</span></span>
              <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">v2.4</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight">Autonomous Cyber SOC</p>
          </div>
        </div>
      </div>

      {/* Threat Readiness Status Pill */}
      <div className="px-4 py-3 border-b border-[#1b2a47]/60 bg-[#070b14]/50">
        <div className="text-[10px] uppercase font-mono text-slate-400 mb-1 flex items-center justify-between">
          <span>SOC Threat Level</span>
          <span className="text-[9px] text-cyan-400">LIVE FEED</span>
        </div>
        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs font-mono font-semibold ${defcon.bg}`}>
          <span className={`w-2 h-2 rounded-full pulse-dot ${defcon.dot}`} />
          <span className="truncate">{defcon.text}</span>
        </div>
      </div>

      {/* Demo Mode Trigger CTA */}
      <div className="p-3">
        <button
          onClick={startDemo}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 border ${
            demoActive
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-neon-purple animate-pulse'
              : 'bg-gradient-to-r from-cyan-950/60 to-purple-950/60 hover:from-cyan-900/80 hover:to-purple-900/80 text-cyan-300 border-cyan-500/40 hover:border-cyan-400'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>{demoActive ? 'Demo Mode Active' : 'Launch 9-Step Demo Mode'}</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
          Investigation Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-[inset_0_1px_0_rgba(0,242,254,0.1)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    item.countColor || 'bg-slate-800 text-cyan-400 border border-cyan-500/20'
                  }`}
                >
                  {item.count}
                </span>
              )}

              {item.badge && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-900/40 text-purple-300 border border-purple-700/30">
                  {item.badge}
                </span>
              )}

              {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          );
        })}
      </div>

      {/* Operator User Card */}
      <div className="p-3 border-t border-[#1b2a47] bg-[#070b14]/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-cyan-400/40">
              {user?.avatar || 'SO'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'SOC Operator'}</div>
              <div className="text-[10px] font-mono text-cyan-400 truncate">{user?.role || 'Incident Analyst'}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
