import React from 'react';
import { Sun, Moon, Clock, User, Check, Pencil, Trash2, AlertCircle } from 'lucide-react';

/**
 * ShiftLogItem - Individual log entry in the handover list
 * Shows date, time, shift type, notes, on-duty staff, and acknowledgment status
 */
export default function ShiftLogItem({
  log,
  currentUser,
  nocMembers,
  onView,
  onEdit,
  onDelete,
  onAck,
  getAckStats
}) {
  // ✅ Calculate acknowledgment progress
  const ackStats = getAckStats ? getAckStats(log) : {
    total: nocMembers.length,
    acked: (log.acknowledgedBy || []).length,
    percentage: 0,
    isComplete: false
  };

  if (!ackStats.percentage && nocMembers.length > 0) {
    ackStats.percentage = Math.round((ackStats.acked / ackStats.total) * 100);
    ackStats.isComplete = ackStats.acked >= ackStats.total;
  }

  // Determine Gradient based on shift
  const isMorning = log.shift === 'Morning';
  const shiftGradient = isMorning
    ? 'from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 border-l-orange-500'
    : 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 border-l-indigo-500';

  return (
    <div
      onClick={onView}
      className={`group relative bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-l-4 ${shiftGradient}`}
    >
      {/* Background Shift Indicator (Subtle) */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isMorning ? 'from-orange-500' : 'from-indigo-500'} opacity-[0.03] rounded-bl-full pointer-events-none`} />

      {/* ✅ Progress bar at bottom (thin line) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full transition-all duration-500 ${ackStats.isComplete
            ? 'bg-emerald-500'
            : ackStats.percentage > 50
              ? 'bg-blue-500'
              : ackStats.percentage > 0
                ? 'bg-amber-500'
                : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          style={{ width: `${ackStats.percentage}%` }}
        />
      </div>

      <div className="flex flex-col md:flex-row p-5 gap-6 relative">

        {/* Left: Date & Time Block */}
        <div className="flex md:flex-col items-center md:items-start gap-3 md:w-32 shrink-0 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 pb-4 md:pb-0 md:pr-4">
          <div className={`p-2.5 rounded-xl shrink-0 ${isMorning ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
            {isMorning ? <Sun size={18} /> : <Moon size={18} />}
          </div>
          <div>
            <span className="block text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wide">
              {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </span>
            <span className="block text-[10px] font-bold text-zinc-400 font-mono mt-0.5">
              {log.time}
            </span>
            <div className={`mt-2 text-[9px] font-bold uppercase tracking-wider ${ackStats.isComplete ? 'text-emerald-500' : 'text-zinc-400'}`}>
              {ackStats.acked}/{ackStats.total} Ack
            </div>
          </div>
        </div>

        {/* Middle: Note & On-Duty */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="mb-3">
            {log.status !== 'Normal' && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">
                <AlertCircle size={10} /> Issue Reported
              </div>
            )}
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
              {log.note || <span className="text-zinc-400 italic">No remarks recorded.</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <div className="flex -space-x-1.5">
              {log.onDuty && log.onDuty.length > 0 ? (
                log.onDuty.map((u, i) => (
                  <div key={i} title={u} className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-white dark:border-black flex items-center justify-center text-[8px] font-black text-zinc-500 uppercase">
                    {u.charAt(0)}
                  </div>
                ))
              ) : (
                <span className="text-[10px] text-zinc-300">-</span>
              )}
            </div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider pl-1">On Duty</span>
          </div>
        </div>

        {/* Right: Avatars & Actions */}
        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 pt-4 md:pt-0">

          {/* Avatar circles grid */}
          <div className="flex md:grid md:grid-cols-2 gap-1.5">
            {nocMembers.map((member, i) => {
              const isAck = (log.acknowledgedBy || []).includes(member.name);
              const isMe = currentUser === member.name;

              return (
                <div
                  key={member.id || i}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMe) onAck(log, member.name);
                  }}
                  className={`
                    w-7 h-7 rounded-full border flex items-center justify-center text-[9px] font-black transition-all duration-200
                    ${isMe ? 'cursor-pointer hover:scale-110 shadow-sm' : 'cursor-default'}
                    ${isAck
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent'
                      : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'}
                    ${isMe && !isAck ? 'ring-2 ring-blue-500/50 animate-pulse' : ''}
                  `}
                  title={`${member.name} ${isAck ? '(Acknowledged)' : '(Pending)'}`}
                >
                  {isAck ? <Check size={10} strokeWidth={4} /> : member.name.charAt(0)}
                </div>
              );
            })}
          </div>

          {/* Action Buttons (Reveal on hover for desktop) */}
          <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(log); }}
              className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors bg-zinc-50 dark:bg-zinc-900 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Edit"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
              className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors bg-zinc-50 dark:bg-zinc-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}