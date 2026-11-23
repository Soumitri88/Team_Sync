import React, { useState } from 'react';
import { 
  X, 
  FileCheck2, 
  Copy, 
  Check, 
  Hash, 
  Server, 
  User, 
  ExternalLink,
  Flame,
  Lock,
  Activity
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const EvidenceModal = ({ item, type, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { executeResponseAction } = useSecurity();
  const [containmentMsg, setContainmentMsg] = useState('');

  if (!item) return null;

  const data = item.data || item;
  const hash = data.evidence_hash || (data.metadata && data.metadata.evidence_hash) || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickIsolate = async () => {
    const target = data.device_name || data.hostname || data.target || 'WS-ENGINEERING-07';
    await executeResponseAction('isolate_device', target);
    setContainmentMsg(`Simulated VLAN isolation executed for ${target}`);
    setTimeout(() => setContainmentMsg(''), 4000);
  };

  const handleQuickDisableAccount = async () => {
    const target = data.username || 'david.webb';
    await executeResponseAction('disable_account', target);
    setContainmentMsg(`Simulated Account suspension executed for ${target}`);
    setTimeout(() => setContainmentMsg(''), 4000);
  };

  const getSevColor = (sev) => {
    const s = String(sev || 'medium').toLowerCase();
    if (s === 'critical') return 'text-red-400 bg-red-950/80 border-red-500/50';
    if (s === 'high') return 'text-amber-400 bg-amber-950/80 border-amber-500/50';
    if (s === 'medium') return 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50';
    return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#090e1a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-[#0d1527] border-b border-[#1b2a47] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex-shrink-0">
              <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold font-mono text-white truncate">
                  Evidence Dossier
                </span>
                <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded border ${getSevColor(data.severity)} uppercase`}>
                  {data.severity || 'EVIDENCE'}
                </span>
                {data.is_critical_path && (
                  <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" />
                    Kill-Chain
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                Target: <span className="text-cyan-300 font-semibold">{data.label || data.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-mono text-slate-200">
          {/* Containment notification */}
          {containmentMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{containmentMsg}</span>
            </div>
          )}

          {/* SHA-256 Seal Box */}
          <div className="p-3.5 rounded-xl bg-[#070b14] border border-[#1b2a47]">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
                <Hash className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                Evidence Hash (SHA-256)
              </span>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/30 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-black/60 border border-slate-800 text-[10px] sm:text-[11px] text-cyan-300 font-mono break-all select-all">
              {hash}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Guarantees evidence integrity against tampering, anti-forensics, or record scrubbing.
            </p>
          </div>

          {/* MITRE ATT&CK Info */}
          {(data.mitre_id || data.mitre_name) && (
            <div className="p-3.5 rounded-xl bg-[#0d1527] border border-[#1b2a47] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MITRE ATT&CK Mapping</span>
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 text-[11px] font-bold">
                  {data.mitre_id || 'T1000'}
                </span>
              </div>
              <div className="text-slate-200 font-medium">
                {data.mitre_name || 'Cyber Adversary Technique'}
              </div>
              <a
                href={`https://attack.mitre.org/techniques/${data.mitre_id?.split('.')[0] || 'T1078'}/`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px] mt-1"
              >
                <span>View technique on MITRE ATT&CK Framework</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Event or Entity Attributes */}
          <div className="p-3.5 rounded-xl bg-[#070b14] border border-[#1b2a47] space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Forensic Attributes
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Entity Type</span>
                <span className="text-slate-100 font-semibold">{data.type || 'security_event'}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Host Device</span>
                <span className="text-slate-100 font-semibold">{data.device_name || data.hostname || 'N/A'}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Associated User</span>
                <span className="text-slate-100 font-semibold">{data.username || 'System'}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Timestamp (UTC)</span>
                <span className="text-slate-100 font-semibold">{data.timestamp ? data.timestamp.replace('T', ' ').slice(0, 19) : 'Live Stream'}</span>
              </div>
            </div>

            {data.event_description && (
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 mt-2">
                <span className="text-slate-400 block text-[10px] mb-0.5">Description & Payload</span>
                <span className="text-slate-200 text-xs font-sans leading-relaxed">{data.event_description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-[#0d1527] border-t border-[#1b2a47] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-[10px] font-mono text-slate-500 hidden sm:block">
            PloyWeb Immutable Audit Ledger
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {(data.device_name || data.type === 'device') && (
              <button
                onClick={handleQuickIsolate}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Server className="w-3.5 h-3.5 text-red-400" />
                <span>Quarantine Host</span>
              </button>
            )}
            {(data.username || data.type === 'account') && (
              <button
                onClick={handleQuickDisableAccount}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Suspend Account</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors text-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
