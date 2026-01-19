import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { useStore } from '../../store/useStore';
import { useToast } from '@/hooks/use-toast';
import PageLoader from '../ui/PageLoader';
import { KeyRound, RefreshCw, AlertCircle } from 'lucide-react';

const AuthContext = createContext(null);

/**
 * AuthProvider: Handles Firebase auth state and session management
 * 
 * Key Features:
 * - Listens to onAuthStateChanged for real-time session persistence
 * - Auto-restores user session from Firebase Auth (not localStorage)
 * - Validates user profile exists and is active in Firestore
 * - Clears invalid/expired sessions automatically
 * - Shows appropriate notifications for session events
 * 
 * Security:
 * - User data is fetched from Firestore on each session restore
 * - No sensitive data stored in localStorage
 * - Session validity controlled by Firebase Auth
 */
export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Use refs to track state without causing re-renders or stale closures
  const hasShownAutoLoginRef = useRef(false);
  const previousUserRef = useRef(null);

  // Get store actions (stable references)
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const logout = useStore((state) => state.logout);

  const { toast } = useToast();

  /**
   * Fetch user profile from Firestore
   * Returns user data if valid, null if not found or inactive
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
          <RefreshCw size={16} className="text-primary" />
          Session Restored
        </span>
      ),
      description: `Welcome back, ${userName}!`,
      className: 'bg-gradient-to-r from-[#0078D4] to-[#106EBE] text-white border-none'
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

        } else {
          // No Firebase session
          const hadPreviousUser = previousUserRef.current !== null;

          logout();
          previousUserRef.current = null;
          hasShownAutoLoginRef.current = false;

          // Show session expired only if there was a previous user
          if (hadPreviousUser) {
            showErrorToast('SESSION_EXPIRED');
          }
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
  }, [fetchUserProfile, setCurrentUser, logout, showSessionRestoredToast, showErrorToast]);

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
    <AuthContext.Provider value={{ isAuthenticated: previousUserRef.current !== null }}>
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
