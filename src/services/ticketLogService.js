import {
  collection, query, orderBy, onSnapshot, addDoc,
  serverTimestamp, writeBatch, doc
} from "firebase/firestore";
import { db } from "./firebaseConfig"; // ตรวจสอบว่าไฟล์นี้อยู่ที่ src/services/ 

const LOGS_COL = "ticket_logs"; // ชื่อ Collection แยกสำหรับ Ticket Log

export const ticketLogService = {
  // ติดตามข้อมูล Log แบบ Real-time
  subscribeLogs: (callback) => {
    const q = query(collection(db, LOGS_COL), orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error("Error subscribing to ticket logs:", error);
      callback([]);
    });
  },

  // นำเข้าข้อมูลแบบ Bulk (จากไฟล์ Excel/CSV)
  importLogs: async (logs) => {
    try {
      const batch = writeBatch(db);
      logs.forEach((log) => {
        const docRef = doc(collection(db, LOGS_COL));
        batch.set(docRef, {
          ...log,
          importedAt: serverTimestamp(),
          // ตรวจสอบฟิลด์ให้ตรงกับข้อมูลในไฟล์ csv 
          updatedAt: serverTimestamp()
        });
      });
      return await batch.commit();
    } catch (error) {
      console.error("Error importing logs:", error);
      throw error;
    }
  }
};