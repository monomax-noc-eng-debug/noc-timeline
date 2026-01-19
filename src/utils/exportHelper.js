// src/utils/exportHelper.js

/**
 * ล้างข้อมูล string ให้ปลอดภัยสำหรับ CSV (Escape double quotes)
 */
export const cleanCsvCell = (str) => {
  if (str === null || str === undefined) return '';
  return String(str).replace(/"/g, '""').replace(/\n/g, ' ');
};

/**
 * แปลงวันที่เป็น format dd/mm/yyyy สำหรับ CSV
 */
export const formatCsvDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-GB');
  } catch (e) {
    return '-';
  }
};

/**
 * สร้างไฟล์ CSV และสั่ง Browser ให้ดาวน์โหลด
 * @param {string} content - เนื้อหา CSV (รวม Headers แล้ว)
 * @param {string} fileName - ชื่อไฟล์ที่ต้องการ (ไม่ต้องใส่นามสกุล .csv ก็ได้ เดี๋ยวเติมให้)
 */
export const downloadCsvFile = (content, fileName) => {
  // เติม BOM (\uFEFF) เพื่อให้ Excel เปิดอ่านภาษาไทยรู้เรื่อง
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  // ตรวจสอบนามสกุลไฟล์
  const finalFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  link.download = finalFileName;

  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 0);
};