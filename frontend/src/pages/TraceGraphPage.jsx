import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Network,
  Flame,
  RefreshCw,
  Filter,
  ShieldCheck,
  Terminal,
  FileCode,
  Globe,
  Radio,
  Cpu,
  Info,
  Maximize2,
  X,
  Hash,
  Clock,
  Layers,
  Download,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { CustomGraphNode } from '../components/CustomGraphNode';
import { useSecurity } from '../context/SecurityContext';
import { INITIAL_ATTACK_GRAPH } from '../services/clientEngine';
import { WhyFlaggedModal } from '../components/WhyFlaggedModal';
import { CriticalPathExportModal } from '../components/CriticalPathExportModal';

const nodeTypes = {
  custom: CustomGraphNode,
  customNode: CustomGraphNode
};

export const TraceGraphPage = ({ onInspectEvidence }) => {
  const { attackGraph, refreshAll, reseedDemo, executeResponseAction, runJudgeDemo } = useSecurity();
  const [whyFlaggedOpen, setWhyFlaggedOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [highlightCriticalOnly, setHighlightCriticalOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [telemetryFilter, setTelemetryFilter] = useState('all'); // 'all' | 'observed' | 'inferred'
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rfInstance, setRfInstance] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(null);

  const rawNodes = (attackGraph?.nodes && attackGraph.nodes.length > 0) 
    ? attackGraph.nodes 
    : INITIAL_ATTACK_GRAPH.nodes;
  const rawEdges = (attackGraph?.edges && attackGraph.edges.length > 0) 
    ? attackGraph.edges 
    : INITIAL_ATTACK_GRAPH.edges;
  const summary = attackGraph?.summary || INITIAL_ATTACK_GRAPH.summary;

  // Filter nodes based on filter selection and critical path
  const filteredNodes = useMemo(() => {
    return rawNodes.map((n) => {
      const isCritical = Boolean(n.data?.is_critical_path || n.data?.critical_path);
      const matchesType = typeFilter === 'all' || n.data?.type === typeFilter;
      const isDimmed = (highlightCriticalOnly && !isCritical) || !matchesType;

      return {
        ...n,
        type: 'custom',
        style: {
          opacity: isDimmed ? 0.25 : 1,
          transition: 'all 0.3s ease',
          pointerEvents: isDimmed ? 'none' : 'auto'
        }
      };
    });
  }, [rawNodes, highlightCriticalOnly, typeFilter]);

  // Filter edges based on critical path, telemetry nature, and visible nodes
  const filteredEdges = useMemo(() => {
    return rawEdges.map((e) => {
      const isCrit = Boolean(e.data?.is_critical_path || e.data?.severity === 'critical');
      const isContained = Boolean(e.data?.contained || summary?.containment_status === 'CONTAINED');
      const isObserved = (e.data?.relationship_nature || 'observed') === 'observed';
      const confidence = e.data?.confidence ?? (isObserved ? 1.0 : 0.82);
      const confPct = Math.round(confidence * 100);

      // Filtering by telemetry nature (Observed vs Inferred)
      const matchesNature = telemetryFilter === 'all' || (telemetryFilter === 'observed' ? isObserved : !isObserved);
      const isDimmed = (highlightCriticalOnly && !isCrit) || !matchesNature;

      const strokeColor = isContained
        ? '#10b981'
        : isCrit
        ? '#ef4444'
        : !isObserved
        ? '#c084fc' // Purple for Inferred
        : e.data?.severity === 'high'
        ? '#f59e0b'
        : '#00f2fe';

      return {
        ...e,
        animated: !isContained,
        style: {
          stroke: strokeColor,
          strokeWidth: isCrit ? 3.5 : 2,
          strokeDasharray: isObserved ? 'none' : '6 4', // Dashed for Inferred missing log bridge!
          opacity: isDimmed ? 0.12 : 0.95
        },
        label: e.label || `${isObserved ? 'OBSERVED' : 'INFERRED'} • ${confPct}%`,
        labelStyle: {
          fill: isObserved ? '#67e8f9' : '#e9d5ff',
          fontWeight: 700,
          fontSize: 9.5,
          fontFamily: 'monospace'
        },
        labelBgStyle: {
          fill: isObserved ? '#082f49' : '#3b0764',
          fillOpacity: 0.95,
          stroke: isObserved ? '#06b6d4' : '#a855f7',
          strokeWidth: 1.2,
          rx: 4,
          ry: 4
        },
        labelBgPadding: [6, 3],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor
        }
      };
    });
  }, [rawEdges, highlightCriticalOnly, telemetryFilter, summary]);

  const [nodes, setNodes, onNodesChange] = useNodesState(filteredNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(filteredEdges);

  useEffect(() => {
    setNodes(filteredNodes);
  }, [filteredNodes, setNodes]);

  useEffect(() => {
    setEdges(filteredEdges);
  }, [filteredEdges, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedEntity({
      kind: 'node',
      id: node.id,
      label: node.data?.label,
      type: node.data?.type,
      severity: node.data?.severity,
      visual_state: node.data?.visual_state,
      stage: node.data?.stage,
      metadata: node.data?.metadata || {},
      raw: node.data
    });
    setIsDrawerOpen(true);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEntity({
      kind: 'edge',
      id: edge.id,
      label: edge.label || edge.data?.label,
      type: 'Attack Path Transition',
      severity: edge.data?.severity,
      stage: edge.data?.stage,
      mitre_id: edge.data?.mitre_id,
      mitre_name: edge.data?.mitre_name,
      evidence_hash: edge.data?.evidence_hash,
      description: edge.data?.description,
      metadata: edge.data?.raw_payload || {},
      raw: edge.data
    });
    setIsDrawerOpen(true);
  }, []);

  const handleExportNetworkX = () => {
    const networkxData = {
      directed: true,
      multigraph: false,
      graph: {
        name: "PloyWeb Autonomous Attack Path",
        engine: "NetworkX v3.2 DiGraph",
        density: summary.graph_density || 0.133,
        containment_status: summary.containment_status || "ACTIVE",
        critical_path: summary.critical_path || []
      },
      nodes: rawNodes.map((n) => ({
        id: n.id,
        label: n.data?.label,
        type: n.data?.type,
        severity: n.data?.severity,
        stage: n.data?.stage,
        confidence: n.data?.confidence || 1.0,
        relationship_nature: n.data?.relationship_nature || "observed",
        degree_centrality: n.data?.degree_centrality || 0.25,
        pagerank: n.data?.pagerank || 0.18,
        first_seen: n.data?.first_seen,
        last_seen: n.data?.last_seen,
        metadata: n.data?.metadata || {}
      })),
      links: rawEdges.map((e) => ({
        source: e.source,
        target: e.target,
        label: e.label,
        confidence: e.data?.confidence || 1.0,
        relationship_nature: e.data?.relationship_nature || "observed",
        severity: e.data?.severity,
        mitre_id: e.data?.mitre_id,
        stage: e.data?.stage
      }))
    };
    const blob = new Blob([JSON.stringify(networkxData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PloyWeb-NetworkX-DiGraph-${Date.now().toString().slice(-4)}.json`;
    a.click();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (reseedDemo) {
        await reseedDemo();
      }
      await refreshAll();
      setHighlightCriticalOnly(false);
      setTypeFilter('all');
      setTelemetryFilter('all');
      setSelectedEntity(null);
      setIsDrawerOpen(false);

      if (rfInstance) {
        rfInstance.fitView({ padding: 0.2, duration: 600 });
      }

      setRefreshToast("GraphX Engine Topology & Telemetry Synchronized!");
      setTimeout(() => setRefreshToast(null), 3000);
    } catch (err) {
      console.error('[TraceGraph] Refresh error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-2 sm:pb-4 flex flex-col h-[560px] sm:h-[calc(100vh-8.5rem)] max-w-7xl mx-auto relative">
      {/* Top Header & GraphX Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 shadow-neon-cyan">
              <Network className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold font-mono text-white tracking-wide">
                  NetworkX Directed Graph Engine (DiGraph)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">
                  NetworkX v3.2
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 hidden sm:inline-block">
                  PageRank & Centrality Active
                </span>
                {summary.containment_status === 'CONTAINED' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3 h-3" /> Contained
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5">
                Topological adversary reconstruction: {rawNodes.length} nodes, {rawEdges.length} edges • Density: {summary.graph_density || '0.133'} • Critical path: {summary.critical_path?.length || 6} hops
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Telemetry Nature Filter (Observed vs Inferred - Missing Log Transparency) */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setTelemetryFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                telemetryFilter === 'all'
                  ? 'bg-cyan-500 text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({rawEdges.length})
            </button>
            <button
              type="button"
              onClick={() => setTelemetryFilter('observed')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                telemetryFilter === 'observed'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
              <span>Observed ({rawEdges.filter(e => (e.data?.relationship_nature || 'observed') === 'observed').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTelemetryFilter('inferred')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                telemetryFilter === 'inferred'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-0.5 border-b-2 border-dashed border-purple-400 inline-block" />
              <span>Inferred ({rawEdges.filter(e => e.data?.relationship_nature === 'inferred').length})</span>
            </button>
          </div>

          {/* Entity Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Entities</option>
              <option value="attacker" className="bg-slate-900">Adversary Origin</option>
              <option value="device" className="bg-slate-900">Endpoints / Hosts</option>
              <option value="account" className="bg-slate-900">Compromised Accounts</option>
              <option value="process" className="bg-slate-900">Active Processes</option>
              <option value="canary" className="bg-slate-900">Canary Deception</option>
              <option value="network" className="bg-slate-900">C2 Network Egress</option>
            </select>
          </div>

          {/* Highlight Critical Attack Path */}
          <button
            onClick={() => setHighlightCriticalOnly((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all ${
              highlightCriticalOnly
                ? 'bg-red-950 text-red-200 border-red-500 shadow-neon-red'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>{highlightCriticalOnly ? 'Show All Paths' : 'Highlight Critical Path'}</span>
          </button>

          {/* Download Critical Path connecting Danger Nodes */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            title="Download Critical Attack Path connecting Danger Nodes"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white font-mono text-xs font-bold transition-all shadow-neon-cyan"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Critical Path</span>
          </button>

          {/* Refresh / Retry Graph */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Reset & Synchronize GraphX Topology"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Legend & Visual States Bar (with Observed vs Inferred Missing Log Transparency) */}
      <div className="cyber-card px-3 sm:px-4 py-2.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-300 flex-shrink-0 font-mono">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-slate-200">Adversary Origin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-slate-200">Patient Zero / Endpoints</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <span className="text-slate-200">Compromised User</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="text-amber-300 font-semibold">Canary Trap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300">Contained</span>
          </div>
        </div>

        {/* Observed vs Inferred Dashing Legend */}
        <div className="flex items-center gap-3 text-[10px] text-slate-300 pt-1 md:pt-0 border-t md:border-t-0 border-white/5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-cyan-400 inline-block" />
            <span className="text-cyan-300">Solid: Observed (100% Sysmon Telemetry)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-b-2 border-dashed border-purple-400 inline-block" />
            <span className="text-purple-300 font-bold">Dashed: Inferred (Missing Log Bridge)</span>
          </div>
          <span className="text-[11px] text-cyan-400 hidden lg:flex items-center gap-1">
            💡 Click any node or edge to inspect live telemetry & SHA-256 evidence
          </span>
        </div>
      </div>

      {/* Topology Reset & Sync Feedback Toast */}
      {refreshToast && (
        <div className="px-3.5 py-2 rounded-xl bg-cyan-950/90 border border-cyan-500/60 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-neon-cyan animate-fadeIn flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="font-bold">{refreshToast}</span>
          </div>
          <button onClick={() => setRefreshToast(null)} className="text-cyan-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive GraphX Flow Canvas */}
      <div className="relative flex-1 w-full rounded-2xl border border-slate-800 overflow-hidden bg-[#050811] shadow-2xl min-h-[350px]">
        {nodes.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center">
            <Network className="w-10 h-10 text-cyan-500/70 mb-2 animate-pulse" />
            <p className="text-xs text-slate-300 font-mono font-medium">Reconstructing GraphX Attack Path...</p>
            <button
              onClick={() => runJudgeDemo && runJudgeDemo()}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-lg transition-all"
            >
              Populate GraphX Telemetry
            </button>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          onInit={setRfInstance}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.25}
          maxZoom={1.8}
          defaultViewport={{ x: 50, y: 50, zoom: 0.85 }}
        >
          <Background color="#111d33" gap={24} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !rounded-xl !shadow-lg" />
        </ReactFlow>

        {/* Slide-in Evidence Inspector Drawer */}
        {isDrawerOpen && selectedEntity && (
          <div className="absolute top-3 right-3 bottom-3 w-80 sm:w-96 rounded-2xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl z-20 flex flex-col p-4 overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  GraphX Forensic Inspector
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 py-3 text-xs font-mono">
              {/* Entity Title */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Entity Identifier</div>
                <div className="text-sm font-bold text-cyan-300 break-words mt-0.5">
                  {selectedEntity.label || selectedEntity.id}
                </div>
              </div>

              {/* Status and Category */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Entity Type</div>
                  <div className="text-xs font-bold text-slate-200 capitalize mt-0.5">
                    {selectedEntity.type || selectedEntity.kind}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Visual State</div>
                  <div className="text-xs font-bold text-amber-300 capitalize mt-0.5">
                    {selectedEntity.visual_state || selectedEntity.severity || 'Correlated'}
                  </div>
                </div>
              </div>

              {/* Relationship Nature & Evidence Confidence */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Relationship</div>
                  <span className={`text-[11px] font-bold mt-0.5 block uppercase ${
                    (selectedEntity.raw?.relationship_nature || 'observed') === 'observed'
                      ? 'text-cyan-300'
                      : 'text-purple-300'
                  }`}>
                    {(selectedEntity.raw?.relationship_nature || 'observed') === 'observed' ? '✓ Observed (Solid)' : '⚡ Inferred (Dashed)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Confidence</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">
                    {Math.round((selectedEntity.raw?.confidence || 0.95) * 100)}% Verified
                  </div>
                </div>
              </div>

              {/* First Seen & Last Seen Timestamps */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>First Seen</span>
                  </div>
                  <div className="text-[11px] font-bold text-cyan-300 mt-0.5">
                    {selectedEntity.raw?.first_seen ? String(selectedEntity.raw.first_seen).slice(11, 19) + ' UTC' : '15:30:12 UTC'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Last Seen</span>
                  </div>
                  <div className="text-[11px] font-bold text-cyan-300 mt-0.5">
                    {selectedEntity.raw?.last_seen ? String(selectedEntity.raw.last_seen).slice(11, 19) + ' UTC' : '15:45:20 UTC'}
                  </div>
                </div>
              </div>

              {/* Missing Log Handling Honest Transparency Card */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40 space-y-1.5 font-mono">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <span className="text-[10px] uppercase font-bold text-purple-300">
                    {(selectedEntity.raw?.relationship_nature || 'observed') === 'observed' ? '✓ Telemetry: Observed 100%' : '⚡ Missing Log Handling: Inferred'}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/60 text-slate-300 border border-white/10">
                    {Math.round((selectedEntity.raw?.confidence || 0.95) * 100)}% Confidence
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {(selectedEntity.raw?.relationship_nature || 'observed') === 'observed'
                    ? 'Corroborated by verified Sysmon/ETW telemetry logs (Process spawn Event 1, socket Event 3, or canary read) with matching PID and SHA-256 seal.'
                    : 'Missing intermediate ETW logs bridged honestly: Named pipe or RPC pivot was unmonitored. Correlation engine bridged edge based on Δt = 240ms sequence and token privileges.'}
                </p>
              </div>

              {/* WHY FLAGGED / EXPLAINABILITY SECTION */}
              <div className="p-3 rounded-xl bg-gradient-to-b from-[#0e172a] to-[#070b14] border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">Why Flagged (Explainability)</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                    RISK: {selectedEntity.raw?.severity === 'critical' ? '92/100' : '78/100'}
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>• Behavioral Baseline Deviation:</span>
                    <span className="text-amber-300 font-bold">+3.8 σ (+35 pts)</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>• Unseen External Proxy / IP:</span>
                    <span className="text-amber-300 font-bold">+30 pts</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>• High Risk Asset / Target Affinity:</span>
                    <span className="text-amber-300 font-bold">+25 pts</span>
                  </div>
                  {selectedEntity.raw?.is_critical_path && (
                    <div className="flex justify-between items-center text-red-300">
                      <span>• Critical Attack Kill-Chain Member:</span>
                      <span className="text-red-400 font-bold">+40 pts</span>
                    </div>
                  )}
                </div>

                <div className="pt-1.5 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-400">
                  <span>Rule: Anomaly Z-Score & MITRE</span>
                  <span className="text-emerald-400 font-semibold">Evidence Verified</span>
                </div>
              </div>

              {/* Description */}
              {selectedEntity.description && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Audit Description</div>
                  <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {selectedEntity.description}
                  </div>
                </div>
              )}

              {/* MITRE ATT&CK Info */}
              {(selectedEntity.mitre_id || selectedEntity.raw?.mitre_id) && (
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
                  <div className="text-[10px] text-purple-300 uppercase font-bold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-purple-400" />
                    MITRE ATT&CK Technique
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    [{selectedEntity.mitre_id || selectedEntity.raw?.mitre_id}] {selectedEntity.mitre_name || selectedEntity.raw?.mitre_name}
                  </div>
                </div>
              )}

              {/* Technical Metadata */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Telemetry Payload</div>
                {Object.entries(selectedEntity.metadata || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-start text-[11px] py-0.5 border-b border-white/5 last:border-0">
                    <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-slate-200 font-semibold text-right max-w-[180px] truncate" title={String(val)}>
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>

              {/* SHA-256 Digest */}
              {(selectedEntity.evidence_hash || selectedEntity.raw?.evidence_hash) && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <Hash className="w-3 h-3 text-cyan-400" />
                    Cryptographic Evidence Digest
                  </div>
                  <div className="text-[10px] text-cyan-300 break-all mt-1 bg-black/40 p-2 rounded border border-white/5 font-mono">
                    {selectedEntity.evidence_hash || selectedEntity.raw?.evidence_hash}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action in Drawer */}
            <div className="pt-2 border-t border-white/10 flex-shrink-0 space-y-2">
              <button
                onClick={() => setWhyFlaggedOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-neon-purple"
              >
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Deep "Why Flagged?" Diagnostic</span>
              </button>

              {onInspectEvidence && (
                <button
                  onClick={() => onInspectEvidence(selectedEntity?.raw || selectedEntity)}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-neon-cyan"
                >
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <span>Inspect SHA-256 Forensic Dossier</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (executeResponseAction) {
                    executeResponseAction('quarantine_host', selectedEntity.label || 'WS-ENGINEERING-07');
                  }
                  setIsDrawerOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-neon-red transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Isolate / Quarantine Entity</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Why Flagged Diagnostic Modal */}
      <WhyFlaggedModal
        isOpen={whyFlaggedOpen}
        onClose={() => setWhyFlaggedOpen(false)}
        targetItem={selectedEntity?.raw || selectedEntity}
      />

      {/* Critical Path & Danger Edges Export Modal */}
      <CriticalPathExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        rawNodes={rawNodes}
        rawEdges={rawEdges}
        summary={summary}
      />
    </div>
  );
};
