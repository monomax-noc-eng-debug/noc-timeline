const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const uploadLocalFileToDrive = async (file, onProgress, signal) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'upload',
            name: file.name,
            mimeType: file.type,
            base64: base64
          }),
        });
        resolve(await response.json());
      } catch (error) { reject(error); }
    };
  });
};

// ✅ ตรวจสอบว่ามีฟังก์ชันนี้และ Export ออกมา
export const deleteFileFromDrive = async (fileUrlOrId) => {
  if (!fileUrlOrId) return;
  let fileId = fileUrlOrId;
  if (fileUrlOrId.includes('id=')) {
    fileId = new URLSearchParams(new URL(fileUrlOrId).search).get('id');
  }
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', fileId: fileId }),
    });
    return await response.json();
  } catch (error) {
    console.error("Drive Delete Error:", error);
  }
};