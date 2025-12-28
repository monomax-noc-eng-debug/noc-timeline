import React from 'react';
import { Calendar, User, ShieldAlert, Activity, CheckCircle2, Zap, LayoutList, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

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
    case 'medium': return 'text-blue-500';
    case 'low': return 'text-emerald-500';
    default: return 'text-zinc-400';
  }
};

export default function LogDetailPanel({ log, onAddToIncident, onClose }) {
  if (!log) return null;

  const dateStr = log.createdAt ? format(new Date(log.createdAt), 'dd MMM yyyy HH:mm') : '-';

  return (
    <div className="h-full bg-zinc-50/50 dark:bg-[#09090b] flex flex-col items-center justify-center p-6">

      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-full">

        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 bg-blue-500 text-white text-[10px] font-bold rounded shadow-blue-500/20 shadow-lg">TICKET LOG</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white">#{log.ticketNumber}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5"><Calendar size={12} /> {dateStr}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
              <span className="flex items-center gap-1.5"><ShieldAlert size={12} /> {log.type}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusColor(log.status)} uppercase`}>{log.status}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Severity</span>
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className={getSeverityColor(log.severity)} />
                <span className={`text-sm font-bold ${getSeverityColor(log.severity)}`}>{log.severity || 'Low'}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Category</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{log.category || '-'}</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Sub Category</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{log.subCategory || '-'}</span>
            </div>
          </div>

          {/* Main Description */}
          <div>
            <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest flex items-center gap-2">
              <LayoutList size={12} /> Description
            </h3>
            <div className="p-5 bg-zinc-50 dark:bg-black rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
              {log.details || log.shortDesc || 'No details available'}
            </div>
          </div>

          {/* Action & Resolution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest flex items-center gap-2">
                <Activity size={12} className="text-blue-500" /> Action Taken
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                {log.action || 'No action recorded'}
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" /> Resolution
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                {log.resolvedDetail || 'Pending'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
              {log.assign?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-[9px] font-black uppercase text-zinc-400">Assigned To</div>
              <div className="text-sm font-bold text-zinc-800 dark:text-white">{log.assign || 'Unassigned'}</div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-zinc-50/80 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => onAddToIncident(log)}
            className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-black uppercase tracking-wide hover:opacity-90 active:scale-[0.99] transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <Zap size={16} className="fill-current" />
            Create Incident Case
          </button>
          <p className="text-center mt-3 text-[10px] text-zinc-400">
            This will create a new incident case in the timeline and link this ticket.
          </p>
        </div>
      </div>
    </div>
  );
}
