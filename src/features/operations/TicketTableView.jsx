import React, { useState, useMemo, useCallback, useRef, memo, lazy, Suspense } from 'react';
import {
  Loader2, DownloadCloud, Plus, Globe
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Services & Hooks
import { ticketLogService } from '../../services/ticketLogService';
import incidentService from '../../services/incidentService';
import { useToast } from "@/hooks/use-toast";
import { hasRole, ROLES } from '../../utils/permissions';
import { cn } from "@/lib/utils";
import { useStore } from '../../store/useStore';

// Components
import TicketStats from '../ticket/components/TicketStats';
import TicketTable from '../ticket/components/TicketTable';
import TicketListMobile from '../ticket/components/TicketListMobile';
import TicketFormPanel from '../ticket/components/TicketFormPanel';
import TicketDetailPanel from '../ticket/components/TicketDetailPanel';
import ConfirmModal from '@/components/ui/ConfirmModal';

// Lazy load heavy modals
const TicketSyncModal = lazy(() => import('../ticket/components/TicketSyncModal'));



export default function TicketTableView({
  logs = [],
  loading = false,
  loadMore,
  hasMore,
  loadingMore,
  stats,
  onRefresh,
  clearFilters
}) {
  const { toast } = useToast();
  const { currentUser } = useStore();
  const canEdit = hasRole(currentUser, [ROLES.LEAD, ROLES.ENGINEER]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // UI States
  // UI Keep alive
  const tableContainerRef = useRef(null);

  // Panel State
  const [selectedLog, setSelectedLog] = useState(null);
  const [panelMode, setPanelMode] = useState('view'); // 'view' | 'create' | 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Panel handlers
  const openViewPanel = useCallback((log) => {
    setSelectedLog(log);
    setPanelMode('view');
  }, []);

  const openCreatePanel = useCallback(() => {
    setSelectedLog(null);
    setPanelMode('create');
  }, []);

  const openEditPanel = useCallback((log) => {
    setSelectedLog(log);
    setPanelMode('edit');
  }, []);

  const closePanel = useCallback(() => {
    setSelectedLog(null);
    setPanelMode('view');
  }, []);

  // --- Actions ---
  const handleCreateOrUpdate = useCallback(async (formData) => {
    setIsSubmitting(true);
    try {
      if (panelMode === 'edit' && selectedLog) {
        await ticketLogService.updateLog(selectedLog.ticketNumber, formData);
        toast({
          className: "bg-emerald-500 text-white border-none",
          title: "Update Successful",
          description: `Ticket #${selectedLog.ticketNumber} has been updated.`
        });
      } else {
        await ticketLogService.createLog(formData);
        toast({
          className: "bg-[#0078D4] text-white border-none",
          title: "Ticket Created",
          description: "New operational log has been recorded."
        });
      }
      queryClient.invalidateQueries(['ticketLogs']);
      closePanel();
    } catch (error) {
      console.error("Submit Error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Could not save the ticket."
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [panelMode, selectedLog, queryClient, toast, closePanel]);

  const confirmDelete = useCallback((ticketId) => {
    setDeleteId(ticketId);
  }, []);

  const executeDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await ticketLogService.deleteLog(deleteId);
      toast({ title: "Ticket Deleted", description: `Ticket #${deleteId} removed.` });
      queryClient.invalidateQueries(['ticketLogs']);
      closePanel();
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Failed", description: error.message });
    } finally {
      setDeleteId(null);
    }
  }, [deleteId, queryClient, toast, closePanel]);

  const handleAddToIncidents = useCallback(async (log, e) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      toast({ variant: "destructive", title: "Auth Required", description: "Please login first." });
      return;
    }

    try {
      const creatorData = typeof currentUser === 'object' && currentUser !== null
        ? { name: currentUser.name, id: currentUser.id, role: currentUser.role }
        : { name: currentUser };

      await incidentService.createIncident({
        subject: log.shortDesc || log.details || 'New Incident from Log',
        ticket: log.ticketNumber || '',
        project: 'MONOMAX',
        type: ['Incident', 'Request', 'Maintenance'].includes(log.type) ? log.type : 'Incident',
        status: 'Open',
        createdBy: creatorData,
        impact: '',
        root_cause: log.details || '',
        action: log.action || ''
      });

      toast({
        title: "Successfully Added",
        description: `Ticket #${log.ticketNumber} is now in Ticket Timeline.`,
        action: (
          <button onClick={() => navigate('/incidents')} className="px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded text-[9px] font-bold">
            Go Now
          </button>
        )
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add to timeline." });
    }
  }, [currentUser, navigate, toast]);

  const handleToggleFlag = useCallback(async (log) => {
    try {
      const newFlagStatus = !log.isFlagged;
      await ticketLogService.updateLog(log.ticketNumber, { isFlagged: newFlagStatus });
      queryClient.invalidateQueries(['ticketLogs']);
      toast({
        title: newFlagStatus ? "Flagged" : "Unflagged",
        description: `Ticket #${log.ticketNumber} ${newFlagStatus ? 'pinned to top' : 'unpinned'}.`
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update flag status." });
    }
  }, [queryClient, toast]);

  const isPanelOpen = selectedLog !== null || panelMode === 'create';

  // Expose openCreatePanel via ref or context if needed, but for now parent might control it via prop?
  // Actually, parent passes data, but this component manages view state.
  // We can add a "Create" button here or in parent. The instruction said "Control Section" in parent.
  // But FilterBar is in parent. "New" button in FilterBar.
  // So parent needs a way to trigger openCreatePanel.
  // We can accept an `actionTrigger` prop or simpler: Parent handles "New" and passes `isCreateOpen`?
  // Use imperative handle? Or just lift state?
  // Refactoring Plan said: "Render Global Controls... Pass actions to sub-components".
  // So "New" button click in parent should call something.
  // Let's use `useImperativeHandle` or just expose `openCreatePanel` via specific Prop if possible.
  // Or better, move `panelMode` state to useOperationsData? 
  // No, `useOperationsData` is data layer. View state belongs here or OperationsPage.
  // Let's attach a ref to this component or allow parent to pass `activePanel` prop.
  // For simplicity, I'll export a ref-able component or add `useImperativeHandle`.

  // Note: For now, I'll assume the parent renders specific buttons that might need to be wired up.
  // Actually, the previous FilterBar had "New" and "Sync" buttons.
  // I should accept `isCreateModalOpen` prop from parent? No, that makes it rigid.
  // Let's export the internal functions via `ref`.

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Helper to trigger create from parent */}
      <div className="hidden" data-trigger-create onClick={openCreatePanel}></div>
      <div className="hidden" data-trigger-sync onClick={() => setIsSyncModalOpen(true)}></div>

      <Suspense fallback={null}>
        {isSyncModalOpen && (
          <TicketSyncModal
            isOpen={isSyncModalOpen}
            onClose={() => setIsSyncModalOpen(false)}
            currentLogs={logs}
            onSyncComplete={(count) => {
              toast({ title: "Sync Completed", description: `Updated ${count} records.` });
              queryClient.invalidateQueries({ queryKey: ['ticketLogs'] });
              setIsSyncModalOpen(false);
            }}
          />
        )}
      </Suspense>

      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all",
        isPanelOpen ? "hidden lg:flex lg:w-[55%] xl:w-[60%]" : "w-full"
      )}>
        <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">

          {/* Stats */}
          <div className="shrink-0">
            {!loading && <TicketStats stats={stats} />}
          </div>

          {/* List */}
          <div ref={tableContainerRef} className="flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-10 h-10 border-4 border-zinc-200 dark:border-zinc-700 border-t-[#0078D4] rounded-full animate-spin" />
                <span className="text-xs font-medium text-zinc-400">Loading tickets...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-300 dark:text-zinc-700">
                <Globe size={60} strokeWidth={1} />
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">No records found</p>
                  <button onClick={clearFilters} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto flex flex-col p-1 custom-scrollbar">
                  <TicketTable
                    logs={logs}
                    onLogClick={openViewPanel}
                    activeLogId={selectedLog?.ticketNumber}
                    onFlag={handleToggleFlag}
                    onDelete={confirmDelete}
                  />
                  <TicketListMobile
                    logs={logs}
                    onLogClick={openViewPanel}
                    onEdit={openEditPanel}
                    canEdit={canEdit}
                  />

                  {/* Load More Trigger */}
                  <div className="shrink-0 py-4 flex justify-center">
                    <button
                      onClick={() => loadMore()}
                      disabled={!hasMore || loadingMore}
                      className={cn(
                        "px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-bold uppercase disabled:opacity-50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2",
                        !hasMore && "hidden"
                      )}
                    >
                      {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <DownloadCloud size={14} />}
                      {loadingMore ? 'Loading more tickets...' : 'Load More'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <div className={cn(
        "hidden lg:block shrink-0 overflow-hidden transition-all",
        isPanelOpen ? "w-[45%] xl:w-[40%]" : "w-0"
      )}>
        {panelMode === 'view' ? (
          <TicketDetailPanel
            ticket={selectedLog}
            mode={panelMode}
            onClose={closePanel}
            onEdit={openEditPanel}
            onDelete={confirmDelete}
            onSendToIncident={handleAddToIncidents}
            canEdit={canEdit}
          />
        ) : (
          <TicketFormPanel
            onClose={closePanel}
            onSubmit={handleCreateOrUpdate}
            initialData={selectedLog}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Mobile Detail */}
      {isPanelOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full max-h-[90vh] bg-white dark:bg-zinc-900 rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {panelMode === 'view' ? (
              <TicketDetailPanel
                ticket={selectedLog}
                mode={panelMode}
                onClose={closePanel}
                onEdit={openEditPanel}
                onDelete={confirmDelete}
                onSendToIncident={handleAddToIncidents}
                canEdit={canEdit}
              />
            ) : (
              <TicketFormPanel
                onClose={closePanel}
                onSubmit={handleCreateOrUpdate}
                initialData={selectedLog}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Delete Confirmation"
        message={`Are you sure you want to delete ticket #${deleteId}?`}
        isDanger={true}
      />
    </div>
  );
}
