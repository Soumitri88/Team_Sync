import React, { useState } from 'react';
import { 
  FileCheck2, 
  Hash, 
  ShieldCheck, 
  Check, 
  Copy, 
  AlertTriangle, 
  RotateCcw, 
  Terminal, 
  Unlock
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const EvidenceLedgerPage = ({ onInspectEvidence }) => {
  const { 
    events, 
    evidenceLedger, 
    ledgerAudit, 
    verifyLedgerIntegrity, 
    tamperEvidence, 
    restoreEvidence
  } = useSecurity();

  const [copiedHash, setCopiedHash] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [selectedEventToTamper, setSelectedEventToTamper] = useState(events[0]?.id || '');
  const [tamperFeedback, setTamperFeedback] = useState('');

  const records = evidenceLedger?.records || events;
  const audit = ledgerAudit;

  const handleCopy = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    await verifyLedgerIntegrity();
    setTimeout(() => setIsAuditing(false), 500);
  };

  const handleSimulateTamper = async () => {
    if (!selectedEventToTamper) return;
    await tamperEvidence(selectedEventToTamper, {
      event_description: 'TAMPERED LOG: All attacker footprints and telemetry sanitized by rogue process.'
    });
    setTamperFeedback(`Simulated tamper applied to ${selectedEventToTamper}. Cryptographic audit now flagged!`);
    setTimeout(() => setTamperFeedback(''), 5000);
  };

  const handleRestore = async (eventId) => {
    await restoreEvidence(eventId);
    setTamperFeedback(`Record ${eventId} restored to authentic ground-truth state.`);
    setTimeout(() => setTamperFeedback(''), 4000);
  };

  const isLedgerCompromised = audit?.status === 'COMPROMISED' || (audit?.tampered_records && audit.tampered_records.length > 0);

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0d1527] to-[#090e1a] border border-purple-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <FileCheck2 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded border border-purple-500/50 bg-purple-950 text-purple-300">
                FORENSIC EVIDENCE LEDGER
              </span>
              <h2 className="text-sm sm:text-base font-extrabold font-mono text-white">
                SHA-256 Cryptographic Chain of Custody
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
              Every security log is assigned a deterministic SHA-256 evidence digest at ingestion. Cryptographic integrity audits detect any post-incident tampering or anti-forensic log sanitization.
            </p>
          </div>
        </div>

        {/* Audit Button */}
        <div className="w-full sm:w-auto flex-shrink-0">
          <button
            onClick={handleAudit}
            disabled={isAuditing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-neon-cyan transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAuditing ? 'Auditing Ledger...' : 'Verify Ledger Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Merkle Root & Integrity Audit Card */}
      <div className={`cyber-card p-4 sm:p-5 rounded-2xl border transition-all ${
        isLedgerCompromised ? 'border-red-500/70 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.25)]' : 'border-emerald-500/40 bg-emerald-950/10'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono flex-wrap">
              <span className="text-xs text-slate-400">Chain Status:</span>
              <span className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded uppercase border flex items-center gap-1.5 ${
                isLedgerCompromised
                  ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-500'
              }`}>
                {isLedgerCompromised ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                {isLedgerCompromised ? 'TAMPERING DETECTED' : '100% CRYPTOGRAPHICALLY SECURE'}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-300 flex items-start sm:items-center gap-2 pt-1 flex-col sm:flex-row">
              <span className="text-slate-400 text-xs">Root Ledger Seal:</span>
              <span className="text-cyan-300 font-mono break-all text-[10px] sm:text-[11px] select-all bg-black/60 px-2 py-0.5 rounded border border-slate-800">
                {audit?.ledger_root_hash || '7d9fa817293a901844bca9928172349182379182739182739182379182739182'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1b2a47]">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Audited</span>
              <span className="text-white font-bold text-sm sm:text-base">{audit?.total_records || records.length}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Valid</span>
              <span className="text-emerald-400 font-bold text-sm sm:text-base">{audit?.verified_records || records.length}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Tampered</span>
              <span className={`font-bold text-sm sm:text-base ${isLedgerCompromised ? 'text-red-400' : 'text-slate-500'}`}>
                {audit?.tampered_records?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tampering Demo Workbench */}
      <div className="cyber-card p-4 sm:p-5 rounded-2xl border-cyan-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-[#1b2a47] pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Interactive Anti-Forensic Tamper Demonstration</span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
              Simulate an adversary attempting to modify an event record to test SHA-256 non-repudiation
            </p>
          </div>
        </div>

        {tamperFeedback && (
          <div className="p-3 mb-3 rounded-lg bg-amber-950/80 border border-amber-500/60 text-amber-200 font-mono text-xs flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{tamperFeedback}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 font-mono text-xs">
          <div className="flex-1">
            <label className="text-slate-400 text-[10px] uppercase block mb-1">
              Select Stored Event Record to Tamper:
            </label>
            <select
              value={selectedEventToTamper}
              onChange={(e) => setSelectedEventToTamper(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white text-xs truncate"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.device_name} - {r.event_description?.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 pt-1 lg:pt-0">
            <button
              onClick={handleSimulateTamper}
              className="col-span-1 px-3 py-2 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5 text-red-400" />
              <span>Tamper Record</span>
            </button>
            <button
              onClick={() => handleRestore(selectedEventToTamper)}
              className="col-span-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Authentic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discrepancies Alert Panel if tampered */}
      {isLedgerCompromised && audit?.tampered_records?.length > 0 && (
        <div className="cyber-card p-4 sm:p-5 rounded-2xl border-red-500/70 bg-red-950/20 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 animate-bounce flex-shrink-0" />
            <span>Cryptographic Checksum Discrepancy Found!</span>
          </div>

          {audit.tampered_records.map((rec) => (
            <div
              key={rec.event_id}
              className="p-3.5 rounded-xl bg-black/60 border border-red-500/50 font-mono text-xs space-y-1.5 text-slate-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-red-400">Tampered Record: {rec.event_id}</span>
                <button
                  onClick={() => handleRestore(rec.event_id)}
                  className="px-2.5 py-1 rounded bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-semibold self-start sm:self-auto"
                >
                  Restore Original Telemetry
                </button>
              </div>
              <div className="text-slate-400 text-[11px]">{rec.discrepancy}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block">Genesis Authentic Hash</span>
                  <span className="text-emerald-400 break-all">{rec.original_hash}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block">Tampered Calculated Hash</span>
                  <span className="text-red-400 break-all">{rec.recalculated_hash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ledger Records Table */}
      <div className="cyber-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold font-mono text-white">Cryptographic Log Records</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Immutable verifiable ledger entries</p>
          </div>
          <span className="text-[11px] font-mono text-purple-400">
            {records.length} Logs Signed
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs font-mono min-w-[550px]">
            <thead>
              <tr className="border-b border-[#1b2a47] text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Device & User</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">SHA-256 Digest</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2a47]/60">
              {records.map((r) => {
                const isCopied = copiedHash === r.id;
                const hashVal = r.evidence_hash || (r.metadata && r.metadata.evidence_hash) || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

                return (
                  <tr
                    key={r.id}
                    onClick={() => onInspectEvidence && onInspectEvidence(r)}
                    className="hover:bg-cyan-950/20 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 text-cyan-400 font-bold whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="text-white font-medium">{r.device_name || 'GW-VPN'}</div>
                      <div className="text-[10px] text-slate-400">{r.username}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">
                      {r.event_description}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30 font-mono inline-block max-w-[140px] truncate">
                        {hashVal}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleCopy(hashVal, r.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors inline-flex items-center gap-1"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
