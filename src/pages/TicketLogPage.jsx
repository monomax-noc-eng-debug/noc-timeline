import React, { useState, useMemo, useCallback, useDeferredValue, memo, lazy, Suspense } from 'react';
import {
  Loader2, DownloadCloud, Search, X, SlidersHorizontal, Plus,
  Globe, Inbox, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Hooks & Services
import { useTicketLog } from '../features/ticket/hooks/useTicketLog';
import { useTicketAutoSync } from '../features/ticket/hooks/useTicketAutoSync';
import incidentService from '../services/incidentService';
import { ticketLogService } from '../services/ticketLogService';
import { useStore } from '../store/useStore';
import { useTicketOptions } from '../hooks/useTicketOptions';
import { useToast } from "@/hooks/use-toast";
import { hasRole, ROLES } from '../utils/permissions';
import { cn } from "@/lib/utils";

// Components
import TicketStats from '../features/ticket/components/TicketStats';
import { FormModal } from '../components/FormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import TicketTable from '../features/ticket/components/TicketTable';
import TicketListMobile from '../features/ticket/components/TicketListMobile';
import TicketFormPanel from '../features/ticket/components/TicketFormPanel';
import TicketDetailPanel from '../features/ticket/components/TicketDetailPanel';
import FilterBar from '../components/common/FilterBar';

// Lazy load heavy modals
const TicketSyncModal = lazy(() => import('../features/ticket/components/TicketSyncModal'));

// --- Constants ---
const ITEMS_PER_PAGE = 15;

// --- Memoized Pagination Component ---
const PaginationFooter = memo(({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
      <p className="text-xs text-zinc-500">
        Showing {startItem} - {endItem} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          className="w-7 h-7 flex items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          className="w-7 h-7 flex items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={14} />
        </button>
        <span className="px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {currentPage} / {totalPages}
        </span>
        <button
          className="w-7 h-7 flex items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight size={14} />
        </button>
        <button
          className="w-7 h-7 flex items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
});
PaginationFooter.displayName = 'PaginationFooter';

export default function TicketLogPage() {
  const { logs, loading, stats, loadMore, hasMore, loadingMore } = useTicketLog();
  const { toast } = useToast();
  const { currentUser } = useStore();
  const canEdit = hasRole(currentUser, [ROLES.LEAD, ROLES.ENGINEER]);
  const { ticketOptions } = useTicketOptions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // UI States
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [activeTab, setActiveTab] = useState('inbox');

  // Ref for dynamic sizing
  const tableContainerRef = React.useRef(null);

  // Dynamic Item Calculation
  React.useEffect(() => {
    const updateSize = () => {
      // Calculate available height for list items
      const vh = window.innerHeight;
      // Approx header (120) + padding (48) + stats (80) + footer (50) = ~300px reserved
      // Each row approx 40px
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        // Safety minimum 5 items
        const calculatedItems = Math.max(5, Math.floor((containerHeight - 40) / 40));
        setItemsPerPage(calculatedItems);
      } else {
        // Fallback based on window if ref not ready
        const availableHeight = vh - 350;
        const calculatedItems = Math.max(5, Math.floor(availableHeight / 40));
        setItemsPerPage(calculatedItems);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Panel State (for view, create, edit - all in split view)
  const [selectedLog, setSelectedLog] = useState(null);
  const [panelMode, setPanelMode] = useState('view'); // 'view' | 'create' | 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete & Filter modals
  const [deleteId, setDeleteId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useTicketAutoSync();

  // Reset page when filters change
  const handleFilterChange = useCallback((setter, value) => {
    setter(value);
    setCurrentPage(1);
  }, []);

  // Panel handlers - Split View for all modes
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

  const handleCreateOrUpdate = useCallback(async (formData) => {
    setIsSubmitting(true);
    try {
      if (panelMode === 'edit' && selectedLog) {
        // Edit mode
        await ticketLogService.updateLog(selectedLog.ticketNumber, formData);
        toast({
          className: "bg-emerald-500 text-white border-none",
          title: "Update Successful",
          description: `Ticket #${selectedLog.ticketNumber} has been updated.`
        });
      } else {
        // Create mode
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

  // Handle flag toggle
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

  // --- Memoized filtered & paginated data ---
  const filteredLogs = useMemo(() => {
    let result = logs;

    // Apply search
    if (deferredSearchTerm) {
      const query = deferredSearchTerm.toLowerCase();
      result = result.filter(log =>
        log.ticketNumber?.toLowerCase().includes(query) ||
        log.shortDesc?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'All') {
      result = result.filter(log => log.status === filterStatus);
    }

    // Apply type filter
    if (filterType !== 'All') {
      result = result.filter(log => log.type === filterType);
    }

    // Sort by flagged first, then by date desc
    return result.sort((a, b) => {
      // Flagged items first
      if (a.isFlagged && !b.isFlagged) return -1;
      if (!a.isFlagged && b.isFlagged) return 1;
      // Then by date desc
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [logs, deferredSearchTerm, filterStatus, filterType]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const hasActiveFilters = filterStatus !== 'All' || filterType !== 'All';

  const clearFilters = useCallback(() => {
    setFilterStatus('All');
    setFilterType('All');
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Panel is open when viewing a ticket or in create mode
  const isPanelOpen = selectedLog !== null || panelMode === 'create';

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-black transition-colors">

      {/* HEADER - Compact single row */}
      {/* FILTER & HEADER (Timeline Style) */}
      <FilterBar
        title="Ticketing Log"
        icon={Inbox}
        searchTerm={searchTerm}
        onSearch={(val) => handleFilterChange(setSearchTerm, val)}
        // Actions
        actions={[
          {
            label: 'New',
            icon: Plus,
            onClick: () => { setActiveTab('new'); openCreatePanel(); },
            variant: 'primary',
            disabled: !canEdit,
            hideTextOnMobile: true
          },
          {
            label: 'Sync',
            icon: DownloadCloud,
            onClick: () => { setActiveTab('sync'); setIsSyncModalOpen(true); },
            variant: 'secondary',
            disabled: !canEdit || loading,
            hideTextOnMobile: true
          }
        ]}
        // Advanced Filter Toggle
        isFilterActive={filterType !== 'All'}
        onFilterClick={() => setIsFilterOpen(true)}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT SIDE - Stats, Search, Table */}
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all",
          isPanelOpen ? "hidden lg:flex lg:w-[55%] xl:w-[60%]" : "w-full"
        )}>
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">

            {/* Stats Dashboard (Non-scrollable or separate scroll?) */}
            <div className="shrink-0">
              {!loading && <TicketStats stats={stats} />}
            </div>

            {/* Table / Loading / Empty State - Flex grow to fill remaining space */}
            <div ref={tableContainerRef} className="flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-10 h-10 border-4 border-zinc-200 dark:border-zinc-700 border-t-[#0078D4] rounded-full animate-spin" />
                  <span className="text-xs font-medium text-zinc-400">Loading tickets...</span>
                </div>
              ) : paginatedLogs.length === 0 ? (
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
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Desktop Table */}
                    <TicketTable
                      logs={paginatedLogs}
                      onLogClick={openViewPanel}
                      activeLogId={selectedLog?.ticketNumber}
                      onFlag={handleToggleFlag}
                      onDelete={confirmDelete}
                    />
                    {/* Mobile Cards (Hidden on Desktop) */}
                    <TicketListMobile
                      logs={paginatedLogs}
                      onLogClick={openViewPanel}
                      onEdit={openEditPanel}
                      canEdit={canEdit}
                    />
                  </div>

                  {/* Footer: Pagination / Load More */}
                  <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 flex flex-col sm:flex-row justify-between items-center gap-2">

                    {/* Left: Item info */}
                    <span className="text-[10px] text-zinc-500 font-medium order-2 sm:order-1">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
                    </span>

                    {/* Center: Page buttons */}
                    <div className="flex items-center gap-1 order-1 sm:order-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="w-7 h-7 flex items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                      >
                        <ChevronsLeft size={14} />
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-7 h-7 flex items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      {/* Page Numbers */}
                      {(() => {
                        const pages = [];
                        const maxVisible = 5;
                        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                        let end = Math.min(totalPages, start + maxVisible - 1);
                        if (end - start + 1 < maxVisible) {
                          start = Math.max(1, end - maxVisible + 1);
                        }
                        for (let i = start; i <= end; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={cn(
                                "w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors",
                                currentPage === i
                                  ? "bg-[#0078D4] text-white"
                                  : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              )}
                            >
                              {i}
                            </button>
                          );
                        }
                        return pages;
                      })()}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-7 h-7 flex items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                      >
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="w-7 h-7 flex items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                      >
                        <ChevronsRight size={14} />
                      </button>
                    </div>

                    {/* Right: Load More Button */}
                    <button
                      onClick={() => loadMore()}
                      disabled={!hasMore || loadingMore}
                      className="px-3 py-1.5 bg-zinc-800 dark:bg-zinc-700 text-white rounded text-[10px] font-bold uppercase disabled:opacity-50 hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors flex items-center gap-1.5 order-3"
                    >
                      {loadingMore ? <Loader2 size={10} className="animate-spin" /> : <DownloadCloud size={10} />}
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Detail Panel (Desktop) - All modes */}
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
      </div>

      {/* MOBILE DETAIL - Bottom Sheet (All modes) */}
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

      {/* MODALS */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Delete Confirmation"
        message={`Are you sure you want to delete ticket #${deleteId}?`}
        isDanger={true}
      />

      <Suspense fallback={null}>
        {isSyncModalOpen && (
          <TicketSyncModal
            isOpen={isSyncModalOpen}
            onClose={() => { setIsSyncModalOpen(false); setActiveTab('inbox'); }}
            currentLogs={logs}
            onSyncComplete={(count) => {
              toast({ title: "Sync Completed", description: `Updated ${count} records.` });
              queryClient.invalidateQueries({ queryKey: ['ticketLogs'] });
              setIsSyncModalOpen(false);
              setActiveTab('inbox');
            }}
          />
        )}
      </Suspense>

      {/* FILTER MODAL (Restored for Advanced Filters) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setIsFilterOpen(false)} />
          <div className="relative w-full sm:w-[400px] bg-white dark:bg-zinc-900 rounded-t-xl sm:rounded-xl p-5 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 pointer-events-auto m-0 sm:m-4">

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#0078D4]" /> Filters
              </h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 hover:text-zinc-900 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Status Filter */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['All', ...ticketOptions.statuses].map(s => {
                    const countKey = s.toLowerCase();
                    const count = stats[countKey] !== undefined ? stats[countKey] : null;
                    return (
                      <button
                        key={s}
                        onClick={() => handleFilterChange(setFilterStatus, s)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5",
                          filterStatus === s
                            ? "bg-[#0078D4] text-white border-transparent"
                            : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                        )}
                      >
                        {s}
                        {count !== null && <span className="opacity-60 text-[10px]">({count})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Ticket Type</label>
                <div className="flex flex-wrap gap-2">
                  {['All', ...ticketOptions.types].map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-bold transition-all border",
                        filterType === t
                          ? "bg-[#0078D4] text-white border-transparent"
                          : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => { clearFilters(); setIsFilterOpen(false); }}
                className="flex-1 py-2.5 text-zinc-600 font-bold bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 transition-colors text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-[2] py-2.5 bg-[#0078D4] text-white font-bold rounded-lg shadow-lg shadow-[#0078D4]/20 hover:bg-[#106EBE] transition-colors text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}