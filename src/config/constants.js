// src/config/constants.js

export const APP_CONFIG = {
  NAME: 'NOC Storage',
  VERSION: '1.0.0',
};

export const REFRESH_INTERVALS = {
  // Matches Fetching
  MATCHES_AUTO: 1000 * 30,         // 30 seconds
  MATCHES_STALE_AUTO: 1000 * 20,   // 20 seconds
  MATCHES_STALE_DEFAULT: 1000 * 60 * 5, // 5 minutes
};

export const MATCH_THRESHOLDS = {
  SOON_MINUTES: 15, // กี่นาทีก่อนเริ่มแข่ง ถึงจะขึ้นสถานะ SOON
  MATCH_DURATION_HOURS: 2.5, // ระยะเวลาแมตช์โดยประมาณ (ชั่วโมง)
};

export const UI_CONFIG = {
  TOAST_DURATION: 3000,
};