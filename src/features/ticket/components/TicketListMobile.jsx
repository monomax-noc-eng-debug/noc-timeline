import React, { memo, useCallback } from 'react';
import { Edit, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import VirtualizedList from '../../../components/ui/VirtualizedList';

// --- Helper Functions & Sub-components ---
// Note: Code duplication is intentional here for copy-paste portability.
// In a stricter setup, these would be in a shared utils file.

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'open': return 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50';
    case 'pending': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
    case 'succeed': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
    default: return 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-zinc-200 dark:border-zinc-800';
  }
};

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'text-red-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-[#0078D4]';
    case 'low': return 'text-emerald-500';
    default: return 'text-zinc-400';
  }
};

const DateBox = memo(({ date }) => {
  const dateObj = date ? new Date(date) : new Date();
  return (
    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col items-center justify-center shrink-0 shadow-sm">
      <span className="text-[8px] sm:text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase leading-none">{format(dateObj, 'MMM')}</span>
      <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-none mt-0.5">{format(dateObj, 'dd')}</span>
      <span className="text-[7px] font-medium text-zinc-400 dark:text-zinc-600 leading-none mt-0.5 hidden sm:block">{format(dateObj, 'yy')}</span>
    </div>
  );
});
DateBox.displayName = 'DateBox';

const MobileTicketCard = memo(({ log, onClick, onEdit, canEdit }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm hover:border-[#0078D4]/50 transition-all active:scale-[0.99] group overflow-hidden"
    >
      <div className="flex gap-4 items-start">
        {/* Date Square */}
        <DateBox date={log.createdAt} />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-[#deecf9] dark:bg-blue-900/20 text-[#0078D4] dark:text-[#4ba0e8] text-[10px] sm:text-xs font-semibold rounded-md border border-blue-100 dark:border-blue-800/50">
                #{log.ticketNumber}
              </span>
              <span className={`text-[9px] sm:text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border ${getStatusColor(log.status)}`}>
                {log.status}
              </span>
            </div>
            {/* Actions for mobile */}
            {canEdit && (
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(log); }}
                  className="p-1.5 text-zinc-400 hover:text-[#0078D4] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                >
                  <Edit size={14} />
                </button>
              </div>
            )}
          </div>

          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight mb-2">
            {log.shortDesc || log.details || 'No Description'}
          </h3>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                {log.assign ? log.assign.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-[11px] font-medium text-zinc-500 truncate max-w-[70px]">{log.assign || 'Unassigned'}</span>
            </div>

            <div className="flex items-center gap-1">
              <AlertTriangle size={12} className={getSeverityColor(log.severity)} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(log.severity)}`}>{log.severity || 'Low'}</span>
            </div>

            <div className="ml-auto text-[10px] text-zinc-500 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-400 font-medium bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded">
              {log.type}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
MobileTicketCard.displayName = 'MobileTicketCard';

export default function TicketListMobile({ logs, onLogClick, onEdit, canEdit }) {
  // Memoized render function for VirtualizedList
  const renderItem = useCallback((log) => (
    <MobileTicketCard
      key={log.id}
      log={log}
      onClick={() => onLogClick(log)}
      onEdit={onEdit}
      canEdit={canEdit}
    />
  ), [onLogClick, onEdit, canEdit]);

  // For small lists, use regular rendering (avoids virtualization overhead)
  if (logs.length <= 15) {
    return (
      <div className="md:hidden space-y-4">
        {logs.map((log) => (
          <MobileTicketCard
            key={log.ticketNumber}
            log={log}
            onClick={() => onLogClick(log)}
            onEdit={onEdit}
            canEdit={canEdit}
          />
        ))}
      </div>
    );
  }

  // For large lists, use virtualization
  return (
    <div className="md:hidden">
      <VirtualizedList
        items={logs}
        itemHeight={140} // Approximate card height including margin
        renderItem={renderItem}
        containerHeight="calc(100vh - 280px)"
        className="space-y-4"
      />
    </div>
  );
}