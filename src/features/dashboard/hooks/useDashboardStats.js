// file: src/features/dashboard/hooks/useDashboardStats.js
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { useStore } from '../../../store/useStore';
import { parse, addHours } from 'date-fns';

export const useDashboardStats = (selectedDate = null) => {
  const currentUser = useStore((state) => state.currentUser);
  const dateToQuery = selectedDate || new Date().toISOString().split('T')[0];

  // Local State
  const [rawMatches, setRawMatches] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // Update time every minute for live status calculation
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 1. Real-time Matches Listener (แทน Polling)
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query สำหรับดึงข้อมูลตารางแข่งของวันที่เลือก
    const qMatch = query(
      collection(db, "schedules"),
      where("startDate", "==", dateToQuery),
      orderBy("startTime", "asc")
    );

    // Subscribe ข้อมูล (จะทำงานทันทีที่มีการเปลี่ยนแปลงใน DB)
    const unsubscribeMatches = onSnapshot(qMatch, (snapshot) => {
      const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRawMatches(matches);
      setLoading(false);
    }, (error) => {
      console.error("Matches subscription error:", error);
      setLoading(false);
    });

    // Clean up function
    return () => unsubscribeMatches();
  }, [currentUser, dateToQuery]);

  // Calculate stats with time-based status
  const daySummary = useMemo(() => {
    const today = new Date(dateToQuery);

    let live = 0;
    let upcoming = 0;
    let finished = 0;

    rawMatches.forEach(match => {
      if (match.hasEndStat) {
        // Match is finished (has end stats)
        finished++;
      } else if (match.hasStartStat) {
        // Match is live (has start stats but no end stats)
        live++;
      } else if (match.startTime) {
        // Calculate based on time
        try {
          const matchStart = parse(match.startTime, 'HH:mm', today);
          const matchEnd = addHours(matchStart, 2); // Assume 2 hours duration

          if (now >= matchStart && now <= matchEnd) {
            // Currently within match time window
            live++;
          } else if (now > matchEnd) {
            // Past the match end time
            finished++;
          } else {
            // Before match start
            upcoming++;
          }
        } catch {
          // If parsing fails, count as upcoming
          upcoming++;
        }
      } else {
        // No start time, count as upcoming
        upcoming++;
      }
    });

    return {
      total: rawMatches.length,
      live,
      upcoming,
      finished,
      startDone: rawMatches.filter(m => m.hasStartStat).length,
      endDone: rawMatches.filter(m => m.hasEndStat).length,
      matches: rawMatches
    };
  }, [rawMatches, now, dateToQuery]);

  // 2. Real-time Active Incidents Listener
  useEffect(() => {
    if (!currentUser) return;

    // Query นับจำนวนเคสที่ยังไม่ปิด (Not Closed)
    const qIncidents = query(
      collection(db, "incidents"),
      where("status", "!=", "Closed")
    );

    // Subscribe จำนวนเคส
    const unsubscribeIncidents = onSnapshot(qIncidents, (snapshot) => {
      // snapshot.size คือจำนวนเอกสารที่ตรงเงื่อนไข
      setActiveIncidents(snapshot.size);
    }, (error) => {
      console.error("Incidents subscription error:", error);
    });

    return () => unsubscribeIncidents();
  }, [currentUser]);

  return {
    daySummary,
    todaySummary: daySummary, // รองรับชื่อตัวแปรเดิมเพื่อไม่ให้กระทบไฟล์อื่น
    activeIncidents,
    loading,
    selectedDate: dateToQuery
  };
};