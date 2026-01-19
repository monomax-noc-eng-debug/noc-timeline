// file: src/hooks/useTeam.js
import { useState, useEffect } from 'react';
import { configService } from '../services/configService';

/**
 * Custom hook to get NOC team members from Firestore
 */
export function useTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = configService.subscribeTeam((data) => {
      setTeam(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { team, loading };
}
