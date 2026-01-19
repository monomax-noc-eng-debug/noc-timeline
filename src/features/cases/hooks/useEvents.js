import { useState, useEffect, useMemo } from 'react';
import incidentService from '../../../services/incidentService';

export const useEvents = (incidentId) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!incidentId) {
      setTimeout(() => {
        setEvents([]);
      }, 0);
      return;
    }

    // Subscribe for real-time updates


    const unsubscribe = incidentService.subscribeEvents(incidentId, (data) => {


      const processedData = (data || []).map(ev => ({
        ...ev,
        // Ensure robust date parsing
        _sortTime: new Date(`${ev.date || '1970-01-01'}T${ev.time || '00:00'}`).getTime()
      }));
      setEvents(processedData);
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [incidentId]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b._sortTime - a._sortTime);
  }, [events]);

  return { events, sortedEvents, loading };
};
