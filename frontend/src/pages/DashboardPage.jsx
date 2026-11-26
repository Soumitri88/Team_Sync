import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Network, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flame,
  Activity,
  Server,
  Radio,
  Cpu,
  Terminal,
  AlertTriangle,
  Layers,
  Lock,
  ArrowRight,
  Check,
  XCircle,
  ArrowUpRight,
  FileSignature
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';
import { WhyFlaggedModal } from '../components/WhyFlaggedModal';

export const DashboardPage = ({ onNavigate, onInspectEvidence }) => {
  const { stats, events, agentStatus, devices, resetSimulation, startDemo, demoActive, setIsJudgeModalOpen, approvals = [], submitApprovalDecision } = useSecurity();
  const { user } = useAuth();
  const [approvalFeedback, setApprovalFeedback] = useState(null);
  const [whyFlaggedOpen, setWhyFlaggedOpen] = useState(false);
  const [selectedWhyFlaggedItem, setSelectedWhyFlaggedItem] = useState(null);

  const handleApprovalAction = async (approvalId, decision) => {
    const reviewer = user?.name || "Alex Vance (SOC Incident Commander)";
    await submitApprovalDecision(approvalId, decision, reviewer);
    setApprovalFeedback({
      id: approvalId,
      decision,
      reviewer,
      time: new Date().toLocaleTimeString()
    });
    setTimeout(() => setApprovalFeedback(null), 5000);
  };

  const isThreat = stats?.overall_status === 'CRITICAL_THREAT' || stats?.overall_status === 'ELEVATED_RISK';
  const totalEvents = stats?.total_events || events.length || 0;
  const compDevs = stats?.compromised_devices_count || 0;
  const canariesTripped = stats?.tripped_canaries_count || 0;

  // Active Windows endpoint
  const activeEndpoint = devices.find((d) => d.device_type === 'windows') || {
    name: 'WS-ENGINEERING-07',
    ip: '10.0.2.14',
    os: 'Windows 11 Enterprise (23H2)',
    status: 'connected',
    security_posture: isThreat ? 'elevated_risk' : 'nominal'
  };

  // Severity counts
  const sevCounts = stats?.severity_counts || {
    critical: events.filter((e) => e.severity === 'critical').length,
    high: events.filter((e) => e.severity === 'high').length,
    medium: events.filter((e) => e.severity === 'medium').length,
    low: events.filter((e) => e.severity === 'low').length
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 max-w-7xl mx-auto font-mono">
      {/* Cyber SOC Top Banner with Radar Sweep & Status */}
      <div
        className={`p-4 sm:p-6 rounded-3xl border transition-all relative overflow-hidden backdrop-blur-xl ${
          isThreat
            ? 'bg-gradient-to-r from-red-950/40 via-slate-900/80 to-slate-950 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
            : 'bg-gradient-to-r from-cyan-950/30 via-slate-900/80 to-slate-950 border-slate-800 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
        } flex flex-col lg:flex-row lg:items-center justify-between gap-4`}
      >
        <div className="flex items-start sm:items-center gap-4 z-10">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
              isThreat
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-neon-red'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-neon-cyan'
            }`}
          >
            {isThreat ? (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                  isThreat
                    ? 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <Radio className="w-3 h-3 animate-pulse" />
                {isThreat ? 'ACTIVE THREAT DETECTED' : 'SYSTEM STATUS: PROTECTED'}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                DEFCON {isThreat ? '1 (BREACH)' : '5 (NOMINAL)'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
              {isThreat
                ? 'Autonomous Intrusion Detected Across Workstation & Storage Subnets'
                : 'Perimeter Telemetry Active & Honey-Tokens Armed'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isThreat
                ? 'GraphX correlated multi-stage telemetry. Canary trap detonated; response containment recommended.'
                : 'Zero uncontained anomalies. All test endpoints, sensors, and tripwires running nominally.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap z-10 w-full lg:w-auto">
          {/* Prominent Live Judge Demo CTA */}
          <button
            onClick={() => setIsJudgeModalOpen && setIsJudgeModalOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-neon-red transition-all"
          >
            <Flame className="w-4 h-4 animate-bounce" />
            <span>START LIVE JUDGE DEMO</span>
          </button>

          {/* GraphX Button */}
          <button
            onClick={() => onNavigate('/tracegraph')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/90 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-neon-cyan transition-all"
          >
            <Network className="w-4 h-4" />
            <span>GraphX Attack Path</span>
          </button>

          {/* Why Flagged Diagnostics Button */}
          <button
            onClick={() => {
              setSelectedWhyFlaggedItem(events[0] || null);
              setWhyFlaggedOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-neon-purple"
            title="Inspect AI Anomaly Detection & Signals Breakdown"
          >
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Why Flagged? Diagnostics</span>
          </button>

          {/* Reset Environment */}
          <button
            onClick={resetSimulation}
            title="Reset Environment"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connected Device & Real-Time Threat Counter Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Device Information Card */}
        <div className="cyber-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase">Monitored Endpoint</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-500/30 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse" /> Live Telemetry
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Device Hostname:</span>
              <span className="font-bold text-white">{activeEndpoint.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Operating System:</span>
              <span className="text-slate-200">{activeEndpoint.os}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">IP Address:</span>
              <span className="text-cyan-300 font-semibold">{activeEndpoint.ip}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Posture:</span>
              <span
                className={`font-bold uppercase ${
                  isThreat ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {isThreat ? 'ELEVATED RISK' : 'NOMINAL (PROTECTED)'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/devices')}
            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-cyan-400 hover:text-cyan-300 border border-slate-800 flex items-center justify-center gap-1 transition-colors"
          >
            <span>Device Diagnostics & Agents</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Severity Metrics & Threat Counter */}
        <div className="cyber-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase">Real-Time Threat Telemetry Counter</span>
            </div>
            <span className="text-[11px] text-slate-400">Total Events: {totalEvents}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Critical */}
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30">
              <span className="text-[10px] text-red-300 uppercase font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-400" /> Critical Alerts
              </span>
              <div className="text-xl sm:text-2xl font-bold text-red-400 mt-1">
                {sevCounts.critical}
              </div>
              <span className="text-[10px] text-red-300/70">Immediate threat</span>
            </div>

            {/* High */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
              <span className="text-[10px] text-amber-300 uppercase font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> High Severity
              </span>
              <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
                {sevCounts.high}
              </div>
              <span className="text-[10px] text-amber-300/70">Elevated anomaly</span>
            </div>

            {/* Medium / Low */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Medium / Low</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-200 mt-1">
                {sevCounts.medium + sevCounts.low}
              </div>
              <span className="text-[10px] text-slate-500">Telemetry logs</span>
            </div>

            {/* Decoys Tripped */}
            <div
              onClick={() => onNavigate('/canary-twin')}
              className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-colors"
            >
              <span className="text-[10px] text-amber-300 uppercase font-bold">Canary Decoys</span>
              <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
                {canariesTripped}
              </div>
              <span className="text-[10px] text-amber-300/70">Honey-tokens breached</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== INTERACTIVE ADMIN APPROVAL WORKFLOW ==================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090e1a]/95 border border-purple-500/40 shadow-xl space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-400">
              <FileSignature className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Admin Approval Workflow & Authorization Queue
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/50 text-[10px] font-bold animate-pulse">
                  {approvals.filter(a => a.decision === 'PENDING').length} PENDING DECISIONS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Human-in-the-loop incident response: Approve, Reject, or Escalate containment actions to update immutable audit log & attack graph.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/incident-response')}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Playbooks ({approvals.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Live Feedback Toast Banner */}
        {approvalFeedback && (
          <div className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between animate-fadeIn ${
            approvalFeedback.decision === 'APPROVED'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
              : approvalFeedback.decision === 'REJECTED'
              ? 'bg-red-950/90 border-red-500/60 text-red-200'
              : 'bg-amber-950/90 border-amber-500/60 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>{approvalFeedback.decision}</strong> recorded for [{approvalFeedback.id}] by <strong>{approvalFeedback.reviewer}</strong> at {approvalFeedback.time}. Cryptographic audit block committed & attack graph synchronized.
              </span>
            </div>
            <span className="text-[9px] uppercase opacity-75 font-bold">SHA-256 SEALED</span>
          </div>
        )}

        {/* Approval Queue Items */}
        <div className="grid grid-cols-1 gap-2.5">
          {approvals.slice(0, 3).map((req) => {
            const isPending = req.decision === 'PENDING';
            const isApproved = req.decision === 'APPROVED';
            const isRejected = req.decision === 'REJECTED';

            return (
              <div
                key={req.id}
                className={`p-3 rounded-xl border transition-all ${
                  isPending
                    ? 'bg-slate-900/90 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                    : isApproved
                    ? 'bg-emerald-950/30 border-emerald-500/40 opacity-90'
                    : isRejected
                    ? 'bg-red-950/30 border-red-500/40 opacity-80'
                    : 'bg-purple-950/30 border-purple-500/40 opacity-85'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-white">
                        {req.id}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/60 text-slate-300 border border-white/10">
                        {req.incident_id}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                        {req.mitre_id}
                      </span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.2 rounded uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-500 text-black animate-pulse'
                          : isApproved
                          ? 'bg-emerald-600 text-white'
                          : isRejected
                          ? 'bg-red-600 text-white'
                          : 'bg-purple-600 text-white'
                      }`}>
                        {req.decision}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-cyan-300">
                      Proposed Defense: {req.action_requested}
                    </div>

                    <div className="text-[10px] text-slate-300 font-sans leading-relaxed">
                      <strong className="text-slate-400">Trigger: </strong> {req.reason}
                    </div>

                    <div className="flex items-center gap-3 text-[9px] text-slate-400 pt-0.5 flex-wrap">
                      <span>Target: <strong className="text-slate-200">{req.target}</strong></span>
                      <span>Reviewer: <strong className="text-slate-200">{req.reviewer_name}</strong></span>
                      <span>Timestamp: <strong className="text-slate-200">{new Date(req.timestamp).toLocaleTimeString()} UTC</strong></span>
                    </div>
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 pt-1 lg:pt-0">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleApprovalAction(req.id, 'APPROVED')}
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-[10px] flex items-center gap-1 shadow transition-transform hover:scale-105 active:scale-95"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>APPROVE</span>
                        </button>

                        <button
                          onClick={() => handleApprovalAction(req.id, 'REJECTED')}
                          className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 font-bold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3 h-3 text-red-400" />
                          <span>REJECT</span>
                        </button>

                        <button
                          onClick={() => handleApprovalAction(req.id, 'ESCALATED')}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-200 font-bold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <ArrowUpRight className="w-3 h-3 text-amber-400" />
                          <span>ESCALATE</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          Sealed at {new Date(req.timestamp).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => handleApprovalAction(req.id, 'PENDING')}
                          className="text-[9px] text-cyan-400 hover:underline px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
                        >
                          Reopen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GraphX Attack Path Reconstruction Pipeline */}
      <div className="cyber-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase">
                GraphX Attack Progression Sequence
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Temporal correlation reconstructing exact adversarial kill-chain steps
            </p>
          </div>
          <button
            onClick={() => onNavigate('/tracegraph')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 flex-shrink-0"
          >
            <span>Full GraphX Canvas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-Step Visual Attack Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Step 1 • Initial Entry</span>
            <div className="text-xs font-bold text-white">RDP External Auth</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Untrusted IP <code className="text-slate-300">198.51.100.44</code> authenticated via compromised credential.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-400">Step 2 • Privilege Escalation</span>
            <div className="text-xs font-bold text-white">Process Spawn & PrivEsc</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Named Pipe token abuse on <code className="text-purple-300">WS-ENGINEERING-07</code> elevating to SYSTEM.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">Step 3 • Lateral Pivot</span>
            <div className="text-xs font-bold text-white">WinRM to Finance Server</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Attacker pivoted laterally to <code className="text-slate-300">SRV-FINANCE-01</code> via port 5985.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-red-500/30 bg-red-950/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-red-400">Step 4 • Canary Decoy Breach</span>
            <div className="text-xs font-bold text-white">Honey-Token Tripped</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Unauthorized access to <code className="text-red-300">financial_report_demo.txt</code> triggering DEFCON 1 alert.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Security Telemetry Events Feed */}
      <div className="cyber-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase">
              Recent Forensic Telemetry Stream
            </h3>
            <p className="text-[11px] text-slate-400">Live endpoint events verified with SHA-256 hashes</p>
          </div>
          <button
            onClick={() => onNavigate('/events')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>All Telemetry Logs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-slate-500 text-xs py-6 text-center">
              No security events recorded. Click "START LIVE JUDGE DEMO" above to generate telemetry.
            </div>
          ) : (
            events.slice(0, 6).map((e) => (
              <div
                key={e.id}
                onClick={() => onInspectEvidence && onInspectEvidence(e)}
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0 font-mono ${
                      e.severity === 'critical'
                        ? 'bg-red-950 text-red-400 border border-red-500/40'
                        : e.severity === 'high'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                    }`}
                  >
                    {e.severity}
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-white block truncate">{e.event_description}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate flex items-center gap-2">
                      <span>Host: <strong className="text-slate-300">{e.device_name}</strong></span>
                      <span>•</span>
                      <span>MITRE: <strong className="text-purple-300">{e.mitre_id || 'T1059'}</strong></span>
                      <span>•</span>
                      <span className="font-mono text-[9px] text-cyan-400/80">SHA: {e.evidence_hash ? e.evidence_hash.slice(0, 8) + '...' : 'Verified'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setSelectedWhyFlaggedItem(e);
                      setWhyFlaggedOpen(true);
                    }}
                    className="px-2 py-0.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-[9px] font-bold text-purple-300 transition-colors"
                  >
                    Why Flagged?
                  </button>
                  <div className="text-slate-500 text-[10px] font-mono whitespace-nowrap">
                    {e.timestamp ? e.timestamp.slice(11, 19) : ''} UTC
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Why Flagged Diagnostic Modal */}
      <WhyFlaggedModal
        isOpen={whyFlaggedOpen}
        onClose={() => setWhyFlaggedOpen(false)}
        targetItem={selectedWhyFlaggedItem}
        onNavigate={onNavigate}
      />
    </div>
  );
};
