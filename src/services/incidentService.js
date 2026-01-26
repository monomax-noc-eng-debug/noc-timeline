import { db } from './firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { throwFriendlyError } from '../utils/firebaseErrorHandler';

const COLLECTION_NAME = 'incidents';

// ----------------------------------------------------------------------
// 1. REAL-TIME SUBSCRIPTIONS
// ----------------------------------------------------------------------

/**
 * Subscribe to all incidents (for Dashboard/List)
 * Sorted by creation date descending
 */
export const subscribeIncidents = (callback, onError) => {
  // Check Firebase configuration
  if (!db) {
    console.error("Firebase not configured! Check your .env file");
    if (onError) onError(new Error("Firebase not configured"));
    callback([]);
    return () => { };
  }



  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'), limit(100));

    return onSnapshot(q, (snapshot) => {

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error("Subscription error:", error.message);
      if (onError) onError(error);
      // Return empty array on error to prevent loading forever
      callback([]);
    });
  } catch (error) {
    if (onError) onError(error);
    callback([]);
    return () => { };
  }
};



// ----------------------------------------------------------------------
// 2. INCIDENT CRUD
// ----------------------------------------------------------------------

export const getIncidentById = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
  } catch (error) { throwFriendlyError(error); }
};

export const getIncidents = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) { throwFriendlyError(error); }
};

export const createIncident = async (incidentData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...incidentData,
      status: incidentData.status || 'Open',
      priority: incidentData.priority || 'Medium',
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) { throwFriendlyError(error); }
};

export const updateIncident = async (id, updateData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...updateData, updatedAt: new Date().toISOString() });
  } catch (error) { throwFriendlyError(error); }
};

export const deleteIncident = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) { throwFriendlyError(error); }
};

// ----------------------------------------------------------------------
// 3. TIMELINE EVENTS CORE (Sub-collection 'events')
// ----------------------------------------------------------------------

/**
 * Subscribe to timeline events from the 'events' SUB-COLLECTION
 */
export const subscribeEvents = (incidentId, callback, onError = null) => {
  if (!incidentId) return () => { };

  // Ref to sub-collection: incidents/{id}/events
  const eventsRef = collection(db, COLLECTION_NAME, incidentId, 'events');
  // Order by date/time
  // Note: Firestore orderBy requires an index if multiple fields. 
  // Let's grab all and sort client-side if needed, or simple query.
  // We'll try ordering by 'date' first. If it fails due to index, we'll fix.
  // For now, let's just get them and sort in frontend or simple query.

  const q = query(eventsRef);

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(events);
  }, (error) => {
    console.error("Error subscribing to events sub-collection:", error);
    if (onError) onError(error);
    callback([]); // Return empty array to prevent loading hang
  });
};

const sanitizeData = (data) => {
  if (!data) return {};
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const addTimelineEvent = async (incidentId, eventData) => {
  try {
    console.log("Adding event to incident:", incidentId, eventData);
    const eventsRef = collection(db, COLLECTION_NAME, incidentId, 'events');

    // Sanitize data to remove undefined values which Firebase rejects
    const cleanEventData = sanitizeData(eventData);

    const newEvent = {
      ...cleanEventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("Clean payload:", newEvent);
    const docRef = await addDoc(eventsRef, newEvent);

    // Optional: Update main incident timestamp
    const incidentRef = doc(db, COLLECTION_NAME, incidentId);
    await updateDoc(incidentRef, { updatedAt: serverTimestamp() });

    return { id: docRef.id, ...newEvent };
  } catch (error) {
    console.error("Failed to add event:", error);
    throwFriendlyError(error);
  }
};

export const updateTimelineEvent = async (incidentId, oldEvent, updatedData) => {
  try {
    // Note: oldEvent is passed entire object, but we mostly need ID.
    const eventId = oldEvent.id || updatedData.id;
    if (!eventId) throw new Error("Event ID missing for update");

    const eventRef = doc(db, COLLECTION_NAME, incidentId, 'events', eventId);
    const updatePayload = {
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(eventRef, updatePayload);

    return { id: eventId, ...updatePayload };
  } catch (error) { throwFriendlyError(error); }
};

export const deleteTimelineEvent = async (incidentId, eventToDelete) => {
  try {
    const eventId = eventToDelete.id;
    if (!eventId) throw new Error("Event ID missing for delete");

    const eventRef = doc(db, COLLECTION_NAME, incidentId, 'events', eventId);
    await deleteDoc(eventRef);
  } catch (error) { throwFriendlyError(error); }
};

// ----------------------------------------------------------------------
// 4. HELPER FUNCTIONS & ALIASES
// ----------------------------------------------------------------------

/** Get all events (One-time fetch from Sub-collection) */
export const getEvents = async (incidentId) => {
  try {
    const eventsRef = collection(db, COLLECTION_NAME, incidentId, 'events');
    const snapshot = await getDocs(eventsRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Error fetching events:", e);
    return [];
  }
};

/** Alias for addTimelineEvent */
export const createEvent = addTimelineEvent;

/** Update event */
export const updateEvent = async (incidentId, eventId, updatedData) => {
  // We need to pass an object with ID as 'oldEvent' param to match signature or fix signature
  // Let's just fix the function to be direct.
  const eventRef = doc(db, COLLECTION_NAME, incidentId, 'events', eventId);
  await updateDoc(eventRef, { ...updatedData, updatedAt: new Date().toISOString() });
};

/** Delete event */
export const deleteEvent = async (incidentId, eventId) => {
  const eventRef = doc(db, COLLECTION_NAME, incidentId, 'events', eventId);
  await deleteDoc(eventRef);
};

/** 
 * Reorder events - Not yet implemented for sub-collections
 * @param {string} incidentId 
 * @param {Array} newOrder 
 * @throws {Error} Not implemented
 * @todo Implement batch update with WriteBatch for ordering
 */
export const reorderEvents = async (incidentId, newOrder) => {
  try {
    const batch = writeBatch(db); // Use default import from firestore usually
    // Wait, need to check imports. Assuming writeBatch is imported or need to import it.
    // Let's check imports at top of file. 
    // If not imported, I should add it. But for now I will use the function body and assume I'll fix imports if needed or use db methods.

    // Actually, let's look at the imports first. I can do a two-step if needed, but 'writeBatch' is standard.
    // Re-checking imports... 'writeBatch' was NOT in the original imports.
    // I will use a separate replacement to add the import first or do it all in one go if I can see the top.

    // Since I can't easily see the top without another view_file (which wastes a turn), I will risk valid JS but missing import, 
    // or I can check if I can use a simpler approach.
    // Batch is best. I will assume I need to add the import.
    // But since `replace_file_content` is a single block replacement...
    // I will write the implementation here and then add the import in a separate tool call to be safe/clean.

    // ...Checking `db` usage... `db` is from `./firebaseConfig`. `writeBatch` is from `firebase/firestore`.


    newOrder.forEach((event, index) => {
      const eventRef = doc(db, COLLECTION_NAME, incidentId, 'events', event.id);
      batch.update(eventRef, {
        order: index,
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();

    // Optional: Touch the incident to trigger updates if needed
    // const incidentRef = doc(db, COLLECTION_NAME, incidentId);
    // await updateDoc(incidentRef, { updatedAt: serverTimestamp() });

  } catch (error) { throwFriendlyError(error); }
};

// ----------------------------------------------------------------------
// 6. IMPORT / EXPORT UTILS
// ----------------------------------------------------------------------

/**
 * Import incidents from Sheet Data
 * Matches existing by 'ticket' field
 */
export const importIncidentsFromSheet = async (incidentsData) => {
  try {
    let created = 0;
    let updated = 0;

    // We process one by one to ensure integrity (could be slow for 100+ items but safe)
    for (const item of incidentsData) {
      // 1. Check if exists by Ticket Number
      const q = query(collection(db, COLLECTION_NAME), where("ticket", "==", item.ticket));
      const snapshot = await getDocs(q);

      const payload = {
        ...item,
        updatedAt: new Date().toISOString()
      };

      if (!snapshot.empty) {
        // Update existing (Take the first one found)
        const docId = snapshot.docs[0].id;
        // Don't overwrite createdAt or timeline if not intended. 
        // Sync usually implies "Source of Truth" from sheet, but maybe preserve timeline?
        // We'll merge.
        const docRef = doc(db, COLLECTION_NAME, docId);
        await updateDoc(docRef, payload);
        updated++;
      } else {
        // Create new
        await addDoc(collection(db, COLLECTION_NAME), {
          ...payload,
          createdAt: item.createdAt || new Date().toISOString(),
          status: item.status || 'Open',
          priority: item.priority || 'Medium',
          timeline: [] // Start with empty timeline
        });
        created++;
      }
    }

    return { created, updated };
  } catch (error) {
    console.error("Import Error:", error);
    throw error;
  }
};

// ----------------------------------------------------------------------
// 7. EXPORT DEFAULT OBJECT
// ----------------------------------------------------------------------

const incidentService = {
  // Subscriptions
  subscribeIncidents,
  subscribeEvents,

  // Incident CRUD
  getIncidentById,
  getIncidents,
  createIncident,
  updateIncident,
  deleteIncident,

  // Timeline CRUD (Core)
  addTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,

  // Helpers / Aliases
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  reorderEvents,

  // Import
  importIncidentsFromSheet
};

export default incidentService;
