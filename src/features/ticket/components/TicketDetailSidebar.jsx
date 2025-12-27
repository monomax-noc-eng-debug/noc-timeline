import React, { memo } from 'react';
import { X, User, Tag, Info, CheckCircle } from 'lucide-react';

const Section = memo(({ title, icon: Icon, children }) => (
  <section className="space-y-2">
    <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-400 tracking-wide border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
      <Icon size={12} /> {title}
    </h4>
    {children}
  </section>
));
Section.displayName = 'Section';

export default function TicketDetailSidebar({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white dark:bg-zinc-950 shadow-xl z-50 border-l border-zinc-200 dark:border-zinc-800 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <h2 className="font-bold text-base text-zinc-900 dark:text-white">Ticket Detail</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* Title Section */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-wide">
            <Tag size={11} /> {ticket.category || 'General'} / {ticket.subCategory || 'Other'}
          </div>
          <h3 className="text-base font-bold leading-snug text-zinc-900 dark:text-white">{ticket.shortDesc}</h3>
          <p className="text-xs font-mono text-zinc-400 font-medium">#{ticket.ticketNumber}</p>
        </div>

        {/* Description */}
        <Section title="Description & Detail" icon={Info}>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {ticket.detail || 'No additional details'}
          </p>
        </Section>

        {/* Action & Resolution */}
        <Section title="Action & Resolution" icon={CheckCircle}>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Action Taken</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-200">{ticket.action || '-'}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Resolved Detail</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-200">{ticket.resolvedDetail || '-'}</p>
            </div>
          </div>
        </Section>

        {/* Assignee Footer */}
        <div className="flex items-center gap-2.5 p-3 bg-zinc-900 dark:bg-white rounded-xl text-white dark:text-zinc-900">
          <div className="w-8 h-8 rounded-full bg-zinc-700 dark:bg-zinc-100 flex items-center justify-center font-bold text-sm">
            {ticket.assign?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase opacity-60 tracking-wide">Assigned To</p>
            <p className="text-sm font-bold">{ticket.assign || 'Unassigned'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}