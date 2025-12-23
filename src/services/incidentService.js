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
   * @param {number} limitCount - Max records to fetch
   * @returns {Function} Unsubscribe function
   */
  subscribeIncidents: (callback, limitCount = 100) => {
    const q = query(
      collection(db, INCIDENTS_COL),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // ✅ Ensure defaults for optional fields
        status: doc.data().status || 'Open',
        type: doc.data().type || 'Incident',
        project: doc.data().project || 'General'
      }));
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
      orderBy("date", "asc"),
      orderBy("time", "asc")
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
        priority: data.priority || 'Medium', // 🔥 Added Priority
        project: data.project || 'General',
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
        order: data.order || 0,
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