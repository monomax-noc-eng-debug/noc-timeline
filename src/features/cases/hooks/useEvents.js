// file: src/features/cases/hooks/useEvents.js
import { useState, useEffect, useMemo } from 'react';
import { incidentService } from '../../../services/incidentService';
import { useStore } from '../../../store/useStore';

export const useEvents = (incidentId) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = useStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser || !incidentId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = incidentService.subscribeEvents(incidentId, (data) => {
      // ✅ 1. Pre-calculate timestamp for sorting
      const processedData = data.map(ev => ({
        ...ev,
        // สร้าง _sortTime ไว้เลยจะได้ไม่ต้อง new Date() ตอน sort บ่อยๆ
        _sortTime: new Date(`${ev.date || '1970-01-01'}T${ev.time || '00:00'}`).getTime()
      }));
      setEvents(processedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [incidentId, currentUser]);

  // ✅ 2. Use Memoized sorted events using pre-calculated timestamp
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a._sortTime !== b._sortTime) {
        return b._sortTime - a._sortTime; // Latest First
      }
      return (b.order || 0) - (a.order || 0); // Fallback to order
    });
  }, [events]);

  const stats = useMemo(() => ({
    total: events.length,
    withImages: events.filter(e => e.imageUrls && e.imageUrls.length > 0).length,
    dateRange: sortedEvents.length > 0 ? {
      start: sortedEvents[sortedEvents.length - 1]?.date,
      end: sortedEvents[0]?.date
    } : null
  }), [events, sortedEvents]);

  return {
    events,
    sortedEvents,
    loading,
    error,
    stats
  };
};