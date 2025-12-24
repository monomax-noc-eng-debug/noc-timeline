import { useInfiniteQuery } from '@tanstack/react-query';
import { ticketLogService } from '../../../services/ticketLogService';

export const useTicketLog = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
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
  });

  // Flatten Pages (รวมข้อมูลจากทุกหน้าเป็น Array เดียว)
  const logs = data?.pages.flatMap(page => page.data) || [];

  const stats = {
    total: logs.length,
    incidents: logs.filter(l => l.type === 'Incident').length,
    requests: logs.filter(l => l.type === 'Request' || l.type === 'Service Request').length
  };

  return {
    logs,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
    stats
  };
};