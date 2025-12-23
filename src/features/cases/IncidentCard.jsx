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

export default function IncidentCard({ incident, isSelected, onClick, onDelete }) {
  const { color, bgColor, textColor, icon: Icon, gradient } = getStatusMeta(incident.status);

  // Format date
  const dateStr = incident.createdAt
    ? new Date(incident.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    : '-';

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${isSelected
          ? 'bg-white dark:bg-[#0a0a0a] border-zinc-900 dark:border-zinc-500 shadow-xl scale-[1.01] z-10'
          : 'bg-white dark:bg-[#111] border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:-translate-y-0.5'
        }
      `}
    >
      {/* Selection Glow */}
      {isSelected && (
        <div className={`absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b ${gradient}`} />
      )}

      {/* Top Row: Meta & Actions */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Indicator (Pulse) */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <span className={`w-2 h-2 rounded-full ${color} ${incident.status === 'Open' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`} />
            <span className="text-[9px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">
              {incident.project || 'SYSTEM'}
            </span>
          </div>

          <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full border border-transparent ${incident.type === 'Incident' ? 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20' :
            incident.type === 'Request' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20' :
              'bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/20'
            }`}>
            {incident.type || 'Incident'}
          </span>
        </div>

        {/* Delete Button (Hover Reveal) */}
        {!isSelected && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(incident.id); }}
            className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transform translate-x-2 group-hover:translate-x-0"
            title="Delete incident"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Subject */}
      <h3 className={`font-black text-sm leading-snug mb-4 line-clamp-2 min-h-[2.5rem] transition-colors ${isSelected ? 'text-black dark:text-white' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white'}`}>
        {incident.subject || 'Untitled Incident'}
      </h3>

      {/* Meta Labels */}
      <div className="flex items-center gap-4 mb-4 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
        {incident.createdBy && (
          <span className="flex items-center gap-1.5">
            <User size={12} className="text-zinc-300" /> {incident.createdBy.split(' ')[0]}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar size={12} className="text-zinc-300" /> {dateStr}
        </span>
      </div>

      {/* Footer: Ticket & Status */}
      <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Hash size={12} />
          <span className="text-[10px] font-mono font-bold">
            {incident.ticket || 'NO-TICKET'}
          </span>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgColor}`}>
          <Icon size={12} className={textColor} />
          <span className={`text-[9px] font-black uppercase tracking-wide ${textColor}`}>
            {incident.status}
          </span>
        </div>
      </div>

    </div>
  );
}