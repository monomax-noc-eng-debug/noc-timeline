import React, { useState } from 'react';
import { useTicketLog } from '../features/ticket/hooks/useTicketLog';
import { ticketLogService } from '../services/ticketLogService';
import { parseTicketCSV } from '../utils/ticketParser';

// Components ย่อยที่แยกออกมา
import TicketStats from '../features/ticket/components/TicketStats';
import TicketDetailSidebar from '../features/ticket/components/TicketDetailSidebar';

import {
  Search,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Filter,
  MoreVertical
} from 'lucide-react';

export default function TicketLogPage() {
  // ดึง Logic ข้อมูลมาจาก Hook 
  const { logs, stats, loading, searchTerm, setSearchTerm } = useTicketLog();

  const [isImporting, setIsImporting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // ฟังก์ชันจัดการการอัปโหลดและ Parse ไฟล์ CSV 
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target.result;
        // ใช้ Utility ที่แยกไว้ใน src/utils/ticketParser.js
        const parsedData = parseTicketCSV(csvText);

        if (parsedData.length > 0) {
          await ticketLogService.importLogs(parsedData);
          alert(`นำเข้าข้อมูลสำเร็จ ${parsedData.length} รายการ`);
        }
      } catch (err) {
        console.error("Import error:", err);
        alert("เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
      } finally {
        setIsImporting(false);
        e.target.value = null; // reset input
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-black overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* --- Header Section --- */}
        <header className="p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Ticket Log Management</h1>
            <p className="text-xs text-zinc-500 font-medium">คลังข้อมูลและประวัติการจัดการตั๋วระบบ NOC</p>
          </div>

          <div className="flex items-center gap-3">
            <label className={`
              flex items-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black 
              rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer 
              hover:opacity-80 transition-all shadow-lg shadow-black/10
              ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              <Upload size={16} strokeWidth={3} />
              <span>{isImporting ? 'Processing...' : 'Import CSV'}</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isImporting}
              />
            </label>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* 1. สถิติภาพรวม (แยก Component) */}
          <TicketStats stats={stats} />

          {/* 2. Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาด้วยเลข Ticket, รายละเอียด หรือชื่อผู้รับผิดชอบ..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 ring-black dark:ring-white transition-all shadow-sm text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <Filter size={16} />
              Filters
            </button>
          </div>

          {/* 3. Ticket Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-5">Date / ID</th>
                    <th className="px-6 py-5">Subject & Detail</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Assigned To</th>
                    <th className="px-6 py-5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-6 h-6 border-2 border-zinc-200 border-t-black dark:border-t-white rounded-full animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Logs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center text-zinc-400 text-xs font-bold">
                        ไม่พบข้อมูลที่ค้นหา
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedTicket(log)}
                        className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all cursor-pointer"
                      >
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold dark:text-white">{log.date}</span>
                            <span className="text-[10px] text-zinc-400 font-mono font-bold tracking-tighter uppercase">{log.ticketNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-1 max-w-md">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded uppercase tracking-tighter dark:text-zinc-300">
                                {log.category}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-blue-500 transition-colors">
                              {log.shortDesc}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                            ${log.status === 'Succeed'
                              ? 'bg-green-50 text-green-600 dark:bg-green-500/10'
                              : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10'}
                          `}>
                            {log.status === 'Succeed' ? <CheckCircle2 size={12} strokeWidth={3} /> : <Clock size={12} strokeWidth={3} />}
                            {log.status}
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black">
                              {log.assign?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{log.assign || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <button className="p-2 text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* --- Detail Sidebar (แยก Component) --- */}
      <TicketDetailSidebar
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
}