// file: src/features/cases/hooks/useIncidents.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { incidentService } from '../../../services/incidentService';
import { useStore } from '../../../store/useStore'; // ✅ 1. Import Store

/**
 * Custom hook for managing incidents
 * Provides real-time data, filtering, and statistics
 */
export const useIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // ✅ 2. ดึงสถานะ User มาเช็ค
  const currentUser = useStore((state) => state.currentUser);

  // Real-time subscription
  useEffect(() => {
    // ✅ 3. ถ้ายังไม่ล็อกอิน ให้หยุดทำงาน (ป้องกัน Error Permission Denied)
    if (!currentUser) {
      setIncidents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = incidentService.subscribeIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]); // ✅ 4. เพิ่ม dependency currentUser

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || (
        (incident.subject || '').toLowerCase().includes(term) ||
        (incident.project || '').toLowerCase().includes(term) ||
        (incident.ticket || '').toLowerCase().includes(term) ||
        (incident.createdBy || '').toLowerCase().includes(term)
      );
      const matchesStatus = filterStatus === 'All' || incident.status === filterStatus;
      const matchesType = filterType === 'All' || incident.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [incidents, searchTerm, filterStatus, filterType]);

  // Statistics
  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter(i => i.status === 'Open').length;
    const inProgress = incidents.filter(i => i.status === 'In Progress').length;
    const pending = incidents.filter(i => i.status === 'Pending').length;
    const monitoring = incidents.filter(i => i.status === 'Monitoring').length;
    const succeed = incidents.filter(i => i.status === 'Succeed').length;
    const resolved = incidents.filter(i => i.status === 'Resolved').length;
    const closed = incidents.filter(i => i.status === 'Closed').length;

    return { total, open, inProgress, pending, monitoring, succeed, resolved, closed };
  }, [incidents]);

  // Get status distribution for charts
  const statusDistribution = useMemo(() => {
    return [
      { status: 'Open', count: stats.open, color: '#ef4444' },
      { status: 'In Progress', count: stats.inProgress, color: '#3b82f6' },
      { status: 'Pending', count: stats.pending, color: '#f59e0b' },
      { status: 'Monitoring', count: stats.monitoring, color: '#f97316' },
      { status: 'Succeed', count: stats.succeed, color: '#10b981' },
      { status: 'Resolved', count: stats.resolved, color: '#059669' },
      { status: 'Closed', count: stats.closed, color: '#6b7280' },
    ].filter(item => item.count > 0);
  }, [stats]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('All');
    setFilterType('All');
  }, []);

  // Check if filters are active
  const hasActiveFilters = searchTerm || filterStatus !== 'All' || filterType !== 'All';

  return {
    // Data
    incidents,
    filteredIncidents,
    selectedId,
    setSelectedId,
    loading,

    // Filters
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    filterType, setFilterType,
    clearFilters,
    hasActiveFilters,

    // Stats
    stats,
    statusDistribution
  };
};