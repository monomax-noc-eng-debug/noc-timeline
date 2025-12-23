// src/features/ticket/components/TicketDetailSidebar.jsx
import React from 'react';
import { X, User, Tag, Info, CheckCircle } from 'lucide-react';

export default function TicketDetailSidebar({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-[#050505] shadow-2xl z-50 border-l border-zinc-200 dark:border-zinc-800 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
        <h2 className="font-black uppercase tracking-tighter text-xl dark:text-white">Ticket Detail</h2>
        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-400">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* หัวข้อและเลขตั๋ว */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
            <Tag size={12} /> {ticket.category || 'General'} / {ticket.subCategory || 'Other'}
          </div>
          <h3 className="text-lg font-bold leading-snug dark:text-white">{ticket.shortDesc}</h3>
          <p className="text-xs font-mono text-zinc-400 font-bold tracking-tighter uppercase">{ticket.ticketNumber}</p>
        </div>

        {/* รายละเอียดจากคอลัมน์ Detail */}
        <section className="space-y-3">
          <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <Info size={14} /> Description & Detail
          </h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {ticket.detail || 'ไม่มีรายละเอียดเพิ่มเติม'}
          </p>
        </section>

        {/* การแก้ไขปัญหา (Action & Resolution) */}
        <section className="space-y-3">
          <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <CheckCircle size={14} /> Action & Resolution
          </h4>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Action Taken</p>
              <p className="text-sm dark:text-zinc-200">{ticket.action || '-'}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Resolved Detail</p>
              <p className="text-sm dark:text-zinc-200">{ticket.resolvedDetail || '-'}</p>
            </div>
          </div>
        </section>

        {/* ข้อมูลผู้รับผิดชอบ (Assignee) */}
        <div className="flex items-center gap-3 p-4 bg-zinc-900 dark:bg-white rounded-2xl text-white dark:text-black">
          <div className="w-10 h-10 rounded-full bg-zinc-800 dark:bg-zinc-100 flex items-center justify-center font-black">
            {ticket.assign?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">Assigned To</p>
            <p className="text-sm font-bold">{ticket.assign || 'Unassigned'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}