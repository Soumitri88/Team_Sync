import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Flame, 
  Radio, 
  Server, 
  UserX, 
  Bug, 
  ArrowUpRight, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Network, 
  Layers, 
  ShieldCheck, 
  Hash, 
  ExternalLink 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { useSecurity } from '../context/SecurityContext';

export const DashboardPage = ({ onNavigate, onInspectEvidence }) => {
  const { stats, events, startDemo, demoActive, startSimulation } = useSecurity();
  const [selectedSevFilter, setSelectedSevFilter] = useState('all');

  const sevCounts = stats?.severity_counts || { critical: 0, high: 0, medium: 0, low: 0 };
  const totalEvents = stats?.total_events || 0;

  const chartData = [
    { name: 'Critical', value: sevCounts.critical || 0, color: '#ef4444' },
    { name: 'High', value: sevCounts.high || 0, color: '#f59e0b' },
    { name: 'Medium', value: sevCounts.medium || 0, color: '#00f2fe' },
    { name: 'Low', value: sevCounts.low || 0, color: '#10b981' }
  ];

  const filteredTimeline = (stats?.attack_timeline || events.slice(0, 15)).filter((evt) => {
    if (selectedSevFilter === 'all') return true;
    return evt.severity === selectedSevFilter;
  });

  const getDefconInfo = () => {
    const status = stats?.overall_status || 'SECURE';
    if (status === 'CRITICAL_THREAT') {
      return {
        level: 'DEFCON 1',
        title: 'CRITICAL INTRUSION DETECTED',
        desc: 'Active lateral movement and canary breach detected. Immediate containment advised.',
        bg: 'from-red-950/60 to-red-900/20 border-red-500/50',
        badge: 'text-red-400 bg-red-950 border-red-500/60'
      };
    }
    if (status === 'ELEVATED_RISK') {
      return {
        level: 'DEFCON 2',
        title: 'ELEVATED SUSPICIOUS ACTIVITY',
        desc: 'Credential spraying and anomalous remote access flagged on external gateway.',
        bg: 'from-amber-950/60 to-amber-900/20 border-amber-500/50',
        badge: 'text-amber-400 bg-amber-950 border-amber-500/60'
      };
    }
    return {
      level: 'DEFCON 5',
      title: 'SECURITY PERIMETER NOMINAL',
      desc: 'All enterprise endpoints and decoy canary tripwires are armed and quiescent.',
      bg: 'from-emerald-950/60 to-emerald-900/20 border-emerald-500/50',
      badge: 'text-emerald-400 bg-emerald-950 border-emerald-500/60'
    };
  };

  const defcon = getDefconInfo();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Threat Banner */}
      <div className={`p-5 rounded-2xl bg-gradient-to-r border ${defcon.bg} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-7 h-7 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${defcon.badge}`}>
                {defcon.level}
              </span>
              <h2 className="text-base font-extrabold font-mono text-white tracking-wide">
                {defcon.title}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
              {defcon.desc}
            </p>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('/tracegraph')}
            className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-neon-cyan"
          >
            <Network className="w-4 h-4 text-cyan-400" />
            <span>TraceGraph View</span>
          </button>
          <button
            onClick={() => onNavigate('/blast-radius')}
            className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-neon-purple"
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Blast Radius</span>
          </button>
          <button
            onClick={startDemo}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>{demoActive ? 'Demo Active' : 'Run 9-Step Demo'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Total Events */}
        <div 
          onClick={() => onNavigate('/events')}
          className="cyber-card p-4 rounded-xl cursor-pointer group transition-all hover:border-cyan-400/50"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Telemetry</span>
            <Radio className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">{totalEvents}</div>
          <div className="text-[10px] font-mono text-cyan-400/80 mt-1 flex items-center gap-1">
            <span>Live Normalized</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Critical Alerts */}
        <div 
          onClick={() => { setSelectedSevFilter('critical'); onNavigate('/events'); }}
          className="cyber-card p-4 rounded-xl cursor-pointer group transition-all hover:border-red-500/60 bg-red-950/20"
        >
          <div className="flex items-center justify-between text-red-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Critical Threats</span>
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-red-400">{sevCounts.critical || 0}</div>
          <div className="text-[10px] font-mono text-red-300/80 mt-1">Immediate Action</div>
        </div>

        {/* High Alerts */}
        <div 
          onClick={() => { setSelectedSevFilter('high'); onNavigate('/events'); }}
          className="cyber-card p-4 rounded-xl cursor-pointer group transition-all hover:border-amber-500/60 bg-amber-950/20"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">High Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">{sevCounts.high || 0}</div>
          <div className="text-[10px] font-mono text-amber-300/80 mt-1">Suspicious Activity</div>
        </div>

        {/* Active Incidents */}
        <div 
          onClick={() => onNavigate('/incident-response')}
          className="cyber-card p-4 rounded-xl cursor-pointer group transition-all hover:border-purple-500/60"
        >
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Incidents</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-300">{stats?.active_incidents || 1}</div>
          <div className="text-[10px] font-mono text-purple-300/80 mt-1">Multi-Stage Active</div>
        </div>

        {/* Compromised Hosts */}
        <div 
          onClick={() => onNavigate('/blast-radius')}
          className="cyber-card p-4 rounded-xl cursor-pointer group transition-all hover:border-cyan-400/50"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Affected Hosts</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-300">
            {stats?.compromised_devices_count || 0}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Patient Zero Tracked</div>
        </div>

        {/* Tripped Canaries */}
        <div 
          onClick={() => onNavigate('/canary-twin')}
          className="cyber-card p-4 rounded-xl cursor-pointer group transition-all hover:border-red-400/60 bg-red-950/15"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Canary Traps</span>
            <Bug className="w-4 h-4 text-amber-400 animate-bounce" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300">
            {stats?.tripped_canaries_count || 0}
          </div>
          <div className="text-[10px] font-mono text-amber-400/80 mt-1">Deception Breached</div>
        </div>
      </div>

      {/* Middle Grid: Severity Distribution & Incident Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Severity Distribution Chart */}
        <div className="cyber-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3 border-b border-[#1b2a47] pb-3">
            <div>
              <h3 className="text-sm font-bold font-mono text-white">Threat Severity Distribution</h3>
              <p className="text-[11px] text-slate-400 font-mono">Real-time normalized event breakdown</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
              {totalEvents} Total Logs
            </span>
          </div>

          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#070b14" strokeWidth={2} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#090e1a',
                    borderColor: '#1b2a47',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold font-mono text-white">{totalEvents}</span>
              <span className="text-[9px] font-mono text-slate-400 uppercase">Alerts</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-[#1b2a47]">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Sequence Overview (TraceGraph Mini Preview) */}
        <div className="cyber-card p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#1b2a47] pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <span>Attack Kill-Chain Reconstruction Preview</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Autonomous correlation of adversarial progression
                </p>
              </div>
              <button
                onClick={() => onNavigate('/tracegraph')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Full Graph</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progression Phase Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 my-4">
              {[
                { stage: 'Stage 1', label: 'Initial Access', desc: 'VPN Credential Spraying', color: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300' },
                { stage: 'Stage 2', label: 'Suspicious Login', desc: 'RDP from Rogue IP', color: 'border-purple-500/50 bg-purple-950/30 text-purple-300' },
                { stage: 'Stage 3', label: 'Lateral Movement', desc: 'WinRM / SMB Pivot', color: 'border-amber-500/50 bg-amber-950/30 text-amber-300' },
                { stage: 'Stage 4', label: 'Privilege Escalation', desc: 'Impersonation -> SYSTEM', color: 'border-red-500/50 bg-red-950/30 text-red-300' },
                { stage: 'Stage 5', label: 'Canary Deception', desc: 'Decoy Trap Tripped', color: 'border-pink-500/50 bg-pink-950/30 text-pink-300' },
              ].map((p, idx) => (
                <div key={idx} className={`p-2.5 rounded-xl border ${p.color} font-mono space-y-1`}>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">{p.stage}</div>
                  <div className="text-xs font-bold truncate">{p.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                </div>
              ))}
            </div>

            {/* AI Incident Narrative Box */}
            <div className="p-3.5 rounded-xl bg-[#070b14] border border-[#1b2a47] font-mono text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PloyWeb AI SOC Investigation Finding:</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                Threat actor originating from <span className="text-red-400 font-semibold">198.51.100.44</span> breached perimeter gateway <span className="text-cyan-300">GW-VPN-EDGE-01</span>, compromised account <span className="text-purple-300 font-semibold">david.webb</span>, and laterally jumped to <span className="text-cyan-300">WS-ENGINEERING-07</span>. Decoy trap <span className="text-amber-400 font-semibold">Finance_Report_Canary.txt</span> detonate corroborated targeted financial intent.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1b2a47] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Recommended Containment:</span>
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-semibold">Isolate WS-ENGINEERING-07</span>
              <button
                onClick={() => onNavigate('/incident-response')}
                className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 text-[11px] font-semibold transition-colors"
              >
                Execute Containment Playbook →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Attack Timeline & Recent Activities Table */}
      <div className="cyber-card p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1b2a47]">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Attack Timeline & Chronological Telemetry Stream</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Ordered by actual occurrence timestamp with SHA-256 evidence digests
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSevFilter(sev)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase transition-all ${
                  selectedSevFilter === sev
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1b2a47] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Source → Dest IP</th>
                <th className="py-2.5 px-3">Device / Account</th>
                <th className="py-2.5 px-3">MITRE ATT&CK</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Evidence SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2a47]/60">
              {filteredTimeline.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No security events recorded for current filter.
                  </td>
                </tr>
              ) : (
                filteredTimeline.map((evt) => {
                  const sevColor =
                    evt.severity === 'critical'
                      ? 'text-red-400 bg-red-950/80 border-red-500/50'
                      : evt.severity === 'high'
                      ? 'text-amber-400 bg-amber-950/80 border-amber-500/50'
                      : evt.severity === 'medium'
                      ? 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50'
                      : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50';

                  return (
                    <tr 
                      key={evt.id} 
                      onClick={() => onInspectEvidence && onInspectEvidence(evt)}
                      className="hover:bg-cyan-950/20 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                        {evt.timestamp ? evt.timestamp.slice(11, 19) : '--:--:--'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${sevColor}`}>
                          {evt.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200 capitalize whitespace-nowrap">
                        {evt.event_type?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                        <span className="text-cyan-400">{evt.source_ip}</span>
                        <span className="text-slate-500 mx-1">→</span>
                        <span className="text-slate-200">{evt.destination_ip}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-slate-200 font-semibold">{evt.device_name || 'N/A'}</div>
                        <div className="text-[10px] text-purple-300">{evt.username}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {evt.mitre_id ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 text-[10px]">
                            {evt.mitre_id}
                          </span>
                        ) : (
                          <span className="text-slate-600">--</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={evt.event_description}>
                        {evt.event_description}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className="text-slate-500 font-mono text-[10px] group-hover:text-cyan-400 transition-colors">
                          {evt.evidence_hash ? `${evt.evidence_hash.slice(0, 8)}...${evt.evidence_hash.slice(-6)}` : 'Verified'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
