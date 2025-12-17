import { api } from '../lib/api';

export const incidentService = {
  // ดึงข้อมูล Incident
  getIncidents: async (cursor = null) => {
    try {
      return await api.getIncidents(cursor);
    } catch (error) {
      console.error("Fetch incidents error:", error);
      throw new Error("Failed to load incidents.");
    }
  },

  getIncidentEvents: async (id) => {
    return await api.getIncidentEvents(id);
  },

  // สร้าง Incident
  createIncident: async (currentUser) => {
    try {
      const payload = {
        project: 'MONOMAX',
        subject: 'New Incident',
        ticket: '',
        createdBy: currentUser
      };
      return await api.createIncident(payload);
    } catch (error) {
      throw new Error("Failed to create case.");
    }
  },

  // อัปเดต Incident
  updateIncident: async (id, data) => {
    return await api.updateIncident(id, data);
  },

  // ลบ Incident
  deleteIncident: async (id) => {
    return await api.deleteIncident(id);
  },

  // --- Events ---
  addEvent: async (incidentId, data) => {
    return await api.createEvent({ incident_id: incidentId, ...data });
  },

  updateEvent: async (incidentId, eventId, data) => {
    return await api.updateEvent(incidentId, eventId, data);
  },

  deleteEvent: async (incidentId, eventId) => {
    return await api.deleteEvent(incidentId, eventId);
  },

  reorderEvents: async (incidentId, newEvents) => {
    return await api.reorderEvents(incidentId, newEvents);
  }
};