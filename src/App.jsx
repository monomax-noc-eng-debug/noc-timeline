import React, { useState, useEffect } from 'react';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import ToastContainer from './components/Toast';
import ConfirmModal from './components/ConfirmModal'; // ✅ Import Modal
import { api } from './lib/api';

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [toasts, setToasts] = useState([]);

  // ✅ State สำหรับ Modal ยืนยัน
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    type: null, // 'incident' หรือ 'event'
    args: [],   // เก็บ ID ที่จะลบ
    title: '',
    message: ''
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  useEffect(() => { fetchData(true); }, []);

  const fetchData = async (isReset = false) => {
    try {
      if (isReset) setLoading(true); else setIsLoadingMore(true);
      const cursor = isReset ? null : lastDoc;
      const { data, lastVisible } = await api.getIncidents(cursor);
      if (isReset) setIncidents(data); else setIncidents(prev => [...prev, ...data]);
      setLastDoc(lastVisible);
      setHasMore(!!lastVisible);
    } catch (error) { console.error(error); addToast('Failed to load data', 'error'); } finally { setLoading(false); setIsLoadingMore(false); }
  };

  const handleSelectIncident = async (id) => {
    setSelectedIncidentId(id);
    const incident = incidents.find(inc => inc.id === id);
    if (incident && (!incident.events || incident.events.length === 0)) {
      try {
        const fetchedEvents = await api.getIncidentEvents(id);
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, events: fetchedEvents || [] } : inc));
      } catch (e) { console.error(e); }
    }
  };
  const handleLoadMore = () => { if (!isLoadingMore && hasMore) fetchData(false); };
  const activeIncident = incidents.find(inc => inc.id === selectedIncidentId);

  // --- CRUD Handlers ---

  const handleAddIncident = async () => {
    try {
      const created = await api.createIncident({ project: 'New Project', subject: 'New Incident', ticket: '' });
      setIncidents([created, ...incidents]);
      setSelectedIncidentId(created.id);
      addToast('New incident created');
    } catch (e) { addToast(e.message, 'error'); }
  };

  // 1. กดปุ่มลบ Incident -> เปิด Modal
  const requestDeleteIncident = (id) => {
    setConfirmConfig({
      isOpen: true,
      type: 'incident',
      args: [id],
      title: 'Delete Incident?',
      message: 'Are you sure you want to delete this incident and all its events? This cannot be undone.'
    });
  };

  const handleUpdateIncident = (id, data) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    api.updateIncident(id, data);
  };

  const handleAddEvent = async (iid, data) => {
    try {
      const nev = await api.createEvent({ incident_id: iid, ...data });
      setIncidents(prev => prev.map(i => i.id === iid ? { ...i, events: [...(i.events || []), nev] } : i));
      addToast('Event added successfully');
    } catch (e) { addToast(e.message, 'error'); }
  };

  // 2. กดปุ่มลบ Event -> เปิด Modal
  const requestDeleteEvent = (iid, eid) => {
    setConfirmConfig({
      isOpen: true,
      type: 'event',
      args: [iid, eid],
      title: 'Delete Event?',
      message: 'Do you really want to remove this event from the timeline?'
    });
  };

  const handleUpdateEvent = async (iid, eid, data) => {
    try {
      setIncidents(prev => prev.map(i => i.id === iid ? { ...i, events: i.events.map(e => e.id === eid ? { ...e, ...data } : e) } : i));
      await api.updateEvent(iid, eid, data);
      addToast('Event updated');
    } catch (e) { addToast('Update failed', 'error'); }
  };

  const handleReorderEvents = async (incidentId, newEvents) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, events: newEvents } : inc));
    try { await api.reorderEvents(incidentId, newEvents); } catch (e) { console.error("Reorder failed", e); addToast('Failed to save order', 'error'); }
  };

  // ✅ 3. ฟังก์ชันลบจริง (ทำงานเมื่อกดปุ่ม Delete ใน Modal)
  const executeDelete = async () => {
    const { type, args } = confirmConfig;

    // ปิด Modal ก่อน
    setConfirmConfig({ ...confirmConfig, isOpen: false });

    try {
      if (type === 'incident') {
        const [id] = args;
        await api.deleteIncident(id);
        setIncidents(prev => prev.filter(i => i.id !== id));
        if (selectedIncidentId === id) setSelectedIncidentId(null);
        addToast('Incident deleted successfully');
      } else if (type === 'event') {
        const [iid, eid] = args;
        await api.deleteEvent(iid, eid);
        setIncidents(prev => prev.map(i => i.id === iid ? { ...i, events: i.events.filter(e => e.id !== eid) } : i));
        addToast('Event deleted');
      }
    } catch (e) {
      addToast('Delete failed: ' + e.message, 'error');
    }
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="h-dvh w-screen bg-gray-200 dark:bg-black flex items-center justify-center p-2 lg:p-8 transition-colors duration-300">

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ✅ ใส่ ConfirmModal ไว้ตรงนี้ */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeDelete}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />

      <div className="w-full max-w-400 h-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border-2 border-gray-300 dark:border-zinc-700">
        <CaseList
          incidents={incidents} selectedId={selectedIncidentId} onSelect={handleSelectIncident}
          onAddIncident={handleAddIncident}
          onDeleteIncident={requestDeleteIncident} // ✅ ส่ง requestDelete แทน
          darkMode={darkMode} toggleTheme={toggleTheme}
          onLoadMore={handleLoadMore} hasMore={hasMore} isLoadingMore={isLoadingMore}
        />
        <CaseDetail
          incident={activeIncident}
          onUpdateIncident={handleUpdateIncident} onAddEvent={handleAddEvent}
          onDeleteEvent={requestDeleteEvent} // ✅ ส่ง requestDelete แทน
          onUpdateEvent={handleUpdateEvent}
          onReorderEvent={handleReorderEvents}
        />
      </div>
    </div>
  );
}