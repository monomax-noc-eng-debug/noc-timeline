import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';

export const useMatchDetails = (matchId, isOpen) => {
  const [data, setData] = useState({ start: null, end: null, loading: false });
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!matchId) return;

    setData(prev => ({ ...prev, loading: true }));
    setError(null);

    try {
      const startRef = doc(db, 'schedules', matchId, 'statistics', 'start_stat');
      const endRef = doc(db, 'schedules', matchId, 'statistics', 'end_stat');

      const [startSnap, endSnap] = await Promise.all([
        getDoc(startRef),
        getDoc(endRef)
      ]);

      setData({
        start: startSnap.exists() ? startSnap.data() : null,
        end: endSnap.exists() ? endSnap.data() : null,
        loading: false
      });
    } catch (err) {
      console.error("Error fetching match detail stats:", err);
      setError(err.message);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [matchId]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && matchId) {
      // Use setTimeout to avoid synchronous state update during render phase
      setTimeout(() => {
        if (isMounted) fetchStats();
      }, 0);
    }
    return () => { isMounted = false; };
  }, [isOpen, matchId, fetchStats]);

  return { ...data, error, refetch: fetchStats };
};
