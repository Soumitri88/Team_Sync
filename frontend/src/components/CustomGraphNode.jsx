import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Skull, 
  Server, 
  User, 
  Bug, 
  Flame
} from 'lucide-react';

const getNodeTheme = (type, isCritical) => {
  if (type === 'attacker') {
    return {
      bg: 'bg-red-950/90 border-red-500',
      icon: Skull,
      iconColor: 'text-red-400',
      tag: 'Attacker Origin',
      tagColor: 'bg-red-900/60 text-red-300'
    };
  }
  if (type === 'canary') {
    return {
      bg: 'bg-amber-950/90 border-amber-500',
      icon: Bug,
      iconColor: 'text-amber-400',
      tag: 'Decoy Trap Tripped',
      tagColor: 'bg-amber-900/60 text-amber-300'
    };
  }
  if (type === 'account') {
    return {
      bg: isCritical ? 'bg-purple-950/90 border-purple-500' : 'bg-slate-900 border-purple-500/50',
      icon: User,
      iconColor: 'text-purple-400',
      tag: 'Compromised Account',
      tagColor: 'bg-purple-900/60 text-purple-300'
    };
  }
  // Default: Device / Server
  return {
    bg: 'bg-slate-900 border-cyan-500/60',
    icon: Server,
    iconColor: 'text-cyan-400',
    tag: 'Internal Computer',
    tagColor: 'bg-cyan-950 text-cyan-300'
  };
};

export const CustomGraphNode = memo(({ data, selected }) => {
  const { label, type, severity, metadata, is_critical_path } = data;
  const theme = getNodeTheme(type, is_critical_path);
  const Icon = theme.icon;

  return (
    <div
      className={`relative min-w-[200px] max-w-[240px] rounded-xl border-2 p-3 transition-all duration-200 cursor-pointer shadow-lg ${
        theme.bg
      } ${
        selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#070b14] scale-105' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-cyan-400 !border !border-[#070b14]"
      />

      {is_critical_path && (
        <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-red-600 text-[9px] font-bold uppercase text-white flex items-center gap-1 shadow">
          <Flame className="w-2.5 h-2.5" />
          Attack Path
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="p-1.5 rounded-lg bg-black/40 flex items-center justify-center flex-shrink-0">
          <Icon className={`w-4 h-4 ${theme.iconColor}`} />
        </div>
        <div className="truncate">
          <div className="text-xs font-bold text-white truncate">{label}</div>
          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${theme.tagColor}`}>
            {theme.tag}
          </span>
        </div>
      </div>

      {/* Subtext info */}
      <div className="text-[11px] text-slate-300 mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
        <span className="text-slate-400">
          {metadata?.ip || (type === 'canary' ? 'Decoy File' : 'Monitored')}
        </span>
        <span className="text-cyan-400 text-[10px] font-medium">Click details →</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-cyan-400 !border !border-[#070b14]"
      />
    </div>
  );
});
