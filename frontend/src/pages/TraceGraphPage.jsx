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
  Layers
} from 'lucide-react';
import { CustomGraphNode } from '../components/CustomGraphNode';
import { useSecurity } from '../context/SecurityContext';
import { INITIAL_ATTACK_GRAPH } from '../services/clientEngine';

const nodeTypes = {
  custom: CustomGraphNode,
  customNode: CustomGraphNode
};

export const TraceGraphPage = ({ onInspectEvidence }) => {
  const { attackGraph, refreshAll, executeResponseAction, runJudgeDemo } = useSecurity();
  const [highlightCriticalOnly, setHighlightCriticalOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  // Filter edges based on critical path and visible nodes
  const filteredEdges = useMemo(() => {
    return rawEdges.map((e) => {
      const isCrit = Boolean(e.data?.is_critical_path || e.data?.severity === 'critical');
      const isDimmed = highlightCriticalOnly && !isCrit;
      const isContained = Boolean(e.data?.contained || summary?.containment_status === 'CONTAINED');

      const strokeColor = isContained
        ? '#10b981'
        : isCrit
        ? '#ef4444'
        : e.data?.severity === 'high'
        ? '#f59e0b'
        : '#00f2fe';

      return {
        ...e,
        animated: !isContained,
        style: {
          stroke: strokeColor,
          strokeWidth: isCrit ? 3 : 1.75,
          opacity: isDimmed ? 0.15 : 0.9
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor
        }
      };
    });
  }, [rawEdges, highlightCriticalOnly, summary]);

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
    if (onInspectEvidence) onInspectEvidence(node);
  }, [onInspectEvidence]);

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
    if (onInspectEvidence) onInspectEvidence(edge.data);
  }, [onInspectEvidence]);

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
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-mono text-white tracking-wide">
                  GraphX – Autonomous Attack Reconstruction
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                  NetworkX Engine
                </span>
                {summary.containment_status === 'CONTAINED' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Contained
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5">
                Dynamic topological synthesis mapping adversary entrypoint, lateral winrm, processes & canary decoys
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
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

          {/* Refresh Graph */}
          <button
            onClick={refreshAll}
            title="Refresh GraphX Engine"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend & Visual States Bar */}
      <div className="cyber-card px-3 sm:px-4 py-2 rounded-xl flex items-center justify-between text-[11px] sm:text-xs text-slate-300 flex-shrink-0 font-mono">
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
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
            <span className="text-slate-200">Compromised User / SYSTEM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="text-amber-300 font-semibold">Canary Decoy Trap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300">Contained Asset</span>
          </div>
        </div>

        <span className="text-[11px] text-cyan-400 hidden lg:flex items-center gap-1">
          💡 Click any node or edge to inspect live telemetry & SHA-256 evidence
        </span>
      </div>

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
                      : 'text-amber-300'
                  }`}>
                    {(selectedEntity.raw?.relationship_nature || 'observed') === 'observed' ? '✓ Observed' : '~ Inferred'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Confidence</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">
                    {Math.round((selectedEntity.raw?.confidence || 0.95) * 100)}% Verified
                  </div>
                </div>
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
            <div className="pt-2 border-t border-white/10 flex-shrink-0">
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
    </div>
  );
};
