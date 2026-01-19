import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { format, isValid } from 'date-fns';
import { useState, useMemo } from 'react';
import { REFRESH_INTERVALS } from '@/config/constants';

// Fetcher Function
const fetchMatches = async ({ queryKey }) => {
  const [_, { dateFilter, dateRange, limit: itemsLimit }] = queryKey;
  const scheduleRef = collection(db, 'schedules');
  let q;

  try {
    // 1. Single Date (Today View)
    if (dateFilter) {
      let dateStr = dateFilter;
      if (dateFilter instanceof Date) {
        if (isValid(dateFilter)) {
          dateStr = format(dateFilter, 'yyyy-MM-dd');
        } else {
          return [];
        }
      }
      // ดึงข้อมูลตามวันที่ และเรียงตามเวลา
      q = query(scheduleRef, where('startDate', '==', dateStr), orderBy('startTime', 'asc'));
    }
    // 2. Date Range (Calendar View)
    else if (dateRange?.start && dateRange?.end) {
      q = query(
        scheduleRef,
        where('startDate', '>=', dateRange.start),
        where('startDate', '<=', dateRange.end),
        orderBy('startDate', 'asc'),
        orderBy('startTime', 'asc')
      );
    }
    // 3. Default List (History View)
    else {
      q = query(scheduleRef, orderBy('startDate', 'desc'), orderBy('startTime', 'asc'), limit(itemsLimit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // แปลงเป็น Boolean เพื่อความชัวร์
        hasStartStat: !!data.hasStartStat,
        hasEndStat: !!data.hasEndStat,
        // 🚀 Performance: สร้าง Index สำหรับ Search ฝั่ง Client ไว้เลย
        _searchString: `${data.teamA || ''} ${data.teamB || ''} ${data.match || ''} ${data.title || ''} ${data.league || ''} ${data.channel || ''}`.toLowerCase()
      };
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

/**
 * useMatches Hook
 * @param {Date|string} dateFilter - วันที่ต้องการดึง (สำหรับหน้า Today)
 * @param {Object} dateRange - ช่วงวันที่ {start, end} (สำหรับหน้า Calendar)
 * @param {boolean} autoRefresh - เปิด/ปิด การดึงข้อมูลอัตโนมัติ (Default: false)
 */
export const useMatches = (dateFilter, dateRange, autoRefresh = false) => {
  const [itemsLimit, setItemsLimit] = useState(500); // Increased default limit

  const queryInfo = useQuery({
    queryKey: ['matches', { dateFilter, dateRange, limit: itemsLimit }],
    queryFn: fetchMatches,
    placeholderData: keepPreviousData,
    staleTime: autoRefresh ? REFRESH_INTERVALS.MATCHES_STALE_AUTO : REFRESH_INTERVALS.MATCHES_STALE_DEFAULT,
    refetchInterval: autoRefresh ? REFRESH_INTERVALS.MATCHES_AUTO : false,

    refetchOnWindowFocus: autoRefresh,
  });

  // ✅ แก้ไขจุดนี้: ใช้ Logical OR เพื่อรับประกันว่าเป็น Array เสมอ ไม่ว่า data จะเป็น null/undefined
  const matches = useMemo(() => queryInfo.data || [], [queryInfo.data]);

  const groupedData = useMemo(() => {
    if (!matches.length) return [];
    const groups = {};
    for (const match of matches) {
      const date = match.startDate;
      if (!groups[date]) groups[date] = [];
      groups[date].push(match);
    }
    return Object.entries(groups).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [matches]);

  const loadMore = () => {
    if (!dateFilter && !dateRange) setItemsLimit(prev => prev + 50);
  };

  return {
    matches, // รับประกันว่าเป็น [] อย่างน้อยที่สุด
    groupedData,
    loading: queryInfo.isLoading,
    isFetching: queryInfo.isFetching,
    loadMore,
    hasMore: true,
    refetch: queryInfo.refetch
  };
};