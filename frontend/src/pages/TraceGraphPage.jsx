import React, { useState, useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import { 
  Network, 
  Flame, 
  RefreshCw 
} from 'lucide-react';
import { CustomGraphNode } from '../components/CustomGraphNode';
import { useSecurity } from '../context/SecurityContext';

const nodeTypes = {
  customNode: CustomGraphNode
};

export const TraceGraphPage = ({ onInspectEvidence }) => {
  const { attackGraph, refreshAll } = useSecurity();
  const [highlightCriticalOnly, setHighlightCriticalOnly] = useState(false);

  const rawNodes = attackGraph?.nodes || [];
  const rawEdges = attackGraph?.edges || [];

  const filteredNodes = useMemo(() => {
    return rawNodes.map((n) => {
      const isCrit = n.data?.is_critical_path;
      const isDimmed = highlightCriticalOnly && !isCrit;

      return {
        ...n,
        style: {
          opacity: isDimmed ? 0.25 : 1.0,
          transition: 'opacity 0.3s ease'
        }
      };
    });
  }, [rawNodes, highlightCriticalOnly]);

  const filteredEdges = useMemo(() => {
    return rawEdges.map((e) => {
      const isCrit = e.data?.severity === 'critical';
      const isDimmed = highlightCriticalOnly && !isCrit;

      return {
        ...e,
        style: {
          ...e.style,
          opacity: isDimmed ? 0.15 : 1.0
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: e.style?.stroke || '#00f2fe'
        }
      };
    });
  }, [rawEdges, highlightCriticalOnly]);

  const [nodes, setNodes, onNodesChange] = useNodesState(filteredNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(filteredEdges);

  React.useEffect(() => {
    setNodes(filteredNodes);
  }, [filteredNodes, setNodes]);

  React.useEffect(() => {
    setEdges(filteredEdges);
  }, [filteredEdges, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    if (onInspectEvidence) {
      onInspectEvidence(node);
    }
  }, [onInspectEvidence]);

  const onEdgeClick = useCallback((event, edge) => {
    if (onInspectEvidence) {
      onInspectEvidence({
        ...edge.data,
        label: edge.label,
        type: 'Suspicious Connection'
      });
    }
  }, [onInspectEvidence]);

  return (
    <div className="space-y-4 pb-8 flex flex-col h-[calc(100vh-7rem)] max-w-7xl mx-auto">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Attack Path Reconstruction
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual reconstruction of how the attacker entered and moved laterally across systems
          </p>
        </div>

        {/* Legend & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setHighlightCriticalOnly(!highlightCriticalOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              highlightCriticalOnly
                ? 'bg-red-950 text-red-300 border-red-500'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>{highlightCriticalOnly ? 'Show All Paths' : 'Highlight Attack Path'}</span>
          </button>

          <button
            onClick={refreshAll}
            title="Refresh Graph"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clean Legend Bar */}
      <div className="cyber-card px-4 py-2 rounded-xl flex items-center justify-between text-xs text-slate-300 flex-shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Adversary Origin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Computers & Servers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>Compromised User</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Decoy Trap</span>
          </div>
        </div>

        <span className="text-[11px] text-cyan-400 hidden md:block">
          💡 Click any node or arrow to see details and take action
        </span>
      </div>

      {/* Interactive Flow Canvas */}
      <div className="relative flex-1 w-full rounded-2xl border border-slate-800 overflow-hidden bg-[#070b14] shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.3}
          maxZoom={1.8}
          defaultViewport={{ x: 50, y: 50, zoom: 0.9 }}
        >
          <Background color="#162238" gap={24} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !rounded-xl" />
        </ReactFlow>
      </div>
    </div>
  );
};
