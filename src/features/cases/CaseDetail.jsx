// file: src/features/cases/CaseDetail.jsx
import React, { useState, useMemo } from 'react';
import { ArrowRight, Clock, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore'; // ✅ 1. Import Store

import TimelineItem from './TimelineItem';
import EventModal from './EventModal';
import ReportModal from './ReportModal';
import IncidentFormModal from './components/IncidentFormModal';
import TicketHeader from './components/ticket/TicketHeader';

export default function CaseDetail({
  incident,
  isLoading,
  onUpdateIncident,
  onAddEvent,
  onDeleteEvent,
  onUpdateEvent,
  onReorderEvent,
  onDeleteIncident,
  onBack
}) {
  const { currentUser } = useStore(); // ✅ 2. ดึง currentUser มาใช้

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState('');

  // ✅ 3. Safe Sorting Logic (Memoized)
  const sortedEvents = useMemo(() => {
    if (!incident?.events) return [];

    return [...incident.events].sort((a, b) => {
      // 1. เรียงตาม Order ที่กำหนดเองก่อน (ถ้ามี)
      if (typeof a.order === 'number' && typeof b.order === 'number' && a.order !== b.order) {
        return a.order - b.order;
      }

      // 2. เรียงตามเวลา (ใหม่ -> เก่า)
      const timeA = `${a.date || '1970-01-01'}T${a.time || '00:00'}`;
      const timeB = `${b.date || '1970-01-01'}T${b.time || '00:00'}`;

      if (timeA < timeB) return 1;
      if (timeA > timeB) return -1;
      return 0;
    });
  }, [incident]);

  // ✅ 4. Early Return (ต้องอยู่หลัง Hooks ทั้งหมด)
  if (!incident) return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-50 dark:bg-[#050505] transition-colors">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center mb-6 shadow-inner">
        <ArrowRight size={32} className="text-zinc-300 dark:text-zinc-600" />
      </div>
      <p className="font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest text-xs">Select an incident to view details</p>
    </div>
  );

  // --- Helper Functions ---

  const handleMoveEvent = (index, direction) => {
    const tempEvents = [...sortedEvents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tempEvents.length) return;
    [tempEvents[index], tempEvents[targetIndex]] = [tempEvents[targetIndex], tempEvents[index]];
    const reorderedEvents = tempEvents.map((ev, i) => ({ ...ev, order: i }));
    if (onReorderEvent) onReorderEvent(incident.id, reorderedEvents);
  };

  const handleUpdate = (updates) => {
    // ✅ 5. แนบชื่อคนแก้ไข (updatedBy) ไปกับข้อมูล Incident หลัก
    const userToRecord = typeof currentUser === 'object' ? currentUser?.name : currentUser;
    onUpdateIncident(incident.id, { ...updates, updatedBy: userToRecord });
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
      grouped[k].forEach(ev => {
        txt += `${ev.time} - ${ev.desc || ev.title}`;
        const imgs = ev.imageUrls || (ev.image ? [ev.image] : []);
        if (imgs.length > 0) {
          imgs.forEach(url => txt += `\n📎 ${url}`);
        }
        txt += '\n';
      });
      txt += `\n`;
    });
    setPreviewText(txt);
    setIsPreviewOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#080808] relative transition-colors duration-300 overflow-hidden">

      {/* Header */}
      <TicketHeader
        incident={incident}
        onUpdate={handleUpdate}
        onBack={onBack}
        onDelete={() => onDeleteIncident(incident.id)}
        onEdit={() => setIsInfoModalOpen(true)}
        onGenerateReport={generateReport}
        onExport={() => {
          const headers = "IncidentDate,Project,Ticket,Type,Status,Subject,CreatedBy,EventDate,EventTime,EventDescription";
          let csvRows = [];
          const incDate = incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('en-GB') : '-';
          const subjectEscaped = (incident.subject || '').replace(/"/g, '""');
          // Check if createdBy is object or string
          const creator = typeof incident.createdBy === 'object' ? incident.createdBy.name : incident.createdBy || '';
          const baseRow = `"${incDate}","${incident.project || ''}","${incident.ticket || ''}","${incident.type || ''}","${incident.status}","${subjectEscaped}","${creator}"`;

          if (sortedEvents && sortedEvents.length > 0) {
            sortedEvents.forEach(ev => {
              const evDate = ev.date ? new Date(ev.date).toLocaleDateString('en-GB') : '-';
              const evTime = ev.time || '-';
              const desc = (ev.desc || ev.title || '').replace(/"/g, '""').replace(/\n/g, ' ');
              csvRows.push(`${baseRow},"${evDate}","${evTime}","${desc}"`);
            });
          } else {
            csvRows.push(`${baseRow},"-","-","-"`);
          }

          const csvContent = [headers, ...csvRows].join("\n");
          const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `Incident_${incident.ticket || 'NO-ID'}_Export.csv`;
          link.click();
        }}
      />

      {/* Timeline Content */}
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
            <div className="absolute top-0 bottom-0 left-[27px] w-[2px] bg-zinc-200 dark:bg-zinc-800 z-0"></div>

            {sortedEvents.map((ev, index) => {
              const showDateHeader = index === 0 || ev.date !== sortedEvents[index - 1].date;
              let dateLabel = '-';
              try {
                dateLabel = ev.date ? new Date(ev.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
              } catch (e) { }

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

      {/* Add Button */}
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
          // ✅ 6. Logic สำคัญ: แนบ createdBy/updatedBy ลงใน Event
          const userToRecord = typeof currentUser === 'object' ? currentUser?.name : currentUser;
          const payload = { ...data };

          if (editingEvent) {
            payload.updatedBy = userToRecord;
            onUpdateEvent(incident.id, editingEvent.id, payload);
          } else {
            payload.createdBy = userToRecord;
            onAddEvent(incident.id, payload);
          }
          setIsModalOpen(false);
        }}
      />
      <ReportModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} text={previewText} incident={incident} />
      <IncidentFormModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        incident={incident}
        onUpdate={handleUpdate}
      />
    </div>
  );
}