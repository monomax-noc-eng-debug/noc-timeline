import React, { useState } from 'react';
import {
  ArrowRight, Clock, Plus
} from 'lucide-react';

import TimelineItem from './TimelineItem';
import EventModal from './EventModal';
import ReportModal from './ReportModal';
import TicketHeader from './components/ticket/TicketHeader';
import TicketInfo from './components/ticket/TicketInfo';
import TicketDetails from './components/ticket/TicketDetails';

export default function CaseDetail({
  incident,
  isLoading,
  onUpdateIncident,
  onAddEvent,
  onDeleteEvent,
  onUpdateEvent,
  onReorderEvent,
  onBack
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState('');

  // State: No Selection
  if (!incident) return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-50 dark:bg-[#050505] transition-colors">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center mb-6 shadow-inner">
        <ArrowRight size={32} className="text-zinc-300 dark:text-zinc-600" />
      </div>
      <p className="font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest text-xs">Select an incident to view details</p>
    </div>
  );

  // Sorting Logic
  const sortedEvents = [...(incident.events || [])].sort((a, b) => {
    if (typeof a.order === 'number' && typeof b.order === 'number' && a.order !== b.order) {
      return a.order - b.order;
    }
    const dateA = new Date(`${a.date || '1970-01-01'}T${a.time || '00:00'}`).getTime();
    const dateB = new Date(`${b.date || '1970-01-01'}T${b.time || '00:00'}`).getTime();
    return dateA - dateB;
  });

  const handleMoveEvent = (index, direction) => {
    const tempEvents = [...sortedEvents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tempEvents.length) return;
    [tempEvents[index], tempEvents[targetIndex]] = [tempEvents[targetIndex], tempEvents[index]];
    const reorderedEvents = tempEvents.map((ev, i) => ({ ...ev, order: i }));
    if (onReorderEvent) onReorderEvent(incident.id, reorderedEvents);
  };

  const handleUpdate = (updates) => {
    onUpdateIncident(incident.id, updates);
  };

  const generateReport = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-').toLowerCase();

    const grouped = {};
    sortedEvents.forEach(ev => {
      const d = ev.date ? new Date(ev.date) : new Date();
      const key = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ev);
    });

    let txt = `Project: ${incident.project || '-'}\nSubject: ${incident.type || 'Incident'} | ${incident.subject || '-'} | ${dateStr}\nStatus: ${incident.status || '-'}\nTicket: ${incident.ticket || '-'}\nImpact: ${incident.impact || '-'}\nRoot Cause: ${incident.root_cause || '-'}\nAction Taken: ${incident.action || '-'}\n\n`;
    Object.keys(grouped).forEach(k => {
      txt += `${k}\n`;
      grouped[k].forEach(ev => txt += `${ev.time} - ${ev.desc || ev.title}\n`);
      txt += `\n`;
    });
    setPreviewText(txt);
    setIsPreviewOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#080808] relative transition-colors duration-300 overflow-hidden">

      {/* 🎫 Ticket Components (Maintained in /components/ticket) */}
      <TicketHeader
        incident={incident}
        onUpdate={handleUpdate}
        onBack={onBack}
        onGenerateReport={generateReport}
      />

      <TicketInfo
        incident={incident}
        onUpdate={handleUpdate}
      />

      <TicketDetails
        incident={incident}
        onUpdate={handleUpdate}
      />

      {/* --- Timeline Section --- */}
      <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar bg-zinc-50/50 dark:bg-black relative min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
            <div className="w-10 h-10 border-4 border-zinc-200 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Loading Timeline...</span>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-300 dark:text-zinc-700 pb-20">
            <Clock size={48} className="mb-4 opacity-50" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">No timeline events recorded</span>
            <button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className="mt-6 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-black uppercase shadow-sm hover:shadow-md hover:border-black dark:hover:border-white transition-all">
              Start Logging
            </button>
          </div>
        ) : (
          <div className="flex flex-col pb-24 relative max-w-3xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute top-0 bottom-0 left-[31px] w-[2px] bg-zinc-200 dark:bg-zinc-800 z-0"></div>

            {sortedEvents.map((ev, index) => {
              const showDateHeader = index === 0 || ev.date !== sortedEvents[index - 1].date;
              const dateLabel = ev.date ? new Date(ev.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
              return (
                <TimelineItem
                  key={ev.id}
                  event={ev}
                  index={index}
                  isLastItem={index === sortedEvents.length - 1}
                  showDateHeader={showDateHeader}
                  dateLabel={dateLabel}
                  onMove={handleMoveEvent}
                  onEdit={(ev) => { setEditingEvent(ev); setIsModalOpen(true); }}
                  onDelete={(eid) => onDeleteEvent(incident.id, eid)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
        className="absolute bottom-8 right-8 bg-black dark:bg-white text-white dark:text-black w-14 h-14 rounded-full shadow-2xl hover:shadow-blue-500/20 hover:scale-105 transition-all z-30 flex items-center justify-center active:scale-95 group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modals */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingEvent}
        onSubmit={(data) => {
          if (editingEvent) onUpdateEvent(incident.id, editingEvent.id, data);
          else onAddEvent(incident.id, data);
          setIsModalOpen(false);
        }}
      />
      <ReportModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} text={previewText} incident={incident} />
    </div>
  );
}