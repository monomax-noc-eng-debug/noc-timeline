import { useState, useEffect } from 'react';
import { configService } from '../services/configService';

/**
 * Hook สำหรับดึงข้อมูล Config ทั้งหมดแบบ Real-time
 * ใช้ในหน้า ConfigPage เพื่อลดความซับซ้อนของ Component
 */
export const useConfigs = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State หลัก
  const [configs, setConfigs] = useState({
    leagues: [],
    channels: [],
    cdnOptions: [],
    ticketSync: { autoSync: false, syncTime: '08:00', lastSync: null }
  });
  const [ticketOptions, setTicketOptions] = useState({ types: [], statuses: [], severities: [], categories: [], subCategories: [] });
  const [team, setTeam] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Error handler for all subscriptions
    const handleError = (err) => {
      console.error('[useConfigs] Subscription error:', err);
      setError(err.message || 'Failed to load configuration');
    };

    // Subscribe ทุก Collection พร้อมกัน - with error handlers
    const unsubConfigs = configService.subscribeConfigs((data) => {
      setConfigs(prev => ({ ...prev, ...data }));
    }, handleError);

    const unsubTicketOptions = configService.subscribeTicketOptions(setTicketOptions, handleError);
    const unsubTeam = configService.subscribeTeam(setTeam, handleError);
    const unsubProjects = configService.subscribeProjects(setProjects, handleError);

    // เมื่อโหลดข้อมูลครบ (ใช้เวลาเพียงเล็กน้อยสำหรับ Firestore snapshot แรก)
    // ใช้ setTimeout เพื่อให้แน่ใจว่าไม่ได้ set state synchronously
    setTimeout(() => setLoading(false), 0);

    return () => {
      unsubConfigs();
      unsubTicketOptions();
      unsubTeam();
      unsubProjects();
    };
  }, []);

  return {
    configs, setConfigs,
    ticketOptions, setTicketOptions,
    team, setTeam,
    projects, setProjects,
    loading,
    error
  };
};