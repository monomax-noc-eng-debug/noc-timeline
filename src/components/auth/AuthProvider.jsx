import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { useStore } from '../../store/useStore';
import { useToast } from '@/hooks/use-toast';
import PageLoader from '../ui/PageLoader';
import { KeyRound, RefreshCw, AlertCircle } from 'lucide-react';
import { ticketLogService } from '../../services/ticketLogService';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 Hour
const SCHEDULED_LOGOUT_TIME = { hour: 0, minute: 1 }; // 00:01

/**
 * AuthProvider: Handles Firebase auth state and session management
 */
export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Use refs to track state without causing re-renders or stale closures
  const hasShownAutoLoginRef = useRef(false);
  const previousUserRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const eventsRef = useRef(['mousemove', 'keydown', 'mousedown', 'touchstart']);

  // Get store actions (stable references)
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const logout = useStore((state) => state.logout);

  const { toast } = useToast();

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = useCallback(async (firebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        console.warn('[AuthProvider] User profile not found in Firestore');
        return { error: 'PROFILE_NOT_FOUND' };
      }

      const userData = userDoc.data();

      // Check if account is active
      if (!userData.isActive) {
        console.warn('[AuthProvider] User account is disabled');
        return { error: 'ACCOUNT_DISABLED' };
      }

      // Return sanitized user data (only necessary fields)
      return {
        data: {
          uid: userData.uid || firebaseUser.uid,
          name: userData.name || 'Unknown',
          email: userData.email || firebaseUser.email,
          role: userData.role || 'NOC Engineer'
        }
      };
    } catch (error) {
      console.error('[AuthProvider] Failed to fetch user profile:', error);
      return { error: 'FETCH_FAILED', message: error.message };
    }
  }, []);

  /**
   * Handle session restoration notification
   */
  const showSessionRestoredToast = useCallback((userName) => {
    if (hasShownAutoLoginRef.current) return;
    hasShownAutoLoginRef.current = true;

    toast({
      title: (
        <span className="flex items-center gap-2">
          <RefreshCw size={16} className="text-emerald-500 animate-spin-slow" />
          Session Active
        </span>
      ),
      description: `Welcome back, ${userName}!`,
      className: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
    });
  }, [toast]);

  /**
   * Handle session error notifications
   */
  const showErrorToast = useCallback((type) => {
    const messages = {
      ACCOUNT_DISABLED: {
        title: 'Account Disabled',
        description: 'Your account has been disabled. Contact administrator.',
        variant: 'destructive'
      },
      PROFILE_NOT_FOUND: {
        title: 'Profile Not Found',
        description: 'User profile not found. Please contact support.',
        variant: 'destructive'
      },
      SESSION_EXPIRED: {
        title: 'Session Expired',
        description: 'Please login again to continue.',
        className: 'bg-amber-600 text-white border-none'
      },
      AUTO_LOGOUT: {
        title: 'Inactivity Logout',
        description: 'You have been logged out due to inactivity.',
        className: 'bg-zinc-800 text-white border-none'
      },
      SCHEDULED_LOGOUT: {
        title: 'Daily System Refresh',
        description: 'System refreshing session for the new day.',
        className: 'bg-[#0078D4] text-white border-none'
      }
    };

    const msg = messages[type];
    if (msg) {
      toast({
        variant: msg.variant || 'default',
        title: msg.title,
        description: msg.description,
        className: msg.className
      });
    }
  }, [toast]);

  // --- Auto Logout Logic ---

  const handleLogout = useCallback((reason = 'SESSION_EXPIRED') => {
    auth.signOut().then(() => {
      logout();
      showErrorToast(reason);
      previousUserRef.current = null;
    });
  }, [logout, showErrorToast]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (auth.currentUser) {
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout('AUTO_LOGOUT');
      }, INACTIVITY_TIMEOUT);
    }
  }, [handleLogout]);

  useEffect(() => {
    const handleActivity = () => resetInactivityTimer();

    eventsRef.current.forEach(event => window.addEventListener(event, handleActivity));

    // Initial start
    resetInactivityTimer();

    // Check for scheduled logout (00:01) every minute
    const scheduleInterval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === SCHEDULED_LOGOUT_TIME.hour && now.getMinutes() === SCHEDULED_LOGOUT_TIME.minute) {
        // Add a small guard to prevent multiple triggers within the same minute if re-renders happen
        // But since handleLogout signs out, this component might unmount or state changes, 
        // stopping the interval effectively if user is logged out.
        if (auth.currentUser) {
          handleLogout('SCHEDULED_LOGOUT');
        }
      }
    }, 60000);

    return () => {
      eventsRef.current.forEach(event => window.removeEventListener(event, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      clearInterval(scheduleInterval);
    };
  }, [resetInactivityTimer, handleLogout]);


  /**
   * Main auth state listener effect
   */
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip processing if component unmounted
      if (!isMounted) return;

      try {
        setAuthError(null);

        if (firebaseUser) {
          // Firebase has a valid session
          const result = await fetchUserProfile(firebaseUser);

          if (!isMounted) return;

          if (result.error) {
            // Profile invalid or disabled
            await auth.signOut();
            logout();
            showErrorToast(result.error);
            setLoading(false);
            return;
          }

          // Valid user - set in store
          const userData = result.data;
          const isRestoringSession = previousUserRef.current === null;

          setCurrentUser(userData);
          previousUserRef.current = userData;

          // Show auto-login notification if restoring session
          if (isRestoringSession) {
            showSessionRestoredToast(userData.name);
          }

          // --- TRIGGER AUTO SYNC ---
          // Run in background, don't await blocking UI
          ticketLogService.checkAndSyncTickets().then((res) => {
            if (res.synced) {
              toast({
                title: "Daily Sync Complete",
                description: `Synced ${res.count} tickets from Google Sheet.`,
                className: "bg-emerald-500 text-white border-none"
              });
            }
          });

          resetInactivityTimer();

        } else {
          // No Firebase session
          const hadPreviousUser = previousUserRef.current !== null;

          logout();
          previousUserRef.current = null;
          hasShownAutoLoginRef.current = false;

          // Show session expired only if there was a previous user (and not manually logged out just now)
          // We can rely on the handleLogout's toast if it was triggered by that. 
          // But if it comes from pure firebase expiry, we might need this.
          // For now, let's suppress duplicate toasts if possible, but keeping safety.
        }
      } catch (error) {
        console.error('[AuthProvider] Auth state error:', error);
        setAuthError(error.message);
        logout();
        previousUserRef.current = null;
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchUserProfile, setCurrentUser, logout, showSessionRestoredToast, showErrorToast, resetInactivityTimer, toast]);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <PageLoader />
        <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
          <KeyRound size={16} className="animate-pulse" />
          Checking authentication...
        </p>
      </div>
    );
  }

  // Show error fallback if auth completely failed
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center p-6 rounded-lg border border-destructive/50 bg-destructive/10">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-lg font-semibold text-destructive mb-2">Authentication Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: previousUserRef.current !== null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Returns { isAuthenticated: boolean }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
