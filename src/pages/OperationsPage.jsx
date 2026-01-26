import React, { useState, useEffect } from 'react';
import { useOperationsData } from '../hooks/useOperationsData';
import { useLocation } from 'react-router-dom';
import { Inbox, AlertTriangle, Archive, Plus, DownloadCloud, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { hasRole, ROLES } from '../utils/permissions';
import { cn } from "@/lib/utils";

// Components
import FilterBar from '../components/common/FilterBar';
import TicketTableView from '../features/operations/TicketTableView';
import TimelineListView from '../features/operations/TimelineListView';
import { useTicketOptions } from '../hooks/useTicketOptions';

export default function OperationsPage({ defaultView = 'table' }) {
  const { currentUser } = useStore();
  const canEdit = hasRole(currentUser, [ROLES.LEAD, ROLES.ENGINEER]);
  const location = useLocation();
  const { ticketOptions } = useTicketOptions();

  // Use the hook
  const {
    viewMode, setViewMode,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    filterType, setFilterType,
    clearFilters, hasActiveFilters,
    // Data
    filteredLogs, logsLoading, loadMoreLogs, hasMoreLogs, loadingMoreLogs, logStats,
    filteredIncidents, incidentsLoading, incidentsError,
    // Actions needed for FilterBar actions
    // createTicket? We need to trigger it in sub-component or here?
    // Sub-components have their own Managers (Panels).
    // We can just switch views.
    stats // We might need to compute combined stats or active view stats
  } = useOperationsData(defaultView);

  // Sync view mode if prop changes (routing)
  useEffect(() => {
    setViewMode(defaultView);
  }, [defaultView, setViewMode]);

  // Handle Tab Change
  const handleTabChange = (mode) => {
    setViewMode(mode);
    // Optionally clear filters on switch? The requirements said "Seamless Switching" and shared logic.
    // So keeping filters active is actually a "Shared Filter" feature. 
    // It's cool if I search "Server" and switch tabs, and both show matches.
  };

  // Filter Modal State
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Active Stats for Filter Modal
  // Use logStats if table, or compute incident stats if timeline?
  // `useOperationsData` returns `logStats`. It doesn't return `incidentStats`.
  // `useIncidents` computes stats internally. We might need to expose them if we want to show counts in Filter Modal.
  // For now, let's just use logStats or generic.

  // ACTIONS for FilterBar
  // When "New" is clicked:
  // If Table View: Trigger Ticket Create Panel.
  // If Timeline View: Trigger Incident Create Panel.
  // Problem: The panels are inside the sub-components.
  // Solution: We can use a ref or DOM event, or just simple state passed down?
  // Let's use a simple Custom Event or just a shared state `isCreateTriggered`.
  // Actually, I added `data-trigger-create` in TicketTableView. I can click it programmatically?
  // Or cleaner: `OperationsPage` shouldn't manage sub-component panels.
  // BUT the FilterBar is HERE.
  // Let's pass `actionTrigger` prop to sub-components?
  // Or better: Let the Active View Component render the "New" button in the FilterBar?
  // No, `OperationsPage` renders `FilterBar`.
  // Let's use a callback prop `onCreate` passed to `Sidebar`? No.

  // Quick Fix: `triggerCreate` state.
  const [triggerCreateCounter, setTriggerCreateCounter] = useState(0);

  const handleCreateClick = () => {
    // We can dispatch a window event or use a Context, or querySelector.
    // QuerySelector is reliable enough for this scoped boundary.
    const trigger = document.querySelector('[data-trigger-create]');
    if (trigger) trigger.click();

    // For timeline, we didn't add a trigger yet.
    // Let's assumes we will add it to `TimelineListView` too.
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-black transition-colors">

      {/* 1. TOP BAR: Tabs & Global Search */}
      <div className="shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col">

          {/* Tabs */}
          <div className="flex items-center px-4 pt-4 gap-4">
            <button
              onClick={() => handleTabChange('table')}
              className={cn(
                "pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2",
                viewMode === 'table'
                  ? "border-[#0078D4] text-[#0078D4]"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <Archive size={16} /> Ticket Log
            </button>
            <button
              onClick={() => handleTabChange('timeline')}
              className={cn(
                "pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2",
                viewMode === 'timeline'
                  ? "border-[#0078D4] text-[#0078D4]"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <AlertTriangle size={16} /> Timeline
            </button>
          </div>

          {/* Filter Bar (Shared) */}
          <FilterBar
            title={viewMode === 'table' ? "Ticket Log" : "Incident Timeline"}
            icon={viewMode === 'table' ? Inbox : AlertTriangle}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            isFilterActive={hasActiveFilters}
            onFilterClick={() => setIsFilterOpen(true)}
            actions={[
              {
                label: 'New',
                icon: Plus,
                onClick: handleCreateClick,
                variant: 'primary',
                disabled: !canEdit,
                hideTextOnMobile: true
              },
              // Export button for Timeline view
              ...(viewMode === 'timeline' ? [{
                label: 'Export',
                icon: DownloadCloud,
                onClick: () => {
                  const trigger = document.querySelector('[data-trigger-export]');
                  if (trigger) trigger.click();
                },
                variant: 'ghost',
                hideTextOnMobile: true
              }] : []),
              // Sync button only for Table view
              ...(viewMode === 'table' ? [{
                label: 'Sync',
                icon: DownloadCloud,
                onClick: () => {
                  // Access sync modal in sub-component? 
                  // Maybe separate Sync button is good.
                  // Or same trigger pattern.
                  const trigger = document.querySelector('[data-trigger-sync]');
                  if (trigger) trigger.click();
                },
                variant: 'secondary',
                disabled: !canEdit || logsLoading,
                hideTextOnMobile: true
              }] : [])
            ]}
          />
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'table' ? (
          <TicketTableView
            logs={filteredLogs}
            loading={logsLoading}
            loadMore={loadMoreLogs}
            hasMore={hasMoreLogs}
            loadingMore={loadingMoreLogs}
            stats={logStats}
          // We need to pass down a way to trigger panels if using the querySelector hack
          />
        ) : (
          <TimelineListView
            incidents={filteredIncidents}
            loading={incidentsLoading}
            error={incidentsError}
          // TimelineListView needs to expose a create trigger too?
          // Let's add it to TimelineListView
          />
        )}
      </div>

      {/* FILTER MODAL (Shared) */}
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
                  {['All', ...ticketOptions.statuses].map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5",
                        filterStatus === s
                          ? "bg-[#0078D4] text-white border-transparent"
                          : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Type</label>
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
