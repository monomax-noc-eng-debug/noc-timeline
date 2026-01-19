import React, { useState, useEffect, useRef, memo } from 'react';
import {
  FilePlus2, Inbox, Layers, X,
  Download, Plus, Loader2, AlertCircle, RefreshCw, CloudDownload
} from 'lucide-react';
import IncidentCard from './IncidentCard';
import LogCard from './LogCard';
import { useTicketOptions } from '../../hooks/useTicketOptions';
import FilterBar from '../../components/common/FilterBar';
import { cn } from "@/lib/utils";

// Internal Debounce Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const CaseList = ({
  filteredIncidents, selectedId, onSelect, onAddIncident, onDeleteIncident, onExportCSV, onSync, stats,
  logs, selectedLogId, onSelectLog, logsLoading,
  viewMode, onViewModeChange, searchTerm, setSearchTerm,
  filterStatus, setFilterStatus, filterType, setFilterType,
  clearFilters, hasActiveFilters, loading, error, canEdit
}) => {
  const { ticketOptions } = useTicketOptions();

  // Search State
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 300);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync Debounce to Parent
  useEffect(() => { setSearchTerm(debouncedSearch); }, [debouncedSearch, setSearchTerm]);
  useEffect(() => { setLocalSearch(searchTerm); }, [searchTerm]);

  // Infinite Scroll State
  const [visibleItems, setVisibleItems] = useState(20);
  const observerTarget = useRef(null);

  const isInbox = viewMode === 'logs';
  const currentData = isInbox ? logs : filteredIncidents;
  const currentLoading = isInbox ? logsLoading : loading;

  // Reset scroll on view/filter change
  useEffect(() => { setVisibleItems(20); }, [currentData?.length, viewMode, filterStatus, filterType, debouncedSearch]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && currentData?.length > visibleItems) {
          setVisibleItems(prev => prev + 20);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [currentData, visibleItems]);

  const handleQuickFilter = (status) => {
    setFilterStatus(status === filterStatus ? 'All' : status);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-[#09090b] relative w-full border-r border-zinc-200 dark:border-zinc-800">

      <FilterBar
        // title="Timeline" // Removed per user request
        icon={isInbox ? Inbox : Layers}
        className="sticky top-0"

        // View Switcher (Custom Slot)
        viewToggle={
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5">
            <button
              onClick={() => onViewModeChange('incidents')}
              className={cn(
                "px-3 py-1.5 rounded-sm text-[10px] font-semibold uppercase tracking-wide transition-all",
                !isInbox
                  ? "bg-white dark:bg-zinc-900 text-[#0078D4] shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              Cases
            </button>
            <button
              onClick={() => onViewModeChange('logs')}
              className={cn(
                "px-3 py-1.5 rounded-sm text-[10px] font-semibold uppercase tracking-wide transition-all",
                isInbox
                  ? "bg-white dark:bg-zinc-900 text-[#0078D4] shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              Logs
            </button>
          </div>
        }

        // Search
        searchTerm={localSearch}
        onSearch={setLocalSearch}
        searchPlaceholder={isInbox ? "Search logs..." : "Search cases..."}

        // Filter Toggle
        isFilterActive={hasActiveFilters}
        onFilterClick={() => setIsMobileFilterOpen(true)}

        // Quick Filters (Pills) - Removed (Moved to Modal)
        quickFilters={[]}

        // Actions
        actions={!isInbox ? [
          {
            label: '', // Icon only for compact layout
            icon: Download,
            onClick: () => onExportCSV(filteredIncidents),
            title: 'Export CSV',
            variant: 'ghost'
          },
          ...(canEdit ? [{
            label: 'New',
            icon: FilePlus2,
            onClick: onAddIncident,
            variant: 'primary'
          }] : [])
        ] : []}
      />

      {/* --- CONTENT LIST --- */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {/* Error State */}
        {error && !isInbox ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Connection Error</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        ) : currentLoading && visibleItems === 20 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="animate-spin text-[#0078D4]" size={28} />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Loading data...</p>
          </div>
        ) : currentData?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-400 opacity-60">
            {isInbox ? <Inbox size={40} strokeWidth={1} /> : <Layers size={40} strokeWidth={1} />}
            <p className="text-sm font-medium mt-2">No records found</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-2 text-xs text-[#0078D4] font-bold hover:underline">Clear Filters</button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-20 md:pb-4 w-full">
            {currentData.slice(0, visibleItems).map((item) => (
              isInbox ? (
                <LogCard
                  key={item.ticketNumber || item.id}
                  log={item}
                  isSelected={selectedLogId === (item.ticketNumber || item.id)}
                  onClick={() => onSelectLog(item)}
                />
              ) : (
                <IncidentCard
                  key={item.id}
                  incident={item}
                  isSelected={selectedId === item.id}
                  onClick={() => onSelect(item.id)}
                  onDelete={onDeleteIncident}
                />
              )
            ))}
            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="h-4 w-full" />
          </div>
        )}
      </div>

      {/* --- FILTER MODAL (Centered - like TicketLog) --- */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative w-full sm:w-[400px] bg-white dark:bg-zinc-900 rounded-t-xl sm:rounded-xl p-5 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 pointer-events-auto m-0 sm:m-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0078D4]"><line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" /><line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" /><line x1="2" x2="6" y1="14" y2="14" /><line x1="10" x2="14" y1="8" y2="8" /><line x1="18" x2="22" y1="16" y2="16" /></svg>
                Filters
              </h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 hover:text-zinc-900 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['All', ...ticketOptions.statuses].map(s => {
                    const count = s === 'All'
                      ? (stats?.open + stats?.pending + stats?.resolved)
                      : stats?.[s.toLowerCase()];

                    return (
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
                        {count !== undefined && !isNaN(count) && (
                          <span className="opacity-60 text-[10px]">({count})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
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
                onClick={() => { clearFilters(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-2.5 text-zinc-600 font-bold bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 transition-colors text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-[2] py-2.5 bg-[#0078D4] text-white font-bold rounded-lg shadow-lg shadow-[#0078D4]/20 hover:bg-[#106EBE] transition-colors text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button */}
      {!isInbox && canEdit && (
        <button
          onClick={onAddIncident}
          className="md:hidden absolute bottom-5 right-5 z-40 w-12 h-12 bg-[#0078D4] text-white rounded-full shadow-xl shadow-[#0078D4]/30 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={22} />
        </button>
      )}

    </div>
  );
};

export default memo(CaseList);
