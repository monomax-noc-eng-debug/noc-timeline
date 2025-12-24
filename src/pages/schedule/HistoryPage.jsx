import React, { useState, useMemo, Suspense, lazy, useEffect, useCallback, useDeferredValue, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Search, History, ChevronDown,
  Calendar, RefreshCw, EyeOff, Eye, Zap, LayoutList, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useMatches } from '../../features/matches/hooks/useMatches';
import MatchCard from '../../features/matches/components/MatchCard';
import './calendar-custom.css';

// Lazy Load Components
const MatchViewModal = lazy(() => import('../../features/matches/components/MatchViewModal'));
const GoogleSyncModal = lazy(() => import('../../features/matches/components/GoogleSyncModal'));

export default function HistoryPage() {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  // --- States ---
  const [calendarRange, setCalendarRange] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});
  const [hideFinished, setHideFinished] = useState(true);

  // --- Data Fetching ---
  const { matches, groupedData, loading, loadMore, hasMore, refetch } = useMatches(
    null,
    viewMode === 'calendar' ? calendarRange : null,
    viewMode === 'list' || !!calendarRange
  );

  // --- Helpers & Memos ---
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const hasTodayMatches = useMemo(() =>
    matches.some(m => m.startDate === todayStr),
    [matches, todayStr]
  );

  // Responsive Listener (Debounced)
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 768), 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Filtered Calendar Events
  const calendarEvents = useMemo(() => {
    return matches
      .filter(m => {
        if (hideFinished) {
          const isPast = m.startDate < todayStr;
          if (m.hasEndStat || isPast) return false;
        }
        return true;
      })
      .map(m => ({
        id: m.id,
        title: (m.teamA && m.teamB) ? `${m.startTime} ${m.teamA} vs ${m.teamB}` : `${m.startTime} ${m.title || 'Match'}`,
        start: m.startDate,
        extendedProps: { ...m, isCompleted: m.hasEndStat || m.startDate < todayStr }
      }));
  }, [matches, hideFinished, todayStr]);

  // Filtered List View Data
  const filteredGroups = useMemo(() => {
    const baseData = (groupedData || []).map(([date, list]) => {
      const filteredList = list.filter(m => {
        if (hideFinished) {
          const isPast = m.startDate < todayStr;
          if (m.hasEndStat || isPast) return false;
        }
        return true;
      });
      return [date, filteredList];
    }).filter(([, list]) => list.length > 0);

    if (!deferredSearch) return baseData;
    const query = deferredSearch.toLowerCase();
    return baseData.filter(([, list]) =>
      list.some(m => m._searchString?.includes(query))
    );
  }, [groupedData, deferredSearch, hideFinished, todayStr]);

  // --- Handlers ---
  const handleDatesSet = useCallback((arg) => {
    setCalendarRange({
      start: arg.startStr.split('T')[0],
      end: arg.endStr.split('T')[0]
    });
  }, []);

  const handleModeSwitch = (mode) => {
    startTransition(() => {
      setViewMode(mode);
    });
  };

  const renderEventContent = useCallback((info) => {
    const { startTime, teamA, teamB, title, isCompleted } = info.event.extendedProps;
    const displayText = (teamA && teamB) ? `${teamA} vs ${teamB}` : title;

    if (isMobile && info.view.type === 'dayGridMonth') {
      return (
        <div className="flex items-center gap-1 overflow-hidden px-0.5">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          <span className="text-[9px] font-mono text-zinc-500 leading-none">{startTime}</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border-l-2 text-[9px] truncate w-full cursor-pointer hover:opacity-80 transition-opacity ${isCompleted
          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'border-zinc-300 bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
        }`}>
        <span className="font-mono font-bold opacity-75">{startTime}</span>
        <span className="font-bold truncate">{displayText}</span>
      </div>
    );
  }, [isMobile]);

  return (
    <div className="h-full flex flex-col bg-[#fafafa] dark:bg-black overflow-hidden">

      <Suspense fallback={null}>
        {isModalOpen && (
          <MatchViewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} matchData={selectedMatch} />
        )}
        {isSyncModalOpen && (
          <GoogleSyncModal
            isOpen={isSyncModalOpen}
            onClose={() => setIsSyncModalOpen(false)}
            onSyncComplete={() => { if (refetch) refetch(); else window.location.reload(); }}
          />
        )}
      </Suspense>

      {/* COMPACT HEADER */}
      <div className="shrink-0 px-4 py-3 md:px-6 md:py-4 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">

          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                <History size={20} className="text-white dark:text-zinc-900" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-none">Archive</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Operational Database</p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-zinc-100/50 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                <button
                  onClick={() => setHideFinished(!hideFinished)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${hideFinished
                      ? 'bg-white dark:bg-zinc-800 text-amber-600 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                >
                  {hideFinished ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span className="hidden md:inline">{hideFinished ? 'Hidden' : 'Show All'}</span>
                </button>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <button onClick={() => setIsSyncModalOpen(true)} className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors" title="Sync Data">
                  <RefreshCw size={16} />
                </button>
              </div>

              {hasTodayMatches && (
                <button
                  onClick={() => navigate('/schedule/today')}
                  className="hidden md:flex px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  <Zap size={12} fill="currentColor" /> Live
                </button>
              )}

              <div className="flex bg-zinc-100/50 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                <button
                  onClick={() => handleModeSwitch('calendar')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400'}`}
                >
                  <Calendar size={16} />
                </button>
                <button
                  onClick={() => handleModeSwitch('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400'}`}
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Slim Search Bar */}
          {viewMode === 'list' && (
            <div className="relative animate-in slide-in-from-top-1 duration-200">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search history records..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-medium outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto pb-10">

          {loading && matches.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-50 space-y-4">
              <Loader2 size={40} className="animate-spin text-zinc-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Archive...</p>
            </div>
          ) : (
            <>
              {viewMode === 'calendar' ? (
                <div className="bg-white dark:bg-[#0a0a0a] p-2 md:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in zoom-in-95 duration-300">
                  <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
                    initialView={isMobile ? "listMonth" : "dayGridMonth"}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: isMobile ? '' : 'dayGridMonth,listMonth'
                    }}
                    events={calendarEvents}
                    eventContent={renderEventContent}
                    eventClick={i => { setSelectedMatch(i.event.extendedProps); setIsModalOpen(true); }}
                    datesSet={handleDatesSet}
                    height="auto"
                    contentHeight="auto"
                    dayMaxEvents={isMobile ? 2 : 4}
                    fixedWeekCount={false}
                  />
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                  {filteredGroups.map(([date, list]) => (
                    <div key={date} className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setExpandedDates(p => ({ ...p, [date]: !p[date] }))}
                        className="w-full px-5 py-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400">
                            <Calendar size={18} />
                          </div>
                          <div className="text-left">
                            <h3 className="text-sm font-black uppercase text-zinc-800 dark:text-zinc-200">{format(new Date(date), 'MMMM d, yyyy')}</h3>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase">{list.length} Matches</p>
                          </div>
                        </div>
                        <ChevronDown size={16} className={`text-zinc-400 transition-transform ${expandedDates[date] ? 'rotate-180' : ''}`} />
                      </button>

                      {expandedDates[date] && (
                        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800">
                          {list.map(m => (
                            <MatchCard key={m.id} match={m} onClick={() => { setSelectedMatch(m); setIsModalOpen(true); }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {!deferredSearch && hasMore && (
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="w-full py-4 mt-6 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
                    >
                      {loading ? 'Loading...' : 'Load Older Records'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}