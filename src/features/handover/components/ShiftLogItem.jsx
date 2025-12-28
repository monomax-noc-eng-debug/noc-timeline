import React from 'react';
import { Sun, Moon, Check, Pencil, Trash2, AlertCircle } from 'lucide-react';

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
      className={`group relative bg-white dark:bg-[#0a0a0a] rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-l-4 ${shiftGradient}`}
    >
      {/* Background Shift Indicator (Subtle) */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isMorning ? 'from-orange-500' : 'from-indigo-500'} opacity-[0.03] rounded-bl-full pointer-events-none`} />

      {/* ✅ Progress bar at bottom (thin line) */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100 dark:bg-zinc-800">
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

      <div className="flex px-3 py-2 gap-3 items-center relative">
        {/* Left: Date & Time & Icon */}
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-zinc-100 dark:border-zinc-800">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMorning ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
            {isMorning ? <Sun size={14} /> : <Moon size={14} />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-zinc-900 dark:text-white leading-none">
              {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </span>
            <span className="text-[9px] font-bold text-zinc-400 font-mono mt-0.5 leading-none">
              {log.time}
            </span>
          </div>
        </div>

        {/* Middle: Note & Status */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {log.status !== 'Normal' && (
            <div className="shrink-0 px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-[8px] font-black text-red-600 dark:text-red-400 uppercase tracking-wide">
              Issue
            </div>
          )}
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
            {log.note || <span className="text-zinc-400 italic">No remarks.</span>}
          </p>
        </div>

        {/* Right: On Duty & Avatars & Actions */}
        <div className="flex items-center gap-4 shrink-0 pl-3 border-l border-zinc-100 dark:border-zinc-800">

          {/* On Duty */}
          <div className="hidden md:flex flex-col items-end gap-0.5">
            <span className="text-[8px] font-black text-zinc-300 uppercase tracking-wider">Duty</span>
            <div className="flex -space-x-1">
              {log.onDuty && log.onDuty.length > 0 ? (
                log.onDuty.map((u, i) => (
                  <div key={i} title={u} className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-white dark:border-black flex items-center justify-center text-[7px] font-black text-zinc-500 uppercase">
                    {u.charAt(0)}
                  </div>
                ))
              ) : <span>-</span>}
            </div>
          </div>

          {/* Ack Avatars */}
          <div className="flex gap-1">
            {nocMembers.map((member, i) => {
              const isAck = (log.acknowledgedBy || []).includes(member.name);
              const currentName = typeof currentUser === 'object' ? currentUser?.name : currentUser;
              const isMe = currentName === member.name;

              return (
                <div
                  key={member.id || i}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMe) onAck(log, member.name);
                  }}
                  className={`
                     w-5 h-5 rounded-full border flex items-center justify-center text-[7px] font-black transition-all duration-200
                     ${isMe ? 'cursor-pointer hover:scale-110 shadow-sm' : 'cursor-default'}
                     ${isAck
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent'
                      : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'}
                     ${isMe && !isAck ? 'ring-1 ring-blue-500/50 animate-pulse' : ''}
                   `}
                  title={`${member.name} ${isAck ? '(Acknowledged)' : '(Pending)'}`}
                >
                  {isAck ? <Check size={8} strokeWidth={4} /> : member.name.charAt(0)}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(log); }}
              className="p-1 text-zinc-400 hover:text-blue-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded"
            >
              <Pencil size={10} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
              className="p-1 text-zinc-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded"
            >
              <Trash2 size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}