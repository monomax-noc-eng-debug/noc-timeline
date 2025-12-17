import { db } from '../lib/api';
import { collection, doc, writeBatch, getDocs, query, where } from "firebase/firestore";

// ใส่ URL ที่ได้จากขั้นตอนที่ 1
const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const scheduleService = {
  // 1. ดึงข้อมูลจาก Google Calendar ผ่าน Apps Script
  syncFromGoogle: async () => {
    try {
      const response = await fetch(APPS_SCRIPT_URL);
      const data = await response.json();
      
      if (!Array.isArray(data)) throw new Error("Invalid data format");
      
      // Save to Firebase (Batch Write เพื่อความเร็ว)
      const batch = writeBatch(db);
      const collectionRef = collection(db, "schedules");
      
      // (Optional) ลบข้อมูลเก่าของเดือนนี้ก่อน เพื่อกันซ้ำซ้อนแบบชัวร์ๆ
      // แต่ในที่นี้จะใช้การ set แบบ merge โดยใช้ ID ที่สร้างมาจาก Script
      
      data.forEach(item => {
        const docRef = doc(collectionRef, item.id); // ใช้ ID ที่สร้างจาก Script
        batch.set(docRef, { ...item, updatedAt: new Date().toISOString() });
      });

      await batch.commit();
      return data.length; // คืนค่าจำนวนที่อัปเดต
    } catch (error) {
      console.error("Sync Error:", error);
      throw error;
    }
  },

  // 2. ดึงข้อมูลจาก Firebase มาแสดง (Real-time ทำใน Hook เอา)
  // ...
};