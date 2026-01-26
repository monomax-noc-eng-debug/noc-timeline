// file: src/hooks/useProjects.js
import { useState, useEffect } from 'react';
import { configService } from '../services/configService';

/**
 * Custom hook to get active projects from Firestore
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (err) => {
      console.error('[useProjects] Subscription error:', err);
      setError(err.message || 'Failed to load projects');
    };

    const unsubscribe = configService.subscribeProjects((data) => {
      setProjects(data);
      setLoading(false);
    }, handleError);

    return () => unsubscribe();
  }, []);

  return { projects, loading, error };
}
