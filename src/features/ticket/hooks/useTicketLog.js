import { useInfiniteQuery } from '@tanstack/react-query';
import { ticketLogService } from '../../../services/ticketLogService';

export const useTicketLog = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['ticketLogs'],
    queryFn: async ({ pageParam = null }) => {
      // เรียก Service เดิมแต่ปรับให้รองรับ React Query
      // หมายเหตุ: คุณอาจต้องปรับ ticketLogService.fetchMoreLogs ให้รับ pageParam ตรงๆ
      const res = await ticketLogService.fetchMoreLogs(pageParam);
      return res; // คาดหวัง { data: [...], lastDoc: ... }
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastDoc || undefined,
    // ⭐ Optimize Firebase requests
    staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for this period
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    refetchOnMount: false, // Don't refetch if data exists
  });

  // Flatten Pages (รวมข้อมูลจากทุกหน้าเป็น Array เดียว)
  const logs = data?.pages.flatMap(page => page.data) || [];

  const stats = {
    total: logs.length,
    succeed: logs.filter(l => l.status?.toLowerCase() === 'succeed').length,
    pending: logs.filter(l => l.status?.toLowerCase() === 'pending').length,
    incidents: logs.filter(l => l.status?.toLowerCase() === 'open' || l.type === 'Incident').length,
    requests: logs.filter(l => l.type === 'Request').length
  };

  return {
    logs,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
    stats,
    // Error handling
    isError,
    error: error?.message || null
  };
};
