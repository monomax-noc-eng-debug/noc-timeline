// file: src/services/ticketLogService.js
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc
} from "firebase/firestore";
import { db } from "./firebaseConfig"; // อ้างอิงจากตำแหน่งที่เก็บไฟล์ config ของคุณ [cite: 47]

const LOGS_COL = "ticket_logs"; // ชื่อ Collection แยกสำหรับเก็บข้อมูล Ticket โดยเฉพาะ

export const ticketLogService = {
  /**
   * ติดตามข้อมูล Log ทั้งหมดแบบ Real-time
   * @param {Function} callback - ฟังก์ชันที่จะทำงานเมื่อข้อมูลมีการอัปเดต
   * @returns {Function} ฟังก์ชันสำหรับยกเลิกการติดตาม (Unsubscribe)
   */
  subscribeLogs: (callback) => {
    // ดึงข้อมูลและเรียงลำดับตามวันที่ (ล่าสุดขึ้นก่อน) 
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

  /**
   * นำเข้าข้อมูล Ticket แบบกลุ่ม (Bulk Import)
   * เหมาะสำหรับการจัดการข้อมูลจากไฟล์ CSV/Excel ที่ผ่านการ Parse แล้ว
   * @param {Array} logs - รายการข้อมูล Ticket ที่ต้องการนำเข้า
   */
  importLogs: async (logs) => {
    try {
      const batch = writeBatch(db); // ใช้ Batch Write เพื่อประสิทธิภาพและความปลอดภัยของข้อมูล 

      logs.forEach((log) => {
        // สร้างเอกสารใหม่ใน Collection ticket_logs
        const docRef = doc(collection(db, LOGS_COL));

        batch.set(docRef, {
          ...log,
          importedAt: serverTimestamp(), // บันทึกเวลาที่นำเข้าจริงจาก Server 
          updatedAt: serverTimestamp()
        });
      });

      return await batch.commit();
    } catch (error) {
      console.error("Error importing logs to Firestore:", error);
      throw error;
    }
  },

  /**
   * เพิ่ม Ticket ใหม่ด้วยตนเอง (ถ้าจำเป็นในอนาคต)
   */
  createLog: async (data) => {
    try {
      const payload = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      return await addDoc(collection(db, LOGS_COL), payload);
    } catch (error) {
      console.error("Error creating ticket log:", error);
      throw error;
    }
  }
};