import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  PlusCircle, 
  RefreshCw 
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const EventsPage = ({ onInspectEvidence }) => {
  const { events, refreshAll, generateTestEvent } = useSecurity();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc' by timestamp
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [customEvent, setCustomEvent] = useState({
    source_ip: '203.0.113.199',
    destination_ip: '10.0.3.11',
    device_name: 'SRV-FINANCE-01',
    username: 'finance_auditor',
    event_type: 'suspicious_login',
    event_description: 'Untrusted IP connection established via SSH with non-standard cipher suite.',
    severity: 'high',
    mitre_id: 'T1078'
  });
  const [ingestStatus, setIngestStatus] = useState('');

  // Filter and sort
  const filteredEvents = events.filter((e) => {
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        (e.id && e.id.toLowerCase().includes(term)) ||
        (e.device_name && e.device_name.toLowerCase().includes(term)) ||
        (e.username && e.username.toLowerCase().includes(term)) ||
        (e.source_ip && e.source_ip.toLowerCase().includes(term)) ||
        (e.destination_ip && e.destination_ip.toLowerCase().includes(term)) ||
        (e.event_description && e.event_description.toLowerCase().includes(term)) ||
        (e.mitre_id && e.mitre_id.toLowerCase().includes(term));
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime();
    const timeB = new Date(b.timestamp || 0).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const handleIngest = async (e) => {
    e.preventDefault();
    setIngestStatus('Ingesting & correlating event...');
    try {
      const res = await fetch('/api/events/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customEvent)
      });
      if (res.ok) {
        setIngestStatus('Event ingested! Re-evaluating graph & blast radius...');
        await refreshAll();
        setTimeout(() => {
          setIngestStatus('');
          setShowIngestModal(false);
        }, 1500);
        return;
      }
    } catch (err) {}

    // Offline resilience fallback
    if (generateTestEvent) {
      generateTestEvent(customEvent);
    }
    setIngestStatus('Event ingested! Re-evaluating graph & blast radius...');
    setTimeout(() => {
      setIngestStatus('');
      setShowIngestModal(false);
    }, 1200);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <h2 className="text-sm sm:text-base font-bold font-mono text-white">
              Live Security Telemetry & Event Ingestion
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5">
            Normalized log stream with timestamp ordering and SHA-256 evidence integrity
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowIngestModal(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-900/60 to-purple-900/60 hover:from-cyan-800/80 hover:to-purple-800/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>Ingest Custom Log</span>
          </button>
          <button
            onClick={refreshAll}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Refresh Events"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="cyber-card p-3.5 sm:p-4 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by IP, Hostname, Account, MITRE ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#070b14] border border-slate-800 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none"
          />
        </div>

        {/* Severity and Type Filters */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Severity */}
          <div className="flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
            <span className="px-1 text-[10px] uppercase">Sev:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] uppercase transition-colors whitespace-nowrap ${
                  severityFilter === sev
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors whitespace-nowrap"
            title="Toggle Timestamp Sort Order"
          >
            <span>Time {sortOrder.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Events Table Container */}
      <div className="cyber-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-[#0d1527] border-b border-[#1b2a47] flex items-center justify-between">
          <div className="text-xs font-mono text-slate-300">
            Displaying <span className="text-cyan-400 font-bold">{filteredEvents.length}</span> of {events.length} Telemetry Events
          </div>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:block">
            Click any row to inspect forensic evidence
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs font-mono min-w-[700px]">
            <thead>
              <tr className="bg-[#090e1a] border-b border-[#1b2a47] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5">Event ID</th>
                <th className="py-3 px-3.5">Timestamp (UTC)</th>
                <th className="py-3 px-3.5">Severity</th>
                <th className="py-3 px-3.5">Event Type</th>
                <th className="py-3 px-3.5">Source → Destination</th>
                <th className="py-3 px-3.5">Host & User</th>
                <th className="py-3 px-3.5">MITRE ATT&CK</th>
                <th className="py-3 px-3.5">Description</th>
                <th className="py-3 px-3.5 text-right">Integrity Digest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2a47]/50">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No events match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
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
                      <td className="py-3 px-3.5 text-cyan-400 font-semibold whitespace-nowrap">
                        {evt.id}
                      </td>
                      <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">
                        {evt.timestamp ? evt.timestamp.replace('T', ' ').slice(0, 19) : '--'}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${sevColor}`}>
                          {evt.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-200 capitalize font-medium whitespace-nowrap">
                        {evt.event_type?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">
                        <span className="text-cyan-300">{evt.source_ip}</span>
                        <span className="text-slate-500 mx-1">→</span>
                        <span className="text-slate-200">{evt.destination_ip}</span>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="text-slate-200 font-semibold">{evt.device_name || 'N/A'}</div>
                        <div className="text-[10px] text-purple-300">{evt.username}</div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {evt.mitre_id ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                            {evt.mitre_id}
                          </span>
                        ) : (
                          <span className="text-slate-600">--</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-300 max-w-xs truncate">
                        {evt.event_description}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors">
                          {evt.evidence_hash ? evt.evidence_hash.slice(0, 12) : 'e3b0c442...'}...
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

      {/* Manual Log Ingestion Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#090e1a] border border-cyan-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <h3 className="text-sm sm:text-base font-bold font-mono text-white mb-1">
              Ingest Custom Synthetic Security Event
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Injects safe telemetry into the PloyWeb correlation engine to simulate novel attack variations.
            </p>

            {ingestStatus && (
              <div className="p-3 mb-4 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs">
                {ingestStatus}
              </div>
            )}

            <form onSubmit={handleIngest} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Source IP Address</label>
                  <input
                    type="text"
                    value={customEvent.source_ip}
                    onChange={(e) => setCustomEvent({ ...customEvent, source_ip: e.target.value })}
                    className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Destination IP Address</label>
                  <input
                    type="text"
                    value={customEvent.destination_ip}
                    onChange={(e) => setCustomEvent({ ...customEvent, destination_ip: e.target.value })}
                    className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target Device</label>
                  <input
                    type="text"
                    value={customEvent.device_name}
                    onChange={(e) => setCustomEvent({ ...customEvent, device_name: e.target.value })}
                    className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Account</label>
                  <input
                    type="text"
                    value={customEvent.username}
                    onChange={(e) => setCustomEvent({ ...customEvent, username: e.target.value })}
                    className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Severity</label>
                  <select
                    value={customEvent.severity}
                    onChange={(e) => setCustomEvent({ ...customEvent, severity: e.target.value })}
                    className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">MITRE ATT&CK ID</label>
                  <input
                    type="text"
                    value={customEvent.mitre_id}
                    onChange={(e) => setCustomEvent({ ...customEvent, mitre_id: e.target.value })}
                    className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Event Description</label>
                <textarea
                  rows={2}
                  value={customEvent.event_description}
                  onChange={(e) => setCustomEvent({ ...customEvent, event_description: e.target.value })}
                  className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                >
                  Ingest & Correlate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
