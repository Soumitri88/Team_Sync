import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bell, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentPath, onNavigate }) => {
  const { stats, refreshAll, demoActive, startDemo, activeAlert, setActiveAlert } = useSecurity();
  const { user } = useAuth();
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25));
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getDefconStyle = () => {
    const status = stats?.overall_status || 'SECURE';
    if (status === 'CRITICAL_THREAT') {
      return {
        badge: 'DEFCON 1 // BREACH IN PROGRESS',
        color: 'text-red-400 bg-red-950/80 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        pulse: 'bg-red-500 animate-ping'
      };
    }
    if (status === 'ELEVATED_RISK') {
      return {
        badge: 'DEFCON 2 // HIGH INTRUSION ALERT',
        color: 'text-amber-400 bg-amber-950/80 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
        pulse: 'bg-amber-500 animate-ping'
      };
    }
    return {
      badge: 'DEFCON 5 // SOC NOMINAL',
      color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50',
      pulse: 'bg-emerald-400'
    };
  };

  const defcon = getDefconStyle();

  return (
    <header className="sticky top-0 z-20 bg-[#090e1a]/95 backdrop-blur-md border-b border-[#1b2a47] px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Path Breadcrumbs & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold tracking-wide">SOC-CONSOLE</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200 capitalize font-medium">
              {currentPath.replace('/', '') || 'Security Dashboard'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* DEFCON indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-bold border transition-all ${defcon.color}`}>
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${defcon.pulse}`}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
            </span>
            <span>{defcon.badge}</span>
          </div>
        </div>

        {/* Right: SOC Controls, UTC Clock, Telemetry status */}
        <div className="flex items-center gap-3">
          {/* Telemetry Stream Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0d1527] border border-[#1b2a47] text-[11px] font-mono text-slate-300">
            <Wifi className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">Telemetry:</span>
            <span className="text-cyan-300 font-semibold">STREAMING</span>
          </div>

          {/* UTC Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0d1527] border border-[#1b2a47] text-[11px] font-mono text-slate-300">
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="text-purple-300 font-bold">{time} UTC</span>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={handleRefresh}
            title="Refresh Security Telemetry"
            className="p-1.5 rounded-lg bg-[#0d1527] border border-[#1b2a47] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Demo Mode Button (if not already in demo) */}
          {!demoActive && (
            <button
              onClick={startDemo}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-900/60 to-purple-900/60 hover:from-cyan-800/80 hover:to-purple-800/80 text-cyan-200 border border-cyan-500/40 text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Mode</span>
            </button>
          )}

          {/* Operator Profile Tag */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded bg-purple-950 border border-purple-500/50 flex items-center justify-center text-xs font-bold font-mono text-purple-300">
              {user?.avatar || 'OP'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-none">{user?.name || 'Operator'}</div>
              <div className="text-[9px] font-mono text-slate-400 mt-0.5 leading-none">{user?.badge || 'CLEARANCE-L1'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Active Critical Alert Notification if present */}
      {activeAlert && (
        <div className="mt-2 p-2.5 rounded-lg bg-red-950/90 border border-red-500/80 text-red-200 text-xs font-mono flex items-center justify-between animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <div>
              <span className="font-bold uppercase text-red-300">{activeAlert.title}</span>
              <span className="mx-2 text-red-500">•</span>
              <span className="text-slate-200">{activeAlert.description}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/tracegraph')}
              className="px-2 py-0.5 rounded bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-semibold border border-red-400/50 flex items-center gap-1"
            >
              Inspect in TraceGraph →
            </button>
            <button
              onClick={() => setActiveAlert(null)}
              className="text-red-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
