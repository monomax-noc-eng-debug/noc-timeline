// file: src/features/handover/hooks/useShiftLogic.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { shiftService } from '../../../services/shiftService';
import { useStore } from '../../../store/useStore';

/**
 * Custom hook for Shift Handover logic
 * Handles CRUD operations, filtering, and acknowledgment
 */
export const useShiftLogic = () => {
  const currentUser = useStore((state) => state.currentUser);
  const nocMembers = useStore((state) => state.nocMembers);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filter states
  const [filterDate, setFilterDate] = useState('');
  const [filterShift, setFilterShift] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchText, setSearchText] = useState('');

  // Toast notification
  const { toast } = useToast();

  const showToast = useCallback((message, type = 'success') => {
    toast({
      description: message,
      variant: type,
    });
  }, [toast]);

  // Real-time Subscription
  useEffect(() => {
    // ✅ เพิ่มการเช็ค currentUser
    if (!currentUser) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = shiftService.subscribeHandovers((data) => {
      setHistory(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]); // ✅ เพิ่ม dependency

  // Filtered history with null-safe checks
  const filteredHistory = useMemo(() => {
    return history.filter(log => {
      const term = searchText.toLowerCase();

      // Null-safe search
      const noteMatch = log.note?.toLowerCase().includes(term) || false;
      const onDutyMatch = (log.onDuty || []).some(m =>
        typeof m === 'string' && m.toLowerCase().includes(term)
      );
      const statusMatch = log.status?.toLowerCase().includes(term) || false;

      const matchSearch = !term || noteMatch || onDutyMatch || statusMatch;
      const matchDate = !filterDate || log.date === filterDate;
      const matchShift = filterShift === 'All' || log.shift === filterShift;
      const matchStatus = filterStatus === 'All' || log.status === filterStatus;

      return matchSearch && matchDate && matchShift && matchStatus;
    });
  }, [history, searchText, filterDate, filterShift, filterStatus]);

  // Calculate acknowledgment statistics
  const getAckStats = useCallback((log) => {
    const total = nocMembers.length;
    const acked = (log.acknowledgedBy || []).length;
    const percentage = total > 0 ? Math.round((acked / total) * 100) : 0;
    const isComplete = acked >= total;
    return { total, acked, percentage, isComplete };
  }, [nocMembers]);

  // Overall stats
  const stats = useMemo(() => {
    const total = filteredHistory.length;
    const withIssues = filteredHistory.filter(log => log.status !== 'Normal').length;
    const fullyAcked = filteredHistory.filter(log => {
      const { isComplete } = getAckStats(log);
      return isComplete;
    }).length;

    return { total, withIssues, fullyAcked };
  }, [filteredHistory, getAckStats]);

  // CRUD Operations
  const handleSave = async (formData, isEditing, id) => {
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
      showToast(err.message || 'Save failed', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await shiftService.deleteHandover(id);
      showToast('Log deleted');
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleAcknowledge = async (log, memberName) => {
    if (!currentUser) {
      showToast("Please login first!", 'error');
      return;
    }

    const isAck = (log.acknowledgedBy || []).includes(memberName);
    try {
      await shiftService.toggleAcknowledge(log.id, memberName, isAck);
      showToast(isAck ? 'Acknowledgment removed' : 'Acknowledged ✓');
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    }
  };

  const handleExportCSV = () => {
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

    showToast('CSV exported');
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterShift('All');
    setFilterStatus('All');
    setSearchText('');
  };

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
    clearFilters,
    showToast,
    handleSave,
    handleDelete,
    handleAcknowledge,
    handleExportCSV,
    getAckStats
  };
};