import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Skull, 
  Server, 
  User, 
  Bug, 
  Flame,
  Terminal,
  FileCode,
  Globe,
  ShieldCheck,
  Radio,
  Lock
} from 'lucide-react';

const getNodeTheme = (type, visualState, isCritical, isPatientZero) => {
  // Contained state override
  if (visualState === 'contained') {
    return {
      bg: 'bg-emerald-950/80 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      tag: 'Neutralized & Contained',
      tagColor: 'bg-emerald-900/70 text-emerald-300 border border-emerald-500/30',
      badgeColor: 'bg-emerald-600'
    };
  }

  // Node type styling
  switch (type) {
    case 'attacker':
      return {
        bg: 'bg-red-950/90 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)]',
        icon: Skull,
        iconColor: 'text-red-400',
        tag: 'Adversary Entrypoint',
        tagColor: 'bg-red-900/70 text-red-300 border border-red-500/30',
        badgeColor: 'bg-red-600'
      };
    case 'process':
      return {
        bg: isCritical ? 'bg-amber-950/90 border-amber-500' : 'bg-slate-900/90 border-amber-500/60',
        icon: Terminal,
        iconColor: 'text-amber-400',
        tag: 'Spawned Process (PID)',
        tagColor: 'bg-amber-900/70 text-amber-300 border border-amber-500/30',
        badgeColor: 'bg-amber-600'
      };
    case 'file':
      return {
        bg: 'bg-indigo-950/90 border-indigo-500',
        icon: FileCode,
        iconColor: 'text-indigo-400',
        tag: 'Targeted File Artifact',
        tagColor: 'bg-indigo-900/70 text-indigo-300 border border-indigo-500/30',
        badgeColor: 'bg-indigo-600'
      };
    case 'canary':
      return {
        bg: 'bg-amber-950/95 border-amber-400 animate-pulse shadow-[0_0_25px_rgba(245,158,11,0.4)]',
        icon: Bug,
        iconColor: 'text-amber-300',
        tag: 'Canary Deception Decoy',
        tagColor: 'bg-amber-900/80 text-amber-200 border border-amber-400/40',
        badgeColor: 'bg-amber-500'
      };
    case 'network':
      return {
        bg: 'bg-rose-950/90 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
        icon: Globe,
        iconColor: 'text-rose-400',
        tag: 'C2 Encrypted Egress',
        tagColor: 'bg-rose-900/70 text-rose-300 border border-rose-500/30',
        badgeColor: 'bg-rose-600'
      };
    case 'account':
      return {
        bg: isCritical ? 'bg-purple-950/90 border-purple-500' : 'bg-slate-900/90 border-purple-500/50',
        icon: User,
        iconColor: 'text-purple-400',
        tag: 'Compromised Identity',
        tagColor: 'bg-purple-900/70 text-purple-300 border border-purple-500/30',
        badgeColor: 'bg-purple-600'
      };
    case 'device':
    default:
      if (isPatientZero) {
        return {
          bg: 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
          icon: Server,
          iconColor: 'text-cyan-300',
          tag: 'Patient Zero (Host)',
          tagColor: 'bg-cyan-900/80 text-cyan-200 border border-cyan-400/40',
          badgeColor: 'bg-cyan-500'
        };
      }
      return {
        bg: 'bg-slate-900/90 border-slate-700 hover:border-cyan-500/60',
        icon: Server,
        iconColor: 'text-cyan-400',
        tag: 'Target Endpoint',
        tagColor: 'bg-slate-800 text-slate-300',
        badgeColor: 'bg-slate-700'
      };
  }
};

export const CustomGraphNode = memo(({ data, selected }) => {
  const { 
    label, 
    type, 
    severity, 
    visual_state = 'normal',
    metadata = {}, 
    is_critical_path,
    is_patient_zero,
    stage = 1
  } = data;

  const isCritical = Boolean(is_critical_path || severity === 'critical');
  const theme = getNodeTheme(type, visual_state, isCritical, is_patient_zero);
  const Icon = theme.icon;

  return (
    <div
      className={`relative min-w-[210px] max-w-[260px] rounded-2xl border-2 p-3.5 transition-all duration-300 cursor-pointer shadow-xl backdrop-blur-md ${
        theme.bg
      } ${
        selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#070b14] scale-105' : ''
      }`}
    >
      {/* React Flow Left Handle (Target) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-[#070b14] !-left-1.5"
      />

      {/* Top Badges */}
      <div className="absolute -top-3 left-3 flex items-center gap-1.5 z-10">
        <span className="px-2 py-0.5 rounded-full bg-slate-950/90 border border-slate-700 text-[9px] font-mono font-bold text-slate-300">
          S{stage}
        </span>
        {visual_state === 'contained' ? (
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-[9px] font-bold uppercase text-white flex items-center gap-1 shadow">
            <ShieldCheck className="w-2.5 h-2.5" />
            Contained
          </span>
        ) : isCritical ? (
          <span className="px-2 py-0.5 rounded-full bg-red-600 text-[9px] font-bold uppercase text-white flex items-center gap-1 shadow animate-pulse">
            <Flame className="w-2.5 h-2.5" />
            Attack Path
          </span>
        ) : null}
      </div>

      {/* Header Info */}
      <div className="flex items-start gap-2.5 mt-1 mb-2">
        <div className="p-2 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
          <Icon className={`w-4 h-4 ${theme.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate leading-tight font-mono">
            {label}
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className={`text-[9px] font-semibold font-mono px-1.5 py-0.5 rounded ${theme.tagColor}`}>
              {theme.tag}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata Detail Preview */}
      <div className="text-[10px] text-slate-300 pt-2 border-t border-white/10 flex flex-col gap-1 font-mono">
        {metadata.ip && (
          <div className="flex justify-between items-center text-slate-400">
            <span>IP:</span>
            <span className="text-slate-200 font-semibold">{metadata.ip}</span>
          </div>
        )}
        {metadata.pid && (
          <div className="flex justify-between items-center text-amber-300/90">
            <span>PID:</span>
            <span className="font-bold text-amber-200">{metadata.pid}</span>
          </div>
        )}
        {metadata.file_name && (
          <div className="flex justify-between items-center text-amber-300/90">
            <span>Decoy:</span>
            <span className="truncate max-w-[140px] text-amber-200">{metadata.file_name}</span>
          </div>
        )}
        {metadata.destination && (
          <div className="flex justify-between items-center text-rose-300">
            <span>Egress:</span>
            <span className="truncate max-w-[140px] text-rose-200">{metadata.destination}</span>
          </div>
        )}
        <div className="flex justify-between items-center mt-1 text-[9px]">
          <span className="text-slate-500 uppercase tracking-wider">
            {visual_state.replace('-', ' ')}
          </span>
          <span className="text-cyan-400 hover:text-cyan-300 font-sans font-semibold">
            Inspect Evidence →
          </span>
        </div>
      </div>

      {/* React Flow Right Handle (Source) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-[#070b14] !-right-1.5"
      />
    </div>
  );
});
