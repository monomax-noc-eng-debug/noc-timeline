import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // ------------------------------------------------------------------
      // 1. User & Team Config
      // ------------------------------------------------------------------

      // รายชื่อทีม NOC (Mock Data)
      nocMembers: [
        { id: 'NOC-1', name: 'Mekin S.', role: 'NOC Lead' },
        { id: 'NOC-2', name: 'Akkapol P.', role: 'NOC Engineer' },
        { id: 'NOC-3', name: 'Nawapat R.', role: 'NOC Engineer' },
        { id: 'NOC-4', name: 'Watcharapol P.', role: 'NOC Engineer' },
        { id: 'NOC-5', name: 'Supporter', role: 'Support' }
      ],

      // ผู้ใช้ปัจจุบัน
      currentUser: null, // เปลี่ยนเป็น null เพื่อให้ระบบวิ่งไปหน้า Login ทุกครั้งที่เปิดเว็บใหม่
      setCurrentUser: (name) => set({ currentUser: name }),

      // Action สำหรับ Logout
      logout: () => set({ currentUser: null }),

      // ------------------------------------------------------------------
      // 2. UI & Theme
      // ------------------------------------------------------------------

      // Theme State
      darkMode: false,
      toggleDarkMode: () => set((state) => {
        const newVal = !state.darkMode;
        // บังคับเปลี่ยน class ที่ html tag ทันทีเพื่อความลื่นไหล
        if (newVal) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { darkMode: newVal };
      }),

      // ------------------------------------------------------------------
      // หมายเหตุ: ส่วน Data Caching ถูกลบออกแล้ว 
      // เพื่อให้ React Query จัดการแทนตามวิธีที่ 2
      // ------------------------------------------------------------------
    }),
    {
      name: 'noc-storage', // ชื่อ Key ที่ใช้เก็บใน LocalStorage
    }
  )
);