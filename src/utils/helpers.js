// file: src/utils/helpers.js

/**
 * ฟังก์ชันคำนวณสถานะเวลาของแมตช์
 */
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

/**
 * ✅ แก้ไขใหม่: รองรับ URL แบบ Direct Link (Google Drive / Dropbox)
 */
export const getDirectImageUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);

    // 1. Google Drive
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      let id = urlObj.searchParams.get('id');

      if (!id) {
        // Updated regex to stop at /, ?, or &
        const parts = url.match(/\/d\/(.+?)(?:\/|\?|&|$)/);
        if (parts && parts[1]) {
          id = parts[1];
        }
      }

      if (id) {
        return `https://lh3.googleusercontent.com/d/${id}`;
      }
    }

    // 2. Dropbox
    if (url.includes('dropbox.com')) {
      urlObj.searchParams.set('raw', '1');
      urlObj.searchParams.delete('dl');
      return urlObj.toString();
    }

    return url;
  } catch (e) {
    // If not a valid URL, check for typical Drive patterns anyway
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      const parts = url.match(/\/d\/(.+?)(?:\/|\?|&|$)/);
      if (parts && parts[1]) {
        return `https://lh3.googleusercontent.com/d/${parts[1]}`;
      }
    }
    return url;
  }
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });