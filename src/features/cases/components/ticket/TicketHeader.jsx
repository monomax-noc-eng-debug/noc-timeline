import React from 'react';
import {
  ArrowLeft, FileText, Calendar, AlertCircle,
  CheckCircle2, Clock, PlayCircle, XCircle,
  AlertTriangle, Minus, ChevronDown
} from 'lucide-react';

export default function TicketHeader({ incident, onUpdate, onBack, onGenerateReport }) {

  // Status Configuration
  const getStatusConfig = (s) => {
    switch (s) {
      case 'Open': return { bg: 'bg-red-50 dark:bg-red-900/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-900/30', icon: AlertCircle };
      case 'In Progress': return { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/30', icon: PlayCircle };
      case 'Monitoring': return { bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/30', icon: Clock };
      case 'Resolved': return { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30', icon: CheckCircle2 };
      case 'Closed': return { bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-500 dark:text-zinc-400', border: 'border-zinc-200 dark:border-zinc-700', icon: XCircle };
      default: return { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200', icon: AlertCircle };
    }
  };

  // Priority Configuration
  const getPriorityConfig = (p) => {
    switch (p) {
      case 'Critical': return { color: 'text-red-600', icon: AlertTriangle, bg: 'bg-red-100 dark:bg-red-900/20' };
      case 'High': return { color: 'text-orange-500', icon: AlertTriangle, bg: 'bg-orange-100 dark:bg-orange-900/20' };
      case 'Medium': return { color: 'text-yellow-500', icon: Minus, bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
      case 'Low': return { color: 'text-blue-500', icon: Minus, bg: 'bg-blue-100 dark:bg-blue-900/20' };
      default: return { color: 'text-zinc-500', icon: Minus, bg: 'bg-zinc-100 dark:bg-zinc-800' };
    }
  };

  const statusConfig = getStatusConfig(incident.status);
  const StatusIcon = statusConfig.icon;
  const priorityConfig = getPriorityConfig(incident.priority || 'Medium');
  const PriorityIcon = priorityConfig.icon;

  return (
    <div className="relative px-6 py-6 border-b border-zinc-200 dark:border-zinc-800 z-20 shrink-0 bg-white dark:bg-[#080808]">

      {/* Mobile Back Button */}
      <div className="lg:hidden mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white font-black uppercase text-[10px] tracking-widest px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft size={14} /> BACK TO LIST
        </button>
      </div>

      {/* Meta Row: Status & Priority */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">

          {/* Status Dropdown */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.border} border transition-colors`}>
            <StatusIcon size={14} className={statusConfig.text} />
            <select
              value={incident.status || 'Open'}
              onChange={(e) => onUpdate({ status: e.target.value })}
              className={`bg-transparent font-black uppercase text-[10px] tracking-widest cursor-pointer outline-none ${statusConfig.text}`}
            >
              {['Open', 'In Progress', 'Monitoring', 'Resolved', 'Closed'].map(s => (
                <option key={s} className="bg-white dark:bg-zinc-900 text-black dark:text-white" value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={12} className={`opacity-50 ${statusConfig.text} pointer-events-none`} />
          </div>

          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

          {/* Priority Dropdown */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${priorityConfig.bg} transition-colors`}>
            <PriorityIcon size={14} className={priorityConfig.color} />
            <select
              value={incident.priority || 'Medium'}
              onChange={(e) => onUpdate({ priority: e.target.value })}
              className={`bg-transparent font-bold uppercase text-[10px] tracking-wider cursor-pointer outline-none ${priorityConfig.color}`}
            >
              {['Critical', 'High', 'Medium', 'Low'].map(p => (
                <option key={p} className="bg-white dark:bg-zinc-900 text-black dark:text-white" value={p}>{p} Priority</option>
              ))}
            </select>
            <ChevronDown size={12} className={`opacity-50 ${priorityConfig.color} pointer-events-none`} />
          </div>

          <div className="hidden sm:block h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

          {/* Create Date */}
          <div className="hidden sm:flex items-center gap-2 text-zinc-400">
            <Calendar size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('en-GB') : '-'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={onGenerateReport} className="flex items-center gap-2 px-4 py-2 text-zinc-500 hover:text-blue-500 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Generate Report">
            <FileText size={16} /> <span className="text-xs font-bold hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* Subject Input (Large) */}
      <div>
        <input
          type="text"
          className="w-full text-2xl md:text-3xl font-black text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700 border-none bg-transparent p-0 focus:ring-0 leading-tight transition-colors"
          value={incident.subject || ''}
          onChange={(e) => onUpdate({ subject: e.target.value })}
          placeholder="Incident Subject..."
        />
      </div>
    </div>
  );
}
