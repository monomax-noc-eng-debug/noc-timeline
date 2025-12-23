import React, { useState, useCallback } from 'react';
import { useIncidents } from '../features/cases/hooks/useIncidents';
import { useEvents } from '../features/cases/hooks/useEvents';
import { useStore } from '../store/useStore';
import { incidentService } from '../services/incidentService';

import CaseList from '../features/cases/CaseList';
import CaseDetail from '../features/cases/CaseDetail';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast from '../components/ui/Toast';

export default function TimelinePage() {
  const { currentUser } = useStore();

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

  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [saving, setSaving] = useState(false);

  const activeIncident = incidents.find(inc => inc.id === selectedId);

  // Toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, []);

  // --- Actions: Incident ---

  const handleAddIncident = async () => {
    if (!currentUser) {
      showToast("Please login first!", 'error');
      return;
    }

    setSaving(true);
    try {
      const newDoc = await incidentService.createIncident({
        subject: 'New Incident',
        project: 'General',
        status: 'Open',
        type: 'Incident',
        ticket: '',
        createdBy: currentUser,
        impact: '',
        root_cause: '',
        action: ''
      });
      setSelectedId(newDoc.id);
      showToast('Incident created');
    } catch (error) {
      console.error("Error creating incident:", error);
      showToast(error.message || 'Failed to create incident', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIncident = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Incident?',
      message: 'This action cannot be undone. All timeline events will be permanently deleted.',
      isDanger: true,
      onConfirm: async () => {
        try {
          await incidentService.deleteIncident(id);
          if (selectedId === id) setSelectedId(null);
          setConfirmModal({ isOpen: false });
          showToast('Incident deleted');
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

  const handleExportCSV = (data) => {
    if (!data || data.length === 0) {
      showToast("No data to export", 'error');
      return;
    }

    const headers = "Date,Project,Ticket,Type,Status,Subject,CreatedBy";
    const csvContent = [
      headers,
      ...data.map(inc => {
        const dateStr = inc.createdAt ? new Date(inc.createdAt).toLocaleDateString('en-GB') : '-';
        const subjectEscaped = (inc.subject || '').replace(/"/g, '""');
        return `"${dateStr}","${inc.project || ''}","${inc.ticket || ''}","${inc.type || ''}","${inc.status}","${subjectEscaped}","${inc.createdBy || ''}"`;
      })
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Incidents_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('CSV exported');
  };

  return (
    <div className="w-full h-full flex overflow-hidden bg-zinc-50 dark:bg-black">

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        {...confirmModal}
      />

      {/* SECTION 1: Case List */}
      <div className={`
        h-full border-r border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#050505] flex-shrink-0 transition-all duration-300
        ${selectedId ? 'hidden lg:block lg:w-[350px]' : 'w-full lg:w-[350px]'}
      `}>
        <CaseList
          incidents={incidents}
          filteredIncidents={filteredIncidents}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddIncident={handleAddIncident}
          onDeleteIncident={handleDeleteIncident}
          onExportCSV={handleExportCSV}
          stats={stats}
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

      {/* SECTION 2: Case Detail */}
      <div className={`
        h-full flex-1 min-w-0 overflow-hidden bg-white dark:bg-[#09090b] relative
        ${selectedId ? 'block' : 'hidden lg:block'}
      `}>
        <CaseDetail
          incident={activeIncident ? { ...activeIncident, events: sortedEvents } : null}
          isLoading={eventsLoading}
          onBack={() => setSelectedId(null)}
          onUpdateIncident={handleUpdateIncident}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          onReorderEvent={handleReorderEvent}
          saving={saving}
        />
      </div>
    </div>
  );
}