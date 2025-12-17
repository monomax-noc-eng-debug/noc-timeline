import { useState, useEffect, useCallback } from 'react';
import { shiftService } from '../services/shiftService';
import { api } from '../lib/api';

export const useShiftLogic = (currentUser) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterDate, setFilterDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, []);

  // Real-time Subscription
  useEffect(() => {
    setLoading(true);
    const unsubscribe = api.subscribeHandovers((data) => {
      setHistory(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    try { await shiftService.deleteHandover(id); showToast('Deleted'); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const handleSave = async (formData, isEditing, editingId) => {
    try {
      if (isEditing) {
        await shiftService.updateHandover(editingId, formData);
        showToast('Updated');
      } else {
        await shiftService.createHandover(formData);
        showToast('Created');
      }
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleAcknowledge = async (log, memberName) => {
    if (!currentUser) { showToast("Select user first!", 'error'); return false; }
    const isAck = (log.acknowledgedBy || []).includes(memberName);
    try {
      await shiftService.toggleAcknowledge(log.id, memberName, isAck);
      showToast(isAck ? 'Ack removed' : 'Acknowledged');
      return true;
    } catch (err) { showToast(err.message, 'error'); return false; }
  };

  const handleExportCSV = (filteredData) => {
    const headers = "Date,Time,Shift,Status,Team,Ack,Note";
    const csvContent = [
      headers,
      ...filteredData.map(log => {
        const dateStr = new Date(log.date).toLocaleDateString('en-GB');
        const noteEscaped = (log.note || '').replace(/"/g, '""');
        const teamEscaped = (log.onDuty || []).join('; ');
        const ackEscaped = (log.acknowledgedBy || []).join('; ');
        return `"${dateStr}","${log.time}","${log.shift}","${log.status}","${teamEscaped}","${ackEscaped}","${noteEscaped}"`;
      })
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `NOC_Handover_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('CSV Exported');
  };

  return {
    history, loading,
    filterDate, setFilterDate,
    searchText, setSearchText,
    toast, setToast,
    handleDelete, handleSave, handleAcknowledge, handleExportCSV
  };
};