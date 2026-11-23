import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
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
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Welcome & Threat Status Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isThreat
          ? 'bg-red-950/30 border-red-500/40'
          : 'bg-slate-900/40 border-slate-800'
      } flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isThreat ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {isThreat ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                isThreat ? 'bg-red-900/80 text-red-300' : 'bg-emerald-900/80 text-emerald-300'
              }`}>
                {isThreat ? 'Threat Detected' : 'All Clear'}
              </span>
              <h2 className="text-base font-bold text-white">
                {isThreat ? 'Active Attack Sequence Detected' : 'Perimeter Secure & Monitoring'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isThreat 
                ? 'An adversarial path has been identified moving across internal computers.'
                : 'Decoy honey-tokens and intrusion sensors are armed and awaiting telemetry.'}
            </p>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('/tracegraph')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Network className="w-4 h-4" />
            <span>View Attack Path</span>
          </button>
          
          <button
            onClick={startDemo}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>{demoActive ? 'Demo Active' : 'Run Attack Demo'}</span>
          </button>

          <button
            onClick={resetSimulation}
            title="Reset Environment"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Essential Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Threat Level */}
        <div className="cyber-card p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Threat Status</div>
          <div className={`text-xl font-bold ${isThreat ? 'text-red-400' : 'text-emerald-400'}`}>
            {isThreat ? 'CRITICAL' : 'SAFE'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isThreat ? 'Immediate containment advised' : 'Normal SecOps'}
          </div>
        </div>

        {/* Card 2: Security Events */}
        <div 
          onClick={() => onNavigate('/events')}
          className="cyber-card p-4 rounded-xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
        >
          <div className="text-xs text-slate-400 mb-1">Detected Events</div>
          <div className="text-xl font-bold text-white">{totalEvents}</div>
          <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-0.5">
            <span>View raw logs</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Affected Devices */}
        <div 
          onClick={() => onNavigate('/blast-radius')}
          className="cyber-card p-4 rounded-xl border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all"
        >
          <div className="text-xs text-slate-400 mb-1">Affected Computers</div>
          <div className="text-xl font-bold text-white">{compDevs}</div>
          <div className="text-[11px] text-purple-400 mt-1 flex items-center gap-0.5">
            <span>Patient Zero identified</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Canary Traps Tripped */}
        <div 
          onClick={() => onNavigate('/canary-twin')}
          className="cyber-card p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <div className="text-xs text-slate-400 mb-1">Decoys Tripped</div>
          <div className={`text-xl font-bold ${canariesTripped > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {canariesTripped}
          </div>
          <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-0.5">
            <span>Fake files breached</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Story of the Attack (Simple Chronological Flow) */}
      <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">How the Attack Happened (Storyline)</h3>
            <p className="text-xs text-slate-400">Step-by-step chronological reconstruction of the intrusion</p>
          </div>
          <button
            onClick={() => onNavigate('/tracegraph')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>Open Graph View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-Step Timeline Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Step 1 • Initial Entry</span>
            <div className="text-xs font-bold text-white">Password Spraying</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              External IP <code className="text-slate-300">198.51.100.44</code> attempted logins on the VPN gateway.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-400">Step 2 • User Compromised</span>
            <div className="text-xs font-bold text-white">Account Breached</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Valid credentials for <code className="text-purple-300">david.webb</code> used from an anomalous location.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">Step 3 • Lateral Pivot</span>
            <div className="text-xs font-bold text-white">Moved to Engineering PC</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Attacker pivoted via WinRM to <code className="text-slate-300">WS-ENGINEERING-07</code> and elevated to SYSTEM.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-red-500/30 bg-red-950/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-red-400">Step 4 • Trap Breached</span>
            <div className="text-xs font-bold text-white">Decoy File Opened</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Opened fake decoy <code className="text-red-300">Finance_Report_Canary.txt</code>, confirming intent.
            </p>
          </div>
        </div>

        {/* Plain-English Recommendation Callout */}
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-cyan-300">Recommended Action:</span>
            <p className="text-slate-300">
              Quarantine workstation <strong>WS-ENGINEERING-07</strong> and suspend user <strong>david.webb</strong> to halt further movement.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/incident-response')}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex-shrink-0 transition-colors"
          >
            Take Response Action →
          </button>
        </div>
      </div>

      {/* Simple Recent Events List */}
      <div className="cyber-card p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Security Activity</h3>
            <p className="text-xs text-slate-400">Latest recorded security telemetry</p>
          </div>
          <button
            onClick={() => onNavigate('/events')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            View All Events →
          </button>
        </div>

        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-slate-500 text-xs py-4 text-center">
              No events recorded yet. Click "Run Attack Demo" above to generate a sample attack.
            </div>
          ) : (
            events.slice(0, 5).map((e) => (
              <div
                key={e.id}
                onClick={() => onInspectEvidence && onInspectEvidence(e)}
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    e.severity === 'critical'
                      ? 'bg-red-950 text-red-400 border border-red-500/40'
                      : e.severity === 'high'
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                  }`}>
                    {e.severity}
                  </span>
                  <div>
                    <span className="font-semibold text-white">{e.event_description}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Target: <span className="text-slate-300">{e.device_name}</span> • User: <span className="text-slate-300">{e.username}</span>
                    </div>
                  </div>
                </div>

                <div className="text-slate-500 text-[11px] font-mono whitespace-nowrap self-end sm:self-center">
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
