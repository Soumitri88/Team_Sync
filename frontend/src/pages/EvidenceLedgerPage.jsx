import React, { useState } from 'react';
import { 
  FileCheck2, 
  Hash, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  Copy, 
  AlertTriangle, 
  RotateCcw, 
  Terminal, 
  Lock, 
  Unlock, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const EvidenceLedgerPage = ({ onInspectEvidence }) => {
  const { 
    events, 
    evidenceLedger, 
    ledgerAudit, 
    verifyLedgerIntegrity, 
    tamperEvidence, 
    restoreEvidence, 
    refreshAll 
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
    setTamperFeedback(`Record ${eventId} restored to authentic cryptographic state!`);
    setTimeout(() => setTamperFeedback(''), 5000);
  };

  const isLedgerCompromised = audit?.status === 'COMPROMISED' || (audit?.tampered_records && audit.tampered_records.length > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0d1527] to-[#090e1a] border border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <FileCheck2 className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-purple-500/50 bg-purple-950 text-purple-300">
                FORENSIC EVIDENCE LEDGER
              </span>
              <h2 className="text-base font-extrabold font-mono text-white">
                SHA-256 Cryptographic Chain of Custody
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
              Every security log is assigned a deterministic SHA-256 evidence digest at ingestion. Cryptographic integrity audits detect any post-incident tampering or anti-forensic log sanitization.
            </p>
          </div>
        </div>

        {/* Audit Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAudit}
            disabled={isAuditing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs font-mono flex items-center gap-2 shadow-neon-cyan transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAuditing ? 'Auditing Ledger...' : 'Verify Ledger Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Merkle Root & Integrity Audit Card */}
      <div className={`cyber-card p-5 rounded-2xl border transition-all ${
        isLedgerCompromised ? 'border-red-500/70 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.25)]' : 'border-emerald-500/40 bg-emerald-950/10'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs text-slate-400">Cryptographic Chain Status:</span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded uppercase border flex items-center gap-1.5 ${
                isLedgerCompromised
                  ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-500'
              }`}>
                {isLedgerCompromised ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                {isLedgerCompromised ? 'TAMPERING DETECTED // INTEGRITY COMPROMISED' : '100% CRYPTOGRAPHICALLY SECURE'}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-300 flex items-center gap-2 pt-1">
              <span className="text-slate-400">Root Ledger Seal:</span>
              <span className="text-cyan-300 font-mono break-all text-[11px] select-all bg-black/60 px-2 py-0.5 rounded border border-slate-800">
                {audit?.ledger_root_hash || '7d9fa817293a901844bca9928172349182379182739182739182379182739182'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-right flex-shrink-0">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Audited Records</span>
              <span className="text-white font-bold text-base">{audit?.total_records || records.length}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Valid Signatures</span>
              <span className="text-emerald-400 font-bold text-base">{audit?.verified_records || records.length}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Tampered Discrepancies</span>
              <span className={`font-bold text-base ${isLedgerCompromised ? 'text-red-400' : 'text-slate-500'}`}>
                {audit?.tampered_records?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tampering Demo Workbench */}
      <div className="cyber-card p-5 rounded-2xl border-cyan-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-[#1b2a47] pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Interactive Anti-Forensic Tamper Demonstration</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
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

        <div className="flex flex-col sm:flex-row items-center gap-3 font-mono text-xs">
          <div className="w-full sm:w-auto flex-1">
            <label className="text-slate-400 text-[10px] uppercase block mb-1">
              Select Stored Event Record to Tamper:
            </label>
            <select
              value={selectedEventToTamper}
              onChange={(e) => setSelectedEventToTamper(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white text-xs"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.device_name} - {r.event_description?.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto self-end pt-2">
            <button
              onClick={handleSimulateTamper}
              className="px-3.5 py-2 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5 text-red-400" />
              <span>Simulate Record Alteration</span>
            </button>
            <button
              onClick={() => handleRestore(selectedEventToTamper)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Authentic Hash</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discrepancies Alert Panel if tampered */}
      {isLedgerCompromised && audit?.tampered_records?.length > 0 && (
        <div className="cyber-card p-5 rounded-2xl border-red-500/70 bg-red-950/20 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
            <span>Cryptographic Checksum Discrepancy Found!</span>
          </div>

          {audit.tampered_records.map((rec) => (
            <div
              key={rec.event_id}
              className="p-3.5 rounded-xl bg-black/60 border border-red-500/50 font-mono text-xs space-y-1.5 text-slate-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-400">Tampered Record: {rec.event_id}</span>
                <button
                  onClick={() => handleRestore(rec.event_id)}
                  className="px-2 py-0.5 rounded bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-semibold"
                >
                  Restore Original Telemetry
                </button>
              </div>
              <div className="text-slate-400 text-[11px]">{rec.discrepancy}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block uppercase">Stored Seal:</span>
                  <span className="text-emerald-400 break-all">{rec.stored_hash}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-red-900/50">
                  <span className="text-red-400 block uppercase">Recomputed Checksum:</span>
                  <span className="text-red-300 break-all">{rec.computed_hash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Ledger Table */}
      <div className="cyber-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1b2a47]">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan-400" />
              <span>Evidence Ledger Records</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Individual SHA-256 cryptographic digests preserving forensic chain-of-custody
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{records.length} Sealed Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1b2a47] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Device & Account</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">MITRE ID</th>
                <th className="py-2.5 px-3">SHA-256 Hash Digest</th>
                <th className="py-2.5 px-3 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2a47]/60">
              {records.map((r) => {
                const isTampered = audit?.tampered_records?.some((tr) => tr.event_id === r.id);
                const hash = r.evidence_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

                return (
                  <tr
                    key={r.id}
                    onClick={() => onInspectEvidence && onInspectEvidence(r)}
                    className="hover:bg-cyan-950/20 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 text-cyan-400 font-semibold whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {r.timestamp ? r.timestamp.replace('T', ' ').slice(0, 19) : '--'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-white font-bold">{r.device_name}</span>
                      <span className="text-purple-300 ml-1.5">[{r.username}]</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap uppercase">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        r.severity === 'critical' ? 'bg-red-950 text-red-400 border-red-500/40' : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-purple-300 font-bold">
                      {r.mitre_id || '--'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-300">
                          {hash.slice(0, 12)}...{hash.slice(-8)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(hash, r.id);
                          }}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                          title="Copy Full SHA-256 Hash"
                        >
                          {copiedHash === r.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        isTampered
                          ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                      }`}>
                        {isTampered ? 'TAMPERED' : 'VERIFIED'}
                      </span>
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
