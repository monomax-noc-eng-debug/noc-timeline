// file: src/features/matches/hooks/useMatches.js
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { format, isValid } from 'date-fns'; // ✅ เพิ่ม isValid
import { useState, useMemo } from 'react';

// Fetcher Function
const fetchMatches = async ({ queryKey }) => {
  const [_, { dateFilter, dateRange, limit: itemsLimit }] = queryKey;
  const scheduleRef = collection(db, 'schedules');
  let q;

  // 1. Single Date (Today View)
  if (dateFilter) {
    let dateStr = dateFilter;
    // ✅ ตรวจสอบความถูกต้องของ Date Object
    if (dateFilter instanceof Date) {
      if (isValid(dateFilter)) {
        dateStr = format(dateFilter, 'yyyy-MM-dd');
      } else {
        console.warn("Invalid Date Object passed to useMatches");
        return []; // คืนค่าว่างถ้าวันที่ผิด กันแอปพัง
      }
    }
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
  // 3. Default List (History/Archive View)
  else {
    q = query(scheduleRef, orderBy('startDate', 'desc'), orderBy('startTime', 'asc'), limit(itemsLimit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      hasStartStat: !!data.hasStartStat,
      hasEndStat: !!data.hasEndStat,
      // 🚀 Performance: เตรียม Search String ไว้เลย
      _searchString: `${data.teamA || ''} ${data.teamB || ''} ${data.match || ''} ${data.title || ''} ${data.league || ''} ${data.startDate || ''}`.toLowerCase()
    };
  });
};

export const useMatches = (dateFilter, dateRange, enabled = true) => {
  const [itemsLimit, setItemsLimit] = useState(100);

  const { data: matches = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['matches', { dateFilter, dateRange, limit: itemsLimit }],
    queryFn: fetchMatches,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // Cache 5 นาที
    gcTime: 1000 * 60 * 30,   // เก็บใน Memory 30 นาที
    enabled: enabled,         // ควบคุมการ Fetch (เช่น รอ user เลือกวันก่อน)
  });

  // Grouping Helper (Memoized)
  const groupedData = useMemo(() => {
    if (matches.length === 0) return [];
    const groups = {};
    for (const match of matches) {
      const date = match.startDate;
      if (!groups[date]) groups[date] = [];
      groups[date].push(match);
    }
    // เรียงวันที่จากน้อยไปมาก (เก่า -> ใหม่)
    return Object.entries(groups).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [matches]);

  const loadMore = () => {
    if (!dateFilter && !dateRange) setItemsLimit(prev => prev + 50);
  };

  return {
    matches,
    groupedData,
    loading: isLoading,
    isFetching,
    loadMore,
    hasMore: true,
    refetch
  };
};