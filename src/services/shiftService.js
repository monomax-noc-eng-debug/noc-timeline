import { api } from '../lib/api'; // สมมติว่านี่คือ axios instance หรือ firebase ref เดิม

export const shiftService = {
  // ดึงข้อมูล (รองรับ Pagination และ Filter Date)
  getHandovers: async (cursor = null, dateFilter = '') => {
    try {
      if (dateFilter) {
        return await api.getShiftHandoversByDate(dateFilter);
      }
      return await api.getShiftHandovers(cursor);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      throw new Error("Failed to load shift history.");
    }
  },

  // สร้างรายการใหม่
  createHandover: async (data) => {
    try {
      const payload = {
        ...data,
        createdAt: new Date().toISOString(),
        acknowledgedBy: []
      };
      return await api.createShiftHandover(payload);
    } catch (error) {
      console.error("Error creating shift:", error);
      throw new Error("Failed to create shift log.");
    }
  },

  // อัปเดตรายการเดิม
  updateHandover: async (id, data) => {
    try {
      await api.updateShiftHandover(id, data);
      return { id, ...data };
    } catch (error) {
      console.error("Error updating shift:", error);
      throw new Error("Failed to update shift log.");
    }
  },

  // ลบรายการ
  deleteHandover: async (id) => {
    try {
      await api.deleteShiftHandover(id);
      return id;
    } catch (error) {
      console.error("Error deleting shift:", error);
      throw new Error("Failed to delete shift log.");
    }
  },

  // กดรับทราบ (Acknowledge)
  toggleAcknowledge: async (id, memberName, isRemoving) => {
    try {
      await api.toggleAcknowledge(id, memberName, isRemoving);
      return { id, memberName, isRemoving };
    } catch (error) {
      console.error("Error toggling acknowledge:", error);
      throw new Error("Failed to update acknowledgment.");
    }
  }
};