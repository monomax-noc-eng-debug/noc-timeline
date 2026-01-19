import React from 'react';
import {
  X, Calendar, Clock, Sun, Moon,
  CheckCircle2, AlertTriangle, Users, Shield
} from 'lucide-react';
import { FormModal } from '../../../components/FormModal';

/**
 * ShiftDetailModal - Shows full details of a shift handover log
 */
export default function ShiftDetailModal({ log, isOpen, onClose, nocMembers = [] }) {
  if (!log) return null;

  // --- Logic การคำนวณและ Fallback ---

  // 1. ดึงรายชื่อคนรับทราบจาก Log
  const ackList = log.acknowledgedBy || [];

  // 2. สร้างรายการที่จะแสดงผล (Display List)
  // ถ้ามี nocMembers (ทีมทั้งหมด) -> ใช้ nocMembers เพื่อแสดงว่าใครรับแล้ว/ยังไม่รับ
  // ถ้าไม่มี nocMembers -> ใช้ ackList (เฉพาะคนที่รับแล้ว) มาแสดงแทน เพื่อกันไม่ให้หน้าจอว่างเปล่า
  const displayMembers = nocMembers.length > 0
    ? nocMembers
    : ackList.map(name => ({ id: name, name }));

  // 3. คำนวณสถิติ
  const totalCount = displayMembers.length;
  const ackCount = ackList.length;
  const isAllAcked = totalCount > 0 && ackCount >= totalCount;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
      headerClassName="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-[#18181b]"
      header={
        <div className="flex justify-between items-start w-full">
          <div className="flex-1 min-w-0 pr-4">
            {/* Status Chips */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {log.shift === 'Morning' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">
                  <Sun size={12} /> Morning Shift
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full">
                  <Moon size={12} /> Night Shift
                </span>
              )}
              {log.status === 'Normal' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={12} /> Normal
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full animate-pulse">
                  <AlertTriangle size={12} /> Issues
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibolder text-zinc-900 dark:text-white truncate">
              Shift Log Details
            </h2>
          </div>

          {/* ✅ Custom Circular Close Button - Moved to standard flow with shrink-0 */}
          <button
            onClick={onClose}
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-200/50 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all backdrop-blur-sm"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
      }
      bodyClassName="p-8 overflow-y-auto custom-scrollbar space-y-6 max-h-[70vh] bg-white dark:bg-[#18181b]"
      footerClassName="px-8 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
      footer={
        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-[10px] tracking-widest hover:bg-white dark:hover:bg-zinc-800 transition-colors"
        >
          Close
        </button>
      }
    >
      {/* 1. Acknowledgments Section (Names Display) */}
      <div className="bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-lg border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield size={12} /> Acknowledgment Status
          </span>
          <span className={`text-[10px] font-bold ${isAllAcked ? 'text-emerald-600' : 'text-zinc-400'}`}>
            {ackCount} / {totalCount} Acknowledged
          </span>
        </div>

        {/* Name Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {displayMembers.length > 0 ? (
            displayMembers.map((member, i) => {
              const isAcked = ackList.includes(member.name);
              return (
                <div
                  key={member.id || i}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-bold border transition-all ${isAcked
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 opacity-60'
                    }`}
                >
                  {isAcked ? (
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-200 dark:border-zinc-600 shrink-0" />
                  )}
                  <span className="truncate">{member.name}</span>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-2 text-xs text-zinc-400 italic">
              No members list available
            </div>
          )}
        </div>
      </div>

      {/* 2. DateTime Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-lg">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
            <Calendar size={12} className="inline mr-1.5" />Date
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
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-lg">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
            <Clock size={12} className="inline mr-1.5" />Time Logged
          </span>
          <div className="text-sm font-bold text-zinc-900 dark:text-white">
            {log.time}
          </div>
        </div>
      </div>

      {/* 3. On Duty */}
      <div>
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3 flex items-center gap-1.5">
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

      {/* 4. Note */}
      <div>
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">
          Remarks / Note
        </span>
        <div className="bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-lg border border-zinc-100 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap min-h-[80px]">
          {log.note || <span className="text-zinc-400 italic">No additional remarks.</span>}
        </div>
      </div>
    </FormModal>
  );
}
