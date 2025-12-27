// file: src/pages/schedule/TodayPage.jsx
import React, { useState, useEffect, useDeferredValue, useMemo, memo } from 'react';
import { useTodayMatches } from './hooks/useTodayMatches';

// Components
import MatchCard from '../../features/matches/components/MatchCard';
import MatchStatModal from '../../features/match-stats/MatchStatModal';
import ManualMatchModal from '../../features/matches/components/ManualMatchModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import DataPreviewPanel from '../../features/matches/components/DataPreviewPanel';

// Icons & Utils
import {
  Search, Radio, Bell, BellOff, ChevronLeft, ChevronRight,
  Plus, Calendar as CalendarIcon, FileText, Filter, Clock,
  LayoutGrid, CheckCircle2, CalendarCheck, Eye, EyeOff
} from 'lucide-react';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isToday } from 'date-fns';

// ----------------------------------------------------------------------
// 1. Sub-components (Performance Optimized)
// ----------------------------------------------------------------------

const CompactFilter = ({ label, icon: Icon, count, active, onClick, isLive }) => (
  <button
    onClick={onClick}
    title={label}
    className={`
      flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border
      ${active
        ? isLive
          ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
          : 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-md'
        : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }
    `}
  >
    <div className="relative flex items-center justify-center">
      {isLive && active && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-30 animate-ping"></span>
      )}
      <Icon size={14} className={isLive && active ? "animate-pulse" : ""} />
    </div>
    <span className="hidden lg:inline">{label}</span>
    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] min-w-[18px] text-center ${active
      ? 'bg-white/20 text-white dark:text-black'
      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
      }`}>
      {count}
    </span>
  </button>
);

const CompactClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 min-w-[60px]">
        {format(time, 'HH:mm:ss')}
      </span>
    </div>
  );
};

// Memoized List
const MatchList = memo(({ matches, loading, setSelectedMatch, setEditingMatch, setIsManualModalOpen, setDeleteConfirm }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
        <Filter size={48} className="text-zinc-300" strokeWidth={1} />
        <p className="text-sm font-medium text-zinc-500">No matches found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-10">
      {matches.map(m => (
        <MatchCard
          key={m.id}
          match={m}
          onClick={() => setSelectedMatch(m)}
          onEdit={(match) => { setEditingMatch(match); setIsManualModalOpen(true); }}
          onDelete={(id) => setDeleteConfirm({ isOpen: true, id })}
        />
      ))}
    </div>
  );
});

// ----------------------------------------------------------------------
// 2. Main Page Component
// ----------------------------------------------------------------------

export default function TodayPage() {
  const {
    selectedDate, setSelectedDate, dateStr,
    matches, loading,
    stats,
    searchQuery, setSearchQuery,
    filterType: filterStatus, setFilterType: setFilterStatus,
    selectedMatch, setSelectedMatch,
    isManualModalOpen, setIsManualModalOpen,
    editingMatch, setEditingMatch,
    saving,
    deleteConfirm, setDeleteConfirm,
    isDataPreviewOpen, setIsDataPreviewOpen,
    notificationEnabled,
    handlePrevDay, handleNextDay, handleGoToday,
    handleSaveMatch, handleDeleteMatch, requestNotifyPermission
  } = useTodayMatches();

  const deferredSearch = useDeferredValue(searchQuery);
  const [hideFinished, setHideFinished] = useState(false);

  // ✅ Filtering Logic (Safe & Optimized)
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // ✅ 1. เพิ่ม || '' เพื่อป้องกัน crash หากข้อมูลเป็น null
      const query = deferredSearch.toLowerCase();
      const matchText = `${match.teamA || ''} ${match.teamB || ''} ${match.league || ''} ${match.match || ''} ${match.title || ''}`.toLowerCase();
      const passSearch = matchText.includes(query);

      // Performance Optimization
      if (filterStatus === 'ALL' && hideFinished && match.statusDisplay?.includes('Finished')) return false;

      if (filterStatus === 'LIVE') return passSearch && match.isLiveTime;
      if (filterStatus === 'FINISHED') return passSearch && match.statusDisplay?.includes('Finished');
      if (filterStatus === 'PENDING') return passSearch && match.statusDisplay === 'Upcoming';
      return passSearch;
    });
  }, [matches, deferredSearch, filterStatus, hideFinished]);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black overflow-hidden">

      {/* Modals */}
      {selectedMatch && (
        <MatchStatModal isOpen={!!selectedMatch} onClose={() => setSelectedMatch(null)} matchData={selectedMatch} />
      )}
      <ManualMatchModal isOpen={isManualModalOpen} onClose={() => { setIsManualModalOpen(false); setEditingMatch(null); }} onSubmit={handleSaveMatch} initialData={editingMatch} selectedDate={dateStr} saving={saving} />
      <ConfirmModal isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, id: null })} title="Delete Match?" message="Are you sure? This cannot be undone." onConfirm={handleDeleteMatch} isDanger={true} />
      <DataPreviewPanel matches={matches} isOpen={isDataPreviewOpen} onClose={() => setIsDataPreviewOpen(false)} />

      {/* HEADER */}
      <header className="shrink-0 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800 p-3 shadow-sm z-20 transition-all">
        <div className="flex flex-col gap-3">
          {/* Row 1 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/50 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <button onClick={handlePrevDay} className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-black dark:hover:text-white transition-all"><ChevronLeft size={16} /></button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="h-7 px-3 text-xs font-bold text-zinc-700 dark:text-zinc-200 min-w-[120px] text-center hover:text-blue-600 transition-colors">
                    {format(selectedDate, 'EEE, dd MMM yyyy')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
              <button onClick={handleNextDay} className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-black dark:hover:text-white transition-all"><ChevronRight size={16} /></button>
              <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
              <button onClick={handleGoToday} disabled={isToday(selectedDate)} className={`px-3 h-7 text-[10px] font-black uppercase rounded-md transition-all flex items-center gap-1.5 ${isToday(selectedDate) ? 'text-zinc-400 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}>
                <CalendarCheck size={14} /><span className="hidden lg:inline">Today</span>
              </button>
              <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
              <button onClick={() => setHideFinished(!hideFinished)} className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${hideFinished ? 'bg-amber-500 text-white shadow-sm' : 'text-zinc-400 hover:text-blue-600'}`}>{hideFinished ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block"><CompactClock /></div>
              <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
              <button onClick={requestNotifyPermission} className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${notificationEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}>{notificationEnabled ? <Bell size={14} /> : <BellOff size={14} />}</button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="relative group flex-1 sm:flex-none sm:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-8 pl-9 pr-3 bg-zinc-100 dark:bg-zinc-900/50 border-none rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-500" />
            </div>
            <div className="hidden sm:block w-px h-5 bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 flex-1">
              <CompactFilter label="All" icon={LayoutGrid} count={stats.total} active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
              <CompactFilter label="Live" icon={Radio} count={stats.live} active={filterStatus === 'LIVE'} onClick={() => setFilterStatus('LIVE')} isLive={true} />
              <CompactFilter label="Upcoming" icon={Clock} count={stats.pending} active={filterStatus === 'PENDING'} onClick={() => setFilterStatus('PENDING')} />
              <CompactFilter label="Finished" icon={CheckCircle2} count={stats.finished} active={filterStatus === 'FINISHED'} onClick={() => setFilterStatus('FINISHED')} />
            </div>
            <div className="flex items-center gap-2 border-l pl-2 border-zinc-200 dark:border-zinc-800">
              <button onClick={() => setIsDataPreviewOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors"><FileText size={14} /></button>
              <button onClick={() => { setEditingMatch(null); setIsManualModalOpen(true); }} className="h-8 px-3 flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black rounded-md text-[10px] font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"><Plus size={14} /> <span className="hidden lg:inline">Add</span></button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <MatchList
          matches={filteredMatches}
          loading={loading}
          setSelectedMatch={setSelectedMatch}
          setEditingMatch={setEditingMatch}
          setIsManualModalOpen={setIsManualModalOpen}
          setDeleteConfirm={setDeleteConfirm}
        />
      </div>
    </div>
  );
}