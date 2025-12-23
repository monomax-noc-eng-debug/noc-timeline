import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { LayoutGrid, List, Search, ArrowRight, FolderArchive, ChevronDown, ChevronUp, Calendar as CalIcon, Activity, CloudDownload, ChevronsUpDown } from 'lucide-react';

import { useMatches } from '../../features/matches/hooks/useMatches';
import MatchViewModal from '../../features/matches/components/MatchViewModal';
import MatchCard from '../../features/matches/components/MatchCard';
import GoogleSyncModal from '../../features/matches/components/GoogleSyncModal';
import './calendar-custom.css';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { matches, groupedData, loading } = useMatches();
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDates, setExpandedDates] = useState({});

  const hasTodayMatches = matches.some(m => m.startDate === new Date().toISOString().split('T')[0]);

  // Calendar Events Logic
  const calendarEvents = useMemo(() => matches.map(m => ({
    id: m.id,
    title: (m.teamA && m.teamB) ? `${m.startTime} ${m.teamA} vs ${m.teamB}` : `${m.startTime} ${m.title || 'Match'}`,
    start: m.startDate,
    extendedProps: { ...m, isCompleted: m.hasStartStat && m.hasEndStat }
  })), [matches]);

  const renderEventContent = (info) => {
    const { startTime, teamA, teamB, title, isCompleted } = info.event.extendedProps;
    const displayText = (teamA && teamB) ? `${teamA} vs ${teamB}` : title;

    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded w-full border-l-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 overflow-hidden ${isCompleted ? 'border-emerald-500' : 'border-blue-500'}`}>
        <span className="text-[9px] font-black font-mono text-zinc-500 whitespace-nowrap">{startTime}</span>
        <span className="text-[9px] font-bold truncate uppercase text-zinc-700 dark:text-zinc-300">{displayText}</span>
      </div>
    );
  };

  const filteredGroups = (groupedData || []).filter(([, list]) =>
    !searchTerm ? true : list.some(m => (
      (m.teamA || '') +
      (m.teamB || '') +
      (m.match || '') +
      (m.title || '') +
      (m.id || '')
    ).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full p-4 md:p-6 bg-zinc-50 dark:bg-black overflow-y-auto custom-scrollbar animate-in fade-in">

      {/* Modals */}
      <MatchViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        matchData={selectedMatch}
      />
      <GoogleSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={() => setIsSyncModalOpen(false)}
      />

      <div className="max-w-7xl mx-auto space-y-8 pb-20">

        {/* ✨ Premium Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-600/10 dark:from-amber-500/20 dark:to-orange-600/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Container: ปรับ flex-wrap เพื่อป้องกันปุ่มล้นจอ */}
          <div className="relative p-6 md:p-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">

            {/* Title Section */}
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30 text-white transform group-hover:scale-105 transition-transform duration-500 shrink-0">
                <FolderArchive size={40} />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter dark:text-white leading-none">
                  Archive
                </h1>
                <p className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2">
                  Historical Data Center
                </p>
              </div>
            </div>

            {/* Actions Section */}
            {/* ใช้ flex-wrap เพื่อให้ปุ่มตกลงมาบรรทัดใหม่ได้เมื่อพื้นที่ไม่พอ */}
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">

              {/* Sync Button */}
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="flex-1 xl:flex-none h-12 px-6 bg-white dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap active:scale-95"
              >
                <CloudDownload size={18} /> Sync Data
              </button>

              {/* View Mode Switcher */}
              <div className="flex-1 xl:flex-none h-12 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-xl flex border border-zinc-200 dark:border-zinc-800 overflow-hidden min-w-[200px]">
                {['calendar', 'list'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 px-4 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 whitespace-nowrap ${viewMode === mode
                      ? 'bg-white dark:bg-black text-black dark:text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                  >
                    {mode === 'calendar' ? <LayoutGrid size={14} /> : <List size={14} />}
                    <span>{mode}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Operation Status */}
        {hasTodayMatches && (
          <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
                  <Activity size={20} />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Live Operation Active</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide mt-0.5">Today's matches are occurring now</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/schedule/today')}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 group"
            >
              Go Live Desk <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 font-black text-zinc-300 animate-pulse uppercase tracking-widest">Loading Archive...</div>
        ) : (
          viewMode === 'calendar' ? (
            <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                events={calendarEvents}
                eventContent={renderEventContent}
                eventClick={i => { setSelectedMatch(i.event.extendedProps); setIsModalOpen(true); }}
                dayMaxEvents={3}
                height="auto"
              />
            </div>
          ) : (
            <div className="space-y-6">

              {/* Search & Expand/Collapse Controls */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search team names..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full h-14 pl-12 rounded-2xl bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 font-bold text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const allExpanded = {};
                      filteredGroups.forEach(([date]) => { allExpanded[date] = true; });
                      setExpandedDates(allExpanded);
                    }}
                    className="flex-1 md:flex-none px-4 py-3 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <ChevronsUpDown size={14} /> Expand All
                  </button>
                  <button
                    onClick={() => setExpandedDates({})}
                    className="flex-1 md:flex-none px-4 py-3 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <ChevronUp size={14} /> Collapse
                  </button>
                </div>
              </div>

              {/* Match List Groups */}
              {filteredGroups.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">No matches found</p>
                </div>
              ) : (
                filteredGroups.map(([date, list]) => (
                  <div key={date} className="bg-white dark:bg-[#111] rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <button
                      onClick={() => setExpandedDates(p => ({ ...p, [date]: !p[date] }))}
                      className="w-full p-6 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                          <CalIcon size={18} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-black uppercase dark:text-white">
                            {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </h3>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {list.length} Matches
                          </p>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-300 ${expandedDates[date] ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedDates[date] && (
                      <div className="p-6 pt-0 space-y-3 border-t border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="h-2" />
                        {list.map(m => (
                          <MatchCard
                            key={m.id}
                            match={m}
                            onClick={() => { setSelectedMatch(m); setIsModalOpen(true); }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}