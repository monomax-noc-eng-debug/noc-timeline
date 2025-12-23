import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // รายชื่อทีม NOC (Mock Data)
      nocMembers: [
        { id: 'NOC-1', name: 'Mekin S.', role: 'NOC Lead' },
        { id: 'NOC-2', name: 'Akkapol P.', role: 'NOC Engineer' },
        { id: 'NOC-3', name: 'Nawapat R.', role: 'NOC Engineer' },
        { id: 'NOC-4', name: 'Watcharapol P.', role: 'NOC Engineer' },
        { id: 'NOC-5', name: 'Supporter', role: 'Support' }
      ],

      // ผู้ใช้ปัจจุบัน
      currentUser: 'Mekin S.', // Default
      setCurrentUser: (name) => set({ currentUser: name }),

      // ✅ เพิ่ม Action สำหรับ Logout
      logout: () => set({ currentUser: null }),

      // Theme
      darkMode: false,
      toggleDarkMode: () => set((state) => {
        const newVal = !state.darkMode;
        // บังคับเปลี่ยน class ที่ html tag ทันทีเพื่อความลื่นไหล
        if (newVal) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { darkMode: newVal };
      }),
    }),
    {
      name: 'noc-storage',
    }
  )
);