import { useState, useEffect, useMemo, useCallback } from 'react';
import incidentService from '../../../services/incidentService';

export const useIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // Real-time subscription with error handling
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to incidents collection with error callback
    const unsubscribe = incidentService.subscribeIncidents(
      (data) => {
        // Pre-calculate search string for performance
        const processedData = (data || []).map(item => ({
          ...item,
          _searchString: `${item.subject || ''} ${item.project || ''} ${item.ticket || ''} ${item.createdBy && typeof item.createdBy === 'object' ? item.createdBy.name : item.createdBy || ''
            } ${item.status || ''} ${item.type || ''}`.toLowerCase()
        }));
        setIncidents(processedData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useIncidents error:", err);
        setError(err.message || 'Failed to connect to database');
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Filter & Sort Logic (Memoized)
  const filteredIncidents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    const result = incidents.filter(incident => {
      // Search Logic - Cached String
      const matchesSearch = !term || (incident._searchString || '').includes(term);

      // Filter Logic
      const matchesStatus = filterStatus === 'All' || incident.status === filterStatus;
      const matchesType = filterType === 'All' || incident.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Sort newest first
    });

    return result;

  }, [incidents, searchTerm, filterStatus, filterType]);

  // Stats Calculation
  const stats = useMemo(() => {
    const initialStats = {
      total: 0, open: 0, inProgress: 0, pending: 0,
      monitoring: 0, succeed: 0, resolved: 0, closed: 0
    };

    return incidents.reduce((acc, curr) => {
      acc.total++;
      const statusKey = curr.status?.replace(/\s+/g, '').replace(/^\w/, c => c.toLowerCase());

      if (acc[statusKey] !== undefined) {
        acc[statusKey]++;
      } else if (curr.status === 'In Progress') {
        acc.inProgress++;
      }

      return acc;
    }, initialStats);
  }, [incidents]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('All');
    setFilterType('All');
  }, []);

  const hasActiveFilters = !!searchTerm || filterStatus !== 'All' || filterType !== 'All';

  return {
    incidents,
    filteredIncidents,
    selectedId,
    setSelectedId,
    loading,
    error,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    filterType, setFilterType,
    clearFilters,
    hasActiveFilters,
    stats
  };
};
