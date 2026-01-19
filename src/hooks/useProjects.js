// file: src/hooks/useProjects.js
import { useState, useEffect } from 'react';
import { configService } from '../services/configService';

/**
 * Custom hook to get active projects from Firestore
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = configService.subscribeProjects((data) => {
      setProjects(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { projects, loading };
}
