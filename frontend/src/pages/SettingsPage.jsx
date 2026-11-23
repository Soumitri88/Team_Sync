import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  RotateCcw,
  Save,
  Terminal,
  Sliders,
  Wifi,
  Database,
  CheckCircle2,
  Sparkles,
  Server,
  Lock
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { reseedDemo, refreshAll } = useSecurity();
  const { user } = useAuth();

  const [config, setConfig] = useState({
    soc_domain: 'corp.ployweb.internal',
    retention_days: 30,
    anomaly_threshold: 0.75,
    auto_quarantine_critical: true,
    canary_instant_alert: true,
    telemetry_streaming: true,
    correlation_window_sec: 120
  });

  const [savedStatus, setSavedStatus] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setConfig((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Settings load error:', err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSavedStatus('Settings successfully committed to SOC configuration store.');
        setTimeout(() => setSavedStatus(''), 4000);
      }
    } catch (err) {
      setSavedStatus('Error updating configuration');
    }
  };

  const handleFactoryReset = async () => {
    setResetting(true);
    await reseedDemo();
    await refreshAll();
    setTimeout(() => {
      setResetting(false);
      setSavedStatus('Platform successfully reset and reseeded with default multi-stage attack telemetry!');
      setTimeout(() => setSavedStatus(''), 5000);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1b2a47] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-white">
              Platform Settings & SOC Environment Configuration
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configure anomaly thresholds, canary response policies, and simulation environment
          </p>
        </div>
      </div>

      {savedStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{savedStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
        {/* SOC Operator & Clearance Info */}
        <div className="cyber-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-[#1b2a47] pb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Active Operator Identity & Role</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47]">
              <span className="text-slate-500 text-[10px] uppercase block">Operator Name</span>
              <span className="text-white font-bold">{user?.name || 'Alex Vance'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47]">
              <span className="text-slate-500 text-[10px] uppercase block">Assigned Role</span>
              <span className="text-cyan-300 font-semibold">{user?.role || 'SOC Commander'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47]">
              <span className="text-slate-500 text-[10px] uppercase block">Clearance Level</span>
              <span className="text-purple-300 font-bold">{user?.badge || 'DEFCON-ALPHA'}</span>
            </div>
          </div>
        </div>

        {/* Environmental Parameters */}
        <div className="cyber-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-[#1b2a47] pb-2">
            <Sliders className="w-4 h-4" />
            <span>Autonomous Detection & Correlation Thresholds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">Internal SOC Domain</label>
              <input
                type="text"
                value={config.soc_domain}
                onChange={(e) => setConfig({ ...config, soc_domain: e.target.value })}
                className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Correlation Time Window: <span className="text-cyan-300">{config.correlation_window_sec}s</span>
              </label>
              <input
                type="range"
                min="30"
                max="600"
                step="30"
                value={config.correlation_window_sec}
                onChange={(e) => setConfig({ ...config, correlation_window_sec: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Anomaly Detection Sensitivity Threshold: <span className="text-cyan-300">{config.anomaly_threshold}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={config.anomaly_threshold}
                onChange={(e) => setConfig({ ...config, anomaly_threshold: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Log Retention Period (Days)</label>
              <input
                type="number"
                min="7"
                max="365"
                value={config.retention_days}
                onChange={(e) => setConfig({ ...config, retention_days: Number(e.target.value) })}
                className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.auto_quarantine_critical}
                onChange={(e) => setConfig({ ...config, auto_quarantine_critical: e.target.checked })}
                className="w-4 h-4 rounded accent-cyan-400"
              />
              <div>
                <span className="text-slate-200 font-semibold block">Auto-Recommend Host Quarantine on Critical Alert</span>
                <span className="text-slate-500 text-[10px]">Automatically queues VLAN isolation playbook upon multi-stage breach confirmation</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.canary_instant_alert}
                onChange={(e) => setConfig({ ...config, canary_instant_alert: e.target.checked })}
                className="w-4 h-4 rounded accent-cyan-400"
              />
              <div>
                <span className="text-slate-200 font-semibold block">Canary Twin Instant DEFCON 1 Escalation</span>
                <span className="text-slate-500 text-[10px]">Immediately escalate platform readiness to DEFCON 1 when any decoy canary is touched</span>
              </div>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold flex items-center justify-center gap-2 shadow-neon-cyan transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>

      {/* Dangerous Zone / Factory Reset */}
      <div className="cyber-card p-4 sm:p-5 rounded-2xl border-red-500/40 bg-red-950/10 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-red-400 font-bold border-b border-red-900/40 pb-2">
          <Database className="w-4 h-4" />
          <span>Reset Platform & Reseed Demonstration Telemetry</span>
        </div>

        <p className="text-slate-300 leading-relaxed font-sans text-xs">
          Clears all current event logs, incidents, response action records, and resets canary tripwires back to their quiescent armed state. Re-populates the database with the pristine 5-stage multi-stage attack scenario for a clean demonstration.
        </p>

        <button
          onClick={handleFactoryReset}
          disabled={resetting}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500 text-red-300 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Reseeding SOC Telemetry...' : 'Factory Reset & Reseed Demo Data'}</span>
        </button>
      </div>
    </div>
  );
};
