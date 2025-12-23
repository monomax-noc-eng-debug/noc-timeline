// file: src/features/dashboard/hooks/useDashboardStats.js
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { useStore } from '../../../store/useStore';
// ❌ ลบ import dashboardService ออกไปเลยครับ

export const useDashboardStats = (selectedDate = null) => {
  const [daySummary, setDaySummary] = useState({ total: 0, startDone: 0, endDone: 0, matches: [] });
  const [activeIncidents, setActiveIncidents] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentUser = useStore((state) => state.currentUser);
  const dateToQuery = selectedDate || new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Check User
    if (!currentUser) {
      setDaySummary({ total: 0, startDone: 0, endDone: 0, matches: [] });
      setActiveIncidents(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. ดึงข้อมูลตารางงานวันนี้ (สำหรับ Card หน้า Welcome)
    const qMatch = query(
      collection(db, "schedules"),
      where("startDate", "==", dateToQuery),
      orderBy("startTime", "asc")
    );

    const unsubscribeMatches = onSnapshot(qMatch, (snapshot) => {
      const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDaySummary({
        total: matches.length,
        startDone: matches.filter(m => m.hasStartStat).length,
        endDone: matches.filter(m => m.hasEndStat).length,
        matches: matches
      });
      // ถ้าโหลด Matches เสร็จแล้ว ให้ถือว่า loading false ไปก่อน (เพื่อให้ UI ขึ้นเร็ว)
      setLoading(false);
    }, (error) => {
      // Ignore permission error
      if (error.code !== 'permission-denied') console.error("Error fetching day matches:", error);
      setLoading(false);
    });

    // 2. ดึงจำนวน Incident ที่ยังไม่ปิด (สำหรับ Card หน้า Welcome)
    // ใช้ getDocs ครั้งเดียวพอ ไม่ต้อง Realtime ก็ได้เพื่อประหยัด Resource
    const fetchIncidents = async () => {
      try {
        const incQ = query(collection(db, "incidents"), where("status", "!=", "Closed"));
        const snap = await getDocs(incQ);
        setActiveIncidents(snap.size);
      } catch (error) {
        if (error.code !== 'permission-denied') console.error("Error fetching incidents:", error);
      }
    };

    fetchIncidents();

    return () => unsubscribeMatches();
  }, [dateToQuery, currentUser]);

  return {
    daySummary,
    todaySummary: daySummary, // backward compatibility
    activeIncidents,
    loading,
    selectedDate: dateToQuery
  };
};