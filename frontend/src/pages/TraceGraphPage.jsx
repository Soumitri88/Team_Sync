import React, { useState, useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import { 
  Network, 
  Flame, 
  Filter, 
  Maximize2, 
  RefreshCw, 
  ShieldAlert, 
  Eye, 
  Info, 
  Server, 
  User, 
  Bug, 
  Skull,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { CustomGraphNode } from '../components/CustomGraphNode';
import { useSecurity } from '../context/SecurityContext';

const nodeTypes = {
  customNode: CustomGraphNode
};

export const TraceGraphPage = ({ onInspectEvidence }) => {
  const { attackGraph, refreshAll, startDemo, demoActive } = useSecurity();
  const [selectedStage, setSelectedStage] = useState('all');
  const [highlightCriticalOnly, setHighlightCriticalOnly] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);

  const rawNodes = attackGraph?.nodes || [];
  const rawEdges = attackGraph?.edges || [];
  const summary = attackGraph?.summary || { total_nodes: 0, total_edges: 0, attack_stages: 0, critical_path: [] };

  // Filter nodes & edges based on stage and critical path filter
  const filteredNodes = useMemo(() => {
    return rawNodes.map((n) => {
      const stageMatch = selectedStage === 'all' || n.data?.stage === Number(selectedStage);
      const isCrit = n.data?.is_critical_path;
      const isHidden = !stageMatch || (highlightCriticalOnly && !isCrit);

      return {
        ...n,
        hidden: isHidden,
        style: {
          opacity: isHidden ? 0.2 : 1.0,
          transition: 'all 0.3s ease'
        }
      };
    });
  }, [rawNodes, selectedStage, highlightCriticalOnly]);

  const filteredEdges = useMemo(() => {
    return rawEdges.map((e) => {
      const isCrit = summary.critical_path?.includes(e.source) && summary.critical_path?.includes(e.target);
      const isHidden = highlightCriticalOnly && !isCrit;

      return {
        ...e,
        hidden: isHidden,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: e.style?.stroke || '#00f2fe'
        }
      };
    });
  }, [rawEdges, highlightCriticalOnly, summary.critical_path]);

  const [nodes, setNodes, onNodesChange] = useNodesState(filteredNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(filteredEdges);

  // Sync state when filtered items change
  React.useEffect(() => {
    setNodes(filteredNodes);
  }, [filteredNodes, setNodes]);

  React.useEffect(() => {
    setEdges(filteredEdges);
  }, [filteredEdges, setEdges]);

  // Click handlers
  const onNodeClick = useCallback((event, node) => {
    setSelectedElement({ type: 'node', item: node });
    if (onInspectEvidence) {
      onInspectEvidence(node);
    }
  }, [onInspectEvidence]);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedElement({ type: 'edge', item: edge });
    if (onInspectEvidence) {
      onInspectEvidence({
        ...edge.data,
        label: edge.label,
        type: 'Suspicious Lateral Link'
      });
    }
  }, [onInspectEvidence]);

  return (
    <div className="space-y-5 pb-12 flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Top Header & Kill-Chain Breadcrumbs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-white">
              TraceGraph – Interactive Attack Graph Reconstruction
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            NetworkX directed graph mapping adversarial progression, hops, and evidence
          </p>
        </div>

        {/* Graph Metric Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <div className="px-3 py-1 rounded-lg bg-[#0d1527] border border-[#1b2a47] text-slate-300 flex items-center gap-1.5">
            <span className="text-slate-500">Nodes:</span>
            <span className="text-cyan-400 font-bold">{summary.total_nodes}</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[#0d1527] border border-[#1b2a47] text-slate-300 flex items-center gap-1.5">
            <span className="text-slate-500">Attack Edges:</span>
            <span className="text-purple-400 font-bold">{summary.total_edges}</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[#0d1527] border border-[#1b2a47] text-slate-300 flex items-center gap-1.5">
            <span className="text-slate-500">Patient Zero:</span>
            <span className="text-red-400 font-bold">{summary.patient_zero || 'GW-VPN-EDGE-01'}</span>
          </div>
          <button
            onClick={refreshAll}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Refresh Graph"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kill-Chain Stage Progression Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-shrink-0 font-mono text-xs">
        {[
          { num: 1, name: '1. Initial Access', desc: 'Credential Spraying', color: 'border-cyan-500/40 bg-cyan-950/30' },
          { num: 2, name: '2. Suspicious Login', desc: 'RDP from Rogue IP', color: 'border-purple-500/40 bg-purple-950/30' },
          { num: 3, name: '3. Lateral Pivot', desc: 'WinRM / SMB Ports', color: 'border-amber-500/40 bg-amber-950/30' },
          { num: 4, name: '4. Privilege Escalation', desc: 'SYSTEM Token Hijack', color: 'border-red-500/40 bg-red-950/30' },
          { num: 5, name: '5. Canary Deception', desc: 'Decoy File Breached', color: 'border-rose-500/40 bg-rose-950/30' },
        ].map((st) => (
          <div
            key={st.num}
            onClick={() => setSelectedStage(selectedStage === String(st.num) ? 'all' : String(st.num))}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              st.color
            } ${
              selectedStage === String(st.num) ? 'ring-2 ring-cyan-400 shadow-neon-cyan scale-102' : 'hover:border-slate-600'
            }`}
          >
            <div className="text-[10px] text-slate-400 uppercase">Phase {st.num}</div>
            <div className="font-bold text-white truncate text-xs">{st.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{st.desc}</div>
          </div>
        ))}
      </div>

      {/* Toolbar Controls */}
      <div className="cyber-card px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400">Filter Stage:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {['all', '1', '2', '3', '4', '5'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStage(s)}
                className={`px-2 py-0.5 rounded text-[11px] uppercase transition-colors ${
                  selectedStage === s
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All Stages' : `S${s}`}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Highlight Critical Path Toggle */}
          <button
            onClick={() => setHighlightCriticalOnly(!highlightCriticalOnly)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all ${
              highlightCriticalOnly
                ? 'bg-red-950/80 text-red-300 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${highlightCriticalOnly ? 'text-red-400 animate-pulse' : ''}`} />
            <span>{highlightCriticalOnly ? 'Critical Path Isolated' : 'Highlight Critical Path'}</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Adversary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Account</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Host Server</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Canary Trap</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="relative flex-1 w-full rounded-2xl border border-cyan-500/30 overflow-hidden bg-[#070b14] shadow-inner">
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
          minZoom={0.2}
          maxZoom={2.0}
          defaultViewport={{ x: 50, y: 50, zoom: 0.85 }}
          attributionPosition="bottom-left"
        >
          <Background color="#162238" gap={24} size={1} />
          <Controls className="!bg-[#0d1527] !border-[#1b2a47] !rounded-xl !overflow-hidden" />
          <MiniMap
            nodeColor={(n) => {
              if (n.data?.type === 'attacker') return '#ef4444';
              if (n.data?.type === 'canary') return '#f59e0b';
              if (n.data?.type === 'account') return '#8b5cf6';
              return '#00f2fe';
            }}
            maskColor="rgba(7, 11, 20, 0.7)"
            className="!bg-[#090e1a] !border !border-[#1b2a47] !rounded-xl"
          />
        </ReactFlow>

        {/* Overlay Helper Tag */}
        <div className="absolute top-4 right-4 pointer-events-none bg-[#090e1a]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1b2a47] text-[11px] font-mono text-cyan-300 shadow-md">
          💡 Click any node or animated edge to open Evidence Ledger dossier
        </div>
      </div>
    </div>
  );
};
