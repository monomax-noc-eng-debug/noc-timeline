import React from 'react';
import { Trash2, AlertCircle, PlayCircle, CheckCircle2, XCircle, Clock, Calendar, User, Hash } from 'lucide-react';

const getStatusMeta = (status) => {
  switch (status) {
    case 'Open': return {
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      icon: AlertCircle,
      gradient: 'from-red-500 to-rose-600'
    };
    case 'In Progress': return {
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      icon: PlayCircle,
      gradient: 'from-blue-500 to-indigo-600'
    };
    case 'Monitoring': return {
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      icon: Clock,
      gradient: 'from-orange-500 to-amber-600'
    };
    case 'Pending': return {
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      icon: Clock,
      gradient: 'from-amber-500 to-yellow-600'
    };
    case 'Succeed': return {
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600'
    };
    case 'Resolved': return {
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600'
    };
    case 'Closed': return {
      color: 'bg-zinc-400',
      bgColor: 'bg-zinc-100 dark:bg-zinc-800',
      textColor: 'text-zinc-500 dark:text-zinc-400',
      icon: XCircle,
      gradient: 'from-zinc-400 to-zinc-500'
    };
    default: return {
      color: 'bg-zinc-400',
      bgColor: 'bg-zinc-100 dark:bg-zinc-800',
      textColor: 'text-zinc-600 dark:text-zinc-400',
      icon: AlertCircle,
      gradient: 'from-zinc-400 to-zinc-500'
    };
  }
};

const getPriorityMeta = (priority) => {
  switch (priority) {
    case 'Critical': return { label: 'CRIT', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    case 'High': return { label: 'HIGH', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    case 'Medium': return { label: 'MED', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    case 'Low': return { label: 'LOW', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    default: return { label: 'MED', color: 'text-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-900' };
  }
};

const IncidentCard = React.memo(({ incident, isSelected, onClick, onDelete }) => {
  const { color, bgColor, textColor, icon: Icon, gradient } = getStatusMeta(incident.status);
  const priority = getPriorityMeta(incident.priority || 'Medium');

  // Format date
  const dateStr = incident.createdAt
    ? new Date(incident.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    : '-';

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
      {/* Selection Glow */}
      {isSelected && (
        <div className={`absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b ${gradient}`} />
      )}

      {/* Top Row: Meta & Type */}
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <span className={`w-1.5 h-1.5 rounded-full ${color} ${incident.status === 'Open' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`} />
            <span className="text-[8px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">
              {incident.project || 'SYSTEM'}
            </span>
          </div>

          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border border-transparent ${incident.type === 'Incident' ? 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20' :
            incident.type === 'Request' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20' :
              'bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/20'
            }`}>
            {incident.type || 'Incident'}
          </span>

          {/* Priority Badge */}
          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-lg border border-transparent ${priority.bg} ${priority.color}`}>
            {priority.label}
          </span>
        </div>

        {/* Delete Button (Hover Reveal) */}
        {!isSelected && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(incident.id); }}
            className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            title="Delete incident"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Subject */}
      <h3 className={`font-black text-xs leading-snug mb-3 line-clamp-2 min-h-[2rem] transition-colors ${isSelected ? 'text-black dark:text-white' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white'}`}>
        {incident.subject || 'Untitled Incident'}
      </h3>

      {/* Footer: Ticket & Meta */}
      <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-zinc-400">
            <Hash size={10} />
            <span className="text-[9px] font-mono font-bold uppercase truncate max-w-[80px]">
              {incident.ticket || 'N/A'}
            </span>
          </div>
          <span className="text-[9px] text-zinc-300 font-bold tracking-tighter uppercase">{dateStr}</span>
        </div>

        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${bgColor}`}>
          <Icon size={10} className={textColor} />
          <span className={`text-[8px] font-black uppercase tracking-tight ${textColor}`}>
            {incident.status}
          </span>
        </div>
      </div>
    </div>
  );
});

export default IncidentCard;
