import { auth, db } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { throwFriendlyError } from '../utils/firebaseErrorHandler';

const USERS_COLLECTION = 'users';

/**
 * Authentication Service
 * Handles user registration, login, and profile management
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { email, password, name, role }
   * @returns {Promise<Object>} User data
   */
  register: async ({ email, password, name, role = 'Viewer' }) => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Create user profile in Firestore
      const userData = {
        uid: user.uid,
        email: user.email,
        name: name,
        role: role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);

      return userData;
    } catch (error) {
      throwFriendlyError(error);
    }
  },

  /**
   * Login user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} User data
   */
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));

      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();

      if (!userData.isActive) {
        await signOut(auth);
        throw new Error('Account is disabled. Contact administrator.');
      }

      return userData;
    } catch (error) {
      throwFriendlyError(error);
    }
  },

  /**
   * Logout current user
   */
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throwFriendlyError(error);
    }
  },

  /**
   * Login with Google
   * @returns {Promise<Object>} User data
   */
  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));

      let userData;
      if (userDoc.exists()) {
        // User exists, return existing data
        userData = userDoc.data();

        if (!userData.isActive) {
          await signOut(auth);
          throw new Error('Account is disabled. Contact administrator.');
        }
      } else {
        // New user, create profile
        userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: 'Viewer', // Default role for Google sign-in
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          photoURL: user.photoURL || null
        };

        await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
      }

      return userData;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled');
      }
      throwFriendlyError(error);
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object|null>}
   */
  getCurrentUser: async () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
          resolve(userDoc.exists() ? userDoc.data() : null);
        } else {
          resolve(null);
        }
      });
    });
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password for reauthentication
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser;

      if (!user || !user.email) {
        throw new Error('No user is currently signed in');
      }

      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      throwFriendlyError(error);
    }
  },

  /**
   * Update user profile
   * @param {string} uid 
   * @param {Object} updates 
   */
  updateUser: async (uid, updates) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throwFriendlyError(error);
    }
  },

  /**
   * Delete user (soft delete by setting isActive to false)
   * @param {string} uid 
   */
  deleteUser: async (uid) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throwFriendlyError(error);
    }
  },

  /**
   * Permanently delete user
   * @param {string} uid 
   */
  permanentDeleteUser: async (uid) => {
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, uid));
    } catch (error) {
      throwFriendlyError(error);
    }
  },

  /**
   * Get all users
   * @returns {Promise<Array>}
   */
  getAllUsers: async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
      return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throwFriendlyError(error);
    }
  },

  /**
   * Get user by UID
   * @param {string} uid 
   * @returns {Promise<Object|null>}
   */
  getUserById: async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      throwFriendlyError(error);
    }
  }
};
