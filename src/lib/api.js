import { db } from './firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, writeBatch, limit, startAfter
} from "firebase/firestore";

const INCIDENTS_COL = 'incidents';
const EVENTS_COL = 'events';

export const api = {
  getIncidents: async (lastDoc = null, pageSize = 20) => {
    try {
      let q = query(collection(db, INCIDENTS_COL), orderBy('createdAt', 'desc'), limit(pageSize));
      if (lastDoc) {
        q = query(collection(db, INCIDENTS_COL), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
      }
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), events: [] }));
      return { data, lastVisible: snapshot.docs[snapshot.docs.length - 1] || null };
    } catch (error) { console.error("Error:", error); throw error; }
  },

  getIncidentEvents: async (incidentId) => {
    try {
      const eventsRef = collection(db, INCIDENTS_COL, incidentId, EVENTS_COL);
      // เรียงตาม order ก่อน ถ้าไม่มีให้เรียงตาม date/time
      const q = query(eventsRef, orderBy('order', 'asc'), orderBy('date', 'asc'), orderBy('time', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { console.error(error); throw error; }
  },

  createIncident: async (data) => {
    const payload = { ...data, type: 'Incident', status: 'Open', impact: '', root_cause: '', action: '', createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, INCIDENTS_COL), payload);
    return { id: docRef.id, ...payload, events: [] };
  },

  updateIncident: async (id, updates) => {
    // eslint-disable-next-line no-unused-vars
    const { events, ...cleanUpdates } = updates;
    await updateDoc(doc(db, INCIDENTS_COL, id), cleanUpdates);
  },

  deleteIncident: async (id) => {
    const eventsSnapshot = await getDocs(collection(db, INCIDENTS_COL, id, EVENTS_COL));
    const batch = writeBatch(db);
    eventsSnapshot.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(db, INCIDENTS_COL, id));
    await batch.commit();
  },

  createEvent: async (ev) => {
    const { incident_id, ...data } = ev;
    // ใส่ order สูงๆ ไว้ก่อนเพื่อให้ไปอยู่ท้ายสุด
    const payload = { ...data, order: 999999 };
    const ref = await addDoc(collection(db, INCIDENTS_COL, incident_id, EVENTS_COL), payload);
    return { id: ref.id, ...payload };
  },

  updateEvent: async (iid, eid, data) => { await updateDoc(doc(db, INCIDENTS_COL, iid, EVENTS_COL, eid), data); },
  deleteEvent: async (iid, eid) => { await deleteDoc(doc(db, INCIDENTS_COL, iid, EVENTS_COL, eid)); },

  // ✅ ฟังก์ชันสำคัญ: บันทึกลำดับ
  reorderEvents: async (incidentId, events) => {
    try {
      const batch = writeBatch(db);
      events.forEach((ev, index) => {
        const ref = doc(db, INCIDENTS_COL, incidentId, EVENTS_COL, ev.id);
        batch.update(ref, { order: index });
      });
      await batch.commit();
    } catch (error) { console.error("Error reordering:", error); throw error; }
  }
};