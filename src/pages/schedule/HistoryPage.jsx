// src/pages/schedule/HistoryPage.jsx
import React, { useState, useMemo, Suspense, lazy, useEffect, useCallback, useDeferredValue, useTransition, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, History, ChevronDown, CalendarIcon, Plus, X,
  Calendar, RefreshCw, Zap, LayoutList, Loader2, Database, LayoutGrid,
  FileSpreadsheet, Eye, EyeOff, CheckCircle2, Clock, Radio, Timer, Bell,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SlidersHorizontal,
  Edit3, Trash2, MoreHorizontal, Filter, ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  isToday, eachDayOfInterval, isSameMonth, addMonths, subMonths, isValid, parseISO,
  parse, addHours, isBefore
} from 'date-fns';
import { useMatches } from '../../features/matches/hooks/useMatches';
import { getMatchStatus } from '../../utils/matchStatus';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatePicker } from '../../components/forms/DatePicker';
import { formatDateAPI } from '../../utils/formatters';
import { useStore } from '../../store/useStore';
import { hasRole, ROLES } from '../../utils/permissions';

// Components
import ManualMatchModal from '../../features/matches/components/ManualMatchModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LiveClock from './components/LiveClock';

// Lazy Load Components
const MatchViewModal = lazy(() => import('../../features/matches/components/MatchViewModal'));
const GoogleSyncModal = lazy(() => import('../../features/matches/components/GoogleSyncModal'));
const DataPreviewPanel = lazy(() => import('../../features/matches/components/DataPreviewPanel'));
const MatchStatPanel = lazy(() => import('../../features/match-stats/MatchStatPanel'));

// Helper: Check if match is finished (hasEndStat OR time has passed)
const isMatchFinished = (match) => {
  // If has end stats, it's definitely finished
  if (match.hasEndStat) return true;

  // Check time-based: if match start + 2 hours is before now, it's finished
  if (match.startDate && match.startTime) {
    try {
      const matchDate = parseISO(match.startDate);
      const matchStart = parse(match.startTime, 'HH:mm', matchDate);
      const matchEnd = addHours(matchStart, 2);
      return isBefore(matchEnd, new Date());
    } catch (e) {
      return false;
    }
  }

  return false;
};

// Status Config - Match TodayPage Style
const STATUS_CONFIG = {
  LIVE: {
    label: 'LIVE',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    dot: 'bg-red-500 animate-pulse'
  },
  COMING: {
    label: 'COMING',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500'
  },
  FINISHED: {
    label: 'FINISHED',
    className: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30',
    dot: 'bg-zinc-500'
  }
};

// Start of Minute Helper
const startOfMinute = (d) => {
  const date = new Date(d);
  date.setSeconds(0, 0);
  return date;
};

// Helper: Calculate advanced status like TodayPage
// Returns: 'LIVE', 'FINISHED', 'COMING'
const calculateMatchStatus = (match, now) => {
  if (match.hasEndStat) return 'FINISHED';
  if (match.hasStartStat) return 'LIVE';

  if (match.startDate && match.startTime) {
    try {
      const matchDate = parseISO(match.startDate);
      const matchStart = parse(match.startTime, 'HH:mm', matchDate);
      // Default duration 2.5 hours
      const matchEnd = addHours(matchStart, 2.5);

      if (now >= matchStart && now <= matchEnd) {
        return 'LIVE';
      }
      if (now > matchEnd) {
        return 'FINISHED';
      }
    } catch (e) {
      return 'COMING';
    }
  }
  return 'COMING';
};

// ITEMS_PER_PAGE removed in favor of dynamic calculation

export default function HistoryPage() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const { currentUser } = useStore();
  const canEdit = hasRole(currentUser, [ROLES.LEAD, ROLES.ENGINEER]);

  // --- States ---
  const [viewMode, setViewMode] = useState('list');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Match Stats Panel State (Split View)
  const [selectedStatMatch, setSelectedStatMatch] = useState(null);
  const [statPanelType, setStatPanelType] = useState('START'); // START or END

  // Clear stat selection when changing view mode
  useEffect(() => {
    setSelectedStatMatch(null);
  }, [viewMode]);

  // CRUD States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // List View specific states
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState(new Date()); // Use Date object instead of string
  const [hideFinished, setHideFinished] = useState(true); // Default: hide finished matches
  const [filterType, setFilterType] = useState('ALL'); // ALL, LIVE, UPCOMING, FINISHED
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Dynamic Pagination
  const tableContainerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const calendarRef = useRef(null);
  const [maxCalendarItems, setMaxCalendarItems] = useState(3);

  useEffect(() => {
    // Dynamic List Items
    const calculateItems = () => {
      if (tableContainerRef.current) {
        const height = tableContainerRef.current.offsetHeight;
        const calculated = Math.floor(height / 54);
        setItemsPerPage(Math.max(5, calculated));
      }
    };
    calculateItems();
    window.addEventListener('resize', calculateItems);

    // Dynamic Calendar Items using ResizeObserver
    const updateCalendarItems = () => {
      if (calendarRef.current) {
        // Get height of a single cell (approximate from first cell if possible, or calculate from total grid height)
        // Since grid is 6 rows, cell height ~= containerHeight / 6
        const gridHeight = calendarRef.current.offsetHeight;
        const rowHeight = gridHeight / 6;

        // Constants: Header ~20px, Item ~24px, Padding ~8px
        // Formula: (RowHeight - Header - Padding) / ItemHeight
        const availableHeight = rowHeight - 28; // Header 20px + Padding 8px
        const itemHeight = 26; // Approximate item height

        const max = Math.max(1, Math.floor(availableHeight / itemHeight));
        setMaxCalendarItems(max);
      }
    };
    // Initial calc
    updateCalendarItems();

    // Observer
    const observer = new ResizeObserver(() => {
      updateCalendarItems();
    });

    if (calendarRef.current) {
      observer.observe(calendarRef.current);
    }

    return () => {
      window.removeEventListener('resize', calculateItems);
      observer.disconnect();
    };
  }, []);

  // --- Derived State ---
  const calendarRange = useMemo(() => {
    const start = format(startOfWeek(startOfMonth(currentDate)), 'yyyy-MM-dd');
    const end = format(endOfWeek(endOfMonth(currentDate)), 'yyyy-MM-dd');
    return { start, end };
  }, [currentDate]);

  // --- Data Fetching ---
  // For List: fetch all (no date filter, no range) 
  // For Calendar: fetch with date range
  const { matches, loading, refetch } = useMatches(
    null,
    viewMode === 'calendar' ? calendarRange : null,
    true
  );

  // --- Helpers ---
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const dateFilterStr = useMemo(() => dateFilter ? formatDateAPI(dateFilter) : null, [dateFilter]);
  const hasTodayMatches = useMemo(() => matches?.some(m => m.startDate === todayStr) || false, [matches, todayStr]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // --- Time Management for Status Calculation ---
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = () => {
      const current = new Date();
      // Update only if minute changes to improve perf
      if (current.getMinutes() !== now.getMinutes()) {
        setNow(current);
      }
    };
    const timer = setInterval(tick, 1000); // Check every second, update on minute change
    return () => clearInterval(timer);
  }, [now]);


  // --- Filtered & Paginated Data ---
  const filteredMatches = useMemo(() => {
    let result = matches || [];

    // Apply date filter
    if (dateFilterStr) {
      result = result.filter(m => m.startDate === dateFilterStr);
    }

    // Apply search filter
    if (deferredSearch) {
      const query = deferredSearch.toLowerCase();
      result = result.filter(m =>
        m._searchString?.includes(query) ||
        m.startDate?.includes(query)
      );
    }

    // Apply status calculation
    // We map over result to attach calculated status for sorting/filtering
    const processed = result.map(m => ({
      ...m,
      calculatedStatus: calculateMatchStatus(m, now)
    }));

    // Apply hide finished filter
    if (hideFinished) {
      result = processed.filter(m => m.calculatedStatus !== 'FINISHED');
    } else {
      result = processed;
    }

    // Apply status filter
    if (filterType !== 'ALL') {
      result = result.filter(m => m.calculatedStatus === filterType);
    }

    return result.sort((a, b) => {
      const dateCompare = (a.startDate || '').localeCompare(b.startDate || '');
      if (dateCompare !== 0) return dateCompare;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }, [matches, dateFilterStr, hideFinished, filterType, deferredSearch, todayStr, now]);

  // Stats for filter counts
  const stats = useMemo(() => {
    const arr = matches || [];
    // Recalculate status for stats
    const processed = arr.map(m => calculateMatchStatus(m, now));
    return {
      total: arr.length,
      live: processed.filter(s => s === 'LIVE').length,
      upcoming: processed.filter(s => s === 'COMING').length,
      finished: processed.filter(s => s === 'FINISHED').length,
    };
  }, [matches, now]);

  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);

  const paginatedMatches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMatches.slice(start, start + itemsPerPage);
  }, [filteredMatches, currentPage, itemsPerPage]);

  // Click row → show in modal
  // Click row → show in modal
  const handleMatchClick = useCallback((match) => {
    // If in Calendar mode, open detail modal
    if (viewMode === 'calendar') {
      setSelectedMatch(match);
      setIsModalOpen(true);
    } else {
      // In List mode, open Stats Split View
      setSelectedStatMatch(match);
      setStatPanelType('START');
    }
  }, [viewMode]);

  // CRUD Handlers
  const handleEditClick = useCallback((match) => {
    setEditingMatch(match);
    setIsManualModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id) => {
    setDeleteConfirm({ isOpen: true, id });
  }, []);

  const handleSaveMatch = async (matchData) => {
    setSaving(true);
    try {
      // Use the save function from useMatches hook would be here
      // For now just refetch after save
      await refetch();
      setIsManualModalOpen(false);
      setEditingMatch(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMatch = async () => {
    // Delete function would be here
    setDeleteConfirm({ isOpen: false, id: null });
    await refetch();
  };

  const handleModeSwitch = (mode) => {
    startTransition(() => {
      setViewMode(mode);
      setCurrentPage(1);
    });
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.COMING;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wide min-w-[80px] justify-center", config.className)}>
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-black overflow-hidden relative">
      <Suspense fallback={null}>
        {isModalOpen && <MatchViewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} matchData={selectedMatch} />}
        {isSyncModalOpen && <GoogleSyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} onSyncComplete={handleRefresh} />}
        {isPreviewOpen && <DataPreviewPanel data={matches || []} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />}
      </Suspense>

      {/* --- HEADER --- */}
      <div className="shrink-0 px-4 py-2 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-full flex items-center justify-between gap-3 overflow-x-auto pb-1">

          {/* Left: Identity & Clock */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0078D4] text-white rounded-md flex items-center justify-center shadow-sm shrink-0">
                <CalendarIcon size={18} />
              </div>
              <div className="hidden xl:block">
                <h1 className="text-sm font-bold text-zinc-900 dark:text-white leading-none tracking-tight">SCHEDULE</h1>
              </div>
            </div>
            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 shrink-0" />
            <LiveClock className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 shrink-0" />
          </div>

          {/* Middle: Filters (List View Only) - Flexible */}
          {viewMode === 'list' && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Search */}
              <div className="relative flex-1 max-w-[240px] min-w-[120px]">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-8 pl-8 pr-3 bg-zinc-100 dark:bg-zinc-900 border-transparent rounded-md text-xs font-medium outline-none focus:bg-white focus:ring-1 focus:ring-[#0078D4] transition-all"
                />
              </div>

              {/* Date & Count */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <DatePicker
                  date={dateFilter}
                  setDate={setDateFilter}
                  showNavigation={true}
                  placeholder="ALL"
                  className="h-8 text-xs"
                />
                <span className="h-8 px-2.5 flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-500 shrink-0">
                  {filteredMatches.length}
                </span>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className={cn(
                  "h-8 w-8 md:w-auto md:px-3 flex items-center justify-center gap-2 rounded-md transition-all border text-xs font-semibold shrink-0",
                  filterType !== 'ALL'
                    ? "bg-[#deecf9] text-[#0078D4] border-[#0078D4]/20"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 border-zinc-200 dark:border-zinc-800"
                )}
                title="Filters"
              >
                <SlidersHorizontal size={14} />
                <span className="hidden lg:inline">Filter</span>
                {filterType !== 'ALL' && <span className="w-1.5 h-1.5 rounded-full bg-[#0078D4]" />}
              </button>
            </div>
          )}

          {/* Spacer if not in list mode to push right items */}
          {viewMode !== 'list' && <div className="flex-1" />}

          {/* Right: Controls & Actions (Responsive) */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* DESKTOP CONTROLS (Hidden on mobile/tablet) */}
            <div className="hidden lg:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900/50 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
              {/* Hide Finished Toggle */}
              <button
                onClick={() => setHideFinished(!hideFinished)}
                className={cn(
                  "h-7 px-2.5 flex items-center gap-1.5 rounded-md text-[9px] font-bold uppercase tracking-wide transition-all",
                  hideFinished
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800"
                )}
                title={hideFinished ? "Show Finished" : "Hide Finished"}
              >
                {hideFinished ? <EyeOff size={12} /> : <Eye size={12} />}
                <span className="hidden xl:inline">{hideFinished ? 'Hidden' : 'Show All'}</span>
              </button>

              <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

              {/* Sync & Preview */}
              <button onClick={() => setIsSyncModalOpen(true)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#0078D4] transition-all" title="Sync">
                <Database size={13} />
              </button>
              <button onClick={() => setIsPreviewOpen(true)} disabled={!matches?.length} className="h-7 w-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#0078D4] disabled:opacity-50 transition-all" title="Export">
                <FileSpreadsheet size={13} />
              </button>

              <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

              {/* View Switch */}
              <button onClick={() => handleModeSwitch('list')} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", viewMode === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm text-[#0078D4]' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300')}>
                <LayoutList size={13} />
              </button>
              <button onClick={() => handleModeSwitch('calendar')} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", viewMode === 'calendar' ? 'bg-white dark:bg-zinc-800 shadow-sm text-[#0078D4]' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300')}>
                <Calendar size={13} />
              </button>
            </div>

            {/* MOBILE MENU (Visible on mobile/tablet) */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>View Options</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setHideFinished(!hideFinished)}>
                    {hideFinished ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {hideFinished ? 'Show Finished' : 'Hide Finished'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Layout</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleModeSwitch('list')}>
                    <LayoutList className="mr-2 h-4 w-4" /> List View
                    {viewMode === 'list' && <CheckCircle2 className="ml-auto h-3 w-3" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleModeSwitch('calendar')}>
                    <Calendar className="mr-2 h-4 w-4" /> Calendar View
                    {viewMode === 'calendar' && <CheckCircle2 className="ml-auto h-3 w-3" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsSyncModalOpen(true)}>
                    <Database className="mr-2 h-4 w-4" /> Sync Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsPreviewOpen(true)} disabled={!matches?.length}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export / Preview
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>


            {/* Manual Add */}
            {canEdit && (
              <button
                onClick={() => { setEditingMatch(null); setIsManualModalOpen(true); }}
                className="h-8 px-3 ml-1 flex items-center gap-1.5 rounded-md bg-[#0078D4] hover:bg-[#106EBE] text-white text-[10px] font-bold uppercase tracking-wide transition-colors shadow-sm shrink-0"
              >
                <Plus size={14} strokeWidth={3} />
                <span className="hidden lg:inline">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* --- SPLIT-VIEW CONTENT --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Table List or Calendar */}
        <div className={cn(
          "h-full flex flex-col overflow-hidden transition-all duration-300",
          selectedStatMatch ? "hidden lg:flex lg:w-[40%]" : "w-full"
        )}>
          {loading && (!matches || matches.length === 0) ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={32} className="animate-spin text-zinc-400" />
            </div>
          ) : viewMode === 'list' ? (
            /* TABLE VIEW */
            <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
              {/* Mobile Card View (Outlook Incident Card Style) */}
              <div className="md:hidden space-y-4 overflow-auto custom-scrollbar flex-1 pb-4">
                {paginatedMatches.length > 0 ? paginatedMatches.map((match) => {
                  const status = match.calculatedStatus || 'COMING';
                  const config = STATUS_CONFIG[status] || STATUS_CONFIG.COMING;

                  let displayDay = '--';
                  let displayMonth = '';
                  try {
                    const parsed = parseISO(match.startDate);
                    if (isValid(parsed)) {
                      displayDay = format(parsed, 'd');
                      displayMonth = format(parsed, 'MMM').toUpperCase();
                    }
                  } catch { /* ignore */ }

                  const matchTitle = (match.teamA && match.teamB)
                    ? `${match.teamA} vs ${match.teamB}`
                    : (match.title || match.match || 'Untitled');

                  const statusBorder = status === 'LIVE' ? 'border-l-red-500' :
                    status === 'COMING' ? 'border-l-[#0078D4]' :
                      'border-l-zinc-300 dark:border-l-zinc-700';

                  return (
                    <div
                      key={match.id}
                      onClick={() => handleMatchClick(match)}
                      className={cn(
                        "group relative flex gap-3 p-3 cursor-pointer transition-all duration-200",
                        "rounded-xl border border-l-4",
                        "bg-zinc-100 dark:bg-zinc-900/80",
                        "border-zinc-200/50 dark:border-zinc-800",
                        "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/80 active:scale-[0.98]",
                        statusBorder
                      )}
                    >
                      {/* Date Box */}
                      <div className="shrink-0 flex flex-col items-center justify-center w-10">
                        <span className="text-xl font-black leading-none text-zinc-800 dark:text-zinc-100">
                          {displayDay}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                          {displayMonth}
                        </span>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Row 1: Time & League */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-zinc-500">{match.startTime || '--:--'}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-400 bg-zinc-200/80 dark:bg-zinc-800 truncate max-w-[120px]">
                            {match.league || 'League'}
                          </span>
                        </div>

                        {/* Row 2: Title */}
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
                          {matchTitle}
                        </div>

                        {/* Row 3: Status + Channel */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border", config.className)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                            {config.label}
                          </span>
                          {match.channel && (
                            <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/50">
                              {match.channel}
                            </span>
                          )}
                          {/* Stats Indicators - Interactive */}
                          <div className="flex items-center gap-1.5 ml-auto">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStatMatch(match);
                                setStatPanelType('START');
                              }}
                              className={cn("w-2 h-2 rounded-full transition-all hover:scale-125", match.hasStartStat ? 'bg-[#0078D4]' : 'bg-zinc-300 dark:bg-zinc-700')}
                              title="Match Stats"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMatch(match);
                                setIsModalOpen(true);
                              }}
                              className={cn("w-2 h-2 rounded-full transition-all hover:scale-125", match.hasEndStat ? 'bg-[#0078D4]' : 'bg-zinc-300 dark:bg-zinc-700')}
                              title="Match Details"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {canEdit && (
                        <div className="shrink-0 flex flex-col items-center justify-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditClick(match); }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-[#0078D4] hover:bg-[#0078D4]/10 active:scale-95 transition-all"
                            title="Edit"
                          >
                            <Edit3 size={16} strokeWidth={2} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(match.id); }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 active:scale-95 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                      <History size={20} className="opacity-50" />
                    </div>
                    <p className="font-medium text-sm">No matches found</p>
                  </div>
                )}
              </div>

              {/* Desktop Table View (No Header, Status First) */}
              <div ref={tableContainerRef} className="hidden md:flex flex-col flex-1 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="flex-1 overflow-hidden">
                  <table className="w-full text-sm">
                    {/* No Header as requested */}
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {paginatedMatches.length > 0 ? paginatedMatches.map((match) => {
                        const status = match.calculatedStatus || 'COMING';
                        const displayDate = isValid(parseISO(match.startDate))
                          ? format(parseISO(match.startDate), 'd MMM')
                          : match.startDate;
                        const matchTitle = (match.teamA && match.teamB)
                          ? `${match.teamA} vs ${match.teamB}`
                          : (match.title || match.match || 'Untitled');

                        return (
                          <tr
                            key={match.id}
                            onClick={() => handleMatchClick(match)}
                            className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 w-[100px]">
                              <StatusBadge status={status} />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap w-[90px]">
                              <span className="font-medium text-zinc-900 dark:text-zinc-200 group-hover:text-[#0078D4] transition-colors uppercase text-xs">{displayDate}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap w-[70px]">
                              <span className="font-mono text-xs text-zinc-500">{match.startTime || '--:--'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-zinc-900 dark:text-white truncate max-w-[200px] lg:max-w-[300px]" title={matchTitle}>
                                {matchTitle}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                                <div className="w-1 h-3 bg-zinc-300 rounded-full" />
                                <span className="truncate max-w-[120px]">{match.league || '-'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              {match.channel ? (
                                <span className="inline-flex px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded text-[10px] font-semibold">
                                  {match.channel}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                {/* First Dot: Match Stats */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStatMatch(match);
                                    setStatPanelType('START');
                                  }}
                                  className={cn("w-2 h-2 rounded-full transition-all hover:scale-150", match.hasStartStat ? 'bg-[#0078D4] hover:bg-[#106EBE]' : 'bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400')}
                                  title="Match Stats"
                                />
                                {/* Second Dot: Match Detail */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMatch(match);
                                    setIsModalOpen(true);
                                  }}
                                  className={cn("w-2 h-2 rounded-full transition-all hover:scale-150", match.hasEndStat ? 'bg-[#0078D4] hover:bg-[#106EBE]' : 'bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400')}
                                  title="Match Details"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 flex items-center justify-center rounded-md text-zinc-400 hover:text-[#0078D4] hover:bg-[#0078D4]/10 transition-all" onClick={(e) => { e.stopPropagation(); handleMatchClick(match); }}>
                                <Eye size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-20 text-center">
                            <div className="flex flex-col items-center text-zinc-400">
                              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                                <History size={20} className="opacity-50" />
                              </div>
                              <p className="font-medium text-sm">No matches found</p>
                              <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters or date range</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Modern Pagination Footer */}
                {totalPages > 1 && (
                  <div className="flex justify-center p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 px-3 flex items-center gap-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>

                      <div className="px-2 text-xs font-semibold text-zinc-900 dark:text-zinc-200 min-w-[60px] text-center">
                        {currentPage} / {totalPages}
                      </div>

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 px-3 flex items-center gap-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <div className="md:hidden flex items-center justify-center gap-3 mt-4 py-3">
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 disabled:opacity-30"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-bold text-zinc-400">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 disabled:opacity-30"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* CALENDAR VIEW - Full Screen */
            <div className="h-full flex flex-col gap-4 animate-in zoom-in-95 duration-500 p-4">
              {/* Month Navigation */}
              <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-all active:scale-95">
                    <ChevronDown size={18} className="rotate-90" />
                  </button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-3 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold uppercase tracking-wide text-zinc-600 transition-all active:scale-95">
                    Today
                  </button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-all active:scale-95">
                    <ChevronDown size={18} className="-rotate-90" />
                  </button>
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="w-10 sm:w-20 hidden xs:block" />
              </div>

              {/* Calendar Grid */}
              <div className="flex-1 bg-white dark:bg-[#0a0a0a] rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-1 sm:p-2 overflow-hidden flex flex-col">
                {/* Weekday Headers */}
                <div className="shrink-0 grid grid-cols-7 mb-1 text-zinc-500">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                    <div key={day} className={cn("py-2 text-center text-[10px] font-bold uppercase tracking-wider", idx === 0 || idx === 6 ? "text-rose-500" : "")}>
                      {isMobile ? day.charAt(0) : day}
                    </div>
                  ))}
                </div>

                {/* Days Grid - Full Height */}
                <div className="flex-1 min-h-0 w-full" ref={calendarRef}>
                  <div className="h-full grid grid-cols-7 grid-rows-6 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                    {(() => {
                      const monthStart = startOfMonth(currentDate);
                      const monthEnd = endOfMonth(monthStart);
                      const startDate = startOfWeek(monthStart);
                      const endDate = endOfWeek(monthEnd);

                      // Ensure we always have 42 days (6 weeks) to maintain grid consistency
                      const existingDays = eachDayOfInterval({ start: startDate, end: endDate });
                      const totalDaysNeeded = 42;
                      const extraDaysNeeded = totalDaysNeeded - existingDays.length;

                      let calendarDays = existingDays;
                      if (extraDaysNeeded > 0) {
                        const lastDay = existingDays[existingDays.length - 1];
                        // Fill remaining days
                        const extraDays = Array.from({ length: extraDaysNeeded }, (_, i) => addHours(lastDay, (i + 1) * 24));
                        calendarDays = [...existingDays, ...extraDays];
                      } else if (extraDaysNeeded < 0) {
                        // In case we somehow got more than 42
                        calendarDays = existingDays.slice(0, 42);
                      }


                      return calendarDays.map((date, i) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        // Apply hideFinished filter to calendar matches too
                        const dayMatches = (matches || [])
                          .filter(m => m.startDate === dateStr)
                          .filter(m => hideFinished ? !isMatchFinished(m) : true);
                        const isCurrentMonth = isSameMonth(date, currentDate);
                        const activeToday = isToday(date);

                        // Dynamic Slicing
                        const visibleMatches = dayMatches.slice(0, maxCalendarItems);
                        const remainingCount = dayMatches.length - visibleMatches.length;

                        return (
                          <div key={i} className={cn(
                            "relative overflow-hidden p-1 transition-all bg-white dark:bg-[#0a0a0a] group hover:bg-zinc-50 flex flex-col",
                            isCurrentMonth ? "" : "bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400"
                          )}>
                            <div className="shrink-0 flex items-center justify-between mb-1">
                              <span className={cn(
                                "w-5 h-5 flex items-center justify-center text-[10px] font-semibold rounded-full transition-colors",
                                activeToday ? "bg-[#0078D4] text-white shadow-sm" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                              )}>
                                {format(date, 'd')}
                              </span>
                              {dayMatches.length > 0 && (
                                <div className="flex items-center gap-0.5">
                                  {!isMobile && <span className="text-[9px] font-bold text-[#0078D4]">{dayMatches.length}</span>}
                                </div>
                              )}
                            </div>

                            {/* Scrollable Content inside Day Cell - Now sliced */}
                            <div className="flex-1 overflow-hidden space-y-1">
                              {visibleMatches.map(m => {
                                const statusKey = getMatchStatus(m);
                                return (
                                  <button
                                    key={m.id}
                                    onClick={() => handleMatchClick(m)}
                                    className={cn(
                                      "w-full text-left px-1.5 py-0.5 rounded-[2px] text-[9px] font-medium truncate transition-all border-l-2",
                                      statusKey === 'LIVE' ? "bg-red-50 text-red-700 border-red-500 font-bold" :
                                        statusKey === 'UPCOMING' ? "bg-blue-50 text-[#0078D4] border-[#0078D4]" :
                                          statusKey === 'SOON' ? "bg-amber-50 text-amber-700 border-amber-500" :
                                            "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    )}
                                    title={(m.teamA && m.teamB) ? `${m.teamA} vs ${m.teamB}` : (m.title || 'Untitled')}
                                  >
                                    <div className="flex items-center gap-1">
                                      {/* <span className="font-mono opacity-70 text-[8px]">{m.startTime}</span> */}
                                      <span className="truncate">{(m.teamA && m.teamB) ? `${m.teamA} vs ${m.teamB}` : (m.title || 'Untitled')}</span>
                                    </div>
                                  </button>
                                );
                              })}

                              {/* New More Button Logic */}
                              {remainingCount > 0 && (
                                <button
                                  onClick={() => { handleModeSwitch('list'); setDateFilter(parseISO(dateStr)); }}
                                  className="w-full text-left px-1.5 py-0.5 text-[8px] font-bold text-zinc-400 hover:text-[#0078D4] transition-colors"
                                >
                                  + {remainingCount} more...
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Match Stats (Split View) */}
        {selectedStatMatch && (
          <div className="flex-1 h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-xl z-20 animate-in slide-in-from-right-10 duration-300">
            <Suspense fallback={<div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#0078D4]" /></div>}>
              <MatchStatPanel
                matchData={selectedStatMatch}
                initialStatType={statPanelType}
                onClose={() => setSelectedStatMatch(null)}
                canEdit={canEdit}
              />
            </Suspense>
          </div>
        )}
      </div>



      {/* CRUD Modals */}
      <ManualMatchModal
        isOpen={isManualModalOpen}
        onClose={() => { setIsManualModalOpen(false); setEditingMatch(null); }}
        onSubmit={handleSaveMatch}
        initialData={editingMatch}
        saving={saving}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        title="Delete Match"
        message="Are you sure you want to delete this match? This cannot be undone."
        onConfirm={handleDeleteMatch}
        isDanger={true}
      />

      {/* FILTER MODAL */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsFilterOpen(false)}>
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Filter Matches</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded"><X size={18} /></button>
            </div>

            <div className="space-y-2">
              {[
                { label: 'All Matches', value: 'ALL', icon: LayoutGrid, count: stats.total },
                { label: 'Live Now', value: 'LIVE', icon: Radio, count: stats.live, isLive: true },
                { label: 'Up Next', value: 'UPCOMING', icon: Bell, count: stats.upcoming },
                { label: 'Finished', value: 'FINISHED', icon: CheckCircle2, count: stats.finished },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setFilterType(opt.value); setIsFilterOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all",
                    filterType === opt.value
                      ? "bg-[#deecf9] border-[#0078D4]/30 text-[#0078D4]"
                      : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <opt.icon size={18} className={opt.isLive && filterType === opt.value ? 'animate-pulse' : ''} />
                  <span className="flex-1 font-medium">{opt.label}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold",
                    filterType === opt.value ? "bg-[#0078D4]/20" : "bg-zinc-200 dark:bg-zinc-700"
                  )}>{opt.count}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => { setFilterType('ALL'); setIsFilterOpen(false); }}
              className="w-full py-2 text-xs font-semibold uppercase text-zinc-500 hover:text-[#0078D4] transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}