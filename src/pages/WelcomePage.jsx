// file: src/pages/WelcomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
// ❌ เอา Zap ออก
import { Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useDashboardStats } from '../features/dashboard/hooks/useDashboardStats';

export default function WelcomePage() {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  const { todaySummary, activeIncidents } = useDashboardStats();

  return (
    <div className="h-full bg-zinc-50 dark:bg-black p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full space-y-12">

        {/* Hero Section */}
        <div>
          {/* ✅ แก้ไขชื่อเว็บ */}
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter dark:text-white mb-4 leading-[0.9]">
            NOC <span className="text-zinc-300 dark:text-zinc-700">NTT</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-600">Management System</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">System Operational • Welcome, {currentUser}</p>
          </div>
        </div>

        {/* Cards Grid - ❌ ปรับเหลือ 2 คอลัมน์พอกว้างๆ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Today Card */}
          <div onClick={() => navigate('/schedule/today')} className="group bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-10">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl text-zinc-900 dark:text-white"><Calendar size={28} /></div>
              <ArrowRight className="text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </div>
            <div className="text-5xl font-black dark:text-white mb-2">{todaySummary.total}</div>
            <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">Matches Scheduled Today</div>
          </div>

          {/* Incidents Card */}
          <div onClick={() => navigate('/incidents')} className="group bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 transition-all cursor-pointer relative overflow-hidden">
            {activeIncidents > 0 && <div className="absolute top-0 right-0 p-4"><span className="flex h-4 w-4 rounded-full bg-red-500 animate-pulse"></span></div>}
            <div className="flex justify-between items-start mb-10">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl text-red-500"><AlertTriangle size={28} /></div>
              <ArrowRight className="text-zinc-300 group-hover:text-red-500 transition-colors" />
            </div>
            <div className="text-5xl font-black dark:text-white mb-2">{activeIncidents}</div>
            <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">Active Incidents</div>
          </div>

          {/* ❌ ลบ Stats Card ออกแล้ว */}

        </div>
      </div>
    </div>
  );
}