import { useState, useEffect, useMemo } from 'react';
import { ticketLogService } from '../../../services/ticketLogService';

/**
 * Custom Hook สำหรับจัดการข้อมูล Ticket Log
 * ใช้สำหรับดึงข้อมูลแบบ Real-time, ค้นหาข้อมูล และคำนวณสถิติภาพรวม
 */
export const useTicketLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. ติดตามข้อมูลจาก Firebase Firestore แบบ Real-time 
  useEffect(() => {
    setLoading(true);
    // เรียกใช้ Service ที่แยกออกมาเพื่อดึงข้อมูลจาก collection 'ticket_logs' 
    const unsubscribe = ticketLogService.subscribeLogs((data) => {
      setLogs(data);
      setLoading(false);
    });

    // Cleanup subscription เมื่อ component ถูกถอดออก 
    return () => unsubscribe();
  }, []);

  // 2. การกรองข้อมูล (Filtering) ตามคำค้นหา 
  const filteredLogs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return logs;

    return logs.filter(log =>
      (log.ticketNumber || '').toLowerCase().includes(term) ||
      (log.shortDesc || '').toLowerCase().includes(term) ||
      (log.assign || '').toLowerCase().includes(term) ||
      (log.category || '').toLowerCase().includes(term)
    );
  }, [logs, searchTerm]);

  // 3. การคำนวณสถิติ (Statistics) เพื่อส่งให้ TicketStats.jsx 
  const stats = useMemo(() => {
    // กำหนดค่าเริ่มต้นเพื่อป้องกัน TypeError: Cannot read properties of undefined 
    if (!logs) return { total: 0, succeed: 0, pending: 0, incidents: 0 };

    return {
      total: logs.length,
      // นับจำนวนสถานะ 'Succeed' จากคอลัมน์ Status ใน Excel 
      succeed: logs.filter(l => l.status === 'Succeed').length,
      // นับจำนวนเคสที่ยังไม่ใช่ Succeed (เช่น Pending หรือ Open) 
      pending: logs.filter(l => l.status !== 'Succeed' && l.status !== '').length,
      // นับจำนวนรายการที่เป็น 'Incident' จากคอลัมน์ Ticket Type ใน Excel 
      incidents: logs.filter(l => l.type === 'Incident').length,
    };
  }, [logs]);

  return {
    logs: filteredLogs, // ข้อมูลที่ผ่านการกรองแล้ว
    allLogs: logs,      // ข้อมูลดิบทั้งหมด
    stats,              // ค่าสถิติสำหรับ Dashboard
    loading,            // สถานะการโหลด
    searchTerm,         // คำค้นหาปัจจุบัน
    setSearchTerm       // ฟังก์ชันสำหรับเปลี่ยนคำค้นหา
  };
};