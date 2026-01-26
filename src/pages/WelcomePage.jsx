import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useDashboardStats } from '../features/dashboard/hooks/useDashboardStats';
import { format } from 'date-fns';
import {
  AlertCircle, Activity, Radio, Users, ArrowRight,
  ShieldCheck, Clock, CalendarDays, Loader2
} from 'lucide-react';

export default function WelcomePage() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time Dashboard Stats
  const { incidents, matches, currentShift, loading } = useDashboardStats();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-black p-6 relative overflow-hidden">

      {/* Background Decoration - Minimal Outlook Style */}
      <div className="absolute inset-0 bg-[#f0f4f8] dark:bg-black" />

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center gap-12 animate-in slide-in-from-bottom-8 fade-in duration-700">

        {/* Header Section */}
        <div className="text-center space-y-4">
          {/* Logo & Date */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-[#0078D4] text-white rounded flex items-center justify-center font-bold text-lg shadow-sm">
              N
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {format(currentTime, 'EEEE, dd MMMM yyyy')}
              </span>
            </div>
          </div>

          {/* Greeting */}
          <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            {getGreeting()}, <span className="text-[#0078D4]">{currentUser?.name?.split(' ')[0] || 'Engineer'}</span>
          </h1>
        </div>

        {/* Dashboard Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full px-4 sm:px-0">

          {/* 1. Incident Status */}
          {/* 1. Incident Status */}
          <div
            onClick={() => navigate('/incidents')}
            className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 cursor-pointer hover:border-[#0078D4] hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Incidents</span>
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-400">
                  <Activity size={18} />
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {loading ? '-' : incidents.open} Open
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mt-1">
                  {incidents.critical > 0 && (
                    <span className="text-red-600 dark:text-red-400 font-semibold">{incidents.critical} Critical</span>
                  )}
                  {incidents.critical > 0 && <span className="w-1 h-1 bg-zinc-300 rounded-full" />}
                  <span>{incidents.total} Total Active</span>
                </div>
              </div>

              <div className="flex items-center text-xs font-medium text-[#0078D4] opacity-0 group-hover:opacity-100 transition-opacity">
                Manage Incidents <ArrowRight size={14} className="ml-1" />
              </div>
            </div>
          </div>

          {/* 2. Match Schedule */}
          {/* 2. Match Schedule */}
          <div
            onClick={() => navigate('/schedule/history')}
            className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 cursor-pointer hover:border-[#0078D4] hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Matches</span>
                <div className="p-2 bg-[#deecf9] dark:bg-[#0078D4]/20 rounded text-[#0078D4]">
                  <CalendarDays size={18} />
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {loading ? '-' : matches.total} Today
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mt-1">
                  {matches.live > 0 ? (
                    <span className="text-[#0078D4] font-semibold animate-pulse">{matches.live} Live Now</span>
                  ) : (
                    <span>{matches.upcoming} Upcoming</span>
                  )}
                </div>
              </div>

              <div className="flex items-center text-xs font-medium text-[#0078D4] opacity-0 group-hover:opacity-100 transition-opacity">
                View Schedule <ArrowRight size={14} className="ml-1" />
              </div>
            </div>
          </div>

          {/* 3. Shift Status */}
          {/* 3. Shift Status */}
          <div
            onClick={() => navigate('/handover')}
            className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 cursor-pointer hover:border-[#0078D4] hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">On Duty</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={18} />
                </div>
              </div>

              <div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white line-clamp-1 mb-1">
                  {loading ? (
                    <Loader2 className="animate-spin text-zinc-400" size={20} />
                  ) : currentShift.onDuty.length > 0 ? (
                    currentShift.onDuty.join(', ')
                  ) : (
                    "No Shift Logged"
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <span className={`inline-block w-2 h-2 rounded-full ${currentShift.status === 'Normal' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>Status: {currentShift.status}</span>
                </div>
              </div>

              <div className="flex items-center text-xs font-medium text-[#0078D4] opacity-0 group-hover:opacity-100 transition-opacity">
                Shift Handover <ArrowRight size={14} className="ml-1" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}