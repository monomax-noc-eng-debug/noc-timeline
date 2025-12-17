import React, { useState } from 'react';
import {
  Plus, ArrowRight, ArrowLeft, FileText, ChevronDown,
  AlertCircle, CheckCircle2, Clock, PlayCircle, XCircle, User
} from 'lucide-react';

import TimelineItem from './TimelineItem';
import EventModal from './EventModal';
import ReportModal from './ReportModal';

export default function CaseDetail({
  incident,
  isLoading, // ✅ รับ prop isLoading
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

  const inputClasses = "w-full bg-transparent border-b-2 border-gray-200 dark:border-zinc-700 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white font-bold text-xs text-gray-900 dark:text-white transition-all pb-0.5 placeholder-gray-400 dark:placeholder-zinc-600 outline-none";
  const labelClasses = "block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5";
  const textareaClasses = "w-full text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 rounded-lg p-2 border-2 border-gray-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-white transition-all resize-none placeholder-gray-400 dark:placeholder-zinc-600 outline-none";

  if (!incident) return (
    <div className="lg:col-span-9 flex flex-col items-center justify-center h-full bg-white dark:bg-zinc-900 transition-colors">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 flex items-center justify-center mb-4">
        <ArrowRight size={24} className="text-gray-400 dark:text-gray-500" />
      </div>
      <p className="font-bold text-gray-500 dark:text-gray-400">Select an incident to view details</p>
    </div>
  );

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

  const getStatusStyle = (s) => {
    const styles = {
      'Open': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
      'In Progress': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
      'Monitoring': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
      'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
      'Closed': 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
    };
    return styles[s] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case 'Open': return <AlertCircle size={14} />;
      case 'In Progress': return <PlayCircle size={14} />;
      case 'Monitoring': return <Clock size={14} />;
      case 'Resolved': return <CheckCircle2 size={14} />;
      case 'Closed': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 relative transition-colors duration-300 overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 z-10 shadow-sm shrink-0">
        <div className="lg:hidden mb-4 -mt-1">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white font-bold uppercase text-xs tracking-widest p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={16} /> <span className="text-sm">BACK TO LIST</span>
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-12 gap-x-4 gap-y-3 mb-3 items-end">
          <div className="group col-span-2 lg:col-span-2">
            <label className={labelClasses}>Project</label>
            <input type="text" className={inputClasses} value={incident.project || ''} onChange={(e) => onUpdateIncident(incident.id, { project: e.target.value })} />
          </div>

          <div className="group col-span-2 lg:col-span-1">
            <label className={labelClasses}>Type</label>
            <select value={incident.type || 'Incident'} onChange={(e) => onUpdateIncident(incident.id, { type: e.target.value })} className={`${inputClasses} cursor-pointer appearance-none`}>
              <option className="dark:bg-zinc-800" value="Incident">Incident</option>
              <option className="dark:bg-zinc-800" value="Request">Request</option>
              <option className="dark:bg-zinc-800" value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="group col-span-2 lg:col-span-2">
            <label className={labelClasses}>Ticket ID</label>
            <input type="text" className={`${inputClasses} font-mono`} value={incident.ticket || ''} onChange={(e) => onUpdateIncident(incident.id, { ticket: e.target.value })} />
          </div>

          <div className="group col-span-2 lg:col-span-2">
            <label className={labelClasses}>Status</label>
            <div className={`relative flex items-center h-[30px] w-full rounded-lg border-2 transition-all px-2 ${getStatusStyle(incident.status)}`}>
              <div className="mr-2 flex-none">{getStatusIcon(incident.status)}</div>
              <select value={incident.status || 'Open'} onChange={(e) => onUpdateIncident(incident.id, { status: e.target.value })} className="w-full bg-transparent font-black uppercase text-[10px] tracking-widest cursor-pointer appearance-none outline-none z-10">
                {['Open', 'In Progress', 'Monitoring', 'Resolved', 'Completed', 'Closed'].map(s => (
                  <option key={s} className="bg-white dark:bg-zinc-900 text-black dark:text-white" value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 opacity-50 pointer-events-none" />
            </div>
          </div>

          <div className="col-span-4 lg:col-span-3">
            <label className={labelClasses}>Subject / Alert</label>
            <div className="flex items-center gap-2 mb-1">
              {incident.createdBy && (
                <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  <User size={10} /> Created by {incident.createdBy}
                </span>
              )}
            </div>
            <input type="text" className="w-full text-lg font-black text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-700 border-none bg-transparent p-0 focus:ring-0 leading-tight" value={incident.subject || ''} onChange={(e) => onUpdateIncident(incident.id, { subject: e.target.value })} placeholder="Subject..." />
          </div>

          <div className="col-span-4 flex justify-end lg:col-span-1 lg:justify-start">
            <button onClick={generateReport} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1.5 border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 rounded-lg lg:mb-1 mt-1 lg:mt-0" title="View Report">
              <FileText size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['impact', 'root_cause', 'action'].map((field) => (
            <div key={field}>
              <label className={labelClasses}>{field.replace('_', ' ')}</label>
              <textarea className={`${textareaClasses} h-[60px]`} value={incident[field] || ''} onChange={(e) => onUpdateIncident(incident.id, { [field]: e.target.value })} placeholder="..." />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 custom-scrollbar bg-gray-50 dark:bg-zinc-950 relative transition-colors min-h-0">

        {/* ✅ Check Loading Here */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading Timeline...</span>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50 pb-20">
            <Clock size={48} className="mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">No timeline events yet</span>
          </div>
        ) : (
          <div className="flex flex-col pb-20 relative">
            <div className="absolute top-0 bottom-0 left-[26px] sm:left-[43px] w-[3px] bg-gray-200 dark:bg-zinc-800 z-0"></div>
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

      {/* FAB */}
      <button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className="absolute bottom-6 right-6 bg-black dark:bg-white text-white dark:text-black w-14 h-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 border-4 border-white dark:border-zinc-800 transition-all z-20 flex items-center justify-center active:scale-95">
        <Plus size={24} strokeWidth={3} />
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
      <ReportModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} text={previewText} />
    </div>
  );
}