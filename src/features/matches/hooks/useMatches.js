import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { format } from 'date-fns';

export const useMatches = (dateFilter) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState([]);

  useEffect(() => {
    setLoading(true);

    let q = collection(db, 'schedules');

    // ตรวจสอบว่าเป็นหน้ารายวัน (Today) หรือหน้าประวัติ (Archive)
    if (dateFilter) {
      // แปลง dateFilter เป็น string yyyy-MM-dd ให้ตรงกับ Database
      const dateStr = dateFilter instanceof Date ? format(dateFilter, 'yyyy-MM-dd') : dateFilter;
      q = query(
        collection(db, 'schedules'),
        where('startDate', '==', dateStr),
        orderBy('startTime', 'asc')
      );
    } else {
      q = query(
        collection(db, 'schedules'),
        orderBy('startDate', 'desc'),
        orderBy('startTime', 'asc')
      );
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // ✅ ดึงข้อมูล matches พร้อมกับ hasStartStat และ hasEndStat ที่บันทึกไว้แล้ว
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // ใช้ค่า hasStartStat และ hasEndStat ที่มีอยู่ใน document แล้ว
          // (useMatchStats บันทึกไว้ตอน save statistics)
          hasStartStat: data.hasStartStat || false,
          hasEndStat: data.hasEndStat || false
        };
      });

      setMatches(results);

      // จัดกลุ่มข้อมูลตามวันที่ (สำหรับหน้า HistoryPage)
      const groups = results.reduce((acc, match) => {
        const date = match.startDate;
        if (!acc[date]) acc[date] = [];
        acc[date].push(match);
        return acc;
      }, {});

      const sortedGroups = Object.entries(groups).sort((a, b) =>
        new Date(b[0]) - new Date(a[0])
      );

      setGroupedData(sortedGroups);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching realtime matches:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dateFilter]);

  return { matches, groupedData, loading };
};