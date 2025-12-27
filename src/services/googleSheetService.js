// file: src/services/googleSheetService.js
const EXPORT_API_URL = import.meta.env.VITE_GOOGLE_EXPORT_SHEET_URL;

export const googleSheetService = {
  /**
   * ส่งข้อมูล Start & End ไปยัง Google Sheet ใน Tab เดียว
   * @param {string} dateStr - ชื่อ Sheet (เช่น "28-12-2025")
   * @param {Array} headers - Array ของหัวข้อคอลัมน์
   * @param {Array} startRows - ข้อมูลตาราง Start (Array of Arrays)
   * @param {Array} endRows - ข้อมูลตาราง End (Array of Arrays)
   */
  exportCombinedMatches: async (dateStr, headers, startRows, endRows) => {
    if (!EXPORT_API_URL) {
      console.warn("⚠️ Missing VITE_GOOGLE_EXPORT_SHEET_URL in .env");
      return;
    }

    const payload = {
      action: 'export_combined_matches', // Action สำหรับ Merge/Upsert
      date: dateStr,
      headers: headers,
      startRows: startRows,
      endRows: endRows
    };

    try {
      await fetch(EXPORT_API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      console.log("✅ Export request sent successfully");
      return true;
    } catch (error) {
      console.error("❌ Export Error:", error);
      throw error;
    }
  }
};