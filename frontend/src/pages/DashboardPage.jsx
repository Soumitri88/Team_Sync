import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Network, 
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const DashboardPage = ({ onNavigate, onInspectEvidence }) => {
  const { stats, events, startDemo, demoActive, resetSimulation } = useSecurity();

  const isThreat = stats?.overall_status === 'CRITICAL_THREAT' || stats?.overall_status === 'ELEVATED_RISK';
  const totalEvents = stats?.total_events || 0;
  const compDevs = stats?.compromised_devices_count || 0;
  const canariesTripped = stats?.tripped_canaries_count || 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Welcome & Threat Status Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isThreat
          ? 'bg-red-950/30 border-red-500/40'
          : 'bg-slate-900/40 border-slate-800'
      } flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isThreat ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {isThreat ? <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /> : <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase ${
                isThreat ? 'bg-red-900/80 text-red-300' : 'bg-emerald-900/80 text-emerald-300'
              }`}>
                {isThreat ? 'Threat Detected' : 'All Clear'}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {isThreat ? 'Active Attack Sequence Detected' : 'Perimeter Secure & Monitoring'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isThreat 
                ? 'An adversarial path has been identified moving across internal computers.'
                : 'Decoy honey-tokens and intrusion sensors are armed and awaiting telemetry.'}
            </p>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onNavigate('/tracegraph')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Network className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">View Attack Path</span>
            <span className="sm:hidden">Attack Path</span>
          </button>
          
          <button
            onClick={startDemo}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{demoActive ? 'Demo Active' : 'Run Attack Demo'}</span>
            <span className="sm:hidden">{demoActive ? 'Demo Active' : 'Run Demo'}</span>
          </button>

          <button
            onClick={resetSimulation}
            title="Reset Environment"
            className="col-span-2 sm:col-span-1 py-2 px-3 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="sm:hidden">Reset Environment</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Threat Level */}
        <div className="cyber-card p-3.5 sm:p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] sm:text-xs text-slate-400 mb-0.5">Threat Status</div>
          <div className={`text-lg sm:text-xl font-bold ${isThreat ? 'text-red-400' : 'text-emerald-400'}`}>
            {isThreat ? 'CRITICAL' : 'SAFE'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
            {isThreat ? 'Containment advised' : 'Normal SecOps'}
          </div>
        </div>

        {/* Card 2: Security Events */}
        <div 
          onClick={() => onNavigate('/events')}
          className="cyber-card p-3.5 sm:p-4 rounded-xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
        >
          <div className="text-[11px] sm:text-xs text-slate-400 mb-0.5">Detected Events</div>
          <div className="text-lg sm:text-xl font-bold text-white">{totalEvents}</div>
          <div className="text-[10px] sm:text-[11px] text-cyan-400 mt-1 flex items-center gap-0.5">
            <span>View raw logs</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Affected Devices */}
        <div 
          onClick={() => onNavigate('/blast-radius')}
          className="cyber-card p-3.5 sm:p-4 rounded-xl border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all"
        >
          <div className="text-[11px] sm:text-xs text-slate-400 mb-0.5">Affected Hosts</div>
          <div className="text-lg sm:text-xl font-bold text-white">{compDevs}</div>
          <div className="text-[10px] sm:text-[11px] text-purple-400 mt-1 flex items-center gap-0.5">
            <span>Blast radius</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Canary Traps Tripped */}
        <div 
          onClick={() => onNavigate('/canary-twin')}
          className="cyber-card p-3.5 sm:p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <div className="text-[11px] sm:text-xs text-slate-400 mb-0.5">Decoys Tripped</div>
          <div className={`text-lg sm:text-xl font-bold ${canariesTripped > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {canariesTripped}
          </div>
          <div className="text-[10px] sm:text-[11px] text-amber-400 mt-1 flex items-center gap-0.5">
            <span>Honey-tokens</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Story of the Attack (Chronological Flow) */}
      <div className="cyber-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white">How the Attack Happened (Storyline)</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Step-by-step chronological reconstruction</p>
          </div>
          <button
            onClick={() => onNavigate('/tracegraph')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 flex-shrink-0"
          >
            <span>Graph View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-Step Timeline Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Step 1 • Initial Entry</span>
            <div className="text-xs font-bold text-white">Password Spraying</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              External IP <code className="text-slate-300">198.51.100.44</code> attempted logins on the VPN gateway.
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-400">Step 2 • User Compromised</span>
            <div className="text-xs font-bold text-white">Account Breached</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Valid credentials for <code className="text-purple-300">david.webb</code> used from an anomalous location.
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">Step 3 • Lateral Pivot</span>
            <div className="text-xs font-bold text-white">Moved to Engineering PC</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Attacker pivoted via WinRM to <code className="text-slate-300">WS-ENGINEERING-07</code> and elevated to SYSTEM.
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-red-500/30 bg-red-950/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-red-400">Step 4 • Trap Breached</span>
            <div className="text-xs font-bold text-white">Decoy File Opened</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Opened fake decoy <code className="text-red-300">Finance_Report_Canary.txt</code>, confirming intent.
            </p>
          </div>
        </div>

        {/* Recommendation Callout */}
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-cyan-300">Recommended Action:</span>
            <p className="text-slate-300 text-xs">
              Quarantine workstation <strong>WS-ENGINEERING-07</strong> and suspend user <strong>david.webb</strong> to halt movement.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/incident-response')}
            className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex-shrink-0 transition-colors w-full sm:w-auto text-center"
          >
            Take Response Action →
          </button>
        </div>
      </div>

      {/* Simple Recent Events List */}
      <div className="cyber-card p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white">Recent Security Activity</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Latest recorded security telemetry</p>
          </div>
          <button
            onClick={() => onNavigate('/events')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex-shrink-0"
          >
            All Events →
          </button>
        </div>

        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-slate-500 text-xs py-4 text-center">
              No events recorded yet. Click "Run Demo" above to simulate an intrusion.
            </div>
          ) : (
            events.slice(0, 5).map((e) => (
              <div
                key={e.id}
                onClick={() => onInspectEvidence && onInspectEvidence(e)}
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                    e.severity === 'critical'
                      ? 'bg-red-950 text-red-400 border border-red-500/40'
                      : e.severity === 'high'
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                  }`}>
                    {e.severity}
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-white block truncate">{e.event_description}</span>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                      Target: <span className="text-slate-300">{e.device_name}</span> • User: <span className="text-slate-300">{e.username}</span>
                    </div>
                  </div>
                </div>

                <div className="text-slate-500 text-[10px] sm:text-[11px] font-mono whitespace-nowrap self-end sm:self-center">
                  {e.timestamp ? e.timestamp.slice(11, 19) : ''} UTC
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
