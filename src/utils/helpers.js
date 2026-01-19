/**
 * Helper แปลง Link Google Drive ให้เป็นรูปภาพที่แสดงผลได้
 */
export const getDirectImageUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('drive.google.com') || urlObj.hostname.includes('docs.google.com')) {
      let id = urlObj.searchParams.get('id');
      if (!id) {
        const pathSegments = urlObj.pathname.split('/');
        const dIndex = pathSegments.indexOf('d');
        if (dIndex !== -1 && pathSegments[dIndex + 1]) id = pathSegments[dIndex + 1];
      }
      // ใช้รูปแบบ Thumbnail เพื่อให้แสดงผลในแอปได้โดยไม่ติด CORS
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }
    return url;
  } catch {
    return url;
  }
};