// file: e:\Project-NOCNTT\noc-timeline\src\features\cases\LogDetailPanel.jsx
import React, { memo } from 'react';
import {
  Calendar, User, ShieldAlert, Activity, CheckCircle2,
  Zap, LayoutList, AlertTriangle, X, Hash, Layers,
  ArrowRight, ShieldCheck, Tag, ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------
// 1. Helpers & Utils
// ----------------------------------------------------------------------

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    case 'pending':
      return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    case 'succeed':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    default:
      return 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-800';
  }
};

const getSeverityStyles = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'text-rose-500 bg-rose-50/50 dark:bg-rose-500/10';
    case 'high': return 'text-orange-500 bg-orange-50/50 dark:bg-orange-500/10';
    case 'medium': return 'text-[#0078D4] bg-[#0078D4]/10 dark:bg-[#0078D4]/10';
    case 'low': return 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10';
    default: return 'text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/50';
  }
};

// ----------------------------------------------------------------------
// 2. Sub-Components
// ----------------------------------------------------------------------

const InfoCard = memo(({ label, value, icon, colorClass }) => {
  const IconComp = icon;
  return (
    <div className="flex-1 p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-md group">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-lg shrink-0", colorClass)}>
          <IconComp size={12} />
        </div>
        <span className="text-[9px] font-semibold text-zinc-400">{label}</span>
      </div>
      <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight truncate">
        {value || '-'}
      </p>
    </div>
  );
});

const DetailSection = memo(({ title, icon, children, accentColor = "text-zinc-400" }) => {
  const IconComp = icon;
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-semibold text-zinc-400 flex items-center gap-2 px-1">
        <IconComp size={12} className={accentColor} /> {title}
      </h3>
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded-lg shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-current transition-colors opacity-30" />
        <div className="relative pl-2">
          {children}
        </div>
      </div>
    </div>
  );
});

// ----------------------------------------------------------------------
// 3. Main Component - Split View Panel (NOT Modal)
// ----------------------------------------------------------------------

export default function LogDetailPanel({ log, onAddToIncident, onClose, canEdit }) {
  if (!log) return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-50 dark:bg-[#09090b] transition-colors relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-zinc-200/50 dark:bg-grid-zinc-800/20 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-14 h-14 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 shadow-sm">
          <Hash size={24} className="text-[#0078D4]" />
        </div>
        <p className="font-semibold text-zinc-600 dark:text-zinc-400 text-sm">Select a log to view details</p>
      </div>
    </div>
  );

  const dateStr = log.createdAt ? format(new Date(log.createdAt), 'dd MMM yyyy HH:mm') : '-';

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#0e0e11] relative transition-colors duration-300 overflow-hidden">

      {/* --- HEADER --- */}
      <div className="shrink-0 z-20 bg-zinc-50 dark:bg-[#0e0e11] border-b border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            <button
              onClick={onClose}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md">
              <Hash size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#0078D4] uppercase tracking-wider">Operational Log</p>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">{log.ticketNumber}</h2>
            </div>
          </div>
          {/* Desktop Close Button */}
          <button
            onClick={onClose}
            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Meta Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 uppercase">
            <Calendar size={12} /> {dateStr}
          </div>
          <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 uppercase">
            <ShieldCheck size={12} /> {log.type}
          </div>
          <div className={cn("px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider", getStatusStyles(log.status))}>
            {log.status}
          </div>
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoCard
            label="Severity"
            value={log.severity || 'Low'}
            icon={AlertTriangle}
            colorClass={getSeverityStyles(log.severity)}
          />
          <InfoCard
            label="Hierarchy"
            value={log.category || 'N/A'}
            icon={Layers}
            colorClass="bg-zinc-50 text-zinc-400 dark:bg-zinc-800"
          />
          <InfoCard
            label="Sub-Class"
            value={log.subCategory || 'N/A'}
            icon={Tag}
            colorClass="bg-zinc-50 text-zinc-400 dark:bg-zinc-800"
          />
        </div>

        {/* Description Block */}
        <DetailSection title="Record Description" icon={LayoutList} accentColor="text-[#0078D4]">
          <div className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap selection:bg-blue-100 dark:selection:bg-blue-900">
            {log.details || log.shortDesc || 'Zero telemetry records available.'}
          </div>
        </DetailSection>

        {/* Response & Resolution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailSection title="Action Deployed" icon={Activity} accentColor="text-orange-500">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {log.action || 'No defensive actions recorded.'}
            </p>
          </DetailSection>
          <DetailSection title="Resolution Status" icon={ShieldCheck} accentColor="text-emerald-500">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {log.resolvedDetail || 'Archive pending reconciliation.'}
            </p>
          </DetailSection>
        </div>

        {/* Ownership Block */}
        <div className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-black flex items-center justify-center text-base font-black shadow-md transition-transform group-hover:scale-105">
              {log.assign?.[0]?.toUpperCase() || <User size={18} />}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400">Lead Engineer</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">@{log.assign || 'Unassigned'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER ACTION --- */}
      {canEdit && (
        <div className="shrink-0 p-6 bg-white dark:bg-[#0a0a0a] border-t border-zinc-100 dark:border-zinc-900">
          <button
            onClick={() => onAddToIncident(log)}
            className="w-full h-12 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0078D4]/20 transition-all active:scale-[0.98]"
          >
            <Zap size={16} className="fill-current" />
            Escalate to Incident
          </button>
          <p className="text-center text-[9px] font-medium text-zinc-400 mt-3">
            This will create a new case from this log entry.
          </p>
        </div>
      )}
    </div>
  );
}

