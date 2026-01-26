import { collection, query, orderBy, onSnapshot, where, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from './firebaseConfig';
import { throwFriendlyError } from '../utils/firebaseErrorHandler';

export const matchService = {
  // Subscribe ข้อมูลแมตช์ - with proper error handling
  subscribeMatches: (dateFilter, callback, onError = null) => {
    let q = query(collection(db, "schedules"), orderBy("startDate", "desc"), orderBy("startTime", "asc"));

    if (dateFilter) {
      q = query(collection(db, "schedules"), where("startDate", "==", dateFilter), orderBy("startTime", "asc"));
    }

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error("Match subscription error:", error);
      if (onError) onError(error);
      callback([]); // Return empty array to prevent infinite loading
    });
  },

  // ✅ เพิ่มฟังก์ชัน: สร้างแมตช์ใหม่ (Manual Add)
  createMatch: async (matchData) => {
    try {
      const payload = {
        ...matchData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hasStartStat: false,
        hasEndStat: false
      };
      return await addDoc(collection(db, "schedules"), payload);
    } catch (error) {
      console.error("Error creating match:", error);
      throwFriendlyError(error);
    }
  },

  // ✅ เพิ่มฟังก์ชัน: แก้ไขแมตช์ (Update)
  updateMatch: async (id, matchData) => {
    try {
      const docRef = doc(db, "schedules", id);
      await updateDoc(docRef, {
        ...matchData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating match:", error);
      throwFriendlyError(error);
    }
  },

  // ✅ เพิ่มฟังก์ชัน: ลบแมตช์ (Delete)
  deleteMatch: async (id) => {
    try {
      await deleteDoc(doc(db, "schedules", id));
    } catch (error) {
      console.error("Error deleting match:", error);
      throwFriendlyError(error);
    }
  }
};