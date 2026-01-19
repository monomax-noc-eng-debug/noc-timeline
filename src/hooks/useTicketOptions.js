// file: src/hooks/useTicketOptions.js
import { useState, useEffect } from 'react';
import { configService } from '../services/configService';

/**
 * Custom hook to get ticket options from Firestore
 * Returns real-time updated options for all ticket-related components
 */
export function useTicketOptions() {
  const [ticketOptions, setTicketOptions] = useState(configService.getDefaultTicketOptions());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = configService.subscribeTicketOptions((data) => {
      setTicketOptions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { ticketOptions, loading };
}
