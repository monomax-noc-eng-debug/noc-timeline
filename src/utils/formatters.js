// utils/formatters.js
import { format, isValid } from 'date-fns';

// Format มาตรฐานสำหรับแสดงผล (UI)
export const formatDateUI = (date) => {
  if (!date || !isValid(new Date(date))) return '-';
  return format(new Date(date), 'dd/MM/yyyy');
};

// Format มาตรฐานสำหรับส่ง API (Backend/Database)
export const formatDateAPI = (date) => {
  if (!date || !isValid(new Date(date))) return null;
  return format(new Date(date), 'yyyy-MM-dd');
};

// Format เวลา
export const formatTimeUI = (timeStr) => {
  if (!timeStr) return '-';
  // ตัดวินาทีทิ้งถ้ามี (08:30:00 -> 08:30)
  return timeStr.substring(0, 5);
};

export const convertToGB = (val, unit) => {
  if (!val || isNaN(val)) return 0;
  const num = parseFloat(val);
  if (unit === 'TB') return num * 1024;
  if (unit === 'MB') return num / 1024;
  return num;
};

export const parseAbbrev = (val) => {
  if (!val) return 0;

  // Handle object format {val, unit}
  if (typeof val === 'object' && val.val !== undefined) {
    const num = parseFloat(val.val);
    if (isNaN(num)) return 0;
    const unit = (val.unit || '').toLowerCase();
    if (unit === 'm') return num * 1000000;
    if (unit === 'k') return num * 1000;
    if (unit === 'b') return num * 1000000000;
    return num;
  }

  // Handle string format "17.1 M" or "17.1M"
  const clean = val.toString().toLowerCase().trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (clean.endsWith('m')) return num * 1000000;
  if (clean.endsWith('k')) return num * 1000;
  if (clean.endsWith('b')) return num * 1000000000;
  return num;
};

export const formatNumber = (num, decimals = 0) => {
  if (num === undefined || num === null || num === '') return '0';
  return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const formatPercent = (val, decimals = 2) => {
  if (!val || isNaN(val)) return '0 %';
  return `${parseFloat(val).toFixed(decimals)} %`;
};