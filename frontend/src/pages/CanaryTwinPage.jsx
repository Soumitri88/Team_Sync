import React, { useState } from 'react';
import { 
  Bug, 
  ShieldAlert, 
  PlusCircle, 
  RotateCcw, 
  Flame, 
  FileText, 
  Key, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Activity, 
  Eye, 
  Radio 
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const CanaryTwinPage = ({ onInspectEvidence }) => {
  const { 
    canaries, 
    tripCanary, 
    rearmCanaries, 
    createCanary, 
    refreshAll 
  } = useSecurity();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCanary, setNewCanary] = useState({
    name: 'Executive_Board_Deck_Canary.docx',
    path: '/srv/shared/executive/2026_Q4_M&A_Canary.docx',
    host_device: 'SRV-FINANCE-01',
    description: 'Decoy strategic acquisition deck monitoring unauthorized insider browsing',
    file_type: 'decoy_document'
  });
  const [trippingId, setTrippingId] = useState(null);

  const handleTrip = async (canaryId) => {
    setTrippingId(canaryId);
    await tripCanary(canaryId, 'adversary.infiltrator', '198.51.100.44');
    setTimeout(() => {
      setTrippingId(null);
    }, 600);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createCanary(newCanary);
    setShowCreateModal(false);
  };

  const trippedCount = canaries.filter((c) => c.tripped).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Overview & Mission Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0d1527] to-[#090e1a] border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Bug className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-amber-500/50 bg-amber-950 text-amber-300">
                CANARY TWIN DECEPTION ENGINE
              </span>
              <h2 className="text-base font-extrabold font-mono text-white">
                Virtual Decoy Honey-Tokens & Tripwires
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
              Virtual deception traps placed inside simulated high-value shares. Touching any decoy produces immediate high-fidelity telemetry with zero false-positives.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>Deploy Decoy Trap</span>
          </button>
          <button
            onClick={rearmCanaries}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rearm All Traps</span>
          </button>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="cyber-card p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400">Deployed Canaries</span>
            <div className="text-2xl font-extrabold font-mono text-white">{canaries.length}</div>
          </div>
          <Bug className="w-6 h-6 text-cyan-400" />
        </div>

        <div className="cyber-card p-4 rounded-xl flex items-center justify-between bg-red-950/20 border-red-500/30">
          <div>
            <span className="text-[11px] font-mono uppercase text-red-400">Breached Traps</span>
            <div className="text-2xl font-extrabold font-mono text-red-400">{trippedCount}</div>
          </div>
          <Flame className="w-6 h-6 text-red-500 animate-pulse" />
        </div>

        <div className="cyber-card p-4 rounded-xl flex items-center justify-between bg-emerald-950/20 border-emerald-500/30">
          <div>
            <span className="text-[11px] font-mono uppercase text-emerald-400">Active Quiescent Traps</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">{canaries.length - trippedCount}</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Canary Traps Grid */}
      <div>
        <h3 className="text-sm font-bold font-mono text-white mb-3 flex items-center gap-2">
          <Bug className="w-4 h-4 text-cyan-400" />
          <span>Active Simulated Decoy Canaries</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {canaries.map((c) => {
            const isTripped = c.tripped;
            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isTripped
                    ? 'bg-red-950/30 border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                    : 'cyber-card hover:border-cyan-500/40'
                }`}
              >
                <div>
                  {/* Top Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border flex items-center gap-1.5 ${
                        isTripped
                          ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isTripped ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      {isTripped ? 'TRIPPED // BREACH DETECTED' : 'ARMED & MONITORING'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{c.id}</span>
                  </div>

                  {/* Title & Path */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-black/40 border border-slate-800 text-amber-400 flex-shrink-0">
                      {c.name.includes('Credential') ? (
                        <Key className="w-4 h-4 text-amber-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-mono text-white break-all">
                        {c.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono break-all mt-0.5">
                        {c.path}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-sans my-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1b2a47] font-mono text-[11px] space-y-1 mb-3">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Host Device:</span>
                      <span className="text-cyan-300 font-bold">{c.host_device}</span>
                    </div>
                    {isTripped && (
                      <>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Tripped At:</span>
                          <span className="text-red-400">{c.tripped_at ? c.tripped_at.slice(11, 19) : 'Recent'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Culprit User:</span>
                          <span className="text-purple-300 font-semibold">{c.tripped_by || 'adversary.sim'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Origin IP:</span>
                          <span className="text-red-400 font-semibold">{c.tripped_ip || '198.51.100.44'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-[#1b2a47] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    MITRE T1005 Tripwire
                  </span>
                  <button
                    onClick={() => handleTrip(c.id)}
                    disabled={trippingId === c.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                      isTripped
                        ? 'bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300'
                        : 'bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 shadow-sm'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{trippingId === c.id ? 'Detonating...' : isTripped ? 'Re-Trigger Tripwire' : 'Simulate Attacker Access'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Canary Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#090e1a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
            <div className="p-4 bg-[#0d1527] border-b border-[#1b2a47] flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <PlusCircle className="w-4 h-4" />
                <span>Deploy Virtual Decoy Canary File</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Decoy File Name</label>
                <input
                  type="text"
                  required
                  value={newCanary.name}
                  onChange={(e) => setNewCanary({ ...newCanary, name: e.target.value })}
                  className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Virtual Share Path</label>
                <input
                  type="text"
                  required
                  value={newCanary.path}
                  onChange={(e) => setNewCanary({ ...newCanary, path: e.target.value })}
                  className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Host Endpoint / Server</label>
                <select
                  value={newCanary.host_device}
                  onChange={(e) => setNewCanary({ ...newCanary, host_device: e.target.value })}
                  className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                >
                  <option value="SRV-FINANCE-01">SRV-FINANCE-01</option>
                  <option value="WS-ENGINEERING-07">WS-ENGINEERING-07</option>
                  <option value="DEV-STORAGE-03">DEV-STORAGE-03</option>
                  <option value="DC-CORP-01">DC-CORP-01</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Trap Description</label>
                <textarea
                  rows={2}
                  value={newCanary.description}
                  onChange={(e) => setNewCanary({ ...newCanary, description: e.target.value })}
                  className="w-full bg-[#070b14] border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                >
                  Deploy Virtual Trap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
