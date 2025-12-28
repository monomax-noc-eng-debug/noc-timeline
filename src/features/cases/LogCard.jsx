import React from 'react';
import { User, Hash, AlertTriangle, Calendar, Clock, FileText } from 'lucide-react';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'open': return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50';
    case 'pending': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
    case 'succeed': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
    default: return 'bg-zinc-50 text-zinc-500 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800';
  }
};

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'text-red-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-blue-500';
    case 'low': return 'text-emerald-500';
    default: return 'text-zinc-400';
  }
};

const LogCard = ({ log, isSelected, onClick }) => {
  const dateObj = log.createdAt ? new Date(log.createdAt) : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-';

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-3.5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${isSelected
          ? 'bg-white dark:bg-[#0a0a0a] border-zinc-900 dark:border-zinc-500 shadow-xl scale-[1.01] z-10'
          : 'bg-white dark:bg-[#111] border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:-translate-y-0.5'
        }
      `}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-zinc-900 dark:bg-zinc-100" />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[9px] font-mono font-bold">
            #{log.ticketNumber}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${getStatusColor(log.status)}`}>
            {log.status}
          </span>
        </div>
        <span className="text-[9px] text-zinc-300 font-bold uppercase">{dateStr}</span>
      </div>

      {/* Description */}
      <h3 className={`font-medium text-xs leading-snug mb-3 line-clamp-2 min-h-[2rem] ${isSelected ? 'text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
        {log.shortDesc || log.details || 'No Description'}
      </h3>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-2 text-zinc-400">
          <User size={10} />
          <span className="text-[9px] font-medium truncate max-w-[80px]">{log.assign || 'Unassigned'}</span>
        </div>

        <div className="flex items-center gap-1">
          <AlertTriangle size={10} className={getSeverityColor(log.severity)} />
          <span className={`text-[8px] font-black uppercase ${getSeverityColor(log.severity)}`}>
            {log.severity || 'Low'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LogCard;
