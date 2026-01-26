import { useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { useStore } from '../store/useStore';
import { useToast } from '@/hooks/use-toast';

// Default timeout: 30 minutes (in milliseconds)
const IDLE_TIMEOUT = 30 * 60 * 1000;

export const useAutoLogout = (timeout = IDLE_TIMEOUT) => {
  const { logout } = useStore();
  const { toast } = useToast();

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      logout();

      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive"
      });

      // Redirect handled by ProtectedRoute or caller
      window.location.href = '/login';
    } catch (error) {
      console.error("Auto-logout error:", error);
    }
  }, [logout, toast]);

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(handleLogout, timeout);
    };

    // Events to detect user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    // Setup listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer start
    resetTimer();

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [handleLogout, timeout]);
};
