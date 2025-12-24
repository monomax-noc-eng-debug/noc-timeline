// file: src/features/cases/hooks/useEvents.js
import { useState, useEffect } from 'react';
import { incidentService } from '../../../services/incidentService';
import { useStore } from '../../../store/useStore'; // ✅ 1. Import Store

/**
 * Custom hook for managing timeline events of an incident
 * Provides real-time data and loading state
 */
export const useEvents = (incidentId) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 2. ดึง User มาเช็ค
  const currentUser = useStore((state) => state.currentUser);

  useEffect(() => {
    // ✅ 3. ถ้าไม่มี User หรือ IncidentId ให้หยุดทำงาน
    if (!currentUser || !incidentId) {
      setEvents([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = incidentService.subscribeEvents(incidentId, (data) => {
      setEvents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [incidentId, currentUser]); // ✅ 4. เพิ่ม currentUser ใน dependency

  // Get sorted events
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date || '1970-01-01'}T${a.time || '00:00'}`).getTime();
    const dateB = new Date(`${b.date || '1970-01-01'}T${b.time || '00:00'}`).getTime();

    if (dateA !== dateB) return dateB - dateA; // Latest First

    // If same time, use order as fallback (descending)
    return (b.order || 0) - (a.order || 0);
  });

  // Get timeline stats
  const stats = {
    total: events.length,
    withImages: events.filter(e => e.imageUrls && e.imageUrls.length > 0).length,
    dateRange: events.length > 0 ? {
      start: sortedEvents[0]?.date,
      end: sortedEvents[sortedEvents.length - 1]?.date
    } : null
  };

  return {
    events,
    sortedEvents,
    loading,
    error,
    stats
  };
};