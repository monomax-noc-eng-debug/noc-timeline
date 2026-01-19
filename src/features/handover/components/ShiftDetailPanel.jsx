// file: src/features/handover/components/ShiftDetailPanel.jsx
// Read-only "Reading Pane" style component for shift handover details
import React, { memo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  X, Edit, Trash2, User, Calendar, Clock, Sun, Moon,
  CheckCircle2, AlertTriangle, Users, Image as ImageIcon
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { ROLES, hasRole } from '../../../utils/permissions';

// --- Detail Item Helper ---
const DetailItem = ({ label, value, icon: Icon, className }) => (
  <div className={cn("space-y-1", className)}>
    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">
      {Icon && <Icon size={12} className="text-[#0078D4]" />}
      {label}
    </div>
    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">
      {value || '-'}
    </div>
  </div>
);

const ShiftDetailPanel = memo(({
  log,
  onClose,
  onEdit,
  onDelete,
  onAcknowledge,
  currentUser
}) => {
  if (!log) return null;

  const hasIssues = log.status === 'Issues';
  const isAcked = currentUser && (log.acknowledgedBy || []).includes(currentUser.name);
  const canEdit = hasRole(currentUser, [ROLES.LEAD, ROLES.ENGINEER]) || (currentUser && currentUser.name === log.createdBy);

  let dateLabel = log.date;
  let dayOfWeek = '';
  try {
    const parsed = parseISO(log.date);
    dateLabel = format(parsed, 'MMMM d, yyyy');
    dayOfWeek = format(parsed, 'EEEE');
  } catch { /* ignore */ }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 overflow-hidden relative">

      {/* --- FIXED HEADER --- */}
      <div className="shrink-0 z-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-sm">

        {/* Top Row: Toolbar (Shift Badge, Breadcrumbs, Actions) */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="lg:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X size={20} /></button>

            <div className="flex items-center gap-2">
              <span className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider",
                log.shift === 'Morning'
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                  : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
              )}>
                {log.shift === 'Morning' ? <Sun size={12} strokeWidth={2.5} /> : <Moon size={12} strokeWidth={2.5} />}
                {log.shift}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{dateLabel}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {canEdit && (
              <>
                <button onClick={() => onEdit(log)} className="p-2 text-zinc-500 hover:text-[#0078D4] hover:bg-[#0078D4]/5 rounded-lg transition-colors" title="Edit"><Edit size={18} /></button>
                <button onClick={() => onDelete(log)} className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
              </>
            )}
            <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-2" />
            <button
              onClick={() => onAcknowledge && onAcknowledge(log, currentUser?.name)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all shadow-sm border",
                isAcked
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:border-white"
              )}
            >
              <CheckCircle2 size={14} className={isAcked ? "fill-emerald-600 text-white" : ""} />
              {isAcked ? 'Acknowledged' : 'Acknowledge'}
            </button>
          </div>
        </div>

        {/* Subject / Title Row */}
        <div>
          {/* Status Label (Small) */}
          <div className="flex items-center gap-2 mb-2">
            {hasIssues ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-500/20">
                <AlertTriangle size={10} /> Issues Reported
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
                <CheckCircle2 size={10} /> Normal
              </span>
            )}
          </div>

          {/* User & Time Info (Replaces Subject since Shift Logs often lack titles) */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center overflow-hidden">
              {/* Placeholder Avatar */}
              <span className="text-sm font-black text-zinc-500">{log.createdBy ? log.createdBy.charAt(0).toUpperCase() : '?'}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                Handover by {log.createdBy}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1"><Clock size={12} /> {log.time}</span>
                <span>•</span>
                <span className="font-mono">{dayOfWeek}</span>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* --- SCROLLABLE BODY --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-zinc-50/50 dark:bg-[#0c0c0e]">

        {/* Properties Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
          <DetailItem label="Shift Type" value={log.shift} icon={log.shift === 'Morning' ? Sun : Moon} />
          <DetailItem label="Duty Count" value={`${(log.onDuty || []).length} Person(s)`} icon={Users} />
          <DetailItem label="Ack Count" value={`${(log.acknowledgedBy || []).length} / ${(log.onDuty || []).length || '-'}`} icon={CheckCircle2} />
          <DetailItem label="Status" value={log.status} icon={hasIssues ? AlertTriangle : CheckCircle2} className={hasIssues ? "text-rose-600" : "text-emerald-600"} />
        </div>

        {/* Personnel */}
        {(log.onDuty || []).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              Personnel On Duty
            </h3>
            <div className="flex flex-wrap gap-2">
              {(log.onDuty || []).map((name, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-[#0078D4]/10 text-[#0078D4] flex items-center justify-center text-[10px] font-bold">
                    {name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note Body */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Handover Note</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-zinc-800/40 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
              {log.note || <span className="italic text-zinc-400">No content provided.</span>}
            </p>
          </div>
        </div>

        {/* Images */}
        {(log.images || []).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Attachments</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(log.images || []).map((img, i) => (
                <div key={i} className="group relative aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <a href={img} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                    <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acknowledged By List */}
        {(log.acknowledgedBy || []).length > 0 && (
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"><CheckCircle2 size={12} /></div>
              <span className="text-xs font-bold text-zinc-500 uppercase">Acknowledged by</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(log.acknowledgedBy || []).map((name, i) => (
                <span key={i} className="text-xs font-medium px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
});

ShiftDetailPanel.displayName = 'ShiftDetailPanel';

export default ShiftDetailPanel;
