/**
 * Firebase Error Handler
 * Maps Firebase error codes to user-friendly messages
 */

const ERROR_MESSAGES = {
  // Auth Errors
  'auth/email-already-in-use': 'Email is already registered.',
  'auth/invalid-email': 'Invalid email address format.',
  'auth/user-not-found': 'User not found. Please check your credentials.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/popup-closed-by-user': 'Sign-in cancelled by user.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/requires-recent-login': 'Please login again to verify your identity.',

  // Firestore Errors
  'permission-denied': 'You do not have permission to perform this action.',
  'unavailable': 'Service temporarily unavailable. Please try again later.',
  'not-found': 'Requested document or resource was not found.',
  'already-exists': 'Resource already exists.',
  'resource-exhausted': 'Quota exceeded or service overloaded.',
  'deadline-exceeded': 'Request timed out.',
  'aborted': 'Operation was aborted.',

  // Storage Errors
  'storage/unauthorized': 'User is not authorized to access the object.',
  'storage/canceled': 'User canceled the upload.',
  'storage/unknown': 'Unknown error occurred, inspect the server response.',
};

/**
 * Maps a Firebase error to a friendly message
 * @param {Object|string} error - The error object or error code
 * @returns {string} The friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  const code = error?.code || error?.message || error;

  if (ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  // Fallback for specific patterns
  if (typeof code === 'string') {
    if (code.includes('quota')) return 'System quota exceeded.';
    if (code.includes('offline')) return 'You are offline.';
    if (code.includes('network')) return 'Network error.';
  }

  // Default return original message if readable, else generic
  return error?.message && error.message.length < 100
    ? error.message
    : 'An unexpected error occurred. Please try again.';
};

/**
 * Throws a standardized error with a friendly message
 * @param {Object} error - Original error object
 */
export const throwFriendlyError = (error) => {
  const message = getFirebaseErrorMessage(error);
  throw new Error(message);
};
