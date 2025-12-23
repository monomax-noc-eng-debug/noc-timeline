// file: src/utils/helpers.js

// ฟังก์ชันคำนวณสถานะเวลาของแมตช์ (คงเดิม)
export const getMatchTimeStatus = (startDate, startTime, currentTime = new Date()) => {
  if (!startDate || !startTime) return { status: 'UNKNOWN', text: '', color: 'text-gray-400' };

  const matchDT = new Date(`${startDate}T${startTime}`);
  const diffMin = Math.round((matchDT - currentTime) / 60000);

  if (diffMin > 0 && diffMin <= 60) {
    return { status: 'SOON', text: `In ${diffMin}m`, color: 'text-orange-500' };
  }
  if (diffMin <= 0 && diffMin > -120) {
    return { status: 'LIVE', text: 'LIVE', color: 'text-blue-600 font-black' };
  }
  return { status: 'NORMAL', text: '', color: 'text-gray-400' };
};

// ✅ แก้ไขใหม่: รองรับ URL แบบฟรี (Google Drive / Dropbox)
export const getDirectImageUrl = (url) => {
  if (!url) return '';

  try {
    // 1. กรณีเป็น Google Drive
    // ใช้เทคนิค lh3.googleusercontent.com เพื่อโหลดรูปแบบ Direct Link ฟรี
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      let id = '';
      const parts = url.match(/\/d\/(.+?)\//);
      if (parts && parts[1]) {
        id = parts[1];
      } else {
        const params = new URLSearchParams(new URL(url).search);
        id = params.get('id');
      }

      if (id) {
        // ใช้ URL นี้จะโหลดเร็วกว่าและไม่ติด redirect
        return `https://lh3.googleusercontent.com/d/${id}`;
      }
    }

    // 2. กรณีเป็น Dropbox
    // เปลี่ยน ?dl=0 เป็น ?raw=1 เพื่อให้เป็น direct image link
    if (url.includes('dropbox.com')) {
      const newUrl = new URL(url);
      newUrl.searchParams.set('raw', '1');
      newUrl.searchParams.delete('dl');
      return newUrl.toString();
    }

    // 3. URL ปกติ หรือ URL ที่แก้ไม่ได้
    return url;
  } catch (e) {
    console.warn("Error parsing image URL:", e);
    return url;
  }
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });