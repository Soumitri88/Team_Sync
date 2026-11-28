import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Menu,
  LogOut
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentPath, onNavigate, onToggleSidebar }) => {
  const { stats, refreshAll, demoActive, startDemo, runJudgeDemo, activeAlert, setActiveAlert, setIsJudgeModalOpen } = useSecurity();
  const { user, logout, activePortal, switchPortal } = useAuth();
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJudgeRunning, setIsJudgeRunning] = useState(false);

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

  const getPageInfo = (path) => {
    switch (path) {
      case '/':
        return { full: 'Dashboard Overview', short: 'Dashboard' };
      case '/landing':
        return { full: 'PloyWeb Platform Overview', short: 'Overview' };
      case '/devices':
        return { full: 'Device Monitoring & Telemetry Ingestion', short: 'Devices' };
      case '/simulation':
        return { full: 'Attack Simulator', short: 'Simulator' };
      case '/tracegraph':
        return { full: 'GraphX Attack Reconstruction', short: 'GraphX Path' };
      case '/blast-radius':
        return { full: 'Impact & Blast Radius Analysis', short: 'Blast Radius' };
      case '/incident-response':
        return { full: 'Incident Response Actions', short: 'Incident Response' };
      case '/canary-twin':
        return { full: 'Decoy Honey-Tokens (Canary)', short: 'Decoy Traps' };
      case '/events':
        return { full: 'Security Event Logs & Telemetry', short: 'Security Logs' };
      case '/evidence':
        return { full: 'Cryptographic Evidence Ledger (SHA-256)', short: 'Evidence Ledger' };
      case '/reports':
        return { full: 'Investigation Report Dossier', short: 'Report Dossier' };
      case '/employees':
        return { full: 'Employee Identity & Access Governance', short: 'Employees' };
      case '/employee-portal':
        return { full: 'Employee Security Portal', short: 'Employee Portal' };
      case '/customer-portal':
        return { full: 'Customer Identity & Privacy Portal', short: 'Customer Portal' };
      case '/settings':
        return { full: 'Platform & SOC Settings', short: 'Settings' };
      default:
        return { full: 'Cyber SOC Console', short: 'Console' };
    }
  };

  const pageInfo = getPageInfo(currentPath);

  return (
    <header className="sticky top-0 z-20 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800 px-3.5 py-2.5 sm:px-6 sm:py-3">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Hamburger + Adaptive Title + Threat Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 md:hidden transition-colors flex-shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-cyan-400" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 min-w-0">
            {/* Full title on Laptop/PC (md+), clean short title on Phone (<md) */}
            <span className="font-bold text-slate-100 text-sm hidden md:inline truncate">
              {pageInfo.full}
            </span>
            <span className="font-bold text-slate-100 text-xs md:hidden truncate">
              {pageInfo.short}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block flex-shrink-0" />

          {/* Threat Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
            isThreat 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isThreat ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="hidden lg:inline">{isThreat ? 'Active Intrusion Detected' : 'Environment Secure'}</span>
            <span className="lg:hidden">{isThreat ? 'Threat' : 'Secure'}</span>
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

          {/* 1-Click Interactive Judge Demo Button */}
          <button
            onClick={() => {
              if (setIsJudgeModalOpen) {
                setIsJudgeModalOpen(true);
              } else {
                runJudgeDemo();
                onNavigate('/tracegraph');
              }
            }}
            title="Interactive 8-Stage Cyber Attack Simulation & Autonomous Investigation Walkthrough"
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all border border-purple-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span className="hidden sm:inline">Judge Demo</span>
            <span className="sm:hidden">Judge</span>
          </button>

          {/* Run Demo Button */}
          {!demoActive && (
            <button
              onClick={startDemo}
              className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Run Guided Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>
          )}

          {/* Portal Switcher Button */}
          <button
            onClick={() => {
              if (activePortal === 'admin') {
                switchPortal('employee');
                if (onNavigate) onNavigate('/employee-portal');
              } else if (activePortal === 'employee') {
                switchPortal('customer');
                if (onNavigate) onNavigate('/customer-portal');
              } else {
                switchPortal('admin');
                if (onNavigate) onNavigate('/');
              }
            }}
            title="Cycle between Master SOC Portal, Employee Portal, and Customer Portal"
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
              activePortal === 'customer'
                ? 'bg-blue-950 text-blue-300 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : activePortal === 'employee'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-neon-cyan'
            }`}
          >
            <span>
              {activePortal === 'customer'
                ? 'CUSTOMER PORTAL'
                : activePortal === 'employee'
                ? 'EMPLOYEE PORTAL'
                : 'SOC ADMIN'}
            </span>
            <span className="text-[10px] text-slate-400 font-normal hidden lg:inline">⇄ Cycle</span>
          </button>

          {/* Operator Name & Sign Out */}
          <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-800 text-xs">
            <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[10px] font-bold text-cyan-300">
              {user?.avatar || 'AV'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-slate-200 font-medium text-xs block leading-tight">{user?.name || 'Operator'}</span>
              <span className="text-[10px] text-slate-500 block leading-none">{user?.role || 'SOC Analyst'}</span>
            </div>
            <button
              onClick={logout}
              title="Sign Out / Switch Account"
              className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors ml-0.5"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
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
