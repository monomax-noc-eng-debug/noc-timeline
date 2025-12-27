import {
  collection, query, orderBy, onSnapshot, addDoc,
  limit, startAfter, getDocs, writeBatch, doc,
  updateDoc, deleteDoc, setDoc, getDoc
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const LOGS_COL = "ticket_logs";
const SHEET_API_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

const syncToSheet = async (action, data) => {
  if (!SHEET_API_URL) return;

  // --- จุดที่แก้ไข (Fixed): ใช้ Logic ที่ยอมรับค่าว่าง ("") ได้ ---
  const payload = {
    action: action,
    ticketNumber: data.ticketNumber,

    // ใช้ ?? แทน || เพื่อให้ค่าว่าง ("") ถูกส่งไปด้วย ไม่ใช่ข้ามไป
    ticketType: data.type ?? data.ticketType,
    status: data.status,
    severity: data.severity,
    category: data.category ?? '',
    subCategory: data.subCategory ?? '',

    // 3 บรรทัดนี้คือตัวปัญหาหลักที่ทำให้ลบข้อมูลไม่ได้ในเวอร์ชันก่อน
    shortDescription: data.shortDesc !== undefined ? data.shortDesc : data.shortDescription,
    detail: data.details !== undefined ? data.details : data.detail,
    actionTaken: data.action !== undefined ? data.action : data.actionTaken,

    resolvedDetail: data.resolvedDetail ?? '',
    assign: data.assign ?? '',
    remark: data.remark ?? ''
  };

  try {
    fetch(SHEET_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).catch(e => console.error("Sync Net Error", e));
  } catch (error) {
    console.error("Sync Error", error);
  }
};

export const ticketLogService = {
  subscribeLogs: (callback, limitCount = 50) => {
    const q = query(collection(db, LOGS_COL), orderBy("createdAt", "desc"), limit(limitCount));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(data, snapshot.docs[snapshot.docs.length - 1]);
    });
  },

  fetchMoreLogs: async (lastDoc, limitCount = 20) => {
    try {
      const constraints = [orderBy("createdAt", "desc"), limit(limitCount)];
      if (lastDoc) constraints.push(startAfter(lastDoc));
      const q = query(collection(db, LOGS_COL), ...constraints);
      const snapshot = await getDocs(q);
      return { data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })), lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
    } catch (e) { return { data: [], lastDoc: null }; }
  },

  importLogsFromSheet: async (logs) => {
    const batchSize = 500;
    const chunks = [];
    for (let i = 0; i < logs.length; i += batchSize) chunks.push(logs.slice(i, i + batchSize));
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((log) => {
        const docRef = log.ticketNumber ? doc(db, LOGS_COL, String(log.ticketNumber)) : doc(collection(db, LOGS_COL));
        batch.set(docRef, {
          ...log,
          createdAt: log.date ? new Date(log.date).toISOString() : new Date().toISOString(),
          importedAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
    }
    return { success: true, count: logs.length };
  },

  createLog: async (logData) => {
    if (logData.ticketNumber) {
      const docRef = doc(db, LOGS_COL, String(logData.ticketNumber));
      const snap = await getDoc(docRef);
      if (snap.exists()) throw new Error(`Ticket ${logData.ticketNumber} exists!`);
      await setDoc(docRef, { ...logData, createdAt: new Date().toISOString() });
    } else {
      await addDoc(collection(db, LOGS_COL), { ...logData, createdAt: new Date().toISOString() });
    }
    syncToSheet('create', logData);
  },

  updateLog: async (id, updates) => {
    const docRef = doc(db, LOGS_COL, String(id));
    await updateDoc(docRef, updates);
    syncToSheet('update', { ticketNumber: id, ...updates });
  },

  deleteLog: async (id) => {
    const docRef = doc(db, LOGS_COL, String(id));
    await deleteDoc(docRef);
    syncToSheet('delete', { ticketNumber: id });
  }
};