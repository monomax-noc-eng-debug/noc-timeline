import React, { useState, useMemo, useRef } from 'react';
import { History, Activity, PenSquare, File, Calendar, Tag, Hash, Download } from 'lucide-react';
import { useStore } from '../../store/useStore';
import TimelineItem from './TimelineItem';
import EventModal from './EventModal';
import ReportModal from './ReportModal';
import IncidentFormModal from './components/IncidentFormModal';
import { cn } from "@/lib/utils";

// Helper for Detail Item
const DetailItem = ({ label, value, icon: Icon, className }) => (
  <div className={cn("space-y-1", className)}>
    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-wide">
      {Icon && <Icon size={12} strokeWidth={2} />}
      {label}
    </div>
    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words leading-relaxed">
      {value || '-'}
    </div>
  </div>
);

export default function IncidentDetailPanel({
  incident,
  isLoading,
  onUpdateIncident,
  onAddEvent,
  onDeleteEvent,
  onUpdateEvent,
  onReorderEvent,
  onDeleteIncident,
  onBack,
  canEdit
}) {
  const { currentUser } = useStore();
  const listEndRef = useRef(null);
  const containerRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState('');

  // Sorting Logic
  const sortedEvents = useMemo(() => {
    if (!incident?.events) return [];
    return [...incident.events].sort((a, b) => {
      // Custom Order Override
      if (typeof a.order === 'number' && typeof b.order === 'number' && a.order !== b.order) {
        return a.order - b.order;
      }
      // Date Time Descending
      const timeA = `${a.date || '1970-01-01'}T${a.time || '00:00'}`;
      const timeB = `${b.date || '1970-01-01'}T${b.time || '00:00'}`;
      if (timeA < timeB) return 1;
      if (timeA > timeB) return -1;
      return 0;
    });
  }, [incident]);

  // Empty State for No Selection
  if (!incident) return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-50 dark:bg-[#09090b] transition-colors relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-zinc-200/50 dark:bg-grid-zinc-800/20 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-14 h-14 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 shadow-sm">
          <Activity size={24} className="text-[#0078D4]" />
        </div>
        <p className="font-semibold text-zinc-600 dark:text-zinc-400 text-sm">Select an incident to view details</p>
      </div>
    </div>
  );

  const handleMoveEvent = (index, direction) => {
    const tempEvents = [...sortedEvents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tempEvents.length) return;
    [tempEvents[index], tempEvents[targetIndex]] = [tempEvents[targetIndex], tempEvents[index]];
    const reorderedEvents = tempEvents.map((ev, i) => ({ ...ev, order: i }));
    if (onReorderEvent) onReorderEvent(incident.id, reorderedEvents);
  };

  const handleUpdate = (updates) => {
    const userToRecord = typeof currentUser === 'object' ? currentUser?.name : currentUser;
    onUpdateIncident(incident.id, { ...updates, updatedBy: userToRecord });
  };

  // CSV Export Logic
  const handleExportCSV = async () => {
    if (!incident) return;
    try {
      const escapeCsv = (field) => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      const sortedForExport = [...(incident.events || [])].sort((a, b) => {
        const timeA = `${a.date || '1970-01-01'}T${a.time || '00:00'}`;
        const timeB = `${b.date || '1970-01-01'}T${b.time || '00:00'}`;
        return timeA < timeB ? -1 : (timeA > timeB ? 1 : 0);
      });

      const metaRows = [
        `Incident,${escapeCsv(incident.subject)}`,
        `Project,${escapeCsv(incident.project)}`,
        `Ticket ID,${escapeCsv(incident.ticket)}`,
        `Current Status,${escapeCsv(incident.status)}`,
        `Export Date,${new Date().toLocaleString('th-TH')}`,
        ''
      ];

      const headers = ['Date', 'Time', 'Status', 'Description', 'Images'].join(',');

      const dataRows = sortedForExport.map(ev => {
        const dateStr = ev.date ? new Date(ev.date).toLocaleDateString('en-GB') : '-';
        const timeStr = ev.time || '-';
        const statusStr = escapeCsv(ev.statusOnLine || '');
        const descStr = escapeCsv(ev.desc || ev.title || '');
        const imgStr = escapeCsv((ev.imageUrls || []).join(' ; '));
        return [dateStr, timeStr, statusStr, descStr, imgStr].join(',');
      });

      const csvContent = '\uFEFF' + [...metaRows, headers, ...dataRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Incident_${incident.ticket || 'Log'}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export CSV. Please check console.");
    }
  };

  const generateReport = () => {
    if (!incident) return;
    let report = `[INCIDENT REPORT]\n`;
    report += `Project : ${incident.project || '-'}\n`;
    report += `Ticket  : ${incident.ticket || '-'}\n`;
    report += `Subject : ${incident.subject || '-'}\n`;
    report += `Status  : ${incident.status || '-'}\n\n`;
    report += `[DETAILS]\n`;
    report += `Impact     : ${incident.impact || '-'}\n`;
    report += `Root Cause : ${incident.root_cause || '-'}\n`;
    report += `Action     : ${incident.action || '-'}\n\n`;
    report += `[TIMELINE]\n`;

    const sorted = [...(incident.events || [])].sort((a, b) => {
      const timeA = `${a.date || '1970-01-01'}T${a.time || '00:00'}`;
      const timeB = `${b.date || '1970-01-01'}T${b.time || '00:00'}`;
      return timeA < timeB ? -1 : (timeA > timeB ? 1 : 0);
    });

    let lastDate = '';
    sorted.forEach(ev => {
      if (ev.date !== lastDate) {
        report += `\n--- ${ev.date ? new Date(ev.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown Date'} ---\n`;
        lastDate = ev.date;
      }
      const timeStr = ev.time || '--:--';
      const statusStr = ev.statusOnLine ? ` [${ev.statusOnLine}]` : '';
      report += `${timeStr}${statusStr} - ${ev.desc || ev.title}\n`;
    });

    setPreviewText(report);
    setIsPreviewOpen(true);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#0e0e11] relative transition-colors duration-300 overflow-hidden">

      {/* --- HEADER (Read-Only) --- */}
      <div className="shrink-0 z-20 bg-zinc-50 dark:bg-[#0e0e11] border-b border-zinc-200 dark:border-zinc-800 p-6 space-y-4">

        {/* Top Row: Case ID & Actions */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="bg-[#0078D4] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {incident.status}
            </span>
            <span className="text-zinc-400 text-xs font-medium uppercase flex items-center gap-1">
              <Hash size={12} />
              {incident.ticket || 'NO-TICKET'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Report Action */}
            <button
              onClick={generateReport}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
              title="Generate Text Report"
            >
              <File size={16} />
            </button>
            {/* Export Action */}
            <button
              onClick={handleExportCSV}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
              title="Export CSV"
            >
              <Download size={16} />
            </button>
            {/* Edit Action */}
            {canEdit && (
              <button
                onClick={() => setIsInfoModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-xs font-bold transition-colors ml-1"
              >
                <PenSquare size={14} />
                Edit Case
              </button>
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
            {incident.subject || 'Untitled Incident'}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              Created: {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('en-GB') : '-'}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={12} />
              {incident.project || 'CORE'}
            </span>
          </div>
        </div>

        {/* Details Grid - Removed per user request */}
        {/* <div className="grid grid-cols-3 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800/50">
          <DetailItem label="Impact" value={incident.impact} icon={Activity} />
          <DetailItem label="Root Cause" value={incident.root_cause} icon={Hash} />
          <DetailItem label="Action" value={incident.action} icon={History} />
        </div> */}
      </div>

      {/* --- TIMELINE CONTENT (Preserved) --- */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-[#0e0e11]">
        <div
          ref={containerRef}
          className="h-full overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
              <div className="w-8 h-8 border-2 border-zinc-200 border-t-[#0078D4] rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Syncing...</span>
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-300 dark:text-zinc-700 mt-10">
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-3">
                <History size={28} className="text-zinc-400 dark:text-zinc-600" />
              </div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide">No Timeline Events</h3>
              <p className="text-[10px] text-zinc-400 mt-1">Add an update to start tracking this case.</p>
            </div>
          ) : (
            <div className="flex flex-col pb-20 relative max-w-4xl mx-auto min-h-full">
              {sortedEvents.map((ev, index) => {
                const showDateHeader = index === 0 || ev.date !== sortedEvents[index - 1].date;
                let dateLabel = '-';
                try {
                  dateLabel = ev.date ? new Date(ev.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                } catch { dateLabel = '-'; }

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
                    canEdit={canEdit}
                  />
                );
              })}
              <div ref={listEndRef} />
            </div>
          )}
        </div>

        {/* Floating Action Button (FAB) - Preserved */}
        <div className="absolute bottom-6 right-6 z-30">
          {canEdit && !isLoading && incident?.id && (
            <button
              onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
              className="w-11 h-11 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-full shadow-lg shadow-[#0078D4]/20 hover:shadow-xl transition-all duration-300 flex items-center justify-center active:scale-95"
              title="Add Timeline Update"
            >
              <PenSquare size={20} />
            </button>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingEvent}
        onDelete={(eid) => incident?.id && onDeleteEvent(incident.id, eid)}
        incidentId={incident?.id}
        onSave={(data) => {
          if (!incident?.id) {
            console.error('Cannot save event: Incident ID is missing');
            setIsModalOpen(false);
            return;
          }
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
        onDelete={() => onDeleteIncident(incident.id)}
        onExport={handleExportCSV}
      />
    </div>
  );
}