import {
  collection, query, orderBy, onSnapshot, addDoc,
  updateDoc, deleteDoc, doc, writeBatch, limit, getDocs
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const INCIDENTS_COL = "incidents";
const EVENTS_COL = "events";

export const incidentService = {
  /**
   * Subscribe to incidents list in real-time
   * @param {Function} callback - Receives array of incidents
   * @param {number} limitCount - Max records to fetch (Increased default to 500)
   * @returns {Function} Unsubscribe function
   */
  subscribeIncidents: (callback, limitCount = 500) => { // ✅ แก้ไข 1: เพิ่ม Limit ป้องกันข้อมูลหาย
    const q = query(
      collection(db, INCIDENTS_COL),
      orderBy("updatedAt", "desc"),
      limit(limitCount)
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          // ✅ Ensure defaults for optional fields
          status: d.status || 'Open',
          type: d.type || 'Incident',
          project: d.project || 'MONOMAX',
          // ✅ แก้ไข 2: คำนวณ Timestamp ไว้เลย เพื่อความเร็วในการ Sort หน้าเว็บ
          _sortTime: new Date(d.updatedAt || d.createdAt || 0).getTime()
        };
      });
      callback(data);
    }, (error) => {
      console.error("Incidents subscription error:", error);
      callback([]);
    });
  },

  /**
   * Subscribe to events for a specific incident
   * @param {string} incidentId - Parent incident ID
   * @param {Function} callback - Receives array of events
   * @returns {Function} Unsubscribe function
   */
  subscribeEvents: (incidentId, callback) => {
    const q = query(
      collection(db, INCIDENTS_COL, incidentId, EVENTS_COL),
      orderBy("order", "asc"),
      orderBy("date", "desc"),
      orderBy("time", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // ✅ Ensure arrays exist
        imageUrls: doc.data().imageUrls || []
      }));
      callback(data);
    }, (error) => {
      console.error("Events subscription error:", error);
      callback([]);
    });
  },

  // --- Incident CRUD ---

  /**
   * Create a new incident
   */
  createIncident: async (data) => {
    try {
      const payload = {
        ...data,
        status: data.status || 'Open',
        type: data.type || 'Incident',
        priority: data.priority || 'Medium',
        project: data.project || 'MONOMAX',
        eventCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return await addDoc(collection(db, INCIDENTS_COL), payload);
    } catch (error) {
      console.error("Create incident error:", error);
      throw new Error("Failed to create incident");
    }
  },

  /**
   * Update an incident
   */
  updateIncident: async (id, data) => {
    try {
      await updateDoc(doc(db, INCIDENTS_COL, id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Update incident error:", error);
      throw new Error("Failed to update incident");
    }
  },

  /**
   * Delete an incident and all its events
   */
  deleteIncident: async (id) => {
    try {
      // First, delete all events in the subcollection
      const eventsRef = collection(db, INCIDENTS_COL, id, EVENTS_COL);
      const eventsSnapshot = await getDocs(eventsRef);
      const batch = writeBatch(db);
      eventsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Then delete the incident itself
      batch.delete(doc(db, INCIDENTS_COL, id));
      await batch.commit();
    } catch (error) {
      console.error("Delete incident error:", error);
      throw new Error("Failed to delete incident");
    }
  },

  // --- Event CRUD (Timeline) ---

  /**
   * Create a new timeline event
   */
  createEvent: async (incidentId, data) => {
    try {
      const eventRef = await addDoc(collection(db, INCIDENTS_COL, incidentId, EVENTS_COL), {
        ...data,
        order: data.order ?? -Date.now(),
        imageUrls: data.imageUrls || [],
        createdAt: new Date().toISOString()
      });

      // Update event count on parent incident
      await updateDoc(doc(db, INCIDENTS_COL, incidentId), {
        updatedAt: new Date().toISOString()
      });

      return eventRef;
    } catch (error) {
      console.error("Create event error:", error);
      throw new Error("Failed to create event");
    }
  },

  /**
   * Update a timeline event
   */
  updateEvent: async (incidentId, eventId, data) => {
    try {
      await updateDoc(doc(db, INCIDENTS_COL, incidentId, EVENTS_COL, eventId), {
        ...data,
        updatedAt: new Date().toISOString()
      });

      // Update parent incident timestamp
      await updateDoc(doc(db, INCIDENTS_COL, incidentId), {
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Update event error:", error);
      throw new Error("Failed to update event");
    }
  },

  /**
   * Delete a timeline event
   */
  deleteEvent: async (incidentId, eventId) => {
    try {
      await deleteDoc(doc(db, INCIDENTS_COL, incidentId, EVENTS_COL, eventId));

      // Update parent incident timestamp
      await updateDoc(doc(db, INCIDENTS_COL, incidentId), {
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Delete event error:", error);
      throw new Error("Failed to delete event");
    }
  },

  /**
   * Reorder timeline events
   */
  reorderEvents: async (incidentId, events) => {
    try {
      const batch = writeBatch(db);
      events.forEach((ev) => {
        const ref = doc(db, INCIDENTS_COL, incidentId, EVENTS_COL, ev.id);
        batch.update(ref, { order: ev.order });
      });
      await batch.commit();
    } catch (error) {
      console.error("Reorder events error:", error);
      throw new Error("Failed to reorder events");
    }
  }
};