import React, { memo } from 'react';
import { User, AlertTriangle, Flag, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

// --- Status Colors (Outlook Style) ---
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'open': return 'bg-red-500';
    case 'pending': return 'bg-amber-500';
    case 'in progress': return 'bg-[#0078D4]'; // Outlook Blue
    case 'resolved':
    case 'succeed':
    case 'completed': return 'bg-emerald-500';
    default: return 'bg-zinc-400';
  }
};

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'open': return { text: 'text-red-600', bg: 'bg-red-50' };
    case 'pending': return { text: 'text-amber-600', bg: 'bg-amber-50' };
    case 'in progress': return { text: 'text-[#0078D4]', bg: 'bg-blue-50' };
    case 'resolved':
    case 'succeed':
    case 'completed': return { text: 'text-emerald-600', bg: 'bg-emerald-50' };
    default: return { text: 'text-zinc-500', bg: 'bg-zinc-50' };
  }
};

// --- List Item Component ---
const TicketListItem = memo(({ log, onClick, isActive, onFlag, onDelete }) => {
  const statusColor = getStatusColor(log.status);
  const statusStyle = getStatusBadge(log.status);

  return (
    <div
      onClick={() => onClick(log)}
      className={cn(
        "group relative flex cursor-pointer transition-all border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
        isActive ? "bg-[#cce3f5] dark:bg-[#0078D4]/20" :
          log.isFlagged ? "bg-amber-50/40 dark:bg-amber-900/10" : "bg-white dark:bg-zinc-900"
      )}
    >
      {/* 1. Status Stripe (Left Border) */}
      <div className={cn("w-1 shrink-0", isActive ? "bg-[#0078D4]" : statusColor)} />

      {/* 2. Main Content */}
      <div className="flex-1 p-3 min-w-0 flex flex-col gap-1">

        {/* Top Row: Sender Info & Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {/* Flagged Status - More Prominent */}
            {log.isFlagged && (
              <div className="shrink-0 flex items-center justify-center w-5 h-5 bg-amber-100 dark:bg-amber-900/50 rounded text-amber-600 dark:text-amber-500" title="Pinned Ticket">
                <Flag size={12} fill="currentColor" />
              </div>
            )}

            {/* Avatar / Sender Name */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]", statusStyle.bg, statusStyle.text)}>
                {log.responsibility ? log.responsibility.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex flex-col">
                <span className={cn("font-semibold truncate", isActive ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300")}>
                  {log.responsibility || 'Unassigned'}
                </span>
                {log.assign && (
                  <span className="text-[9px] text-zinc-400 leading-none">
                    To: {log.assign}
                  </span>
                )}
              </div>
            </div>

            {/* Severity Badge (Critical/High) */}
            {(log.severity === 'Critical' || log.severity === 'High') && (
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ml-1",
                log.severity === 'Critical'
                  ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 animate-pulse"
                  : "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"
              )}>
                {log.severity}
              </span>
            )}
          </div>

          <span className={cn("text-[10px] shrink-0", isActive ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 group-hover:hidden")}>
            {log.createdAt ? format(new Date(log.createdAt), 'MMM dd') : ''}
          </span>

          {/* Hover Actions (Replaces Date on Hover) */}
          <div className="hidden group-hover:flex items-center gap-2 shrink-0 animate-in fade-in duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onFlag && onFlag(log); }}
              className={cn("transition-colors", log.isFlagged ? "text-amber-500 hover:text-amber-600" : "text-zinc-400 hover:text-amber-500")}
              title={log.isFlagged ? "Remove Pin" : "Pin to Top"}
            >
              <Flag size={14} fill={log.isFlagged ? "currentColor" : "none"} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete && onDelete(log.ticketNumber); }}
              className="text-zinc-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Middle Row: Subject (Bold) */}
        <div className="flex items-center gap-2">
          {/* Severity Icon fallback if not in badge */}
          {/* {log.severity === 'Critical' && <AlertTriangle size={12} className="text-red-500 shrink-0" />} */}

          <h4 className={cn(
            "text-sm font-semibold truncate",
            isActive ? "text-[#0078D4]" : "text-zinc-900 dark:text-white",
            log.isFlagged ? "italic" : ""
          )}>
            {log.shortDesc || log.details || '(No Subject)'}
          </h4>
        </div>

        {/* Bottom Row: Preview & Meta */}
        <div className="flex items-center gap-2 text-xs truncate">
          {/* Ticket ID Pill */}
          <span className="shrink-0 font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
            #{log.ticketNumber}
          </span>
          <span className={cn("truncate", isActive ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-500")}>
            {log.details?.substring(0, 60) || 'No details preview...'}
          </span>
          {/* Small Status Badge if not active (Active has blue stripe) */}
          {!isActive && (
            <span className={cn("ml-auto shrink-0 px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium uppercase tracking-wider", statusStyle.bg, statusStyle.text)}>
              {log.status}
            </span>
          )}
        </div>

      </div>
    </div>
  );
});
TicketListItem.displayName = 'TicketListItem';

// --- Main Container ---
const TicketTable = memo(({
  logs,
  onLogClick,
  isLoading,
  activeLogId,
  onFlag,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>
        <p className="font-medium">All caught up!</p>
        <p className="text-sm">No tickets found.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
      {logs.map(log => (
        <TicketListItem
          key={log.id || log.ticketNumber}
          log={log}
          onClick={onLogClick}
          isActive={activeLogId === log.ticketNumber}
          onFlag={onFlag}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

TicketTable.displayName = 'TicketTable';

export default TicketTable;