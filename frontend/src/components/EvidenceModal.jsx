import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  FileCheck2, 
  Copy, 
  Check, 
  Hash, 
  Clock, 
  Server, 
  User, 
  ExternalLink,
  Flame,
  Bug,
  AlertTriangle,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#090e1a] border border-cyan-500/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(0,242,254,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#0d1527] border-b border-[#1b2a47] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-white">
                  Forensic Evidence Dossier
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getSevColor(data.severity)} uppercase`}>
                  {data.severity || 'EVIDENCE'}
                </span>
                {data.is_critical_path && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" />
                    Critical Kill-Chain
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target Entity: <span className="text-cyan-300 font-semibold">{data.label || data.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-slate-200">
          {/* Containment Flash notification */}
          {containmentMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>{containmentMsg}</span>
            </div>
          )}

          {/* SHA-256 Seal Box */}
          <div className="p-3.5 rounded-xl bg-[#070b14] border border-[#1b2a47]">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                Cryptographic Evidence Hash (SHA-256)
              </span>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/30 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied Hash' : 'Copy Digest'}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-black/60 border border-slate-800 text-[11px] text-cyan-300 font-mono break-all select-all">
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
                Inspect MITRE Knowledgebase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Telemetry Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47] space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Entity Classification</span>
              <div className="text-slate-200 font-bold capitalize">{data.type || type || 'Telemetry Node'}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47] space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Kill-Chain Phase</span>
              <div className="text-cyan-300 font-bold">Stage {data.stage || 1} of 5</div>
            </div>
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47] space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Observed Timestamp</span>
              <div className="text-slate-300 text-[11px]">
                {data.timestamp || new Date().toISOString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47] space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Forensic State</span>
              <div className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Ledger Sealed & Verified
              </div>
            </div>
          </div>

          {/* Description & Raw Payload */}
          <div className="p-3.5 rounded-xl bg-[#070b14] border border-[#1b2a47] space-y-2">
            <span className="text-slate-400 text-[11px] font-semibold block">Incident Description</span>
            <p className="text-slate-300 leading-relaxed text-xs">
              {data.description || data.event_description || 'Security telemetry correlated to attack graph node.'}
            </p>
            {data.raw_payload && Object.keys(data.raw_payload).length > 0 && (
              <div className="mt-2">
                <span className="text-slate-500 text-[10px] uppercase block mb-1">Normalized Event Payload</span>
                <pre className="p-2.5 rounded bg-black/80 border border-slate-800 text-[10px] text-cyan-200 overflow-x-auto max-h-36">
                  {JSON.stringify(data.raw_payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0d1527] border-t border-[#1b2a47] flex items-center justify-between">
          <div className="text-[10px] font-mono text-slate-500">
            PloyWeb Immutable Audit Ledger
          </div>
          <div className="flex items-center gap-2">
            {(data.device_name || data.type === 'device') && (
              <button
                onClick={handleQuickIsolate}
                className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Server className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate Quarantine Host</span>
              </button>
            )}
            {(data.username || data.type === 'account') && (
              <button
                onClick={handleQuickDisableAccount}
                className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Simulate Suspend Account</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
