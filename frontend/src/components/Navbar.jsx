import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  RefreshCw, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
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

  const isThreat = stats?.overall_status === 'CRITICAL_THREAT' || stats?.overall_status === 'ELEVATED_RISK';

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Dashboard Overview';
      case '/simulation': return 'Attack Simulator';
      case '/tracegraph': return 'Attack Path (TraceGraph)';
      case '/blast-radius': return 'Impact & Blast Radius';
      case '/incident-response': return 'Incident Response Actions';
      case '/canary-twin': return 'Decoy Honey-Tokens (Canary)';
      case '/events': return 'Security Event Logs';
      case '/evidence': return 'Cryptographic Evidence Ledger';
      case '/reports': return 'Investigation Dossier';
      case '/settings': return 'System Settings';
      default: return 'SOC Console';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Clean Path & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">{getPageTitle(currentPath)}</span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Simple Threat Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            isThreat 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isThreat ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span>{isThreat ? 'Active Intrusion' : 'Environment Secure'}</span>
          </div>
        </div>

        {/* Right: Refresh & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>{time} UTC</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh Telemetry"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Run Demo Button */}
          {!demoActive && (
            <button
              onClick={startDemo}
              className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Guided Demo</span>
            </button>
          )}

          {/* Operator Name */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
            <span className="text-slate-300 font-medium">{user?.name || 'Operator'}</span>
          </div>
        </div>
      </div>

      {/* Clean Notification Banner for Critical Alerts */}
      {activeAlert && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span><strong>{activeAlert.title}:</strong> {activeAlert.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNavigate('/tracegraph');
                setActiveAlert(null);
              }}
              className="underline text-cyan-300 hover:text-cyan-200 font-semibold text-[11px]"
            >
              View on Attack Path →
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
