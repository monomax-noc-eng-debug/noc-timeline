import {
  collection, query, orderBy, onSnapshot, addDoc,
  limit, startAfter, getDocs, writeBatch, doc,
  updateDoc, deleteDoc, setDoc, getDoc
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { throwFriendlyError } from "../utils/firebaseErrorHandler";

const LOGS_COL = "ticket_logs";
const SHEET_API_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

const syncToSheet = async (action, data) => {
  if (!SHEET_API_URL) return;

  // ✅ Comprehensive Field Mapping for Google Sheet
  const payload = {
    action: action,
    ticketNumber: data.ticketNumber || data.id || '',

    // Type field (handle both 'type' and 'ticketType')
    ticketType: data.type || data.ticketType || '',

    // Status and Severity
    status: data.status || '',
    severity: data.severity || '',

    // Category fields
    category: data.category || '',
    subCategory: data.subCategory || '',

    // Description fields (handle multiple variations)
    shortDescription: data.shortDesc || data.shortDescription || '',
    detail: data.details || data.detail || '',
    actionTaken: data.action || data.actionTaken || '',

    // Additional fields
    resolvedDetail: data.resolvedDetail || '',
    responsibility: data.responsibility || '',  // ✅ เพิ่ม Responsibility
    assign: data.assign || '',
    remark: data.remark || '',

    // Date field (if exists)
    date: data.createdAt || data.date || ''
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
  // Subscribe to logs - use ticketNumber as primary key
  subscribeLogs: (callback, limitCount = 50) => {
    const q = query(collection(db, LOGS_COL), orderBy("createdAt", "desc"), limit(limitCount));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id, // Document ID = ticketNumber
        ticketNumber: d.id, // Ensure ticketNumber always equals doc ID
        ...d.data()
      }));
      callback(data, snapshot.docs[snapshot.docs.length - 1]);
    });
  },

  fetchMoreLogs: async (lastDoc, limitCount = 20) => {
    try {
      const constraints = [orderBy("createdAt", "desc"), limit(limitCount)];
      if (lastDoc) constraints.push(startAfter(lastDoc));
      const q = query(collection(db, LOGS_COL), ...constraints);
      const snapshot = await getDocs(q);
      return {
        data: snapshot.docs.map(d => ({
          id: d.id,
          ticketNumber: d.id,
          ...d.data()
        })),
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
      };
    } catch (error) { throwFriendlyError(error); }
  },

  importLogsFromSheet: async (logs) => {
    const batchSize = 500;
    const chunks = [];
    for (let i = 0; i < logs.length; i += batchSize) chunks.push(logs.slice(i, i + batchSize));

    // 1. Process Batches for Ticket Logs
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

    // 2. Update Sync Log for Sidebar Status
    try {
      const today = new Date().toISOString().split('T')[0];
      const syncLogRef = doc(db, "system_settings", "sync_log");
      await setDoc(syncLogRef, {
        lastSyncDate: today,
        lastManualSync: new Date().toISOString(),
        lastSyncType: 'manual',
        updatedCount: logs.length
      }, { merge: true });

      // Update local store immediately if possible, but Firestore listener should handle it
      // if using real-time listener in Sidebar
    } catch (error) {
      console.error("Failed to update sync log:", error);
    }

    return { success: true, count: logs.length };
  },

  // Create new log - ticketNumber is REQUIRED and used as document ID
  createLog: async (logData) => {
    // Validate ticketNumber is provided
    if (!logData.ticketNumber || logData.ticketNumber.trim() === '') {
      throw new Error('Ticket Number is required');
    }

    const ticketNo = String(logData.ticketNumber).trim();
    const docRef = doc(db, LOGS_COL, ticketNo);

    // Check for duplicate
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      throw new Error(`Ticket #${ticketNo} already exists! Please use a different ticket number.`);
    }

    // Create with ticketNumber as document ID
    await setDoc(docRef, {
      ...logData,
      ticketNumber: ticketNo, // Ensure consistency
      createdAt: new Date().toISOString()
    });

    syncToSheet('create', { ...logData, ticketNumber: ticketNo });
  },

  updateLog: async (id, updates) => {
    const docRef = doc(db, LOGS_COL, String(id));
    await updateDoc(docRef, updates);

    // ดึงข้อมูลเต็มหลัง update เพื่อส่งไป Google Sheet
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      const fullData = { ticketNumber: id, ...updatedDoc.data() };
      syncToSheet('update', fullData);
    }
  },

  deleteLog: async (id) => {
    const docRef = doc(db, LOGS_COL, String(id));
    await deleteDoc(docRef);
    syncToSheet('delete', { ticketNumber: id });
  },

  checkAndSyncTickets: async () => {
    // Import sync status store
    const { useSyncStatus } = await import('../store/useSyncStatus');
    const store = useSyncStatus.getState();

    try {
      store.setChecking();

      // Step 1: Check Lock
      const syncLogRef = doc(db, "system_settings", "sync_log");
      const syncLogSnap = await getDoc(syncLogRef);
      const today = new Date().toISOString().split('T')[0];

      if (syncLogSnap.exists()) {
        const lastSync = syncLogSnap.data().lastSyncDate;
        if (lastSync === today) {
          store.setDone(0, true); // Already synced today
          return { synced: false, reason: 'already_synced' };
        }
      }

      // Step 2: Fetch & Parse CSV
      if (!import.meta.env.VITE_GOOGLE_SHEET_URL) {
        store.setError('No Sheet URL configured');
        return { synced: false, reason: 'no_url' };
      }

      store.setSyncing();
      const response = await fetch(import.meta.env.VITE_GOOGLE_SHEET_URL);
      if (!response.ok) throw new Error("Failed to fetch CSV");
      const csvText = await response.text();

      const Papa = await import('papaparse');
      const { parse: parseDateFn, isValid } = await import('date-fns');

      const results = Papa.default.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
      });

      // Helper Date Parser
      const parseDateVal = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const formats = ['d/M/yyyy', 'yyyy-MM-dd', 'dd/MM/yy', 'dd/MM/yyyy'];
        const refDate = new Date();
        for (const fmt of formats) {
          const d = parseDateFn(dateStr.trim(), fmt, refDate);
          if (isValid(d)) return d.toISOString();
        }
        return null;
      };

      // Step 3: Prepare Data
      const batch = writeBatch(db);
      let opCount = 0;

      results.data.forEach(item => {
        const ticketNo = item['Ticket Number'] || item['Ticket No'];
        if (!ticketNo) return;

        const safeDate = parseDateVal(item['Date']) || new Date().toISOString();
        const docRef = doc(db, LOGS_COL, String(ticketNo));

        const logData = {
          ticketNumber: ticketNo,
          shortDesc: item['Short Description & Detail'] || item['Detail'] || item['Description'] || '',
          status: item['Status'] || 'Open',
          type: item['Ticket Type'] || 'Incident',
          assign: item['Assign'] || 'Unassigned',
          details: item['Detail'] || '',
          action: item['Ation'] || item['Action'] || '',
          resolvedDetail: item['Resolved detail'] || '',
          remark: item['Remark'] || '',
          date: safeDate,
          createdAt: safeDate,
          importedAt: new Date().toISOString()
        };

        batch.set(docRef, logData, { merge: true });
        opCount++;
      });

      // Step 4: Lock & Commit: Save 'auto' type
      batch.set(syncLogRef, {
        lastSyncDate: today,
        lastManualSync: new Date().toISOString(), // Optional: track time too
        lastSyncType: 'auto',
        updatedCount: opCount
      }, { merge: true });
      await batch.commit();

      store.setDone(opCount, false);
      return { synced: true, count: opCount };

    } catch (error) {
      const { useSyncStatus } = await import('../store/useSyncStatus');
      useSyncStatus.getState().setError(error.message);
      return { synced: false, reason: 'error', error: error.message };
    }
  }
};