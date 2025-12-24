import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';

// Fetcher Function
const fetchMatches = async ({ queryKey }) => {
  const [_, { dateFilter, dateRange, limit: itemsLimit }] = queryKey;
  const scheduleRef = collection(db, 'schedules');
  let q;

  // 1. Single Date (Today)
  if (dateFilter) {
    const dateStr = dateFilter instanceof Date ? format(dateFilter, 'yyyy-MM-dd') : dateFilter;
    q = query(scheduleRef, where('startDate', '==', dateStr), orderBy('startTime', 'asc'));
  }
  // 2. Date Range (Calendar)
  else if (dateRange?.start && dateRange?.end) {
    q = query(
      scheduleRef,
      where('startDate', '>=', dateRange.start),
      where('startDate', '<=', dateRange.end),
      orderBy('startDate', 'asc'),
      orderBy('startTime', 'asc')
    );
  }
  // 3. Default List (Archive)
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
      // 🚀 Performance: เตรียม search string รวมวันที่เข้าไปด้วย เพื่อให้ค้นหาได้เร็วกว่าเดิม
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
    staleTime: 1000 * 60 * 5, // 🚀 เก็บข้อมูลใน Cache ไว้ 5 นาที (ไม่ต้องโหลดใหม่ตอนสลับหน้า)
    gcTime: 1000 * 60 * 30, // เก็บไว้ใน Memory นานขึ้น
    enabled: enabled, // 🚀 ควบคุมการ Fetch ได้ (เช่น รอให้มี Range ก่อนค่อยดึง)
  });

  // Grouping Helper (Memoized เพื่อลดการคำนวณซ้ำ)
  const groupedData = useMemo(() => {
    if (matches.length === 0) return [];
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
    matches,
    groupedData,
    loading: isLoading, // Initial Load
    isFetching, // Background Update
    loadMore,
    hasMore: true,
    refetch
  };
};