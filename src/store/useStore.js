// file: src/store/useStore.js
/**
 * Global State Management with Zustand
 * 
 * Security Notes:
 * - currentUser is NOT persisted to localStorage for security
 * - User session should be managed via Firebase Auth (AuthProvider)
 * - Only safe, non-sensitive data is persisted (darkMode, ticketConfig)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Current storage version - increment when schema changes
const STORAGE_VERSION = 4;

// Default values for ticket configuration
const DEFAULT_TICKET_CONFIG = {
  autoSync: false,
  syncTime: '08:00',
  lastSync: null
};

export const useStore = create(
  persist(
    (set) => ({
      // ========================
      // 1. User Info (NOT persisted for security)
      // ========================
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      // ========================
      // 2. UI & Theme (persisted)
      // ========================
      darkMode: false,
      toggleDarkMode: () => set((state) => ({
        darkMode: !state.darkMode
      })),

      // ========================
      // 3. Ticket Config (persisted)
      // ========================
      ticketConfig: DEFAULT_TICKET_CONFIG,
      setTicketConfig: (config) => set((state) => ({
        ticketConfig: { ...state.ticketConfig, ...config }
      })),
    }),
    {
      name: 'noc-storage',
      version: STORAGE_VERSION,

      /**
       * Partialize: Only persist safe, non-sensitive state
       * - darkMode: UI preference, safe to store
       * - ticketConfig: App config, no sensitive data
       * - currentUser: EXCLUDED for security (handled by Firebase Auth)
       */
      partialize: (state) => ({
        darkMode: state.darkMode,
        ticketConfig: state.ticketConfig
      }),

      /**
       * Migration: Handle storage version upgrades
       * Clean slate from version 4 - no legacy migrations needed
       */
      migrate: (persistedState, version) => {
        // From older versions: ensure clean state with defaults
        if (version < STORAGE_VERSION) {
          return {
            darkMode: persistedState?.darkMode ?? false,
            ticketConfig: {
              ...DEFAULT_TICKET_CONFIG,
              ...(persistedState?.ticketConfig || {})
            }
          };
        }
        return persistedState;
      },
    }
  )
);