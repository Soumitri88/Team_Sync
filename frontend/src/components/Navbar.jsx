import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Menu
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentPath, onNavigate, onToggleSidebar }) => {
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

  const isThreat = stats?.overall_status === 'CRITICAL_THREAT' || stats?.overall_status === 'ELEVATED_RISK';

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/simulation': return 'Simulator';
      case '/tracegraph': return 'Attack Path';
      case '/blast-radius': return 'Blast Radius';
      case '/incident-response': return 'Incident Response';
      case '/canary-twin': return 'Decoy Traps';
      case '/events': return 'Security Logs';
      case '/evidence': return 'Evidence Ledger';
      case '/reports': return 'Investigation Report';
      case '/settings': return 'Settings';
      default: return 'SOC Console';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800 px-3.5 py-2.5 sm:px-6 sm:py-3">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger menu on mobile + Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 md:hidden transition-colors flex-shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-cyan-400" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 min-w-0">
            <span className="font-bold text-slate-100 text-xs sm:text-sm truncate">{getPageTitle(currentPath)}</span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block flex-shrink-0" />

          {/* Threat Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
            isThreat 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isThreat ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span>{isThreat ? 'Intrusion Detected' : 'Protected'}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>{time} UTC</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh Telemetry"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Run Demo Button */}
          {!demoActive && (
            <button
              onClick={startDemo}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Run Demo</span>
            </button>
          )}

          {/* User Name */}
          <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-slate-800 text-xs">
            <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[10px] font-bold text-cyan-300">
              {user?.avatar || 'AV'}
            </div>
            <span className="hidden sm:inline text-slate-300 font-medium text-xs">{user?.name || 'Operator'}</span>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {activeAlert && (
        <div className="mt-2 p-2 sm:p-2.5 rounded-lg bg-red-950/90 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="truncate"><strong>{activeAlert.title}:</strong> {activeAlert.description}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                onNavigate('/tracegraph');
                setActiveAlert(null);
              }}
              className="underline text-cyan-300 hover:text-cyan-200 font-semibold text-[11px] whitespace-nowrap"
            >
              Attack Path →
            </button>
            <button
              onClick={() => setActiveAlert(null)}
              className="text-slate-400 hover:text-white px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
