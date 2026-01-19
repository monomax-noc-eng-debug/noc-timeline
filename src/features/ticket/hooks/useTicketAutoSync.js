// file: src/features/ticket/hooks/useTicketAutoSync.js
import { useEffect, useRef } from 'react';
import { ticketLogService } from '../../../services/ticketLogService';

export const useTicketAutoSync = () => {
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Call the service function to handle daily sync check
    ticketLogService.checkAndSyncTickets();

  }, []);
};
