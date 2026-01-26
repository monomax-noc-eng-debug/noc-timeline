import React, { useState, useEffect, useRef, memo } from 'react';
import {
  FilePlus2, Inbox, Layers, X,
  Download, Plus, Loader2, AlertCircle, RefreshCw, CloudDownload
} from 'lucide-react';
import IncidentCard from './IncidentCard';
import LogCard from './LogCard';
import { useTicketOptions } from '../../hooks/useTicketOptions';
// FilterBar import removed - logic externalized
import { cn } from "@/lib/utils";

// Internal Debounce Hook (Removed as search is external)

const CaseList = ({
  filteredIncidents, selectedId, onSelect, onAddIncident, onDeleteIncident, onExportCSV, onSync, stats,
  logs, selectedLogId, onSelectLog, logsLoading,
  viewMode, onViewModeChange, searchTerm, setSearchTerm,
  filterStatus, setFilterStatus, filterType, setFilterType,
  clearFilters, hasActiveFilters, loading, error, canEdit
}) => {
  const { ticketOptions } = useTicketOptions();

  // Search State - Managed Externally now


  // Infinite Scroll State
  const [visibleItems, setVisibleItems] = useState(20);
  const observerTarget = useRef(null);

  const isInbox = viewMode === 'logs';
  const currentData = isInbox ? logs : filteredIncidents;
  const currentLoading = isInbox ? logsLoading : loading;

  // Reset scroll on view/filter change
  useEffect(() => { setVisibleItems(20); }, [currentData?.length, viewMode, filterStatus, filterType]);

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



  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-[#09090b] relative w-full border-r border-zinc-200 dark:border-zinc-800">

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

      {/* --- Filter Modal (Mobile Only or triggered externally?) --- 
          Actually, since Global Filter handles everything, do we need this modal?
          The request was to remove "header... filter new search".
          If the global filter bar has an advanced filter button, it opens the GLOBAL filter modal.
          Use params `isMobileFilterOpen` here seem to be local. 
          If `OperationsPage` handles filter modal, we can remove this local one too.
          But `TimelineListView` passed empty handlers to `CaseList`...
          Let's KEEP this local modal for now but it won't be triggered by the removed header.
          Wait, if the header is removed, there is no button to open `isMobileFilterOpen`. 
          So this code is dead unless we expose a trigger.
          The user said "header ... remove". 
          So I will remove the local filter modal code to keep it clean, as requested.
       */}

      {/* Mobile Floating Action Button - Keep for mobile convenience or remove as well?
          User said "remove header". FAB is not header. 
          But Global FilterBar should have "New" button visible on mobile too.
          Let's keep FAB just in case, or safer to remove if duplication.
          Global FilterBar (OperationsPage) has "New" action with `hideTextOnMobile: true` (icon only).
          So duplicates are likely. I will remove the FAB.
       */}

    </div>
  );
};

export default memo(CaseList);
