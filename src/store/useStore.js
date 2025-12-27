// file: src/store/useStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // 1. User & Team Config
      nocMembers: [
        { id: 'NOC-1', name: 'Mekin S.', role: 'NOC Lead' },
        { id: 'NOC-2', name: 'Akkapol P.', role: 'NOC Engineer' },
        { id: 'NOC-3', name: 'Nawapat R.', role: 'NOC Engineer' },
        { id: 'NOC-4', name: 'Watcharapol P.', role: 'NOC Engineer' },
        { id: 'NOC-5', name: 'Supporter', role: 'Support' }
      ],

      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      // 2. UI & Theme
      darkMode: false,
      toggleDarkMode: () => set((state) => {
        const newVal = !state.darkMode;
        if (newVal) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { darkMode: newVal };
      }),

      // 3. Ticket Config (Auto Sync)
      ticketConfig: {
        autoSync: false,
        syncTime: '08:00',
        lastSync: null
      },
      setTicketConfig: (config) => set((state) => ({
        ticketConfig: { ...state.ticketConfig, ...config }
      })),
    }),
    {
      name: 'noc-storage',
      version: 3,
      migrate: (persistedState, version) => {
        if (version < 1) {
          if (typeof persistedState.currentUser === 'string') {
            persistedState.currentUser = {
              id: 'legacy-user',
              name: persistedState.currentUser,
              role: 'NOC Engineer'
            };
          }
        }
        if (version < 2) {
          persistedState.ticketConfig = {
            autoSync: false,
            syncTime: '08:00',
            lastSync: null
          };
        }
        // Note: ticketOptions are now stored in Firestore, not localStorage
        // Remove old ticketOptions from localStorage if exists
        if (persistedState.ticketOptions) {
          delete persistedState.ticketOptions;
        }
        return persistedState;
      },
    }
  )
);