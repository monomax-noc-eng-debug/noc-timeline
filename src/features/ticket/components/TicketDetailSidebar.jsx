// file: e:\Project-NOCNTT\noc-timeline\src\features\ticket\components\TicketDetailSidebar.jsx
import React, { memo } from 'react';
import { X, User, Tag, Info, Hash, LayoutGrid, Clock, CheckCircle, TrendingUp } from 'lucide-react';

/**
 * DataSummaryRow Component
 * Displays a label and value pair with clean hierarchy
 */
const DataSummaryRow = memo(({ label, value, icon }) => {
  const Icon = icon;
  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
        {Icon && <Icon size={14} strokeWidth={2.5} className="text-[#0078D4]" />}
        {label}
      </div>
      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap">
        {value || '-'}
      </div>
    </div>
  );
});
DataSummaryRow.displayName = 'DataSummaryRow';

/**
 * Modern Sidebar Section
 */
const ModernSection = memo(({ title, icon, children }) => {
  const Icon = icon;
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-[#deecf9] dark:bg-blue-900/20 flex items-center justify-center">
          <Icon size={14} strokeWidth={2.5} className="text-[#0078D4]" />
        </div>
        <h4 className="text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 tracking-wider">
          {title}
        </h4>
      </div>
      <div className="pl-9">
        {children}
      </div>
    </section>
  );
});
ModernSection.displayName = 'ModernSection';

/**
 * TicketDetailSidebar Component
 * Refactored for 'Minimalist Clean & Modern' design.
 */
export default function TicketDetailSidebar({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-[#0c0c0e] shadow-xl z-[100] border-l border-zinc-200 dark:border-zinc-800 flex flex-col animate-in slide-in-from-right duration-500 backdrop-blur-md bg-opacity-95">

      {/* 1. Header Section */}
      <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#0078D4] flex items-center justify-center text-white shadow-md shadow-[#0078D4]/20">
            <LayoutGrid size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">Record Insight</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 leading-none">
                Details for {ticket.ticketNumber}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          aria-label="Close Sidebar"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* 2. Content Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">

        {/* Core Identity Card */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-[#0078D4] border border-blue-100 dark:border-blue-800/50 text-[11px] font-bold flex items-center gap-2">
              <Tag size={12} strokeWidth={2.5} />
              {ticket.category || 'General'}
            </div>
            <div className="px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-bold flex items-center gap-2">
              <LayoutGrid size={12} strokeWidth={2.5} />
              {ticket.subCategory || 'Other'}
            </div>
          </div>

          <h3 className="text-xl font-bold leading-snug text-zinc-900 dark:text-white tracking-tight">
            {ticket.shortDesc}
          </h3>

          <div className="flex items-center gap-3 text-zinc-500">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <Hash size={12} strokeWidth={2.5} className="text-[#0078D4]" />
              <span className="text-xs font-semibold tabular-nums">{ticket.ticketNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <Clock size={12} strokeWidth={2.5} /> Deploy Date: 2025
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8 pb-8">
          <ModernSection title="System Narrative" icon={Info}>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {ticket.details || ticket.detail || 'No additional technical data provided for this record.'}
              </p>
            </div>
          </ModernSection>

          <ModernSection title="Action & Resolution Mapping" icon={CheckCircle}>
            <div className="grid grid-cols-1 gap-3">
              <DataSummaryRow
                label="Mitigation Taken"
                value={ticket.action}
                icon={TrendingUp}
              />
              <DataSummaryRow
                label="Final Resolution"
                value={ticket.resolvedDetail}
                icon={CheckCircle}
              />
            </div>
          </ModernSection>
        </div>
      </div>

      {/* 3. Footer Section (Operator Identity) */}
      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg">
              {ticket.assign?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Lead Operator</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">@{ticket.assign || 'Unassigned'}</p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
            <User size={16} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
}