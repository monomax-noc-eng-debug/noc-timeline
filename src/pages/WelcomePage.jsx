// file: src/pages/WelcomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, AlertTriangle, ArrowRight, Activity, Clock,
  Zap, TrendingUp, Shield, Radio, FileText, Users
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useDashboardStats } from '../features/dashboard/hooks/useDashboardStats';

export default function WelcomePage() {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  const { todaySummary, activeIncidents, loading } = useDashboardStats();

  // Get current time info
  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black p-6 md:p-10 lg:p-16">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header Skeleton */}
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-16 w-3/4 max-w-lg bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>

          {/* Quick Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>

          {/* Main Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black overflow-y-auto custom-scrollbar">
      <div className="min-h-full p-6 md:p-10 lg:p-16">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Top Status Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-50" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                System Operational
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock size={12} />
              <span className="text-[10px] font-mono">
                {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Hero Section */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">
              {greeting}
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-zinc-900 dark:text-white leading-[0.95]">
              {currentUser?.name || 'Operator'}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
              Welcome to NOC NTT Management System. Monitor live matches, track incidents, and manage operations.
            </p>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Radio size={12} className="text-blue-500" />
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Live Now</span>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{todaySummary.live || 0}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} className="text-amber-500" />
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Upcoming</span>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{todaySummary.upcoming || 0}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Completed</span>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{todaySummary.finished || 0}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={12} className="text-purple-500" />
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Success Rate</span>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">100%</p>
            </div>
          </div>

          {/* Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Live Desk Card */}
            <button
              onClick={() => navigate('/schedule/today')}
              className="group text-left bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 p-8 rounded-3xl border border-zinc-700 hover:border-zinc-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-zinc-900/20"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
                  <Calendar size={24} className="text-white" />
                </div>
                <ArrowRight className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <div className="space-y-2">
                <div className="text-6xl font-black text-white">{todaySummary.total}</div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  TODAY'S MATCHES
                </div>
                <p className="text-[11px] text-zinc-500 pt-2">
                  Monitor live broadcasts, track match status, and manage real-time operations.
                </p>
              </div>
              {todaySummary.live > 0 && (
                <div className="mt-6 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-red-400 uppercase">{todaySummary.live} Live Now</span>
                </div>
              )}
            </button>

            {/* Incidents Card */}
            <button
              onClick={() => navigate('/incidents')}
              className={`group text-left p-8 rounded-3xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${activeIncidents > 0
                ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 border-red-200 dark:border-red-900/50 hover:border-red-400 hover:shadow-red-500/10'
                : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 hover:shadow-zinc-900/10'
                }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`p-3 rounded-xl ${activeIncidents > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                  <AlertTriangle size={24} className={activeIncidents > 0 ? 'text-red-500' : 'text-zinc-500'} />
                </div>
                <ArrowRight className={`group-hover:translate-x-1 transition-all ${activeIncidents > 0 ? 'text-red-300 group-hover:text-red-500' : 'text-zinc-300 group-hover:text-zinc-600'}`} />
              </div>
              <div className="space-y-2">
                <div className={`text-6xl font-black ${activeIncidents > 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}>
                  {activeIncidents}
                </div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  ACTIVE INCIDENTS
                </div>
                <p className="text-[11px] text-zinc-500 pt-2">
                  Track and resolve ongoing incidents with detailed timeline management.
                </p>
              </div>
              {activeIncidents > 0 && (
                <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Activity size={12} className="text-red-500" />
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">Requires Attention</span>
                </div>
              )}
            </button>

          </div>

          {/* Secondary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Ticket Log Card */}
            <button
              onClick={() => navigate('/tickets')}
              className="group text-left bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <FileText size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Ticket Log</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Manage Support Tickets</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-zinc-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* Shift Transfer Card */}
            <button
              onClick={() => navigate('/handover')}
              className="group text-left bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Users size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Shift Transfer</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Handover Management</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-zinc-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

          </div>

          {/* Footer Info */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] text-zinc-400">
              <p>
                Role: <span className="font-bold text-zinc-600 dark:text-zinc-300 uppercase">{currentUser?.role || 'Guest'}</span>
              </p>
              <p className="font-mono">
                NOC NTT Management System v2.0
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}