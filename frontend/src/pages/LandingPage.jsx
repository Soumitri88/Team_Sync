import React from 'react';
import {
  ShieldAlert,
  Network,
  Bug,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Lock,
  Terminal,
  Cpu,
  Smartphone,
  Monitor,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export function LandingPage({ onNavigate }) {
  const { runJudgeDemo, stats } = useSecurity();

  const handleLaunchJudgeDemo = async () => {
    await runJudgeDemo();
    onNavigate('/tracegraph');
  };

  return (
    <div className="min-h-full pb-16 text-slate-100 space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-[#0c1427]/80 to-[#070b14]/90 border border-slate-800 p-6 sm:p-12 lg:p-16 text-center">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Cyber Investigation & Attack Graph Reconstruction</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Ploy<span className="text-cyan-400">Web</span>
          </h1>

          {/* Signature Philosophy */}
          <p className="text-lg sm:text-2xl font-medium text-cyan-200/90 italic">
            " PloyWeb does not just flag anomalies. It reconstructs the reality of an attack. "
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate alert fatigue. PloyWeb correlates fragmented, out-of-order logs across Windows, Android, and cloud servers into an immutable, directional attack graph with automated containment playbooks and SHA-256 evidence integrity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            <button
              onClick={() => onNavigate('/')}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>Launch SOC Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLaunchJudgeDemo}
              className="px-6 py-3 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-bold text-sm sm:text-base flex items-center gap-2 border border-purple-400/30 shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>1-Click Hackathon Judge Demo</span>
            </button>

            <button
              onClick={() => onNavigate('/simulation')}
              className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm sm:text-base flex items-center gap-2 border border-slate-700 transition-all hover:scale-105"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Attack Simulation Lab</span>
            </button>
          </div>

          {/* Live Telemetry Pulse */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Rule-Based Graph Correlation: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>NetworkX Reconstructed Nodes: {stats?.total_events || 7}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>Evidence Ledger: SHA-256 Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Technologies: TraceGraph & Canary Twin */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Two Pillars of Deep Forensics
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Interactive visual reconstruction and safe deception tripwires engineered for rapid threat containment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: TraceGraph */}
          <div className="rounded-xl bg-gradient-to-br from-slate-900/90 to-[#0a1122]/90 border border-cyan-500/30 p-6 sm:p-8 space-y-4 hover:border-cyan-500/60 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>TraceGraph™ Visual Reconstruction</span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Signature</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Traditional SIEMs dump thousands of isolated alerts. TraceGraph uses NetworkX and Cytoscape.js to reconstruct the exact causal kill chain in chronological order—even when security logs arrive scrambled or out-of-order.
            </p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Directional edges reveal lateral movement and privilege escalation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Forensic node inspection with MITRE ATT&CK mapping & evidence hashes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Timeline scrubber for frame-by-frame attack replay</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/tracegraph')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
              >
                <span>Open TraceGraph Interactive Canvas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pillar 2: Canary Twin */}
          <div className="rounded-xl bg-gradient-to-br from-slate-900/90 to-[#0a1122]/90 border border-purple-500/30 p-6 sm:p-8 space-y-4 hover:border-purple-500/60 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bug className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Canary Twin™ Safe Deception</span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">Deception Trap</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Deploys harmless decoy files containing fictional data across protected hosts: <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded text-xs">financial_report_demo.txt</code>, <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded text-xs">admin_credentials_demo.txt</code>, and <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded text-xs">confidential_demo.txt</code>.
            </p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Instant DEFCON 1 alert upon unauthorized access attempt</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Zero false positives: no legitimate user ever touches honeypot files</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Automated SHA-256 evidence hashing and blast radius injection</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/canary-twin')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
              >
                <span>Inspect Canary Tripwires & Traps</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How PloyWeb Works: 4-Step Pipeline */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Autonomous Cyber Investigation Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            From fragmented telemetry to cryptographic evidence ledger and containment playbooks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h4 className="font-bold text-sm text-white">Controlled Telemetry Ingestion</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Collects security telemetry from Windows PCs, Android phones, iOS simulators, and Linux servers without deploying risky kernel rootkits.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h4 className="font-bold text-sm text-white">Temporal Correlation Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sorts out-of-order logs using verified timestamps, evaluates MITRE ATT&CK patterns, and links related entities into cohesive attack paths.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h4 className="font-bold text-sm text-white">Graph & Blast Radius Mapping</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reconstructs directed attack graphs, exposes Patient Zero, and calculates subnet compromise impact percentage before data exfiltration occurs.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h4 className="font-bold text-sm text-white">Response & Evidence Ledger</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Executes 1-click containment playbooks (quarantine host, revoke tokens, MFA) and seals forensic records in an immutable SHA-256 evidence ledger.
            </p>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for Modern Security Operations
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Empowering analysts, engineering teams, and compliance officers with actionable intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">SOC Analysts</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Resolve incidents 10x faster. Eliminate manual alert correlation across disparate log tabs with unified attack graphs and automated timeline reconstruction.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Enterprise SecOps</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Simulate enterprise and mobile threats safely before attackers breach production. Measure blast radius impact across subnets and validate defense playbooks.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Compliance & Audit</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Present court-admissible forensic evidence. SHA-256 cryptographic digests ensure telemetry integrity is mathematically provable with automated tamper audits.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Launch Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-purple-950/70 border border-cyan-500/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-white">Ready to inspect live cyber telemetry?</h3>
          <p className="text-xs sm:text-sm text-slate-400">Run safe simulations, monitor registered devices, or trigger the 1-click judge evaluation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs sm:text-sm transition-all shadow-md"
          >
            Open Dashboard
          </button>
          <button
            onClick={() => onNavigate('/devices')}
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all"
          >
            Device Monitoring
          </button>
        </div>
      </section>
    </div>
  );
}
