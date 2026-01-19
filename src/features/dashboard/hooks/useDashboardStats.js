import { useState, useEffect } from 'react';
import { subscribeIncidents } from '../../../services/incidentService';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { format } from 'date-fns';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    incidents: { total: 0, critical: 0, open: 0 },
    matches: { total: 0, live: 0, upcoming: 0 },
    currentShift: { onDuty: [], status: 'Normal', lastUpdate: null },
    loading: true
  });

  useEffect(() => {
    // 1. Subscribe Active Incidents
    const unsubIncidents = subscribeIncidents(
      (data) => {
        const active = data.filter(i => i.status !== 'Closed' && i.status !== 'Resolved');
        const critical = active.filter(i => i.priority === 'Critical' || i.priority === 'High').length;

        setStats(prev => ({
          ...prev,
          incidents: {
            total: active.length,
            open: active.filter(i => i.status === 'Open').length,
            critical
          }
        }));
      },
      (err) => console.error("Incidents Snapshot Error:", err)
    );

    // 2. Subscribe Today's Matches
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const matchesQuery = query(
      collection(db, 'schedules'),
      where('startDate', '==', todayStr)
    );

    const unsubMatches = onSnapshot(matchesQuery, (snapshot) => {
      const matches = snapshot.docs.map(d => d.data());
      const now = new Date();

      const live = matches.filter(m => {
        if (m.hasStartStat && !m.hasEndStat) return true;
        if (!m.startTime) return false;
        try {
          const start = new Date(`${todayStr}T${m.startTime}`);
          const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours match
          return now >= start && now <= end;
        } catch { return false; }
      }).length;

      setStats(prev => ({
        ...prev,
        matches: {
          total: matches.length,
          live,
          upcoming: Math.max(0, matches.length - live)
        }
      }));
    }, (err) => console.error("Matches Snapshot Error:", err));

    // 3. Subscribe Latest Shift Log
    const shiftQuery = query(
      collection(db, 'shifts'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubShift = onSnapshot(shiftQuery, (snapshot) => {
      if (!snapshot.empty) {
        const latest = snapshot.docs[0].data();
        setStats(prev => ({
          ...prev,
          currentShift: {
            onDuty: latest.onDuty || [],
            status: latest.status || 'Normal',
            lastUpdate: latest.updatedAt || latest.createdAt
          }
        }));
      }
    }, (err) => console.error("Shift Snapshot Error:", err));

    // Initial Loading State Off
    setTimeout(() => {
      setStats(p => ({ ...p, loading: false }));
    }, 500);

    return () => {
      if (typeof unsubIncidents === 'function') unsubIncidents();
      if (unsubMatches) unsubMatches();
      if (unsubShift) unsubShift();
    };
  }, []);

  return stats;
};
