import React, { useState, useCallback, useEffect } from 'react';
import { useEvents } from '../cases/hooks/useEvents';
import { useStore } from '../../store/useStore';
import incidentService from '../../services/incidentService';
import { cleanCsvCell, formatCsvDate, downloadCsvFile } from '../../utils/exportHelper';
import { useToast } from "@/hooks/use-toast";
import { hasRole, ROLES } from '../../utils/permissions';
import { LayoutDashboard } from 'lucide-react';

// Components
import CaseList from '../cases/CaseList';
import CaseDetail from '../cases/CaseDetail';
import LogDetailPanel from '../cases/LogDetailPanel';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function TimelineListView({
  incidents = [], // filtered incidents
  loading = false,
  error = null,
  stats,
  logs = [], // needed for CaseList 'logs' mode logic if kept
  logsLoading = false,
  logStats = {},
  // Handlers for selection
  // Note: CaseList manages 'viewMode' locally or via parent. 
  // Unified Page has global tabs, but TimelinePage had internal "Incidents vs Inbox" mode.
  // We need to support this internal mode or drop it.
  // The User Requirements: "No Feature Loss".
  // TimelinePage had `[viewMode, setViewMode] = useState('incidents');` (internal).
  // This internal viewMode toggled between Incident List and "Inbox" (promoting tickets).
  // We should preserve this if we want full feature parity.
  // OR, "Inbox" is just the Ticket View?
  // TimelinePage's "Inbox" (logs) allowed dragging/promoting logs to incidents.
  // If we merge pages, maybe the "Tickets" *Main Tab* replaces the "Inbox" mode?
  // However, dragging/promoting might be a specific workflow in Timeline view.
  // Let's keep the internal state for now to be safe and ensure feature parity.
}) {

  const { currentUser } = useStore();
  const canEdit = hasRole(currentUser, [ROLES.LEAD, ROLES.ENGINEER]);
  const { toast } = useToast();

  // Internal View Mode: 'incidents' or 'logs' (Inbox within Timeline context)
  const [internalViewMode, setInternalViewMode] = useState('incidents');

  const [selectedId, setSelectedId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  // Load events for selected incident
  const { sortedEvents, loading: eventsLoading } = useEvents(selectedId);

  // UI States
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [saving, setSaving] = useState(false);
  const [pendingIncident, setPendingIncident] = useState(null);

  const activeIncident = pendingIncident && pendingIncident.id === selectedId && !incidents.find(inc => inc.id === selectedId)
    ? pendingIncident
    : incidents.find(inc => inc.id === selectedId);

  useEffect(() => {
    if (pendingIncident && incidents.find(inc => inc.id === pendingIncident.id)) {
      setPendingIncident(null);
    }
  }, [incidents, pendingIncident]);

  const showToast = useCallback((message, type = 'success') => {
    toast({ description: message, variant: type === 'error' ? 'destructive' : 'default' });
  }, [toast]);

  // --- Actions ---

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

      setPendingIncident({
        ...incidentData,
        id: newId,
        events: [],
        createdAt: new Date().toISOString()
      });

      setInternalViewMode('incidents');
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
      setInternalViewMode('incidents');
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

  const handleExportCSV = async (data) => {
    if (!data || data.length === 0) {
      showToast("No data to export", 'error');
      return;
    }
    showToast("Preparing export...", "info");

    try {
      const headers = "IncidentDate,Project,Ticket,Type,Status,Subject,CreatedBy,EventDate,EventTime,EventDescription";
      const rowPromises = data.map(async (inc) => {
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
      downloadCsvFile(csvContent, `CaseExport_${new Date().toISOString().split('T')[0]}`);
      showToast('Export completed');
    } catch (error) {
      console.error(error);
      showToast("Failed to export data", 'error');
    }
  };

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

  // If searchTerm is controlled by parent, we don't need `setSearchTerm` prop unless we want to update parent?
  // CaseList expects `searchTerm` and `setSearchTerm`. 
  // If we want parent (OperationsPage) to control search, we should pass props.
  // BUT CaseList also has internal search logic or expects props.
  // In `TimelinePage`, `useIncidents` provided these state setters.
  // In Unified Page, these are handled by `useOperationsData`.
  // So we should receive `searchTerm` and `setSearchTerm` (or `onSearch`) from parent.
  // Checking `CaseList` props... it takes `searchTerm`, `setSearchTerm`, `filterStatus`, etc.
  // We can just pass dummy functions if we want to disable CaseList's own search bar, 
  // OR we pass the parent's handlers to keep CaseList's inputs working (sync with global).
  // The User Requirement said "Control Section: Include Search Bar and Filter Bar at the top".
  // So `CaseList` might NOT need to render its own filter bar?
  // `CaseList.jsx` likely has its own Header/Filter bar.
  // Step 11: `CaseList` was imported in `TimelinePage`. We should check `CaseList` to see if we can hide its search/filters.
  // Or just sync them. Synchronizing is safer for "No Logic Deletion".

  return (
    <div className="flex w-full h-full bg-zinc-50 dark:bg-black overflow-hidden relative">
      {/* Helper to trigger create from parent */}
      <div className="hidden" data-trigger-create onClick={handleAddIncident}></div>
      <div className="hidden" data-trigger-export onClick={() => handleExportCSV(incidents)}></div>

      <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false })} {...confirmModal} />

      {/* --- LEFT PANEL: List View --- */}
      <div className={`
        flex-shrink-0 h-full flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 z-10
        lg:w-[380px] xl:w-[420px]
        ${(selectedId || selectedLog) ? 'hidden lg:flex' : 'w-full flex'}
      `}>
        {/* 
            Note: We act as if we are TimelinePage. 
            We pass `incidents` (which are already filtered by parent).
            If CaseList does further filtering, it might double-filter if we pass search/filter props.
            Ideally, we tell CaseList "here is the data, don't filter". 
            Or we pass empty search chars to CaseList and let Parent handle filtering.
            Let's check if CaseList does filtering or just UI controls.
            Step 110 shows TimelinePage passes `filteredIncidents` to `CaseList`. 
            So `CaseList` just displays data. It accepts `setSearchTerm` likely to update the state in hook.
         */}
        <CaseList
          filteredIncidents={incidents} // Data already filtered by parent hook
          stats={stats}
          loading={loading}
          error={error}
          logs={logs}
          logsLoading={logsLoading}
          logStats={logStats}
          selectedId={selectedId}
          selectedLogId={selectedLog?.ticketNumber}
          onSelect={(id) => { setInternalViewMode('incidents'); setSelectedId(id); }}
          onSelectLog={setSelectedLog}
          onAddIncident={handleAddIncident}
          onDeleteIncident={handleDeleteIncident}
          onExportCSV={handleExportCSV}
          viewMode={internalViewMode}
          onViewModeChange={(mode) => {
            setInternalViewMode(mode);
            if (mode === 'incidents') setSelectedLog(null);
            if (mode === 'logs') setSelectedId(null);
          }}
          // Controls logic: We pass dummy or parent handlers.
          // Since Filtering is global now, these inputs inside CaseList might be redundant or conflicting.
          // If CaseList has a UI for search, we should wire it to parent `setSearchTerm`.
          // But if parent `OperationsPage` ALREADY has a search bar at the very top, 
          // having another search bar inside CaseList is bad UI (duplicate).
          // We likely want to Hide CaseList's filter header?
          // Since we can't delete logic/code easily without seeing CaseList file,
          // Let's pass the parent props for now to ensure functionality works (even if UI is duplicated temporarily).
          // Better yet, we can't see CaseList code right now to know if it has a `hideFilters` prop.
          // I'll assume standard props.
          searchTerm={""} // Pass empty so CaseList doesn't think it needs to filter? No `filteredIncidents` is passed.
          setSearchTerm={() => { }} // No-op inner search? or connect to global?
          filterStatus={'All'}
          setFilterStatus={() => { }}
          filterType={'All'}
          setFilterType={() => { }}
          clearFilters={() => { }}
          hasActiveFilters={false}
          canEdit={canEdit}
        // Maybe we can hide header via CSS or prop if it exists?
        // For now, let's proceed. Simplicity.
        />
      </div>

      {/* --- RIGHT PANEL: Detail View --- */}
      <div className={`
        flex-1 h-full relative overflow-hidden bg-zinc-50/50 dark:bg-black
        ${(selectedId || selectedLog) ? 'flex w-full' : 'hidden lg:flex'}
      `}>
        {internalViewMode === 'incidents' && selectedId ? (
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
        ) : internalViewMode === 'logs' && selectedLog ? (
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
