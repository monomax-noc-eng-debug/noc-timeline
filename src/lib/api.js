import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, orderBy, startAfter, limit, writeBatch, where,
  arrayUnion, arrayRemove, onSnapshot
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

const INCIDENTS_COL = "incidents";
const EVENTS_COL = "events";
const SHIFT_COL = "shift_handovers";

export const api = {

  // --- 1. INCIDENTS (Real-time) ---

  // Subscribe รายการ Incident (Real-time)
  subscribeIncidents: (callback, limitCount = 50) => {
    const q = query(
      collection(db, INCIDENTS_COL),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  // ดึง Incident แบบครั้งเดียว (เผื่อใช้)
  getIncidents: async (lastDoc = null, pageSize = 20) => {
    try {
      let q = query(collection(db, INCIDENTS_COL), orderBy("createdAt", "desc"), limit(pageSize));
      if (lastDoc) {
        q = query(collection(db, INCIDENTS_COL), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(pageSize));
      }
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data, lastVisible: snapshot.docs[snapshot.docs.length - 1] || null };
    } catch (error) { console.error(error); throw error; }
  },

  createIncident: async (data) => {
    const payload = { ...data, type: 'Incident', status: 'Open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, INCIDENTS_COL), payload);
    return { id: docRef.id, ...payload, events: [] };
  },

  updateIncident: async (id, data) => {
    // eslint-disable-next-line no-unused-vars
    const { events, ...cleanData } = data;
    await updateDoc(doc(db, INCIDENTS_COL, id), { ...cleanData, updatedAt: new Date().toISOString() });
  },

  deleteIncident: async (id) => {
    const eventsRef = collection(db, INCIDENTS_COL, id, EVENTS_COL);
    const snapshot = await getDocs(eventsRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(doc(db, INCIDENTS_COL, id));
    await batch.commit();
  },

  // --- EVENTS ---

  // Subscribe Events (Real-time Timeline)
  subscribeIncidentEvents: (incidentId, callback) => {
    const q = query(
      collection(db, INCIDENTS_COL, incidentId, EVENTS_COL),
      orderBy("order", "asc"),
      orderBy("date", "asc"),
      orderBy("time", "asc")
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  // ดึง Events ครั้งเดียว (สำหรับ Export CSV)
  getIncidentEvents: async (incidentId) => {
    const q = query(
      collection(db, INCIDENTS_COL, incidentId, EVENTS_COL),
      orderBy("order", "asc"),
      orderBy("date", "asc"),
      orderBy("time", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  createEvent: async ({ incident_id, ...data }) => {
    const payload = { ...data, order: 999999 };
    const docRef = await addDoc(collection(db, INCIDENTS_COL, incident_id, EVENTS_COL), payload);
    await updateDoc(doc(db, INCIDENTS_COL, incident_id), { updatedAt: new Date().toISOString() });
    return { id: docRef.id, ...payload };
  },
  updateEvent: async (incidentId, eventId, data) => {
    await updateDoc(doc(db, INCIDENTS_COL, incidentId, EVENTS_COL, eventId), data);
    await updateDoc(doc(db, INCIDENTS_COL, incidentId), { updatedAt: new Date().toISOString() });
  },
  deleteEvent: async (incidentId, eventId) => {
    await deleteDoc(doc(db, INCIDENTS_COL, incidentId, EVENTS_COL, eventId));
  },
  reorderEvents: async (incidentId, events) => {
    const batch = writeBatch(db);
    events.forEach((ev, index) => {
      const ref = doc(db, INCIDENTS_COL, incidentId, EVENTS_COL, ev.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  },
  uploadImage: async (file) => {
    const filename = `evidence/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filename);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  // --- 2. SHIFT HANDOVERS (Real-time) ---

  // Subscribe Shift Logs (Real-time)
  subscribeHandovers: (callback, limitCount = 50) => {
    const q = query(
      collection(db, SHIFT_COL),
      orderBy("date", "desc"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  getShiftHandovers: async (lastDoc = null, pageSize = 20) => {
    try {
      let q = query(collection(db, SHIFT_COL), orderBy("date", "desc"), orderBy("createdAt", "desc"), limit(pageSize));
      if (lastDoc) {
        q = query(collection(db, SHIFT_COL), orderBy("date", "desc"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(pageSize));
      }
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data, lastVisible: snapshot.docs[snapshot.docs.length - 1] || null };
    } catch (error) { console.error(error); throw error; }
  },
  getShiftHandoversByDate: async (dateStr) => {
    try {
      const q = query(collection(db, SHIFT_COL), where("date", "==", dateStr), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { console.error(error); throw error; }
  },
  createShiftHandover: async (data) => {
    const docRef = await addDoc(collection(db, SHIFT_COL), { ...data, createdAt: new Date().toISOString() });
    return { id: docRef.id, ...data };
  },
  updateShiftHandover: async (id, data) => { await updateDoc(doc(db, SHIFT_COL, id), data); },
  deleteShiftHandover: async (id) => { await deleteDoc(doc(db, SHIFT_COL, id)); },
  toggleAcknowledge: async (id, name, isRemoving) => {
    const docRef = doc(db, SHIFT_COL, id);
    await updateDoc(docRef, { acknowledgedBy: isRemoving ? arrayRemove(name) : arrayUnion(name) });
  }
};