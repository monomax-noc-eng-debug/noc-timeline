// file: e:\Project-NOCNTT\noc-timeline\src\features\cases\LogCard.jsx
import React, { memo } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import Card from '@/components/ui/Card';

// ----------------------------------------------------------------------
// 1. Helpers
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

const getStatusAccent = (status) => {
  switch (status?.toLowerCase()) {
    case 'open': return 'open';
    case 'pending': return 'pending';
    case 'succeed': return 'resolved';
    default: return 'none';
  }
};

const getSeverityStyles = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'text-rose-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-[#0078D4]';
    case 'low': return 'text-emerald-500';
    default: return 'text-zinc-400';
  }
};

// ----------------------------------------------------------------------
// 2. Main Component
// ----------------------------------------------------------------------

const LogCard = memo(({ log, isSelected, onClick }) => {
  const dateObj = log.createdAt ? new Date(log.createdAt) : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-';

  return (
    <Card
      variant="interactive"
      selected={isSelected}
      accent={isSelected ? 'primary' : getStatusAccent(log.status)}
      showAccent
      size="md"
      onClick={onClick}
      className={cn(
        "group mb-3",
        !isSelected && "hover:-translate-y-1"
      )}
    >
      {/* Header: Ticket ID & Status */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg">
            <span className="text-[10px] font-black tracking-tight tabular-nums uppercase">#{log.ticketNumber}</span>
          </div>
          <div className={cn("px-2.5 py-1 rounded-lg text-[9px] font-mediumst border", getStatusStyles(log.status))}>
            {log.status || 'LOG'}
          </div>
        </div>
        <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">{dateStr}</span>
      </div>

      {/* Body: Description */}
      <div className="mb-4">
        <h3 className={cn(
          "text-sm font-black leading-tight line-clamp-2 min-h-[2.5rem] transition-colors",
          isSelected ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
        )}>
          {log.shortDesc || log.details || 'Zero Telemetry Records'}
        </h3>
      </div>

      {/* Footer: Metadata */}
      <div className="flex justify-between items-center pt-4 border-t border-zinc-50 dark:border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-black text-zinc-500">
            {(log.assign || log.updatedBy || 'u').charAt(0).toUpperCase()}
          </div>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 truncate max-w-[100px] uppercase tracking-wide">
            {log.assign || 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-transform group-hover:scale-105">
          <AlertTriangle size={10} className={cn("shrink-0", getSeverityStyles(log.severity))} />
          <span className={cn("text-[9px] font-mediumst", getSeverityStyles(log.severity))}>
            {log.severity || 'Low'}
          </span>
        </div>
      </div>

      {/* Hover Arrow (Desktop) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden lg:block">
        <ChevronRight size={18} className="text-zinc-300" />
      </div>
    </Card>
  );
});

export default LogCard;
