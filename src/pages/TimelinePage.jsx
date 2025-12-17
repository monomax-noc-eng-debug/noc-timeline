import React from 'react';
import CaseList from '../features/cases/CaseList';
import CaseDetail from '../features/cases/CaseDetail';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useIncidents } from '../hooks/useIncidents';

export default function TimelinePage({ currentUser }) {
  const {
    incidents,
    loading,
    isEventsLoading,
    selectedIncidentId,
    setSelectedIncidentId,
    handleSelectIncident,
    handleCreate,
    handleUpdate,
    requestDelete,
    handleAddEvent,
    handleUpdateEvent,
    requestDeleteEvent,
    handleReorderEvents,
    toast,
    setToast,
    confirmConfig,
    setConfirmConfig,
    executeConfirmAction,
    handleExportCSV
  } = useIncidents(currentUser);

  const activeIncident = incidents.find(inc => inc.id === selectedIncidentId);

  if (loading && incidents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black dark:border-zinc-700 dark:border-t-white rounded-full animate-spin"></div>
        <span className="text-xs font-bold uppercase tracking-widest">Loading Data...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />}
      <ConfirmModal isOpen={confirmConfig.isOpen} onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} onConfirm={executeConfirmAction} title={confirmConfig.title} message={confirmConfig.message} isDanger={true} />

      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12">
        <div className={`lg:col-span-3 h-full border-r-2 border-gray-200 dark:border-[#333] overflow-hidden flex-col ${selectedIncidentId ? 'hidden lg:flex' : 'flex'}`}>
          <CaseList
            incidents={incidents}
            selectedId={selectedIncidentId}
            onSelect={(id) => handleSelectIncident(id)}
            onAddIncident={handleCreate}
            onDeleteIncident={requestDelete}
            onExportCSV={handleExportCSV}
          />
        </div>
        <div className={`lg:col-span-9 h-full overflow-hidden flex flex-col bg-[#F3F4F6] dark:bg-[#000000] ${selectedIncidentId ? 'absolute inset-0 z-40 lg:relative lg:flex animate-in slide-in-from-right duration-300' : 'hidden lg:flex'}`}>
          <CaseDetail
            incident={activeIncident}
            isLoading={isEventsLoading}
            onUpdateIncident={handleUpdate}
            onAddEvent={handleAddEvent}
            onDeleteEvent={requestDeleteEvent}
            onUpdateEvent={handleUpdateEvent}
            onReorderEvent={handleReorderEvents}
            onBack={() => setSelectedIncidentId(null)}
          />
        </div>
      </div>
    </div>
  );
}