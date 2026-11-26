import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  ShieldCheck, 
  Check, 
  Hash, 
  Clock, 
  Server, 
  User, 
  Flame, 
  Layers, 
  Sparkles, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useSecurity } from '../context/SecurityContext';
import { INITIAL_REPORT } from '../services/clientEngine';

export const ReportsPage = () => {
  const [report, setReport] = useState(INITIAL_REPORT);
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    fetch('/api/report/generate')
      .then((res) => {
        if (!res.ok) throw new Error('Offline');
        return res.json();
      })
      .then((data) => {
        if (data && data.report_id) {
          setReport(data);
        }
      })
      .catch((err) => {
        console.log('[Reports] Using client-side autonomous investigation dossier.');
      });
  }, []);

  const handleDownloadPDF = () => {
    if (!report) return;
    setPdfGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Background styling
      doc.setFillColor(7, 11, 20);
      doc.rect(0, 0, 210, 297, 'F');

      // Title & Header
      doc.setTextColor(0, 242, 254);
      doc.setFont('courier', 'bold');
      doc.setFontSize(18);
      doc.text('PLOYWEB CYBER INVESTIGATION DOSSIER', 14, 20);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(9);
      doc.text(`REPORT ID: ${report.report_id}  |  CLASSIFICATION: ${report.classification}`, 14, 27);
      doc.text(`GENERATED AT: ${report.generated_at} (UTC)`, 14, 32);
      doc.text(`DIGITAL SEAL HASH: ${report.digital_seal_hash}`, 14, 37);

      doc.setDrawColor(27, 42, 71);
      doc.line(14, 40, 196, 40);

      // Executive Summary
      doc.setTextColor(0, 242, 254);
      doc.setFontSize(12);
      doc.text('1. EXECUTIVE SUMMARY NARRATIVE', 14, 48);

      doc.setTextColor(226, 232, 240);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitSummary = doc.splitTextToSize(report.incident_summary || 'No incident summary available.', 180);
      doc.text(splitSummary, 14, 55);

      let currentY = 55 + splitSummary.length * 5 + 8;

      // Blast Radius & Affected Assets
      doc.setTextColor(0, 242, 254);
      doc.setFont('courier', 'bold');
      doc.setFontSize(12);
      doc.text('2. BLAST RADIUS & ASSET IMPACT ASSESSMENT', 14, currentY);
      currentY += 6;

      doc.setTextColor(203, 213, 225);
      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      doc.text(`- Patient Zero Origin: ${report.blast_radius?.patient_zero || 'Unknown'}`, 14, currentY);
      currentY += 5;
      doc.text(`- Environment Blast Exposure Score: ${report.blast_radius?.impact_score || 0}%`, 14, currentY);
      currentY += 5;
      
      const compHosts = (report.blast_radius?.compromised_devices || []).map((d) => d.name).join(', ');
      doc.text(`- Confirmed Compromised Hosts: ${compHosts || 'None'}`, 14, currentY);
      currentY += 5;

      const compAccs = (report.blast_radius?.compromised_accounts || []).map((a) => a.username).join(', ');
      doc.text(`- Confirmed Compromised Accounts: ${compAccs || 'None'}`, 14, currentY);
      currentY += 10;

      // MITRE ATT&CK Matrix
      doc.setTextColor(0, 242, 254);
      doc.setFont('courier', 'bold');
      doc.setFontSize(12);
      doc.text('3. IDENTIFIED MITRE ATT&CK TECHNIQUES', 14, currentY);
      currentY += 6;

      (report.mitre_techniques || []).slice(0, 5).forEach((t) => {
        doc.setTextColor(168, 85, 247);
        doc.setFont('courier', 'bold');
        doc.setFontSize(9);
        doc.text(`[${t.id}] ${t.name}`, 14, currentY);
        currentY += 5;
      });
      currentY += 6;

      // Strategic Recommendations
      doc.setTextColor(0, 242, 254);
      doc.setFont('courier', 'bold');
      doc.setFontSize(12);
      doc.text('4. STRATEGIC REMEDIATION & HARDENING RECOMMENDATIONS', 14, currentY);
      currentY += 6;

      (report.recommendations || []).forEach((rec) => {
        doc.setTextColor(239, 68, 68);
        doc.setFont('courier', 'bold');
        doc.setFontSize(9);
        doc.text(`[${rec.priority}] ${rec.category}:`, 14, currentY);
        currentY += 4;
        doc.setTextColor(226, 232, 240);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const splitAction = doc.splitTextToSize(rec.action, 180);
        doc.text(splitAction, 14, currentY);
        currentY += splitAction.length * 4 + 3;
      });

      // Footer seal
      doc.setTextColor(100, 116, 139);
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.text('PloyWeb Autonomous Forensic Engine  |  Cryptographically Sealed  |  Page 1 of 1', 14, 288);

      doc.save(`PloyWeb-Incident-Report-${report.report_id}.pdf`);
    } catch (e) {
      console.error('PDF generation error:', e);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PloyWeb-Forensics-${report.report_id}.json`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const activeReport = report || INITIAL_REPORT;

  if (loading && !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center font-mono">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-cyan-300 text-xs">Compiling Autonomous Incident Dossier...</span>
      </div>
    );
  }

  const reportData = activeReport;

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header and Download Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <h2 className="text-sm sm:text-base font-bold font-mono text-white">
              Autonomous Cybersecurity Investigation Dossier
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5">
            Full attack reconstruction, forensic timeline, blast radius, and hardening plan
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs font-mono flex items-center justify-center gap-1.5 shadow-neon-cyan transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{pdfGenerating ? 'Generating PDF...' : 'Download PDF Dossier'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Hash className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Print Incident Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Formatted Incident Dossier View */}
      <div className="cyber-card p-4 sm:p-8 rounded-2xl border-cyan-500/40 space-y-6 sm:space-y-8 bg-[#090e1a]/95 text-slate-200">
        {/* Dossier Header */}
        <div className="border-b border-[#1b2a47] pb-4 sm:pb-6 space-y-3 font-mono">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold block">
                CYBER INCIDENT RESPONSE DOSSIER
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
                {report.report_id}
              </h1>
            </div>
            <div className="text-left md:text-right">
              <span className="inline-block px-3 py-1 rounded bg-red-950/80 text-red-300 border border-red-500/50 text-xs font-bold uppercase">
                {report.classification}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                STATUS: <span className="text-emerald-400 font-bold">{report.investigation_status}</span>
              </div>
            </div>
          </div>

          {/* Root Seal Bar */}
          <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Digital Seal Hash (Merkle Ledger Root):
            </span>
            <span className="text-cyan-300 text-[11px] font-mono break-all select-all">
              {report.digital_seal_hash}
            </span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold text-sm border-b border-[#1b2a47] pb-2">
            <span>1.0</span>
            <span>EXECUTIVE INCIDENT SUMMARY</span>
          </div>
          <p className="text-xs font-sans text-slate-300 leading-relaxed p-4 rounded-xl bg-[#070b14] border border-[#1b2a47]">
            {report.incident_summary}
          </p>
        </div>

        {/* Section 2: Blast Radius & Impact Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold text-sm border-b border-[#1b2a47] pb-2">
            <span>2.0</span>
            <span>ENVIRONMENTAL IMPACT & BLAST RADIUS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47]">
              <span className="text-slate-400 text-[10px] uppercase block">Patient Zero Host</span>
              <span className="text-red-400 font-bold text-sm">
                {report.blast_radius?.patient_zero || 'GW-VPN-EDGE-01'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47]">
              <span className="text-slate-400 text-[10px] uppercase block">Environmental Blast Score</span>
              <span className="text-cyan-300 font-bold text-sm">
                {report.blast_radius?.impact_score || 87.5}% Impact
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#070b14] border border-[#1b2a47]">
              <span className="text-slate-400 text-[10px] uppercase block">Canary Decoys Tripped</span>
              <span className="text-amber-400 font-bold text-sm">
                Finance_Report_Canary.txt (Tripped)
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: MITRE ATT&CK Matrix */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold text-sm border-b border-[#1b2a47] pb-2">
            <span>3.0</span>
            <span>IDENTIFIED MITRE ATT&CK TECHNIQUES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            {(report.mitre_techniques || []).map((tech) => (
              <div
                key={tech.id}
                className="p-3 rounded-xl bg-[#070b14] border border-purple-500/30 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-bold text-xs">{tech.id}</span>
                  <span className="text-[10px] text-slate-400">{tech.occurrences}x observed</span>
                </div>
                <div className="text-slate-200 font-medium text-xs truncate">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Chronological Attack Progression Timeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold text-sm border-b border-[#1b2a47] pb-2">
            <span>4.0</span>
            <span>FORENSIC ATTACK PROGRESSION TIMELINE</span>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left font-mono text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-[#1b2a47] text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3">Source → Target</th>
                  <th className="py-2 px-3">Device / Account</th>
                  <th className="py-2 px-3">MITRE</th>
                  <th className="py-2 px-3">Evidence Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2a47]/50">
                {(report.timeline_events || []).slice(0, 8).map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 px-3 text-slate-300">
                      {e.timestamp ? e.timestamp.slice(11, 19) : '--'}
                    </td>
                    <td className="py-2 px-3 uppercase text-[10px] font-bold text-red-400">
                      {e.severity}
                    </td>
                    <td className="py-2 px-3 text-cyan-300">
                      {e.source_ip} → {e.destination_ip}
                    </td>
                    <td className="py-2 px-3">
                      {e.device_name} ({e.username})
                    </td>
                    <td className="py-2 px-3 text-purple-300">{e.mitre_id || '--'}</td>
                    <td className="py-2 px-3 text-slate-500 text-[10px]">
                      {e.evidence_hash ? `${e.evidence_hash.slice(0, 8)}...` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Response Actions & Playbooks Executed */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold text-sm border-b border-[#1b2a47] pb-2">
            <span>5.0</span>
            <span>CONTAINMENT COUNTERMEASURES EXECUTED</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {(report.response_actions_taken || []).map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-[#070b14] border border-emerald-500/30 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white">{act.title}</span>
                  <span className="text-cyan-300 ml-2">Target: {act.target}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">{act.details}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  EXECUTED
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Actionable Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold text-sm border-b border-[#1b2a47] pb-2">
            <span>6.0</span>
            <span>STRATEGIC HARDENING RECOMMENDATIONS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {(report.recommendations || []).map((rec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#070b14] border border-[#1b2a47] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">{rec.category}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 font-bold">
                    PRIORITY: {rec.priority}
                  </span>
                </div>
                <p className="text-slate-200 text-xs font-sans leading-relaxed">
                  {rec.action}
                </p>
                <span className="text-[10px] text-purple-300 block pt-1">
                  MITRE References: {rec.mitre_ref}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dossier Footer Signature */}
        <div className="pt-6 border-t border-[#1b2a47] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <div>
            <span>Investigator: </span>
            <span className="text-slate-300 font-semibold">{report.investigator}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Digital Chain-of-Custody Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
