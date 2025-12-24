import {
  collection, query, orderBy, onSnapshot, addDoc,
  limit, startAfter, getDocs, writeBatch, doc
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const LOGS_COL = "ticket_logs";

export const ticketLogService = {
  /**
   * 1. Subscribe (Real-time): ดึง 50 รายการล่าสุด
   */
  subscribeLogs: (callback, limitCount = 50) => {
    const q = query(
      collection(db, LOGS_COL),
      orderBy("createdAt", "desc"), // ใช้ createdAt เป็นหลัก
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      callback(data, lastVisible);
    }, (error) => {
      console.error("Logs subscription error:", error);
      callback([], null);
    });
  },

  /**
   * 2. Fetch More (Pagination): ดึงข้อมูลเก่าถัดไป
   */
  fetchMoreLogs: async (lastDoc, limitCount = 20) => {
    try {
      const constraints = [
        orderBy("createdAt", "desc"),
        limit(limitCount)
      ];

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(
        collection(db, LOGS_COL),
        ...constraints
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      return { data, lastDoc: newLastDoc };

    } catch (error) {
      console.error("Error fetching more logs:", error);
      return { data: [], lastDoc: null };
    }
  },

  /**
   * 3. Import from Sheet (Sync): บันทึกทีละ Batch (500 รายการ)
   */
  importLogsFromSheet: async (logs) => {
    try {
      const batchSize = 500;
      const chunks = [];

      // แบ่งข้อมูลเป็นก้อนๆ ละ 500
      for (let i = 0; i < logs.length; i += batchSize) {
        chunks.push(logs.slice(i, i + batchSize));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);

        chunk.forEach((log) => {
          // ใช้ ticketNumber เป็น Doc ID เพื่อกันซ้ำ
          // ถ้าไม่มี ticketNumber ให้ใช้ auto-id
          const docRef = log.ticketNumber
            ? doc(db, LOGS_COL, String(log.ticketNumber))
            : doc(collection(db, LOGS_COL));

          batch.set(docRef, {
            ...log,
            // แปลงวันที่ให้เป็น ISO String เพื่อให้เรียงลำดับได้ถูกต้อง
            createdAt: log.date ? new Date(log.date).toISOString() : new Date().toISOString(),
            importedAt: new Date().toISOString()
          }, { merge: true }); // merge: true = อัปเดตข้อมูลเดิม ไม่ทับหาย
        });

        await batch.commit();
      }
      return { success: true, count: logs.length };

    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  },

  createLog: async (logData) => {
    try {
      await addDoc(collection(db, LOGS_COL), {
        ...logData,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Create log error:", error);
      throw error;
    }
  }
};