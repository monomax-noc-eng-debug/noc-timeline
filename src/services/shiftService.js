import {
  collection, query, orderBy, onSnapshot, addDoc,
  updateDoc, deleteDoc, doc, arrayUnion, arrayRemove, limit, where, getDocs
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { throwFriendlyError } from "../utils/firebaseErrorHandler";

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
      throwFriendlyError(error);
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
      throwFriendlyError(error);
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
      throwFriendlyError(error);
    }
  },

  // --- Standard CRUD Aliases ---
  createShift: (data) => shiftService.createHandover(data),

  getShifts: async (limitCount = 50) => {
    try {
      const q = query(
        collection(db, SHIFT_COL),
        orderBy("date", "desc"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throwFriendlyError(error);
    }
  },

  updateShift: (id, data) => shiftService.updateHandover(id, data),

  deleteShift: (id, images = []) => shiftService.deleteHandover(id, images),

  /**
   * Delete a handover log with image cleanup
   * @param {string} id - Document ID
   * @param {Array} images - List of image objects {id, url} to delete from Drive
   */
  deleteHandover: async (id, images = []) => {
    try {
      // 1. Delete associated images from Drive if they exist
      if (images && images.length > 0) {
        // We trigger deletes in parallel but don't strictly block Firestore deletion if one fails
        Promise.all(images.map(img =>
          // Handle both full object {id, url} or just id string (legacy safety)
          // deleteFileFromDrive handles URL or ID string.
          import('../utils/driveUpload').then(({ deleteFileFromDrive }) =>
            deleteFileFromDrive(img.id || img.url || img)
          )
        )).catch(err => console.error("Error cleaning up images:", err));
      }

      // 2. Delete Firestore Document
      await deleteDoc(doc(db, SHIFT_COL, id));
    } catch (error) {
      throwFriendlyError(error);
    }
  },
};
