// file: src/hooks/useTeam.js
import { useState, useEffect } from 'react';
import { configService } from '../services/configService';

/**
 * Custom hook to get NOC team members from Firestore
 */
export function useTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (err) => {
      console.error('[useTeam] Subscription error:', err);
      setError(err.message || 'Failed to load team');
    };

    const unsubscribe = configService.subscribeTeam((data) => {
      setTeam(data);
      setLoading(false);
    }, handleError);

    return () => unsubscribe();
  }, []);

  return { team, loading, error };
}
