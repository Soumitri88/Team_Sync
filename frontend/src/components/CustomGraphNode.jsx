import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Skull, 
  Server, 
  User, 
  Bug, 
  ShieldAlert, 
  Flame, 
  Radio, 
  ShieldCheck,
  AlertTriangle,
  Lock
} from 'lucide-react';

const getNodeStyle = (type, severity, isCritical) => {
  if (type === 'attacker') {
    return {
      bg: 'bg-red-950/80 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
      icon: Skull,
      iconColor: 'text-red-400',
      tagBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      titleColor: 'text-red-200'
    };
  }
  if (type === 'canary') {
    return {
      bg: 'bg-amber-950/80 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      icon: Bug,
      iconColor: 'text-amber-400',
      tagBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      titleColor: 'text-amber-200'
    };
  }
  if (type === 'account') {
    return {
      bg: isCritical 
        ? 'bg-purple-950/85 border-purple-500/80 shadow-[0_0_18px_rgba(168,85,247,0.4)]'
        : 'bg-[#0f172a]/90 border-purple-500/40 shadow-sm',
      icon: User,
      iconColor: 'text-purple-400',
      tagBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      titleColor: 'text-purple-200'
    };
  }
  // Default: device / server
  const isHighSev = severity === 'critical' || severity === 'high';
  return {
    bg: isHighSev
      ? 'bg-[#0d1829]/95 border-cyan-400/80 shadow-[0_0_18px_rgba(0,242,254,0.3)]'
      : 'bg-[#0d1527]/90 border-slate-700/60 shadow-sm',
    icon: Server,
    iconColor: isHighSev ? 'text-cyan-400' : 'text-slate-400',
    tagBg: isHighSev ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700',
    titleColor: 'text-slate-100'
  };
};

export const CustomGraphNode = memo(({ data, selected }) => {
  const { label, type, severity, stage, metadata, is_critical_path } = data;
  const style = getNodeStyle(type, severity, is_critical_path);
  const Icon = style.icon;

  return (
    <div
      className={`relative min-w-[210px] max-w-[260px] rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
        style.bg
      } ${
        selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#070b14] scale-105' : ''
      } ${
        is_critical_path ? 'animate-pulse' : ''
      }`}
    >
      {/* Target Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-[#070b14] -ml-1 hover:!bg-white"
      />

      {/* Target Handle (Top) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2.5 !h-2.5 !bg-purple-400 !border-2 !border-[#070b14] -mt-1 hover:!bg-white"
      />

      {/* Critical Attack Path Badge */}
      {is_critical_path && (
        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-red-600 text-[9px] font-mono font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1 border border-red-300/40">
          <Flame className="w-2.5 h-2.5 text-yellow-300" />
          Critical Path
        </div>
      )}

      {/* Node Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
            <Icon className={`w-4 h-4 ${style.iconColor}`} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block leading-tight">
              {type || 'NODE'}
            </span>
            <div className={`text-xs font-bold font-mono truncate max-w-[140px] ${style.titleColor}`}>
              {label}
            </div>
          </div>
        </div>

        {/* Stage Pill */}
        {stage && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 text-slate-300">
            S{stage}
          </span>
        )}
      </div>

      {/* Metadata Preview */}
      <div className="pt-2 border-t border-white/10 text-[11px] font-mono space-y-1 text-slate-300">
        {metadata?.ip && (
          <div className="flex items-center justify-between text-slate-400">
            <span>IP Address:</span>
            <span className="text-cyan-300 font-semibold">{metadata.ip}</span>
          </div>
        )}
        {metadata?.threat_actor && (
          <div className="flex items-center justify-between text-slate-400">
            <span>Actor:</span>
            <span className="text-red-400 font-semibold">{metadata.threat_actor}</span>
          </div>
        )}
        {metadata?.username && (
          <div className="flex items-center justify-between text-slate-400">
            <span>Account:</span>
            <span className="text-purple-300 font-semibold">{metadata.username}</span>
          </div>
        )}
        {metadata?.file_name && (
          <div className="flex items-center justify-between text-slate-400">
            <span>Decoy:</span>
            <span className="text-amber-400 font-semibold truncate max-w-[120px]">{metadata.file_name}</span>
          </div>
        )}
        {metadata?.criticality && (
          <div className="flex items-center justify-between text-slate-400">
            <span>Tier:</span>
            <span className="text-slate-200">{metadata.criticality}</span>
          </div>
        )}
      </div>

      {/* Footer Status Pill */}
      <div className="mt-2.5 flex items-center justify-between">
        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${style.tagBg}`}>
          {severity || 'MONITORED'}
        </span>
        <span className="text-[9px] font-mono text-slate-500 hover:text-cyan-400 transition-colors">
          Click for Evidence →
        </span>
      </div>

      {/* Source Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-[#070b14] -mr-1 hover:!bg-white"
      />

      {/* Source Handle (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2.5 !h-2.5 !bg-purple-400 !border-2 !border-[#070b14] -mb-1 hover:!bg-white"
      />
    </div>
  );
});
