import { useState, useMemo, useCallback } from 'react';
import { useTicketLog } from '../features/ticket/hooks/useTicketLog';
import { useIncidents } from '../features/cases/hooks/useIncidents';
import { useTicketOptions } from '../hooks/useTicketOptions';

export const useOperationsData = (defaultView = 'table') => {
  // --- View State ---
  const [viewMode, setViewMode] = useState(defaultView); // 'table' (Tickets) or 'timeline' (Incidents)

  // --- Shared Filter State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // --- Data Fetching ---
  const {
    logs,
    loading: logsLoading,
    loadMore: loadMoreLogs,
    hasMore: hasMoreLogs,
    loadingMore: loadingMoreLogs,
    stats: logStats,
    refetch: refetchLogs
  } = useTicketLog();

  const {
    incidents,
    loading: incidentsLoading,
    error: incidentsError,
    // We ignore useIncidents' internal filtering/stats and compute our own to match the container's filter state
  } = useIncidents();

  // --- Filtering Logic (Centralized) ---

  // 1. Processed Incidents (Timeline)
  const filteredIncidents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return incidents.filter(item => {
      // Search
      const searchStr = `${item.subject || ''} ${item.project || ''} ${item.ticket || ''} ${item.createdBy?.name || item.createdBy || ''} ${item.status || ''}`.toLowerCase();
      const matchesSearch = !term || searchStr.includes(term);

      // Filters
      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
      const matchesType = filterType === 'All' || item.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Newest first
    });
  }, [incidents, searchTerm, filterStatus, filterType]);

  // 2. Processed Logs (Table)
  const filteredLogs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return logs.filter(log => {
      // Search
      const matchesSearch = !term ||
        log.ticketNumber?.toLowerCase().includes(term) ||
        log.shortDesc?.toLowerCase().includes(term) ||
        log.details?.toLowerCase().includes(term);

      // Filters
      const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
      const matchesType = filterType === 'All' || log.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      // Flagged items first
      if (a.isFlagged && !b.isFlagged) return -1;
      if (!a.isFlagged && b.isFlagged) return 1;
      // Then by date desc
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [logs, searchTerm, filterStatus, filterType]);

  // --- Helper: Clear Filters ---
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('All');
    setFilterType('All');
  }, []);

  const hasActiveFilters = !!searchTerm || filterStatus !== 'All' || filterType !== 'All';

  // --- Combined Stats (Optional, or per view) ---
  // For now, we can pass raw stats or computed stats based on the active view
  // But usually, stats cards are specific to the view (Ticket Stats vs Incident Stats)

  return {
    // State
    viewMode, setViewMode,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    filterType, setFilterType,
    clearFilters, hasActiveFilters,

    // Ticket Data
    logs,
    filteredLogs,
    logsLoading,
    loadMoreLogs,
    hasMoreLogs,
    loadingMoreLogs,
    logStats,
    refetchLogs,

    // Incident Data
    incidents,
    filteredIncidents,
    incidentsLoading,
    incidentsError
  };
};
