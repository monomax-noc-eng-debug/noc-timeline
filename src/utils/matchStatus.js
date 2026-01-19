// src/utils/matchStatus.js
import { Clock, CheckCircle2, PlayCircle, Radio, Timer } from 'lucide-react';
import { parse, isPast, isToday, addHours, differenceInMinutes } from 'date-fns';
import { MATCH_THRESHOLDS } from '@/config/constants'; // ตรวจสอบว่าไฟล์ constants ถูกสร้างแล้วตาม Step 4

/**
 * Determines the status of a match based on its data.
 * @param {Object} match - The match data object.
 * @returns {string} Status string: 'LIVE' | 'SOON' | 'FINISHED' | 'UPCOMING'
 */
export const getMatchStatus = (match) => {
  if (!match) return 'UPCOMING';

  const now = new Date();

  // Priority 1: Smart Status จาก Hook/DB (Source of Truth)
  if (match.isLiveTime) return 'LIVE';
  if (match.statusDisplay?.includes('Finished')) return 'FINISHED';

  // ถ้ามี Countdown เป็นนาที (มาจากระบบคำนวณสด)
  if (match.countdown && match.countdown.toString().includes('m')) return 'SOON';

  // Priority 2: Fallback Logic based on manual toggles
  if (match.hasEndStat) return 'FINISHED';
  if (match.hasStartStat && !match.hasEndStat) return 'LIVE';

  // Priority 3: Time-based Logic (Starting Soon)
  if (match.startTime && match.startDate) {
    try {
      // แปลงวันที่ปัจจุบันเป็น YYYY-MM-DD ตาม Local time เพื่อเทียบวัน
      const todayStr = now.toLocaleDateString('en-CA');
      const isToday = match.startDate === todayStr;

      if (isToday) {
        const [hours, minutes] = match.startTime.split(':').map(Number);
        const matchDate = new Date();
        matchDate.setHours(hours, minutes, 0, 0);

        const diffMs = matchDate - now;
        const diffMins = diffMs / (1000 * 60);

        // ใช้ค่าจาก Config (เช่น 15 นาที)
        if (diffMins > 0 && diffMins <= MATCH_THRESHOLDS.SOON_MINUTES) {
          return 'SOON';
        }
      }
    } catch (error) {
      console.error("Error calculating match status:", error);
    }
  }

  return 'UPCOMING';
};

/**
 * Formats a date string to a readable format.
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date (e.g., "Monday, 10 January 2024")
 */
export const formatMatchDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};