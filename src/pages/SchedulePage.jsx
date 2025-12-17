import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from '../lib/api';
import { scheduleService } from '../services/scheduleService';
import { RefreshCw, Download, Calendar as CalIcon } from 'lucide-react';
import Toast from '../components/Toast';

export default function SchedulePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // 1. Real-time Subscription
  useEffect(() => {
    const q = query(collection(db, "schedules"), orderBy("startDate"), orderBy("startTime"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync Function (กดปุ่มแล้วไปดึงจาก Google)
  const handleSync = async () => {
    setSyncing(true);
    try {
      const count = await scheduleService.syncFromGoogle();
      setToast({ show: true, message: `Synced ${count} matches successfully!`, type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Sync failed: ' + err.message, type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  // 3. Export CSV Function
  const handleExportCSV = () => {
    if (matches.length === 0) return;

    const headers = "League,Title,Team A,Team B,Date,Start,Start+15,Start+2H,End Date,End Time,Channel";
    const csvRows = matches.map(m => {
      const esc = (t) => `"${(t || '').toString().replace(/"/g, '""')}"`;
      return [
        esc(m.calendar), esc(m.title), esc(m.teamA), esc(m.teamB),
        esc(m.startDate), esc(m.startTime), esc(m.startPlus15), esc(m.startPlus2H),
        esc(m.endDate), esc(m.endTime), esc(m.channel)
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers, ...csvRows].join("\n"); // ใส่ BOM
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Schedule_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="h-full bg-[#F3F4F6] dark:bg-[#000000] p-6 flex flex-col transition-colors duration-300">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1F2937] dark:text-[#F2F2F2]">
            <span className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-200 dark:bg-[#333] dark:border-[#444]"><CalIcon size={20} /></span>
            Schedule
          </h1>
          <p className="text-xs mt-1 text-gray-500 font-mono">{matches.length} MATCHES THIS MONTH</p>
        </div>
        <div className="flex gap-2">
          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold text-white shadow-lg transition-all
              ${syncing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
            {syncing ? 'SYNCING...' : 'UPDATE FROM CALENDAR'}
          </button>

          {/* Export Button */}
          <button onClick={handleExportCSV} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-[#111] dark:border-[#333] dark:text-[#F2F2F2]">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-[#111] dark:border-[#333] shadow-sm flex flex-col">
        <div className="overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-[#222] sticky top-0 z-10">
              <tr>
                {['Date', 'Time', 'League', 'Match', 'Channel'].map(h => (
                  <th key={h} className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b dark:border-[#333]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400">Loading...</td></tr>
              ) : matches.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                  <td className="p-3 text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">{m.startDate}</td>
                  <td className="p-3 text-xs font-mono text-gray-500">{m.startTime}</td>
                  <td className="p-3 text-xs font-bold text-blue-600 dark:text-blue-400">{m.calendar}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1F2937] dark:text-[#F2F2F2]">{m.teamA} {m.teamB ? 'vs' : ''} {m.teamB}</span>
                      <span className="text-[10px] text-gray-400">{m.title}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gray-500">{m.channel || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}