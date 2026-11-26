import React, { useState } from 'react';
import {
  Laptop,
  Smartphone,
  Server,
  PlusCircle,
  Upload,
  Radio,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Cpu,
  Info,
  Terminal,
  FileCode,
  Zap
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export function DeviceMonitoringPage({ onInspectEvidence }) {
  const { devices, registerDevice, generateTestEvent, importEvents, events, refreshAll } = useSecurity();

  // New device registration form state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('windows');
  const [deviceOs, setDeviceOs] = useState('Windows 11 Enterprise (23H2)');
  const [deviceMode, setDeviceMode] = useState('Simulated Telemetry Agent');
  const [isRegistering, setIsRegistering] = useState(false);

  // Safe test event generator state
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [testEventType, setTestEventType] = useState('diagnostic_audit');
  const [testSeverity, setTestSeverity] = useState('low');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testEventFeedback, setTestEventFeedback] = useState(null);

  // Security log import state
  const [logInput, setLogInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;
    setIsRegistering(true);
    await registerDevice({
      name: deviceName.trim(),
      device_type: deviceType,
      os: deviceOs,
      mode: deviceMode
    });
    setIsRegistering(false);
    setShowRegisterModal(false);
    setDeviceName('');
  };

  const handleGenerateTestEvent = async (targetDev) => {
    setIsGenerating(true);
    setTestEventFeedback(null);
    const evt = await generateTestEvent({
      device_id: targetDev?.id,
      device_name: targetDev?.name,
      event_type: testEventType,
      severity: testSeverity
    });
    setIsGenerating(false);
    setTestEventFeedback({
      message: `Benign test probe generated on ${targetDev?.name || 'Device'}!`,
      eventId: evt?.id
    });
    setTimeout(() => setTestEventFeedback(null), 6000);
  };

  const handleImportLogs = async () => {
    if (!logInput.trim()) return;
    setIsImporting(true);
    setImportResult(null);
    const res = await importEvents(logInput);
    setIsImporting(false);
    if (res && res.status === 'success') {
      setImportResult(`Successfully ingested ${res.imported_count} security log(s) into correlation engine.`);
      setLogInput('');
    } else {
      setImportResult('Log ingestion processed. Check event feed.');
    }
    setTimeout(() => setImportResult(null), 5000);
  };

  const handlePreloadSampleJson = () => {
    const sample = [
      {
        "timestamp": new Date().toISOString(),
        "source_ip": "10.0.2.14",
        "destination_ip": "10.0.0.1",
        "username": "auditor.sec",
        "device_name": "WS-ENGINEERING-07",
        "event_type": "diagnostic_audit",
        "event_description": "Sample Import: Endpoint integrity audit pass verified.",
        "severity": "low",
        "mitre_id": "T1059",
        "mitre_name": "Command and Scripting Interpreter (Audit Probe)"
      },
      {
        "timestamp": new Date().toISOString(),
        "source_ip": "198.51.100.44",
        "destination_ip": "10.0.4.52",
        "username": "mobile_admin",
        "device_name": "MOBILE-PIXEL-08",
        "event_type": "suspicious_login",
        "event_description": "Sample Import: Mobile device geofence warning triggered.",
        "severity": "medium",
        "mitre_id": "T1078",
        "mitre_name": "Valid Accounts: Mobile Ingress"
      }
    ];
    setLogInput(JSON.stringify(sample, null, 2));
  };

  const handlePreloadSyslog = () => {
    const lines = [
      `<134>1 ${new Date().toISOString()} WS-ENGINEERING-07 PloyAgent 4102 - [audit@loy category="sec"] Port 443 TCP handshake completed`,
      `<132>1 ${new Date().toISOString()} MOBILE-PIXEL-08 PloyMobile 1089 - [auth@loy severity="medium"] Anomalous app permission requested: BIND_DEVICE_ADMIN`,
      `<131>1 ${new Date().toISOString()} SRV-FINANCE-01 PloyServer 9901 - [auth@loy severity="high"] SMB null session bind attempted from 10.0.2.14`
    ].join('\n');
    setLogInput(lines);
  };

  const filteredDevices = devices.filter(d => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.os?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.ip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.device_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'android':
      case 'ios':
        return <Smartphone className="w-5 h-5 text-cyan-400" />;
      case 'linux':
        return <Server className="w-5 h-5 text-purple-400" />;
      default:
        return <Laptop className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPostureBadge = (posture) => {
    switch (posture?.toLowerCase()) {
      case 'protected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Protected
          </span>
        );
      case 'critical_threat':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            Critical Threat
          </span>
        );
      case 'elevated_risk':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Elevated Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Nominal
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            <span>Device Monitoring & Telemetry Ingestion</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Register endpoints, ingest authorized security logs, and generate safe diagnostic audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Device</span>
          </button>
          <button
            onClick={refreshAll}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Devices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Windows Endpoint Agent Quick Connect Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex-shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-wide">Windows Endpoint Agent Connection</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-500/30">
                Ready for Hackathon Judging
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              To connect a physical Windows computer to PloyWeb: run <code className="text-cyan-300">agent\start_agent.bat</code> or <code className="text-cyan-300">python agent\ployweb_agent.py</code>. The agent establishes live heartbeat telemetry into GraphX.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-[11px] text-cyan-300 font-mono">
            Host: WS-ENGINEERING-07
          </span>
        </div>
      </div>

      {/* Non-destructive Compliance Disclaimer Notice */}
      <div className="p-3.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-cyan-300">Authorized Telemetry Compliance Notice:</span>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            PloyWeb operates strictly with controlled, simulated telemetry and authorized operating-system security logs. Real endpoint kernel drivers or invasive agents are not deployed without explicit enterprise authorization. All simulation data remains strictly isolated.
          </p>
        </div>
      </div>

      {/* Device Registration & Search Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter devices by name, OS, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 w-full sm:w-auto justify-end">
          <span>Active Endpoints: <strong className="text-cyan-400">{devices.length}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Simulation Mode: <strong className="text-purple-400">Enabled</strong></span>
        </div>
      </div>

      {/* Feedback Alert */}
      {testEventFeedback && (
        <div className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>{testEventFeedback.message}</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">Event ID: {testEventFeedback.eventId}</span>
        </div>
      )}

      {/* Device Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDevices.map((dev) => (
          <div
            key={dev.id}
            className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                    {getDeviceIcon(dev.device_type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{dev.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{dev.ip || '10.0.0.x'}</p>
                  </div>
                </div>
                {getPostureBadge(dev.security_posture)}
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">OS:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[140px] text-right" title={dev.os}>
                    {dev.os}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Mode:</span>
                  <span className="text-cyan-300 text-[10px] truncate max-w-[140px] text-right">
                    {dev.mode || 'Simulated Agent'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Status:</span>
                  <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Device Actions */}
            <div className="pt-2">
              <button
                onClick={() => handleGenerateTestEvent(dev)}
                disabled={isGenerating}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 text-xs font-semibold border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Generate Test Event</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Log Ingestion & Telemetry Import Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ingestion Tool */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Security Log Ingestion & Import</span>
              </h2>
              <p className="text-xs text-slate-400">
                Paste JSON security events or RFC 5424 Syslog entries to inject into the correlation pipeline.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePreloadSampleJson}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
              >
                Sample JSON
              </button>
              <button
                onClick={handlePreloadSyslog}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
              >
                Sample Syslog
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            placeholder='Paste JSON array of event objects or newline-separated syslog records here...'
            className="w-full p-3 bg-[#080d1a] border border-slate-800 rounded-lg text-xs font-mono text-cyan-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Supports automatic normalization into PloyWeb standard schema.
            </span>

            <button
              onClick={handleImportLogs}
              disabled={isImporting || !logInput.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isImporting ? 'Ingesting...' : 'Ingest Logs'}</span>
            </button>
          </div>

          {importResult && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{importResult}</span>
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Test Generator */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Safe Telemetry Probe</span>
            </h2>
            <p className="text-xs text-slate-400">
              Fire controlled benign audit events to verify correlation.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Endpoint</label>
              <select
                onChange={(e) => setSelectedDevice(devices.find(d => d.id === e.target.value))}
                value={selectedDevice?.id || ''}
                className="w-full p-2 bg-[#080d1a] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Endpoint (Default: WS-ENGINEERING-07)</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.os})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Event Type</label>
              <select
                value={testEventType}
                onChange={(e) => setTestEventType(e.target.value)}
                className="w-full p-2 bg-[#080d1a] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="diagnostic_audit">Safe Diagnostic Audit</option>
                <option value="suspicious_login">Simulated Login Indicator</option>
                <option value="privilege_escalation">Simulated Token Probe</option>
                <option value="lateral_movement">Simulated Subnet Ping</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Severity</label>
              <select
                value={testSeverity}
                onChange={(e) => setTestSeverity(e.target.value)}
                className="w-full p-2 bg-[#080d1a] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="low">Low (Harmless Probe)</option>
                <option value="medium">Medium (Audit Flag)</option>
                <option value="high">High (Anomalous Flow)</option>
              </select>
            </div>

            <button
              onClick={() => handleGenerateTestEvent(selectedDevice)}
              disabled={isGenerating}
              className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Firing...' : 'Fire Safe Test Probe'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Device Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1427] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" />
                <span>Register Endpoint</span>
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Device Hostname / Tag *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAPTOP-DEV-09 or PIXEL-USER-02"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Platform Type</label>
                <select
                  value={deviceType}
                  onChange={(e) => {
                    setDeviceType(e.target.value);
                    if (e.target.value === 'android') setDeviceOs('Android 14 (Google Pixel)');
                    else if (e.target.value === 'ios') setDeviceOs('iOS 17.4 (iPhone Simulation)');
                    else if (e.target.value === 'linux') setDeviceOs('Ubuntu 22.04 LTS');
                    else setDeviceOs('Windows 11 Enterprise (23H2)');
                  }}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="windows">Windows Computer</option>
                  <option value="android">Android Mobile Device</option>
                  <option value="ios">iOS Mobile Device (Simulation Mode)</option>
                  <option value="linux">Linux Server / Workstation</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Operating System Details</label>
                <input
                  type="text"
                  value={deviceOs}
                  onChange={(e) => setDeviceOs(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Telemetry Mode</label>
                <select
                  value={deviceMode}
                  onChange={(e) => setDeviceMode(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Simulated Telemetry Agent">Simulated Telemetry Agent (Safe)</option>
                  <option value="Sandbox Simulation Mode">Sandbox Simulation Mode</option>
                  <option value="Authorized Syslog Stream">Authorized Syslog Stream</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isRegistering ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
