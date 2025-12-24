import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { useStore } from '../../../store/useStore';

export const useDashboardStats = (selectedDate = null) => {
  const currentUser = useStore((state) => state.currentUser);
  const dateToQuery = selectedDate || new Date().toISOString().split('T')[0];

  // 1. Fetch Matches Summary
  const { data: daySummary = { total: 0, startDone: 0, endDone: 0, matches: [] }, isLoading: loadingMatches } = useQuery({
    queryKey: ['dashboardMatches', dateToQuery],
    queryFn: async () => {
      if (!currentUser) return { total: 0, startDone: 0, endDone: 0, matches: [] };

      const qMatch = query(collection(db, "schedules"), where("startDate", "==", dateToQuery), orderBy("startTime", "asc"));
      const matchSnap = await getDocs(qMatch);
      const matches = matchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // คำนวณ Stats จากข้อมูลที่ได้มาเลย (ลดจำนวน Request)
      return {
        total: matches.length,
        startDone: matches.filter(m => m.hasStartStat).length,
        endDone: matches.filter(m => m.hasEndStat).length,
        matches
      };
    },
    enabled: !!currentUser,
    refetchInterval: 1000 * 60, // อัปเดตทุก 1 นาที (Polling)
  });

  // 2. Fetch Active Incidents
  const { data: activeIncidents = 0 } = useQuery({
    queryKey: ['activeIncidents'],
    queryFn: async () => {
      const incQ = query(collection(db, "incidents"), where("status", "!=", "Closed"));
      const snapshot = await getCountFromServer(incQ);
      return snapshot.data().count;
    },
    enabled: !!currentUser,
    refetchInterval: 1000 * 60 * 2, // อัปเดตทุก 2 นาที
  });

  return {
    daySummary,
    todaySummary: daySummary,
    activeIncidents,
    loading: loadingMatches,
    selectedDate: dateToQuery
  };
};