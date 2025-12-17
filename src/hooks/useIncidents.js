import { useState, useEffect, useCallback } from 'react';
import { incidentService } from '../services/incidentService';
import { api } from '../lib/api';

export const useIncidents = (currentUser) => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(false);

  // UI State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, []);

  // 1. Real-time Incidents
  useEffect(() => {
    setLoading(true);
    const unsubscribe = api.subscribeIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Events (เมื่อเลือก Incident)
  useEffect(() => {
    let unsubscribeEvents = null;
    if (selectedIncidentId) {
      setIsEventsLoading(true);
      unsubscribeEvents = api.subscribeIncidentEvents(selectedIncidentId, (events) => {
        setIncidents(prev => prev.map(inc =>
          inc.id === selectedIncidentId ? { ...inc, events } : inc
        ));
        setIsEventsLoading(false);
      });
    }
    return () => { if (unsubscribeEvents) unsubscribeEvents(); };
  }, [selectedIncidentId]);

  // Actions
  const handleSelectIncident = (id) => setSelectedIncidentId(id);

  const handleCreate = async () => {
    if (!currentUser) return showToast('Please select user first', 'error');
    try {
      const newCase = await incidentService.createIncident(currentUser);
      setSelectedIncidentId(newCase.id);
      showToast(`Case created`);
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleUpdate = async (id, data) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    await incidentService.updateIncident(id, data);
  };

  const requestDelete = (id) => {
    setConfirmConfig({ isOpen: true, type: 'incident', args: [id], title: 'Delete Incident?', message: 'Confirm delete?', isDanger: true });
  };

  const handleAddEvent = async (iid, data) => {
    try { await incidentService.addEvent(iid, data); showToast('Event added'); }
    catch (e) { showToast(e.message, 'error'); }
  };

  const handleUpdateEvent = async (iid, eid, data) => {
    try { await incidentService.updateEvent(iid, eid, data); showToast('Updated'); }
    catch (e) { showToast('Failed', 'error'); }
  };

  const requestDeleteEvent = (iid, eid) => {
    setConfirmConfig({ isOpen: true, type: 'event', args: [iid, eid], title: 'Delete Event?', message: 'Remove this event?', isDanger: true });
  };

  const handleReorderEvents = async (incidentId, newEvents) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, events: newEvents } : inc));
    try { await incidentService.reorderEvents(incidentId, newEvents); } catch (e) { console.error(e); }
  };

  const executeConfirmAction = async () => {
    const { type, args } = confirmConfig;
    setConfirmConfig({ ...confirmConfig, isOpen: false });
    try {
      if (type === 'incident') {
        await incidentService.deleteIncident(args[0]);
        if (selectedIncidentId === args[0]) setSelectedIncidentId(null);
        showToast('Deleted');
      } else if (type === 'event') {
        await incidentService.deleteEvent(args[0], args[1]);
        showToast('Deleted');
      }
    } catch (e) { showToast('Error', 'error'); }
  };

  // CSV Export with BOM + Timeline Fetch
  const handleExportCSV = async (dataToExport) => {
    showToast('Preparing download data...', 'info');
    const headers = "Date,Time,Project,Type,Ticket,Subject,Status,CreatedBy,Impact,Root Cause,Action,Timeline Details";

    const exportRows = await Promise.all(dataToExport.map(async (item) => {
      let timelineText = "";
      try {
        const events = await incidentService.getIncidentEvents(item.id);
        if (events && events.length > 0) {
          const sortedEvents = events.sort((a, b) => {
            const timeA = new Date(`${a.date}T${a.time}`);
            const timeB = new Date(`${b.date}T${b.time}`);
            return timeA - timeB;
          });
          timelineText = sortedEvents.map(e => `[${e.date} ${e.time}] ${e.title || e.desc}`).join("\n");
        }
      } catch (err) { timelineText = "Error loading timeline"; }

      const d = item.createdAt ? new Date(item.createdAt) : new Date();
      const dateStr = d.toLocaleDateString('en-GB');
      const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const esc = (t) => (t || '').toString().replace(/"/g, '""');

      return `"${dateStr}","${timeStr}","${esc(item.project)}","${esc(item.type)}","${esc(item.ticket)}","${esc(item.subject)}","${esc(item.status)}","${esc(item.createdBy)}","${esc(item.impact)}","${esc(item.root_cause)}","${esc(item.action)}","${esc(timelineText)}"`;
    }));

    const csvContent = [headers, ...exportRows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `NOC_Incidents_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('CSV Exported Successfully');
  };

  return {
    incidents, loading, selectedIncidentId, setSelectedIncidentId,
    isEventsLoading,
    handleSelectIncident, handleCreate, handleUpdate, requestDelete,
    handleAddEvent, handleUpdateEvent, requestDeleteEvent, handleReorderEvents,
    toast, setToast, confirmConfig, setConfirmConfig, executeConfirmAction,
    handleExportCSV
  };
};