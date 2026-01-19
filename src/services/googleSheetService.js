const EXPORT_API_URL = import.meta.env.VITE_GOOGLE_EXPORT_SHEET_URL;

export const googleSheetService = {
  exportCombinedMatches: async (dateStr, headers, startRows, endRows) => {
    if (!EXPORT_API_URL) {
      console.warn("⚠️ Missing VITE_GOOGLE_EXPORT_SHEET_URL in .env");
      return false; // Return false instead of void
    }

    const payload = {
      action: 'export_combined_matches',
      date: dateStr,
      headers: headers,
      startRows: startRows,
      endRows: endRows
    };

    try {
      // ✅ ลบ mode: 'no-cors' ออกเพื่อให้รับ Response ได้
      // ตรวจสอบให้แน่ใจว่า Google Apps Script ของคุณ return headers CORS ที่ถูกต้อง
      const response = await fetch(EXPORT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // Apps Script ชอบ text/plain
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }

      // ถ้าต้องการอ่านผลลัพธ์
      // const result = await response.json(); 
      return true;

    } catch (error) {
      console.error("❌ Export Error:", error);
      // throw error; // หรือจะ return false แล้วให้ UI แจ้งเตือน
      return false;
    }
  }
};