import React, { useState, useCallback } from 'react';
import { useIncidents } from '../features/cases/hooks/useIncidents';
import { useEvents } from '../features/cases/hooks/useEvents';
import { useTicketLog } from '../features/ticket/hooks/useTicketLog';
import { useStore } from '../store/useStore';
import { incidentService } from '../services/incidentService';

import CaseList from '../features/cases/CaseList';
import CaseDetail from '../features/cases/CaseDetail';
import LogDetailPanel from '../features/cases/LogDetailPanel';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useToast } from "@/hooks/use-toast";

export default function TimelinePage() {
  const { currentUser } = useStore();

  // Mode: 'incidents' | 'logs'
  const [viewMode, setViewMode] = useState('incidents');

  // --- 1. Incidents Data ---
  const {
    incidents,
    filteredIncidents,
    selectedId,
    setSelectedId,
    loading,
    stats,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    filterType, setFilterType,
    clearFilters,
    hasActiveFilters
  } = useIncidents();

  const { sortedEvents, loading: eventsLoading } = useEvents(selectedId);

  // --- 2. Ticket Logs Data (Inbox) ---
  const {
    logs,
    loading: logsLoading,
    stats: logStats
  } = useTicketLog();

  const [selectedLog, setSelectedLog] = useState(null);

  // --- 3. UI States ---
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const activeIncident = incidents.find(inc => inc.id === selectedId);

  // Toast helper wrapper
  const showToast = useCallback((message, type = 'success') => {
    toast({
      description: message,
      variant: type,
    });
  }, [toast]);

  // --- Actions: Incident ---

  const handleAddIncident = async () => {
    setSaving(true);
    try {
      const creatorData = typeof currentUser === 'object' ? currentUser : { name: 'Admin' };
      const newDoc = await incidentService.createIncident({
        subject: 'New Incident',
        project: 'MONOMAX',
        status: 'Open',
        type: 'Incident',
        ticket: '',
        createdBy: creatorData,
        impact: '',
        root_cause: '',
        action: ''
      });
      setViewMode('incidents');
      setSelectedId(newDoc.id);
      showToast('Case created');
    } catch (error) {
      console.error("Error creating incident:", error);
      showToast(error.message || 'Failed to create incident', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePromoteToIncident = async (log) => {
    if (!log) return;
    setSaving(true);

    try {
      const creatorData = typeof currentUser === 'object' ? currentUser : { name: 'System' };

      // Map Log Data to Incident
      const incidentData = {
        subject: log.shortDesc || log.details || `Ticket #${log.ticketNumber}`,
        ticket: log.ticketNumber || '',
        project: 'MONOMAX', // Default
        type: ['Incident', 'Request', 'Maintenance'].includes(log.type) ? log.type : 'Incident',
        status: 'Open',
        priority: log.severity || 'Medium',
        createdBy: creatorData,
        impact: '',
        root_cause: log.details || '',
        action: log.action || ''
      };

      const newDoc = await incidentService.createIncident(incidentData, log.ticketNumber);

      showToast(`Ticket #${log.ticketNumber} promoted to Case`);

      // Switch to Incident View
      setViewMode('incidents');
      setSelectedId(newDoc.id);

    } catch (error) {
      console.error("Error promoting log:", error);
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
          console.error("Error deleting incident:", error);
          showToast(error.message || 'Failed to delete', 'error');
        }
      }
    });
  };

  const handleUpdateIncident = async (id, data) => {
    try {
      await incidentService.updateIncident(id, data);
    } catch (error) {
      console.error("Error updating incident:", error);
      showToast(error.message || 'Failed to update', 'error');
    }
  };

  // --- Actions: Events ---

  const handleAddEvent = async (incidentId, data) => {
    try {
      await incidentService.createEvent(incidentId, data);
      showToast('Event added');
    } catch (error) {
      console.error("Error adding event:", error);
      showToast(error.message || 'Failed to add event', 'error');
    }
  };

  const handleUpdateEvent = async (incidentId, eventId, data) => {
    try {
      await incidentService.updateEvent(incidentId, eventId, data);
      showToast('Event updated');
    } catch (error) {
      console.error("Error updating event:", error);
      showToast(error.message || 'Failed to update event', 'error');
    }
  };

  const handleDeleteEvent = async (incidentId, eventId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Event?',
      message: 'This timeline event will be permanently removed.',
      isDanger: true,
      onConfirm: async () => {
        try {
          await incidentService.deleteEvent(incidentId, eventId);
          setConfirmModal({ isOpen: false });
          showToast('Event deleted');
        } catch (error) {
          console.error("Error deleting event:", error);
          showToast(error.message || 'Failed to delete event', 'error');
        }
      }
    });
  };

  const handleReorderEvent = async (incidentId, reorderedEvents) => {
    try {
      await incidentService.reorderEvents(incidentId, reorderedEvents);
    } catch (error) {
      console.error("Error reordering events:", error);
      showToast(error.message || 'Failed to reorder', 'error');
    }
  };

  // --- Export CSV ---

  // --- Export CSV ---

  // --- Export CSV ---

  const handleExportCSV = async (data) => {
    if (!data || data.length === 0) {
      showToast("No data to export", 'error');
      return;
    }

    showToast("Preparing export...", "info");

    try {
      // ✅ Reverted to specific columns as requested
      const headers = "IncidentDate,Project,Ticket,Type,Status,Subject,CreatedBy,EventDate,EventTime,EventDescription";
      let csvRows = [];

      for (const inc of data) {
        const incDate = inc.createdAt ? new Date(inc.createdAt).toLocaleDateString('en-GB') : '-';
        // ✅ Fix: Remove newlines from Subject to prevent broken/tall rows in Excel
        const subjectEscaped = (inc.subject || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const projectEscaped = (inc.project || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const ticketEscaped = (inc.ticket || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const typeEscaped = (inc.type || '').replace(/"/g, '""').replace(/\n/g, ' ');

        // Removed Impact, RootCause, Action
        const baseRow = `"${incDate}","${projectEscaped}","${ticketEscaped}","${typeEscaped}","${inc.status}","${subjectEscaped}","${inc.createdBy?.name || inc.createdBy || ''}"`;

        // Fetch events for this incident
        const events = await incidentService.getEvents(inc.id);

        if (events.length > 0) {
          events.forEach(ev => {
            const evDate = ev.date ? new Date(ev.date).toLocaleDateString('en-GB') : '-';
            const evTime = ev.time || '-';
            const desc = (ev.desc || ev.title || '').replace(/"/g, '""').replace(/\n/g, ' ');
            csvRows.push(`${baseRow},"${evDate}","${evTime}","${desc}"`);
          });
        } else {
          // No events, just print incident line
          csvRows.push(`${baseRow},"-","-","-"`);
        }

        // Separator row (adjusted for 10 columns -> 9 commas)
        csvRows.push(",,,,,,,,,");
      }

      const csvContent = [headers, ...csvRows].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `TicketTimeline_Full_Export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showToast('Export completed');
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Failed to export data", 'error');
    }
  };

  return (
    <div className="w-full h-full flex overflow-hidden bg-zinc-50 dark:bg-black">

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        {...confirmModal}
      />

      {/* SECTION 1: Case List (Left Sidebar) */}
      <div className={`
        h-full border-r border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#050505] flex-shrink-0 transition-all duration-300
        ${(selectedId || selectedLog) ? 'hidden lg:block lg:w-[350px]' : 'w-full lg:w-[350px]'}
      `}>
        <CaseList
          // Incidents Props
          filteredIncidents={filteredIncidents}
          selectedId={selectedId}
          onSelect={(id) => { setViewMode('incidents'); setSelectedId(id); }}
          onAddIncident={handleAddIncident}
          onDeleteIncident={handleDeleteIncident}
          onExportCSV={handleExportCSV}
          stats={stats}

          // Inbox Props
          logs={logs}
          selectedLogId={selectedLog?.ticketNumber}
          onSelectLog={setSelectedLog}
          logsLoading={logsLoading}
          logStats={logStats}

          // Shared
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setViewMode(mode);
            if (mode === 'incidents') setSelectedLog(null);
            if (mode === 'logs') setSelectedId(null);
          }}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterType={filterType}
          setFilterType={setFilterType}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          loading={loading}
        />
      </div>

      {/* SECTION 2: Detail Panel (Right Side) */}
      <div className={`
        h-full flex-1 min-w-0 overflow-hidden bg-white dark:bg-[#09090b] relative
        ${(selectedId || selectedLog || viewMode === 'incidents') ? 'block' : 'hidden lg:block'}
      `}>
        {viewMode === 'incidents' ? (
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
          />
        ) : (
          <LogDetailPanel
            log={selectedLog}
            onAddToIncident={handlePromoteToIncident}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </div>
    </div>
  );
}