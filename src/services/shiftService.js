import {
  collection, query, orderBy, onSnapshot, addDoc,
  updateDoc, deleteDoc, doc, arrayUnion, arrayRemove, limit
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const SHIFT_COL = "shift_handovers";

export const shiftService = {
  /**
   * Subscribe to handover logs in real-time
   * @param {Function} callback - Function to receive data updates
   * @param {number} limitCount - Maximum number of records to fetch
   * @returns {Function} Unsubscribe function
   */
  subscribeHandovers: (callback, limitCount = 50) => {
    const q = query(
      collection(db, SHIFT_COL),
      orderBy("date", "desc"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // ✅ Ensure arrays exist to prevent null errors
        onDuty: doc.data().onDuty || [],
        acknowledgedBy: doc.data().acknowledgedBy || []
      }));
      callback(data);
    }, (error) => {
      console.error("Firestore subscription error:", error);
      callback([]);
    });
  },

  /**
   * Create a new handover log
   * @param {Object} data - Log data
   * @returns {Promise<DocumentReference>}
   */
  createHandover: async (data) => {
    try {
      const payload = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // ✅ Preserve acknowledgedBy from input or default to empty
        acknowledgedBy: data.acknowledgedBy || [],
        // ✅ Ensure onDuty is always an array
        onDuty: data.onDuty || []
      };
      return await addDoc(collection(db, SHIFT_COL), payload);
    } catch (error) {
      console.error("Create handover error:", error);
      throw new Error("Failed to create handover log");
    }
  },

  /**
   * Update an existing handover log
   * @param {string} id - Document ID
   * @param {Object} data - Updated data
   */
  updateHandover: async (id, data) => {
    try {
      const updatePayload = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(doc(db, SHIFT_COL, id), updatePayload);
    } catch (error) {
      console.error("Update handover error:", error);
      throw new Error("Failed to update handover log");
    }
  },

  /**
   * Delete a handover log
   * @param {string} id - Document ID
   */
  deleteHandover: async (id) => {
    try {
      await deleteDoc(doc(db, SHIFT_COL, id));
    } catch (error) {
      console.error("Delete handover error:", error);
      throw new Error("Failed to delete handover log");
    }
  },

  /**
   * Toggle acknowledgment status for a user
   * @param {string} id - Document ID
   * @param {string} name - User name to toggle
   * @param {boolean} isRemoving - Whether to remove (true) or add (false)
   */
  toggleAcknowledge: async (id, name, isRemoving) => {
    try {
      const docRef = doc(db, SHIFT_COL, id);
      await updateDoc(docRef, {
        acknowledgedBy: isRemoving ? arrayRemove(name) : arrayUnion(name),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Toggle acknowledge error:", error);
      throw new Error("Failed to update acknowledgment");
    }
  }
};