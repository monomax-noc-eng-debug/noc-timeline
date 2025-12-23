import React, { useState, useEffect, useMemo, useRef } from 'react';
// Hooks & Services
import { useMatches } from '../../features/matches/hooks/useMatches';
import { matchService } from '../../services/matchService';
// Components
import MatchCard from '../../features/matches/components/MatchCard';
import MatchStatModal from '../../features/match-stats/MatchStatModal';
import ManualMatchModal from '../../features/matches/components/ManualMatchModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Toast from '../../components/ui/Toast';
import DataPreviewPanel from '../../features/matches/components/DataPreviewPanel';
// Icons & Utils
import {
  Search, Radio, Bell, BellOff, ChevronLeft, ChevronRight,
  Plus, Calendar, FileText, Filter as FilterIcon, TrendingUp
} from 'lucide-react';
import { format, addDays, subDays, isToday } from 'date-fns';

// Internal Component: Live Clock
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="w-full md:w-auto bg-white text-black px-4 md:px-6 py-2.5 rounded-xl font-mono text-lg md:text-xl font-bold shadow-lg flex items-center justify-center md:justify-start gap-3">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
      {format(time, 'HH:mm:ss')}
    </div>
  );
};

export default function TodayPage() {
  // ... existing code ...

  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { matches, loading } = useMatches(selectedDate);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [toasts, setToasts] = useState([]); // Array of toasts
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Notification State
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notifiedMatches, setNotifiedMatches] = useState(new Set());
  const [notifiedStatusChanges, setNotifiedStatusChanges] = useState(new Set());
  const previousMatchStates = useRef(new Map());

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Date Handlers
  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleGoToday = () => setSelectedDate(new Date());
  const handleDateChange = (e) => {
    if (e.target.value) setSelectedDate(new Date(e.target.value));
  };

  // Notification Setup
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationEnabled(true);
    }
  }, []);

  const requestNotifyPermission = async () => {
    if (!("Notification" in window)) {
      showToast("Browser does not support notifications", "error");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationEnabled(true);
      new Notification("🔔 System Ready", { body: "Notifications enabled for matches!" });
      showToast("Notifications enabled successfully!");
    }
  };

  // Notification: Upcoming matches (15 minutes before)
  useEffect(() => {
    if (!notificationEnabled || matches.length === 0) return;
    const checkMatches = () => {
      const now = new Date();
      matches.forEach(match => {
        const notifyKey = `time-${match.id}`;
        if (notifiedMatches.has(notifyKey)) return;
        const mDateStr = match.startDate || dateStr;
        const matchTime = new Date(`${mDateStr}T${match.startTime}`);
        const diffMs = matchTime - now;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins <= 15 && diffMins > 0) {
          new Notification("⚽ Match Starting Soon!", {
            body: `${match.teamA || 'Match'} vs ${match.teamB || ''} starts in ${diffMins} mins!`,
          });
          setNotifiedMatches(prev => new Set(prev).add(notifyKey));
        }
      });
    };
    checkMatches();
    const interval = setInterval(checkMatches, 60000);
    return () => clearInterval(interval);
  }, [matches, notificationEnabled, notifiedMatches, dateStr]);

  // Notification: Status changes (LIVE/FINISHED)
  useEffect(() => {
    if (!notificationEnabled || matches.length === 0) return;
    matches.forEach(match => {
      const matchTitle = match.teamA && match.teamB
        ? `${match.teamA} vs ${match.teamB}`
        : (match.title || match.match || 'Match');
      const currentState = `${match.hasStartStat}-${match.hasEndStat}`;
      const previousState = previousMatchStates.current.get(match.id);

      if (previousState && previousState !== currentState) {
        if (match.hasStartStat && !match.hasEndStat && !previousState.startsWith('true')) {
          const notifyKey = `live-${match.id}`;
          if (!notifiedStatusChanges.has(notifyKey)) {
            new Notification("🔴 LIVE: Match Started!", {
              body: `${matchTitle} is now LIVE!`,
              icon: '/favicon.ico'
            });
            setNotifiedStatusChanges(prev => new Set(prev).add(notifyKey));
            showToast(`🔴 ${matchTitle} is LIVE!`, 'success');
          }
        }
        if (match.hasEndStat && !previousState.endsWith('true')) {
          const notifyKey = `finished-${match.id}`;
          if (!notifiedStatusChanges.has(notifyKey)) {
            new Notification("✅ Match Finished!", {
              body: `${matchTitle} has finished!`,
              icon: '/favicon.ico'
            });
            setNotifiedStatusChanges(prev => new Set(prev).add(notifyKey));
            showToast(`✅ ${matchTitle} finished!`, 'success');
          }
        }
      }
      previousMatchStates.current.set(match.id, currentState);
    });
  }, [matches, notificationEnabled, notifiedStatusChanges, showToast]);

  // Filter & Stats
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchText = `${m.league || ''} ${m.teamA || ''} ${m.teamB || ''} ${m.match || ''}`.toLowerCase();
      const matchesSearch = matchText.includes(searchQuery.toLowerCase());
      let matchesStatus = true;
      if (filterStatus === 'LIVE') matchesStatus = m.hasStartStat && !m.hasEndStat;
      if (filterStatus === 'FINISHED') matchesStatus = m.hasEndStat;
      if (filterStatus === 'PENDING') matchesStatus = !m.hasStartStat;
      return matchesSearch && matchesStatus;
    });
  }, [matches, searchQuery, filterStatus]);

  const stats = useMemo(() => ({
    total: matches.length,
    live: matches.filter(m => m.hasStartStat && !m.hasEndStat).length,
    finished: matches.filter(m => m.hasEndStat).length,
    pending: matches.filter(m => !m.hasStartStat).length
  }), [matches]);

  // Pagination
  const totalPages = Math.ceil(filteredMatches.length / ITEMS_PER_PAGE);
  const paginatedMatches = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMatches.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMatches, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, matches]);

  // CRUD Handlers
  const handleSaveMatch = async (data) => {
    setSaving(true);
    try {
      if (editingMatch) {
        await matchService.updateMatch(editingMatch.id, data);
      } else {
        await matchService.createMatch(data);
      }
      setEditingMatch(null);
      setIsManualModalOpen(false); // ✅ Corrected state name
      showToast(editingMatch ? "Match updated successfully!" : "Match created successfully!");
    } catch (error) {
      showToast("Failed to save match: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMatch = async () => {
    if (!deleteConfirm.id) return;
    try {
      await matchService.deleteMatch(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
      showToast("Match deleted successfully!");
    } catch (error) {
      showToast("Failed to delete match: " + error.message, "error");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-900 dark:to-black overflow-hidden">

      {/* Modals */}
      {selectedMatch && (
        <MatchStatModal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          matchData={selectedMatch}
        />
      )}

      <ManualMatchModal
        isOpen={isManualModalOpen}
        onClose={() => { setIsManualModalOpen(false); setEditingMatch(null); }}
        onSubmit={handleSaveMatch}
        initialData={editingMatch}
        selectedDate={dateStr}
        saving={saving}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        title="Delete Match?"
        message="Are you sure you want to delete this match? This action cannot be undone."
        onConfirm={handleDeleteMatch}
        isDanger={true}
      />


      {/* Toast Stack */}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col-reverse gap-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="animate-in slide-in-from-right-5 fade-in duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>


      <DataPreviewPanel
        matches={filteredMatches}
        isOpen={isDataPreviewOpen}
        onClose={() => setIsDataPreviewOpen(false)}
      />

      {/* Header - Redesigned 2.0 (Fully Responsive) */}
      <header className="shrink-0 bg-zinc-950 border-b border-zinc-800 pb-6 transition-all">
        <div className="px-4 md:px-6 pt-6 space-y-6">

          {/* Row 1: Title & Clock */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
                <Radio size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Live Desk</h1>
                <p className="text-zinc-400 text-sm font-medium">Monitor and manage live matches</p>
              </div>
            </div>
            <LiveClock />
          </div>

          {/* Row 2: Date Navigation */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
            <div className="flex flex-col lg:flex-row items-stretch gap-3 w-full xl:w-auto">
              {/* Prev/Next/Date Display */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 flex-1 justify-between">
                <button
                  onClick={handlePrevDay}
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors shrink-0"
                >
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </button>

                <div className="relative mx-2 flex-1 flex justify-center">
                  <div className="h-12 w-full flex items-center justify-center px-2 bg-zinc-800/50 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors border border-zinc-700/50 group overflow-hidden">
                    <Calendar size={18} className="text-zinc-400 mr-2 md:mr-3 group-hover:text-red-500 transition-colors shrink-0" />
                    <span className="text-sm md:text-lg font-bold text-white tracking-wide whitespace-nowrap truncate">
                      {format(selectedDate, 'EEEE, dd MMM yyyy')}
                    </span>
                  </div>
                  <input
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    value={dateStr}
                    onChange={handleDateChange}
                  />
                </div>

                <button
                  onClick={handleNextDay}
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors shrink-0"
                >
                  <ChevronRight size={24} strokeWidth={2.5} />
                </button>
              </div>

              {/* Smart Date Control */}
              <div className="flex bg-zinc-800 rounded-2xl border border-zinc-700 p-1.5 h-14 lg:h-[62px] items-center w-full lg:w-auto">
                {/* Picker Part */}
                <div className="relative h-full aspect-square shrink-0">
                  <button
                    className="w-full h-full flex items-center justify-center rounded-xl bg-zinc-700 text-zinc-300 hover:bg-zinc-600 hover:text-white transition-all"
                    title="Select Date"
                  >
                    <Calendar size={22} />
                  </button>
                  <input
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    value={dateStr}
                    onChange={handleDateChange}
                  />
                </div>

                {/* Separator */}
                <div className="w-px h-6 lg:h-8 bg-zinc-700 mx-2" />

                {/* Today Part */}
                <button
                  onClick={handleGoToday}
                  disabled={isToday(selectedDate)}
                  className={`h-full flex-1 lg:flex-none px-4 lg:px-6 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center justify-center ${isToday(selectedDate)
                    ? 'text-zinc-500 cursor-default bg-transparent'
                    : 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20'
                    }`}
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Filters & Actions */}
          <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mt-4 pt-6 border-t border-zinc-900">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto no-scrollbar pb-1 xl:pb-0">
              {[
                { id: 'ALL', label: 'All', count: stats.total },
                { id: 'LIVE', label: 'Live', count: stats.live, isLive: true },
                { id: 'PENDING', label: 'Scheduled', count: stats.pending },
                { id: 'FINISHED', label: 'Finished', count: stats.finished },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setFilterStatus(item.id)}
                  className={`h-12 px-4 md:px-5 rounded-xl border-2 font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${filterStatus === item.id
                    ? 'bg-white border-white text-black shadow-lg shadow-white/10'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                >
                  <span>{item.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-xs ${filterStatus === item.id
                    ? 'bg-black text-white'
                    : 'bg-zinc-800 text-zinc-500'
                    }`}>{item.count}</span>
                  {item.isLive && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-1" />}
                </button>
              ))}
            </div>

            {/* Actions (Grid on Mobile, Flex on Desktop) */}
            <div className="grid grid-cols-[auto_1fr_1fr] md:flex gap-3 w-full xl:w-auto">
              <button
                onClick={requestNotifyPermission}
                disabled={notificationEnabled}
                className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all ${notificationEnabled
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
              >
                {notificationEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              </button>

              <button
                onClick={() => setIsDataPreviewOpen(true)}
                disabled={filteredMatches.length === 0}
                className="h-12 px-4 md:px-6 bg-zinc-800 border border-zinc-700 text-violet-400 hover:text-violet-300 hover:bg-zinc-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileText size={18} />
                <span>Preview</span>
              </button>

              <button
                onClick={() => { setEditingMatch(null); setIsManualModalOpen(true); }}
                className="h-12 px-4 md:px-6 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} strokeWidth={3} />
                <span>Add Match</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-white dark:bg-zinc-900 rounded-2xl animate-pulse border-2 border-zinc-100 dark:border-zinc-800" />
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-lg border-2 border-zinc-100 dark:border-zinc-800 mb-4">
              <FilterIcon size={48} className="text-zinc-300 dark:text-zinc-700" />
            </div>
            <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-200 mb-2">
              No matches found
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md text-center">
              {searchQuery
                ? `No matches found for "${searchQuery}". Try a different search term.`
                : `No matches scheduled for ${format(selectedDate, 'dd MMM yyyy')}. Add a new match to get started.`
              }
            </p>
            <button
              onClick={() => { setEditingMatch(null); setIsManualModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={20} />
              Add Match
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {paginatedMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onClick={() => setSelectedMatch(m)}
                  onEdit={(match) => { setEditingMatch(match); setIsManualModalOpen(true); }}
                  onDelete={(id) => setDeleteConfirm({ isOpen: true, id })}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800">
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredMatches.length)} of {filteredMatches.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )
        }
      </div >
    </div >
  );
}

// Sub Components
function StatPill({ label, count, active, onClick, isLive }) {
  return (
    <button
      onClick={onClick}
      className={`
        h-10 px-4 rounded-xl border-2 flex items-center gap-2 font-bold text-sm transition-all
        ${active
          ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-lg'
          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
        }
      `}
    >
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-md text-xs font-black ${active
        ? 'bg-white/20 text-white dark:text-black'
        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
        }`}>
        {count}
      </span>
      {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
    </button>
  );
}

