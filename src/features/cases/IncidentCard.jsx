import React, { memo } from 'react';
import { Trash2, Hash, AlertCircle, CheckCircle2, Clock, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";

const getStatusMeta = (status) => {
  switch (status) {
    case 'Open': return { border: 'border-l-rose-500', dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' };
    case 'In Progress': return { border: 'border-l-[#0078D4]', dot: 'bg-[#0078D4]', text: 'text-[#0078D4] dark:text-blue-400', bg: 'bg-[#0078D4]/10' };
    case 'Monitoring':
    case 'Pending': return { border: 'border-l-amber-500', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' };
    case 'Succeed':
    case 'Resolved': return { border: 'border-l-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' };
    case 'Closed': return { border: 'border-l-zinc-500', dot: 'bg-zinc-500', text: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-500/10' };
    default: return { border: 'border-l-zinc-400', dot: 'bg-zinc-400', text: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-500/10' };
  }
};

const IncidentCard = memo(({ incident, isSelected, onClick, onDelete }) => {
  const meta = getStatusMeta(incident.status);

  let dateDay = '--';
  let dateMonth = '';
  try {
    if (incident.createdAt) {
      const parsed = new Date(incident.createdAt);
      dateDay = parsed.getDate();
      dateMonth = parsed.toLocaleString('default', { month: 'short' }).toUpperCase();
    }
  } catch { /* ignore */ }

  return (
    <div
      onClick={onClick}
      className={cn(
        // Card Container: Dark surface, rounded corners
        "group relative flex items-stretch gap-4 p-4 mb-2 cursor-pointer transition-all duration-200 overflow-hidden",
        "rounded-xl border",
        "bg-zinc-100 dark:bg-zinc-900/80",
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

        {/* Row 1: Ticket ID & Project */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Hash size={12} />
            {incident.ticket || '-'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
            {incident.project || 'CORE'}
          </span>
        </div>

        {/* Row 2: Subject */}
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug">
          {incident.subject || 'Untitled Incident'}
        </h3>

        {/* Row 3: Pill-Shaped Badges */}
        <div className="flex items-center gap-2 mt-0.5">
          {/* Status Badge (Pill) */}
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
            meta.bg, meta.text,
            incident.status === 'Open' ? 'border-rose-500/30' :
              incident.status === 'In Progress' ? 'border-[#0078D4]/30' :
                incident.status === 'Pending' || incident.status === 'Monitoring' ? 'border-amber-500/30' :
                  incident.status === 'Resolved' || incident.status === 'Succeed' ? 'border-emerald-500/30' :
                    'border-zinc-500/30'
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
            {incident.status}
          </span>

          {/* Type Badge (Pill) */}
          {incident.type && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-300/50 dark:border-zinc-700/50">
              {incident.type}
            </span>
          )}
        </div>
      </div>

      {/* --- DELETE ACTION (Hover) --- */}
      <div className={cn(
        "shrink-0 flex items-center justify-center transition-opacity",
        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(incident.id); }}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
          title="Delete Case"
        >
          <Trash2 size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
});

export default IncidentCard;
