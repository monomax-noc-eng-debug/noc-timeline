import React, { memo } from 'react';
import {
  Clock, Sun, Moon,
  CheckCircle2, Edit2, Trash2, AlertTriangle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';

const getShiftMeta = (log, hasIssues) => {
  if (hasIssues) {
    return { border: 'border-l-rose-500', dot: 'bg-rose-500' };
  }
  if (log.shift === 'Morning') {
    return { border: 'border-l-amber-500', dot: 'bg-amber-500' };
  }
  return { border: 'border-l-[#0078D4]', dot: 'bg-[#0078D4]' }; // Night/Default
};

const ShiftLogItem = memo(({
  log,
  currentUser,
  onAcknowledge,
  onView,
  onEdit,
  onDelete,
  isSelected
}) => {
  const isAck = currentUser && (log.acknowledgedBy || []).includes(currentUser.name);
  const isOwner = currentUser && (log.createdBy === currentUser.name || (log.onDuty || []).includes(currentUser.name));
  const hasIssues = log.status === 'Issues';
  const meta = getShiftMeta(log, hasIssues);

  // Date Parsing
  let dateDay = '--';
  let dateMonth = '';
  try {
    const parsed = parseISO(log.date);
    dateDay = format(parsed, 'dd');
    dateMonth = format(parsed, 'MMM').toUpperCase();
  } catch { /* ignore */ }

  return (
    <div
      onClick={onView}
      className={cn(
        // Card Container: Dark surface, rounded corners
        "group relative flex items-stretch gap-4 p-4 mb-2 cursor-pointer transition-all duration-200 overflow-hidden",
        "rounded-xl border",
        "bg-zinc-100 dark:bg-zinc-900/80", // Dark surface
        "border-zinc-200/50 dark:border-zinc-800",
        "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/80",
        // Status Indicator: Vertical accent line on left
        "border-l-4",
        meta.border,
        isSelected && "ring-2 ring-[#0078D4] ring-offset-2 ring-offset-white dark:ring-offset-black"
      )}
    >
      {/* --- DATE BOX --- */}
      <div className="shrink-0 flex flex-col items-center justify-center w-12 text-center">
        <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100 leading-none tracking-tight">
          {dateDay}
        </span>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {dateMonth}
        </span>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">

        {/* Row 1: Author & Time */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
            {log.createdBy || 'Unknown'}
          </span>
          <span className="text-xs text-zinc-400 font-mono">{log.time}</span>
        </div>

        {/* Row 2: Note Preview */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">
          {log.note || <span className="italic opacity-75">No remarks</span>}
        </p>

        {/* Row 3: Pill-Shaped Tags/Badges */}
        <div className="flex items-center gap-2 mt-1">
          {/* Shift Badge (Pill) */}
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
            log.shift === 'Morning'
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
          )}>
            {log.shift === 'Morning' ? <Sun size={10} strokeWidth={2.5} /> : <Moon size={10} strokeWidth={2.5} />}
            {log.shift}
          </span>

          {/* Status Badge (Pill) */}
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
            hasIssues
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", hasIssues ? "bg-rose-500" : "bg-emerald-500")} />
            {hasIssues ? 'Issues' : 'Normal'}
          </span>

          {/* Ack Count (if any) */}
          {(log.acknowledgedBy || []).length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/20">
              <CheckCircle2 size={10} />
              {(log.acknowledgedBy || []).length}
            </span>
          )}
        </div>
      </div>

      {/* --- ACTIONS (Hover) --- */}
      <div className={cn(
        "shrink-0 flex flex-col items-center justify-center gap-1 transition-opacity",
        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        {/* Ack */}
        <button
          onClick={(e) => { e.stopPropagation(); onAcknowledge(); }}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            isAck
              ? "text-emerald-500 bg-emerald-500/10"
              : "text-zinc-400 hover:text-emerald-600 hover:bg-emerald-500/10"
          )}
          title={isAck ? "Acknowledged" : "Acknowledge"}
        >
          <CheckCircle2 size={16} strokeWidth={2} />
        </button>

        {isOwner && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-[#0078D4] hover:bg-[#0078D4]/10 transition-colors"
              title="Edit"
            >
              <Edit2 size={16} strokeWidth={2} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </div>
  );
});

export default ShiftLogItem;