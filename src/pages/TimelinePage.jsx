import React, { useState, useCallback, useEffect } from 'react';
import { useIncidents } from '../features/cases/hooks/useIncidents';
import { useEvents } from '../features/cases/hooks/useEvents';
import { useTicketLog } from '../features/ticket/hooks/useTicketLog';
import { useStore } from '../store/useStore';
import incidentService from '../services/incidentService';
import { cleanCsvCell, formatCsvDate, downloadCsvFile } from '../utils/exportHelper';
import { useToast } from "@/hooks/use-toast";

// Components
import CaseList from '../features/cases/CaseList';
import CaseDetail from '../features/cases/CaseDetail';
import LogDetailPanel from '../features/cases/LogDetailPanel';
import ConfirmModal from '../components/ui/ConfirmModal';
import IncidentSyncModal from '../features/cases/components/IncidentSyncModal';
import { LayoutDashboard } from 'lucide-react';
import { hasRole, ROLES } from '../utils/permissions';

export default function TimelinePage() {

  const { currentUser } = useStore();
  const canEdit = hasRole(currentUser, [ROLES.LEAD, ROLES.ENGINEER]);
  const { toast } = useToast();

  // View Mode: 'incidents' or 'logs'
  const [viewMode, setViewMode] = useState('incidents');

  // --- Data Hooks ---
  const {
    incidents, filteredIncidents, selectedId, setSelectedId, loading, error, stats,
    searchTerm, setSearchTerm, filterStatus, setFilterStatus, filterType, setFilterType,
    clearFilters, hasActiveFilters
  } = useIncidents();

  const { sortedEvents, loading: eventsLoading } = useEvents(selectedId);

  const {
    logs, loading: logsLoading, stats: logStats
  } = useTicketLog();

  const [selectedLog, setSelectedLog] = useState(null);

  // --- UI States ---
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingIncident, setPendingIncident] = useState(null); // Optimistic update for new incidents

  // Use pending incident if exists and not yet in incidents array, otherwise find from incidents
  const activeIncident = pendingIncident && pendingIncident.id === selectedId && !incidents.find(inc => inc.id === selectedId)
    ? pendingIncident
    : incidents.find(inc => inc.id === selectedId);

  // Clear pendingIncident once Firestore subscription has the incident
  useEffect(() => {
    if (pendingIncident && incidents.find(inc => inc.id === pendingIncident.id)) {
      setPendingIncident(null);
    }
  }, [incidents, pendingIncident]);

  // Helper: Toast
  const showToast = useCallback((message, type = 'success') => {
    toast({ description: message, variant: type === 'error' ? 'destructive' : 'default' });
  }, [toast]);

  // --- Handlers ---

  const handleAddIncident = async () => {
    setSaving(true);
    try {
      const creatorData = typeof currentUser === 'object' ? currentUser : { name: 'Admin' };
      const incidentData = {
        subject: 'New Incident',
        project: 'MONOMAX',
        status: 'Open',
        type: 'Incident',
        ticket: '',
        createdBy: creatorData,
        impact: '', root_cause: '', action: ''
      };
      const newId = await incidentService.createIncident(incidentData);

      // Optimistic update: Set pending incident immediately so CaseDetail can render
      setPendingIncident({
        ...incidentData,
        id: newId,
        events: [],
        createdAt: new Date().toISOString()
      });

      setViewMode('incidents');
      setSelectedId(newId);
      showToast('Case created successfully');
    } catch (error) {
      console.error(error);
      showToast('Failed to create incident', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePromoteToIncident = async (log) => {
    if (!log) return;
    setSaving(true);
    try {
      const creatorData = typeof currentUser === 'object' ? currentUser : { name: 'System' };
      const incidentData = {
        subject: log.shortDesc || log.details || `Ticket #${log.ticketNumber}`,
        ticket: log.ticketNumber || '',
        project: 'MONOMAX',
        type: ['Incident', 'Request', 'Maintenance'].includes(log.type) ? log.type : 'Incident',
        status: 'Open',
        priority: log.severity || 'Medium',
        createdBy: creatorData,
        impact: '', root_cause: log.details || '', action: log.action || ''
      };

      const newId = await incidentService.createIncident(incidentData, log.ticketNumber);
      showToast(`Ticket #${log.ticketNumber} promoted to Case`);
      setViewMode('incidents');
      setSelectedId(newId);
    } catch (error) {
      console.error(error);
      showToast("Failed to promote ticket", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIncident = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Case?',
      message: 'This action cannot be undone. All timeline events will be permanently deleted.',
      isDanger: true,
      onConfirm: async () => {
        try {
          await incidentService.deleteIncident(id);
          if (selectedId === id) setSelectedId(null);
          setConfirmModal({ isOpen: false });
          showToast('Case deleted');
        } catch (error) {
          console.error(error);
          showToast('Failed to delete', 'error');
        }
      }
    });
  };

  // CSV Export Logic (Extracted for cleanliness)
  const handleExportCSV = async (data) => {
    if (!data || data.length === 0) {
      showToast("No data to export", 'error');
      return;
    }
    showToast("Preparing export...", "info");

    try {
      const headers = "IncidentDate,Project,Ticket,Type,Status,Subject,CreatedBy,EventDate,EventTime,EventDescription";

      const rowPromises = data.map(async (inc) => {
        // ✅ ใช้ helper function
        const incDate = formatCsvDate(inc.createdAt);
        const baseRow = `"${incDate}","${cleanCsvCell(inc.project)}","${cleanCsvCell(inc.ticket)}","${cleanCsvCell(inc.type)}","${inc.status}","${cleanCsvCell(inc.subject)}","${inc.createdBy?.name || inc.createdBy || ''}"`;

        try {
          const events = await incidentService.getEvents(inc.id);

          if (events.length > 0) {
            const eventRows = events.map(ev => {
              const evDate = formatCsvDate(ev.date);
              const desc = cleanCsvCell(ev.desc || ev.title);
              return `${baseRow},"${evDate}","${ev.time || '-'}","${desc}"`;
            }).join("\n");
            return eventRows + "\n,,,,,,,,,";
          } else {
            return `${baseRow},"-","-","-"\n,,,,,,,,,`;
          }
        } catch (err) {
          return `${baseRow},"Error fetching events","-","-"\n,,,,,,,,,`;
        }
      });

      const processedRows = await Promise.all(rowPromises);
      const csvContent = [headers, ...processedRows].join("\n");

      // ✅ เรียกใช้ helper บรรทัดเดียวจบ ไม่ต้องยุ่งกับ Blob/DOM
      downloadCsvFile(csvContent, `CaseExport_${new Date().toISOString().split('T')[0]}`);

      showToast('Export completed');
    } catch (error) {
      console.error(error);
      showToast("Failed to export data", 'error');
    }
  };

  // Other simple handlers
  // Other simple handlers with Toast feedback
  const handleUpdateIncident = async (id, data) => {
    try {
      await incidentService.updateIncident(id, data);
      showToast('Incident updated');
    } catch (error) {
      showToast('Update failed', 'error');
    }
  };

  const handleAddEvent = async (incId, data) => {
    try {
      console.log("TimelinePage: Adding event", incId, data);
      await incidentService.createEvent(incId, data);
      showToast('Timeline updated');
    } catch (error) {
      console.error("TimelinePage: Failed to add event", error);
      showToast('Failed to add event', 'error');
    }
  };

  const handleUpdateEvent = async (incId, evId, data) => {
    try {
      await incidentService.updateEvent(incId, evId, data);
      showToast('Event updated');
    } catch (error) {
      showToast('Failed to update event', 'error');
    }
  };

  const handleReorderEvent = async (incId, events) => incidentService.reorderEvents(incId, events);

  const handleDeleteEvent = async (incId, evId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Event?',
      message: 'This event will be removed.',
      isDanger: true,
      onConfirm: async () => {
        try {
          await incidentService.deleteEvent(incId, evId);
          showToast('Event removed');
        } catch (error) {
          showToast('Failed to remove event', 'error');
        } finally {
          setConfirmModal({ isOpen: false });
        }
      }
    });
  };

  return (
    <div className="flex w-full h-full bg-zinc-50 dark:bg-black overflow-hidden relative">
      <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false })} {...confirmModal} />

      {/* --- LEFT PANEL: List View --- */}
      <div className={`
        flex-shrink-0 h-full flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 z-10
        lg:w-[380px] xl:w-[420px]
        ${(selectedId || selectedLog) ? 'hidden lg:flex' : 'w-full flex'}
      `}>
        <CaseList
          filteredIncidents={filteredIncidents} stats={stats} loading={loading} error={error}
          logs={logs} logsLoading={logsLoading} logStats={logStats}
          selectedId={selectedId} selectedLogId={selectedLog?.ticketNumber}
          onSelect={(id) => { setViewMode('incidents'); setSelectedId(id); }}
          onSelectLog={setSelectedLog}
          onAddIncident={handleAddIncident} onDeleteIncident={handleDeleteIncident} onExportCSV={handleExportCSV}
          viewMode={viewMode} onViewModeChange={(mode) => {
            setViewMode(mode);
            if (mode === 'incidents') setSelectedLog(null);
            if (mode === 'logs') setSelectedId(null);
          }}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterType={filterType} setFilterType={setFilterType}
          clearFilters={clearFilters} hasActiveFilters={hasActiveFilters}
          canEdit={canEdit}
        />
      </div>

      {/* --- RIGHT PANEL: Detail View --- */}
      <div className={`
        flex-1 h-full relative overflow-hidden bg-zinc-50/50 dark:bg-black
        ${(selectedId || selectedLog) ? 'flex w-full' : 'hidden lg:flex'}
      `}>
        {viewMode === 'incidents' && selectedId ? (
          <CaseDetail
            incident={activeIncident ? { ...activeIncident, events: sortedEvents } : null}
            isLoading={eventsLoading}
            onBack={() => setSelectedId(null)}
            onUpdateIncident={handleUpdateIncident}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onDeleteIncident={handleDeleteIncident}
            onReorderEvent={handleReorderEvent}
            saving={saving}
            canEdit={canEdit}
          />
        ) : viewMode === 'logs' && selectedLog ? (
          <LogDetailPanel
            log={selectedLog}
            onAddToIncident={handlePromoteToIncident}
            onClose={() => setSelectedLog(null)}
            canEdit={canEdit}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 select-none p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <LayoutDashboard size={40} strokeWidth={1.5} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">No Selection</h3>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Select a case from the list to view its timeline, or choose a log from the inbox to process.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
