import { db } from './firebaseConfig';
import { collection, doc, writeBatch } from "firebase/firestore";
import { throwFriendlyError } from '../utils/firebaseErrorHandler';

const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const scheduleService = {
  fetchMatchesFromGoogle: async (date) => {
    try {
      if (!APPS_SCRIPT_URL) throw new Error("Google Script URL is missing");

      const response = await fetch(`${APPS_SCRIPT_URL}?date=${date}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = Array.isArray(result) ? result : (result.data || []);

      if (data.length === 0) return [];

      // ✅ แก้ไขจุดนี้: Map Key ให้ตรงกับที่ Google Script ส่งมา
      return data.map((item, index) => ({
        tempId: item.id || `gas-${Date.now()}-${index}`,

        // แก้จาก item.Time เป็น item.startTime
        time: item.startTime || item.time || '',

        // แก้จาก item.League เป็น item.calendar
        league: item.calendar || item.league || '',

        // title มีอยู่แล้ว แต่เพิ่ม fallback ให้ชัวร์
        match: item.title || item.Match || item.match || '',

        channel: item.channel || item.Channel || '',
        startDate: date,
        status: 'Scheduled'
      }));

    } catch (error) {
      throwFriendlyError(error);
    }
  },

  saveMatchesToFirestore: async (matches) => {
    try {
      if (!matches || matches.length === 0) return;

      const batch = writeBatch(db);
      const collectionRef = collection(db, "schedules");

      matches.forEach(match => {
        const docRef = doc(collectionRef);
        const { tempId: _tempId, ...matchData } = match;

        batch.set(docRef, {
          ...matchData,
          title: matchData.match,
          startTime: matchData.time,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hasStartStat: false,
          hasEndStat: false
        });
      });

      await batch.commit();
      return true;
    } catch (error) {
      throwFriendlyError(error);
    }
  }
};