// file: src/store/useSyncStatus.js
/**
 * Sync Status Store - Manages auto-sync status for UI display
 * Uses Zustand for global state management
 */
import { create } from 'zustand';

/**
 * Sync Status States:
 * - 'idle': No sync in progress, waiting for next check
 * - 'checking': Checking if sync is needed (reading sync_log)
 * - 'syncing': Actively syncing data from Google Sheet
 * - 'done': Sync completed successfully (or already synced today)
 * - 'error': Sync failed with error
 */

export const useSyncStatus = create((set, get) => ({
  // State
  status: 'idle',           // 'idle' | 'checking' | 'syncing' | 'done' | 'error'
  lastSyncDate: null,       // ISO date string "2026-01-18"
  syncCount: 0,             // Number of records synced in last sync
  errorMessage: null,       // Error message if failed
  alreadySyncedToday: false, // True if skipped because already synced

  // Actions
  setChecking: () => set({
    status: 'checking',
    errorMessage: null
  }),

  setSyncing: () => set({
    status: 'syncing',
    errorMessage: null
  }),

  setDone: (syncCount = 0, alreadySynced = false, syncType = 'auto') => set({
    status: 'done',
    syncCount,
    alreadySyncedToday: alreadySynced,
    lastSyncDate: new Date().toISOString().split('T')[0],
    lastSyncType: syncType,
    errorMessage: null
  }),

  setError: (message) => set({
    status: 'error',
    errorMessage: message
  }),

  reset: () => set({
    status: 'idle',
    errorMessage: null,
    syncCount: 0,
    alreadySyncedToday: false,
    lastSyncType: 'auto'
  }),

  // Selectors
  isActive: () => {
    const { status } = get();
    return status === 'checking' || status === 'syncing';
  },

  isSyncedToday: () => {
    const { lastSyncDate } = get();
    const today = new Date().toISOString().split('T')[0];
    return lastSyncDate === today;
  }
}));
