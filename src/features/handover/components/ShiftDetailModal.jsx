import React from 'react';
import { X, Calendar, Clock, User, Sun, Moon, CheckCircle2, AlertTriangle, Users, Shield } from 'lucide-react';

/**
 * ShiftDetailModal - Shows full details of a shift handover log
 */
export default function ShiftDetailModal({ log, isOpen, onClose, nocMembers }) {
  if (!isOpen || !log) return null;

  // Calculate acknowledgment stats
  const totalMembers = nocMembers.length;
  const ackedCount = (log.acknowledgedBy || []).length;
  const ackPercentage = totalMembers > 0 ? Math.round((ackedCount / totalMembers) * 100) : 0;
  const isFullyAcked = ackedCount >= totalMembers;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#18181b] rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-[#18181b]">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {log.shift === 'Morning' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">
                    <Sun size={12} /> Morning Shift
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full">
                    <Moon size={12} /> Night Shift
                  </span>
                )}
                {log.status === 'Normal' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} /> Normal
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full animate-pulse">
                    <AlertTriangle size={12} /> Issues
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                Shift Log Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white rounded-full transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">

          {/* ✅ Acknowledgment Progress */}
          <div className={`p-4 rounded-2xl border-2 ${isFullyAcked
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                <Shield size={12} /> Acknowledgment Status
              </span>
              <span className={`text-sm font-black ${isFullyAcked ? 'text-emerald-600' : 'text-amber-600'}`}>
                {ackPercentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 rounded-full ${isFullyAcked ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                style={{ width: `${ackPercentage}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] font-bold text-zinc-500">
              {ackedCount} of {totalMembers} team members acknowledged
            </div>
          </div>

          {/* DateTime Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                <Calendar size={10} className="inline mr-1" />Date
              </span>
              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                {new Date(log.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                <Clock size={10} className="inline mr-1" />Time Logged
              </span>
              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                {log.time}
              </div>
            </div>
          </div>

          {/* On Duty */}
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3 flex items-center gap-1">
              <Users size={12} /> On Duty
            </span>
            <div className="flex flex-wrap gap-2">
              {log.onDuty && log.onDuty.length > 0 ? (
                log.onDuty.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 pl-1 pr-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-sm">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-white dark:to-zinc-100 text-white dark:text-black flex items-center justify-center text-[10px] font-black">
                      {name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{name}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-zinc-400 italic">No staff assigned</span>
              )}
            </div>
          </div>

          {/* Note */}
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">
              Remarks / Note
            </span>
            <div className="bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap min-h-[80px]">
              {log.note || <span className="text-zinc-400 italic">No additional remarks.</span>}
            </div>
          </div>

          {/* Acknowledged By */}
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">
              Acknowledged By
            </span>
            <div className="flex flex-wrap gap-2">
              {nocMembers.map((member, i) => {
                const isAcked = (log.acknowledgedBy || []).includes(member.name);
                return (
                  <div
                    key={member.id || i}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${isAcked
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 opacity-60'
                      }`}
                  >
                    {isAcked ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                    {member.name}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:bg-white dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}