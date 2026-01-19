import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { shiftService } from '../../../services/shiftService';
import { useStore } from '../../../store/useStore';

/**
 * Custom hook for Shift Handover Page Logic
 * Handles: Real-time Data Subscription, Filtering, Stats Calculation, CRUD Ops
 */
export const useShiftLogic = () => {
  const currentUser = useStore((state) => state.currentUser);
  const nocMembers = useStore((state) => state.nocMembers);
  const { toast } = useToast();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filter states
  const [filterDate, setFilterDate] = useState('');
  const [filterShift, setFilterShift] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchText, setSearchText] = useState('');

  // Toast Helper
  const showToast = useCallback((message, type = 'success') => {
    toast({ description: message, variant: type === 'error' ? 'destructive' : 'default' });
  }, [toast]);

  // 1. Real-time Subscription
  useEffect(() => {
    if (!currentUser) {
      setHistory([]);
      setLoading(false);
      return;
    }

    // Subscribe to Firebase/Backend
    const unsubscribe = shiftService.subscribeHandovers((data) => {
      setHistory(data || []); // Ensure array
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [currentUser]);

  // 2. Filter Logic (Memoized)
  const filteredHistory = useMemo(() => {
    if (!history.length) return [];

    const term = searchText.toLowerCase().trim();

    return history.filter(log => {
      // Search matching
      const noteMatch = (log.note || '').toLowerCase().includes(term);
      const onDutyMatch = (log.onDuty || []).some(m =>
        (m || '').toLowerCase().includes(term)
      );
      const statusMatch = (log.status || '').toLowerCase().includes(term);
      const matchSearch = !term || noteMatch || onDutyMatch || statusMatch;

      // Filter matching
      const matchDate = !filterDate || log.date === filterDate;
      const matchShift = filterShift === 'All' || log.shift === filterShift;
      const matchStatus = filterStatus === 'All' || log.status === filterStatus;

      return matchSearch && matchDate && matchShift && matchStatus;
    });
  }, [history, searchText, filterDate, filterShift, filterStatus]);

  // 3. Stats Calculation
  const getAckStats = useCallback((log) => {
    const total = Array.isArray(nocMembers) ? nocMembers.length : 0;
    const acked = (log.acknowledgedBy || []).length;
    // Prevent division by zero
    const percentage = total > 0 ? Math.round((acked / total) * 100) : 0;
    const isComplete = total > 0 && acked >= total;
    return { total, acked, percentage, isComplete };
  }, [nocMembers]);

  const stats = useMemo(() => {
    const total = filteredHistory.length;
    const withIssues = filteredHistory.filter(log => log.status !== 'Normal').length;
    const fullyAcked = filteredHistory.filter(log => getAckStats(log).isComplete).length;

    return { total, withIssues, fullyAcked };
  }, [filteredHistory, getAckStats]);

  // 4. CRUD Operations
  const handleSave = useCallback(async (formData, isEditing, id) => {
    setSaving(true);
    try {
      if (isEditing) {
        await shiftService.updateHandover(id, formData);
        showToast('Log updated successfully');
      } else {
        await shiftService.createHandover(formData);
        showToast('Log created successfully');
      }
      return true;
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Save failed', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  const handleDelete = useCallback(async (id) => {
    try {
      await shiftService.deleteHandover(id);
      showToast('Log deleted');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Delete failed', 'error');
    }
  }, [showToast]);

  const handleAcknowledge = useCallback(async (log, memberName) => {
    if (!currentUser) {
      showToast("Please login first!", 'error');
      return;
    }
    const isAck = (log.acknowledgedBy || []).includes(memberName);
    try {
      await shiftService.toggleAcknowledge(log.id, memberName, isAck);
      showToast(isAck ? 'Acknowledgment removed' : 'Acknowledged ✓');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update', 'error');
    }
  }, [currentUser, showToast]);

  const handleExportCSV = useCallback(() => {
    if (filteredHistory.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    try {
      const headers = "Date,Time,Shift,Status,Team,Acknowledged,Note";
      const csvContent = [
        headers,
        ...filteredHistory.map(log => {
          const dateStr = new Date(log.date).toLocaleDateString('en-GB');
          const noteEscaped = (log.note || '').replace(/"/g, '""');
          const onDutyStr = (log.onDuty || []).join('; ');
          const ackStr = (log.acknowledgedBy || []).join('; ');
          return `"${dateStr}","${log.time}","${log.shift}","${log.status}","${onDutyStr}","${ackStr}","${noteEscaped}"`;
        })
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `NOC_Handover_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      showToast('CSV exported successfully');
    } catch (error) {
      console.error(error);
      showToast('Export failed', 'error');
    }
  }, [filteredHistory, showToast]);

  const clearFilters = useCallback(() => {
    setFilterDate('');
    setFilterShift('All');
    setFilterStatus('All');
    setSearchText('');
  }, []);

  return {
    filteredHistory,
    loading,
    saving,
    stats,
    filterDate, setFilterDate,
    filterShift, setFilterShift,
    filterStatus, setFilterStatus,
    searchText, setSearchText,
    clearFilters,
    handleSave,
    handleDelete,
    handleAcknowledge,
    handleExportCSV,
    getAckStats
  };
};
