/**
 * Permission System for NOC Timeline
 * Roles: NOC Lead, NOC Engineer, Support, Viewer
 */

export const ROLES = {
  LEAD: 'NOC Lead',
  ENGINEER: 'NOC Engineer',
  SUPPORT: 'Support',
  VIEWER: 'Viewer'
};

const PERMISSIONS = {
  // Master Config (Leagues, Channels, Team, Projects)
  CONFIG_EDIT: [ROLES.LEAD],
  CONFIG_VIEW: [ROLES.LEAD, ROLES.ENGINEER],

  // Matches & Statistics
  MATCH_EDIT: [ROLES.LEAD, ROLES.ENGINEER],
  MATCH_VIEW: [ROLES.LEAD, ROLES.ENGINEER, ROLES.SUPPORT, ROLES.VIEWER],

  // Incident & Timeline
  INCIDENT_EDIT: [ROLES.LEAD, ROLES.ENGINEER],
  INCIDENT_VIEW: [ROLES.LEAD, ROLES.ENGINEER, ROLES.SUPPORT, ROLES.VIEWER],

  // Ticket Log
  TICKET_EDIT: [ROLES.LEAD, ROLES.ENGINEER],
  TICKET_VIEW: [ROLES.LEAD, ROLES.ENGINEER, ROLES.SUPPORT, ROLES.VIEWER],

  // Shift Handover
  HANDOVER_EDIT: [ROLES.LEAD, ROLES.ENGINEER],
  HANDOVER_ACK: [ROLES.LEAD, ROLES.ENGINEER, ROLES.SUPPORT],
  HANDOVER_VIEW: [ROLES.LEAD, ROLES.ENGINEER, ROLES.SUPPORT, ROLES.VIEWER],
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object from store
 * @param {string} permissionKey - Key from PERMISSIONS
 * @returns {boolean}
 */
export const checkPermission = (user, permissionKey) => {
  if (!user || !user.role) return false;
  const allowedRoles = PERMISSIONS[permissionKey];
  if (!allowedRoles) return false;
  return allowedRoles.includes(user.role);
};

/**
 * Check if user is in one of the allowed roles
 * @param {Object} user 
 * @param {Array} allowedRoles 
 * @returns {boolean}
 */
export const hasRole = (user, allowedRoles) => {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};
