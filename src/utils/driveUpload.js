// src/utils/driveUpload.js

/**
 * ฟังก์ชันส่งข้อมูลไปที่ Google Apps Script
 */
const uploadToDrive = async (payload) => {
  const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    console.error("ไม่พบ VITE_GOOGLE_SCRIPT_URL ในไฟล์ .env");
    return { result: "error", error: "Missing Configuration" };
  }

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    return { result: "error", error: error.message };
  }
};

/**
 * ✅ ตรวจสอบว่ามีคำว่า 'export' หน้าฟังก์ชันนี้
 */
export const uploadImageByUrl = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        const fileName = imageUrl.split('/').pop() || `img_${Date.now()}.png`;
        const res = await uploadToDrive({
          base64,
          fileName,
          mimeType: blob.type
        });
        resolve(res);
      };
    });
  } catch (error) {
    return { result: "error", error: "ไม่สามารถดึงรูปภาพจาก URL ได้" };
  }
};

/**
 * ✅ ตรวจสอบว่ามีคำว่า 'export' หน้าฟังก์ชันนี้
 */
export const uploadLocalFileToDrive = async (file) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        const res = await uploadToDrive({
          base64,
          fileName: file.name,
          mimeType: file.type
        });
        resolve(res);
      };
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    return { result: "error", error: error.message };
  }
};