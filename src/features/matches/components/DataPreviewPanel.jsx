import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  FileSpreadsheet, Copy, Check, X, LayoutGrid, Zap, Layers,
  DownloadCloud, Loader2, Clock, Calendar as CalendarIcon,
  Minus, ChevronDown, ChevronRight, ExternalLink
} from 'lucide-react';
import { convertToGB, parseAbbrev, formatNumber, formatPercent } from '../../../utils/formatters';
import { useToast } from "@/hooks/use-toast";
import { googleSheetService } from '../../../services/googleSheetService';
import { format, isValid, startOfDay } from 'date-fns';
import { FormModal } from '../../../components/FormModal';
import { DatePicker } from '../../../components/forms/DatePicker';
import { formatDateAPI } from '../../../utils/formatters';

// --- Static Data (Moved outside component) ---
const DATA_HEADERS = [
  "No.", "League", "Match", "Time", "ECS Sport", "ECS Ent", "API Huawei",
  "WWW & API Peak", "CDN", "Channel", "Req Peak", "Req Total",
  "BW Peak", "BW Total", "Viewers", "Score", "Start", "End"
];

// --- Helpers (Memoized outside component) ---
const safeFormatNum = (val) => {
  if (val === undefined || val === null) return "0";
  try {
    const num = parseAbbrev(val);
    return formatNumber(num) || "0";
  } catch { return "0"; }
};

const safeConvertGB = (valObj) => {
  try {
    const value = valObj?.val ?? valObj ?? 0;
    const unit = valObj?.unit || 'GB';
    const gb = convertToGB(value, unit);
    return gb?.toLocaleString('en-US', { maximumFractionDigits: 4 }) || "0";
  } catch { return "0"; }
};

const safeFormatPercent = (val) => {
  try {
    return formatPercent(val, 2) || "0.00 %";
  } catch { return "0.00 %"; }
};

// --- Memoized Row Components ---
const TableHeaderRow = memo(({ onSelectAll, isAllSelected, dataLength }) => (
  <tr className="bg-zinc-50/50 dark:bg-zinc-900/50">
    <th className="sticky left-0 z-30 p-2 sm:p-3 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm text-left border-b border-zinc-100 dark:border-zinc-800 w-10">
      <button onClick={onSelectAll} className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border ${isAllSelected && dataLength > 0 ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-transparent hover:border-zinc-400'}`}>
        <Check size={12} strokeWidth={4} />
      </button>
    </th>
    {DATA_HEADERS.map((h, i) => (
      <th key={i} className="px-2 py-2 sm:px-3 sm:py-3 text-left text-[9px] font-mediumst text-zinc-400 whitespace-nowrap select-none border-b border-zinc-100 dark:border-zinc-800">{h}</th>
    ))}
  </tr>
));
TableHeaderRow.displayName = 'TableHeaderRow';

const DateHeaderRow = memo(({ row, isExpanded, dateIds, isAllDateSelected, isSomeDateSelected, onToggleDateSelection, onToggleDateExpand }) => (
  <tr className="bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer" onClick={() => onToggleDateExpand(row.date)}>
    <td className="sticky left-0 z-20 px-2 sm:px-3 py-2 bg-zinc-100/90 dark:bg-zinc-800/90 border-y border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-center gap-2">
        <button onClick={(e) => onToggleDateSelection(e, row.date)} className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border ${isAllDateSelected ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black' : isSomeDateSelected ? 'bg-zinc-300 dark:bg-zinc-600 border-zinc-300 dark:border-zinc-600 text-white' : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400'}`}>
          {isAllDateSelected && <Check size={12} strokeWidth={4} />}
          {!isAllDateSelected && isSomeDateSelected && <Minus size={12} strokeWidth={4} />}
        </button>
      </div>
    </td>
    <td colSpan={DATA_HEADERS.length} className="px-2 py-2 text-[10px] font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-widest border-y border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 flex items-center justify-center rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <CalendarIcon size={12} />
        {isValid(new Date(row.date)) ? format(new Date(row.date), 'EEEE, d MMMM yyyy') : row.date}
        <span className="ml-2 px-1.5 py-0.5 rounded bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 text-[9px] text-zinc-400">{dateIds.length} Matches</span>
      </div>
    </td>
  </tr>
));
DateHeaderRow.displayName = 'DateHeaderRow';

const DataRow = memo(({ row, isSelected, onToggleSelection }) => (
  <tr onClick={() => onToggleSelection(row.matchId)} className={`group cursor-pointer transition-colors ${isSelected ? 'bg-zinc-50 dark:bg-zinc-900/50' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 bg-white dark:bg-[#0a0a0a]'}`}>
    <td className={`sticky left-0 z-20 p-2 sm:p-3 transition-colors ${isSelected ? 'bg-zinc-50 dark:bg-zinc-900/50' : 'bg-white dark:bg-[#0a0a0a] group-hover:bg-zinc-50/50 dark:group-hover:bg-zinc-900/30'}`}>
      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border ${isSelected ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-transparent group-hover:border-zinc-400'}`}><Check size={12} strokeWidth={4} /></div>
    </td>
    {row.cells.map((cell, i) => (
      <td key={i} className={`px-2 py-2 sm:px-3 sm:py-2.5 text-[11px] font-bold whitespace-nowrap font-mono ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
        {cell}
      </td>
    ))}
  </tr>
));
DataRow.displayName = 'DataRow';

const CardItem = memo(({ match, isSelected, onToggleSelection }) => (
  <div onClick={() => onToggleSelection(match.id)} className={`relative p-4 rounded-lg border transition-all duration-300 cursor-pointer shadow-sm ${isSelected ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700'}`}>
    <div className="flex justify-between items-start mb-2">
      <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[8px] font-semibold text-zinc-400 tracking-widest border border-zinc-200/50 dark:border-zinc-700/50">{match.league || match.calendar}</span>
      {isSelected && <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg"><Check size={12} strokeWidth={3} /></div>}
    </div>
    <h4 className={`text-xs font-black leading-tight mb-3 line-clamp-2 uppercase tracking-tighter ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
      {match.teamA && match.teamB ? `${match.teamA} vs ${match.teamB}` : match.title || match.match || '-'}
    </h4>
    <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-900">
      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
        <Clock size={10} />{match.startTime || match.time || '-'}
      </div>
    </div>
  </div>
));
CardItem.displayName = 'CardItem';

// --- Main Component ---
export default function DataPreviewPanel({ data, isOpen, onClose }) {
  const [localData, setLocalData] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [copyType, setCopyType] = useState('end_stat');
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState('table');
  const [isExporting, setIsExporting] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today

  // ✅ OPTIMIZATION: Use shallow copy with reference check instead of deep clone
  useEffect(() => {
    if (isOpen && Array.isArray(data)) {
      setLocalData(data); // Shallow reference - much faster
      setSelectedIds(new Set());
      setExpandedDates({});
    }
  }, [isOpen, data]);

  // ✅ OPTIMIZATION: Stable enrichment with minimal recalculation
  const enrichedData = useMemo(() => {
    if (!localData?.length) return [];

    const uniqueMap = new Map();
    const getCdn = (item) => item.cdn || item.endStats?.cdn || item.startStats?.cdn;
    const getCdnDetails = (item) => item.cdnDetails || item.endStats?.cdnDetails || item.startStats?.cdnDetails;

    localData.forEach((m) => {
      const title = (m.teamA && m.teamB) ? `${m.teamA} vs ${m.teamB}` : (m.title || m.match || "");
      const cleanTitle = title?.toLowerCase().replace(/\s/g, '') || "";
      const key = m.id || `${m.startDate || ""}|${m.startTime || m.time || ""}|${cleanTitle}`;

      if (uniqueMap.has(key)) {
        uniqueMap.set(key, { ...uniqueMap.get(key), ...m });
      } else {
        uniqueMap.set(key, { ...m, cdn: getCdn(m), cdnDetails: getCdnDetails(m) });
      }
    });

    return Array.from(uniqueMap.values()).map((m, idx) => ({ ...m, originalNo: idx + 1 }));
  }, [localData]);

  // ✅ Filter by selected date
  const filteredByDate = useMemo(() => {
    if (!selectedDate) return enrichedData; // Show all if no date selected
    const dateStr = formatDateAPI(selectedDate);
    return enrichedData.filter(m => m.startDate === dateStr);
  }, [enrichedData, selectedDate]);

  // ✅ OPTIMIZATION: Single pass grouping
  const matchIdsByDate = useMemo(() => {
    const map = {};
    filteredByDate.forEach(m => {
      const date = m.startDate || "unknown";
      (map[date] ??= []).push(m.id);
    });
    return map;
  }, [filteredByDate]);

  // ✅ Auto-expand dates on load
  useEffect(() => {
    if (enrichedData.length > 0 && Object.keys(expandedDates).length === 0) {
      const allExpanded = Object.keys(matchIdsByDate).reduce((acc, d) => ({ ...acc, [d]: true }), {});
      setExpandedDates(allExpanded);
    }
  }, [matchIdsByDate, enrichedData.length, expandedDates]);

  // ✅ OPTIMIZATION: Memoized formatter
  const formatMatchRow = useCallback((m, statsType = 'end_stat') => {
    const targetStats = statsType === 'start_stat' ? (m.startStats || {}) : (m.endStats || {});
    const finalData = { ...m, ...targetStats };
    const hasStats = !!(statsType === 'start_stat' ? m.startStats : m.endStats);
    const displayTitle = (m.teamA && m.teamB && !m.title) ? `${m.teamA} vs ${m.teamB}` : (m.title || m.match || "-");

    const common = {
      no: m.originalNo,
      league: m.league || m.calendar || "-",
      title: displayTitle,
      time: m.startTime || m.time || "-",
      ecsSport: safeFormatPercent(finalData.ecsSport),
      ecsEnt: safeFormatPercent(finalData.ecsEntitlement),
      api: safeFormatPercent(finalData.apiHuawei),
      reqPeak: safeFormatNum(finalData.requestPeak),
      viewers: safeFormatNum(finalData.muxViewerUniq),
      score: finalData.muxScore || "0",
      start: finalData.rangeStart || "-",
      end: finalData.rangeEnd || "-"
    };

    const isMultiCdn = m.cdn === 'Multi CDN' || Array.isArray(m.cdnDetails);

    if (isMultiCdn && Array.isArray(m.cdnDetails)) {
      return m.cdnDetails.map((cdn, cdnIdx) => ({
        id: `${m.id}-cdn-${cdnIdx}`,
        matchId: m.id,
        isMainRow: cdnIdx === 0,
        hasStats,
        cells: [
          common.no, common.league, common.title, common.time,
          common.ecsSport, common.ecsEnt, common.api, common.reqPeak,
          cdn.provider || "Unknown", cdn.key || "-",
          safeFormatNum(cdn.reqPeakMin), safeFormatNum(cdn.reqTotal),
          safeConvertGB(cdn.bwPeakGbps), safeConvertGB(cdn.bandwidth),
          common.viewers, common.score, common.start, common.end
        ]
      }));
    }

    return [{
      id: m.id,
      matchId: m.id,
      isMainRow: true,
      hasStats,
      cells: [
        common.no, common.league, common.title, common.time,
        common.ecsSport, common.ecsEnt, common.api, common.reqPeak,
        m.cdn || finalData.cdn || "-", m.liveChannel || m.channel || "-",
        safeFormatNum(finalData.reqPeakMin), safeFormatNum(finalData.reqTotal),
        safeConvertGB(finalData.bwPeakGbps), safeConvertGB(finalData.bandwidth),
        common.viewers, common.score, common.start, common.end
      ]
    }];
  }, []);

  // ✅ OPTIMIZATION: Memoized formatted rows with stable dependencies
  const formattedRows = useMemo(() => {
    const sorted = [...filteredByDate].sort((a, b) => {
      const dateComp = (a.startDate || "").localeCompare(b.startDate || "");
      return dateComp !== 0 ? dateComp : (a.startTime || "").localeCompare(b.startTime || "");
    });

    const rows = [];
    let lastDate = null;

    sorted.forEach(m => {
      if (m.startDate && m.startDate !== lastDate) {
        rows.push({ isHeader: true, date: m.startDate, id: `header-${m.startDate}` });
        lastDate = m.startDate;
      }
      if (m.startDate && expandedDates[m.startDate]) {
        rows.push(...formatMatchRow(m, copyType));
      }
    });

    return rows;
  }, [filteredByDate, copyType, expandedDates, formatMatchRow]);

  // ✅ OPTIMIZATION: Stable handlers with useCallback
  const toggleSelection = useCallback((matchId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(matchId) ? next.delete(matchId) : next.add(matchId);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => prev.size === filteredByDate.length ? new Set() : new Set(filteredByDate.map(m => m.id)));
  }, [filteredByDate]);

  const toggleDateSelection = useCallback((e, date) => {
    e.stopPropagation();
    const idsInDate = matchIdsByDate[date] || [];
    setSelectedIds(prev => {
      const allSelected = idsInDate.every(id => prev.has(id));
      const next = new Set(prev);
      idsInDate.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  }, [matchIdsByDate]);

  const toggleDateExpand = useCallback((date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  }, []);

  const selectedRows = useMemo(() => filteredByDate.filter(m => selectedIds.has(m.id)), [filteredByDate, selectedIds]);

  const getExportRows = useCallback(() => {
    return filteredByDate.filter(m => selectedIds.has(m.id)).flatMap(m => formatMatchRow(m, copyType));
  }, [filteredByDate, selectedIds, copyType, formatMatchRow]);

  const handleOpenSheet = useCallback(() => {
    const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_OPEN_URL;
    if (sheetUrl) window.open(sheetUrl, '_blank');
    else toast({ title: "Configuration Error", description: "Sheet URL is not configured.", variant: "destructive" });
  }, [toast]);

  const handleCopy = useCallback((copyAll = false) => {
    const rowsToCopy = copyAll
      ? enrichedData.flatMap(m => formatMatchRow(m, copyType))
      : getExportRows();

    if (!rowsToCopy.length) {
      toast({ title: 'Copy Failed', description: 'No data to copy', variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(rowsToCopy.map(r => r.cells.join('\t')).join('\n')).then(() => {
      toast({ title: 'Success', description: `Copied ${rowsToCopy.length} rows.`, variant: "success" });
    });
  }, [enrichedData, copyType, formatMatchRow, getExportRows, toast]);

  const handleExport = useCallback(async (exportMode = 'all') => {
    if (!selectedIds.size) {
      toast({ title: "No Selection", description: "Please select at least one match to export.", variant: "destructive" });
      return;
    }

    const targetMatches = enrichedData.filter(m => selectedIds.has(m.id));
    setIsExporting(true);

    try {
      const dateStr = format(new Date(), 'dd-MM-yyyy');
      const startRows = (exportMode === 'all' || exportMode === 'start')
        ? targetMatches.flatMap(m => formatMatchRow(m, 'start_stat').map(r => r.cells))
        : [];
      const endRows = (exportMode === 'all' || exportMode === 'end')
        ? targetMatches.flatMap(m => formatMatchRow(m, 'end_stat').map(r => r.cells))
        : [];

      await googleSheetService.exportCombinedMatches(dateStr, DATA_HEADERS, startRows, endRows);

      const modeText = exportMode === 'all' ? 'All' : exportMode === 'start' ? 'Start' : 'End';
      toast({
        title: "Export Success!",
        description: `Sent ${modeText} stats for ${targetMatches.length} matches.`,
        className: "bg-emerald-500 text-white border-none"
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Export Error", description: "Check console for details.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  }, [enrichedData, selectedIds, formatMatchRow, toast]);

  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      showCloseButton={false}
      size="3xl"
      bodyClassName="overflow-y-auto custom-scrollbar p-0 sm:p-4 bg-zinc-50/10 dark:bg-black/20"
      className="max-h-[98vh] sm:max-h-[90vh]"
      header={
        <div className="shrink-0 w-full flex flex-col gap-3 bg-white/50 dark:bg-black/50 backdrop-blur-xl z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">
                  Data Preview
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 mt-1.5 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Zap size={10} className="text-amber-500" /> {filteredByDate?.length || 0} Showing</span>
                  <div className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="flex items-center gap-1"><Layers size={10} className="text-[#0078D4]" /> {enrichedData.length} Total</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <DatePicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  showNavigation={true}
                  placeholder="Select Date"
                  className="h-8 text-xs"
                />
                <button
                  onClick={() => setSelectedDate(null)}
                  className={`h-8 px-3 rounded-md text-[9px] font-medium transition-all ${!selectedDate ? 'bg-[#0078D4] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                >
                  All
                </button>
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-95">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
              <button onClick={() => setCopyType('start_stat')} className={`h-8 px-4 rounded-md text-[9px] font-medium transition-all ${copyType === 'start_stat' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700/50' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>Start Stats</button>
              <button onClick={() => setCopyType('end_stat')} className={`h-8 px-4 rounded-md text-[9px] font-medium transition-all ${copyType === 'end_stat' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700/50' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>End Stats</button>
            </div>
            <button onClick={() => setViewMode(v => v === 'table' ? 'compact' : 'table')} className="h-9 px-4 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg text-[9px] font-mediumst transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 whitespace-nowrap">
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">{viewMode === 'table' ? 'Cards' : 'Table'}</span>
            </button>
          </div>
        </div>
      }
      footer={
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <span className={`w-2 h-2 rounded-full ${selectedRows.length > 0 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
              <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{selectedRows.length} Rows Selected</span>
            </div>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <div className="flex items-center p-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <button onClick={() => handleExport('start')} disabled={isExporting || !enrichedData.length} className="h-9 px-4 text-[9px] font-mediumst text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 rounded-md transition-all disabled:opacity-50 whitespace-nowrap">Start</button>
              <div className="w-px h-1/2 bg-zinc-200 dark:border-zinc-700 mx-1" />
              <button onClick={() => handleExport('end')} disabled={isExporting || !enrichedData.length} className="h-9 px-4 text-[9px] font-mediumst text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 rounded-md transition-all disabled:opacity-50 whitespace-nowrap">End</button>
              <div className="w-px h-1/2 bg-zinc-200 dark:border-zinc-700 mx-1" />
              <button onClick={() => handleExport('all')} disabled={isExporting || !enrichedData.length} className="h-9 px-4 flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md text-[9px] font-mediumst transition-all shadow-md active:scale-95 disabled:opacity-70 whitespace-nowrap">{isExporting ? <Loader2 size={12} className="animate-spin" /> : <DownloadCloud size={12} />} Export All</button>
            </div>
            <button onClick={handleOpenSheet} className="h-11 px-5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-[10px] font-mediumst transition-all whitespace-nowrap active:scale-95 flex items-center gap-2">
              <ExternalLink size={16} /> Open Sheet
            </button>
            <button onClick={() => handleCopy(true)} disabled={!enrichedData.length} className="h-11 px-5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-[10px] font-mediumst transition-all whitespace-nowrap active:scale-95 disabled:opacity-50">Copy All</button>
            <button onClick={() => handleCopy(false)} disabled={!selectedIds.size} className="h-11 px-6 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-100 text-[10px] font-mediumst shadow-lg flex items-center gap-3 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"><Copy size={16} /> Copy {copyType === 'start_stat' ? 'Start' : 'End'}</button>
          </div>
        </div>
      }
    >
      {!enrichedData.length ? (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 mb-4"><FileSpreadsheet size={40} /></div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">No Data Available</h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-[250px] leading-relaxed">There are no matches to display.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="min-w-full inline-block align-middle">
          <div className="bg-white dark:bg-[#0a0a0a] shadow-sm sm:rounded-lg overflow-hidden border-b sm:border border-zinc-100 dark:border-zinc-800">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <TableHeaderRow
                  onSelectAll={toggleSelectAll}
                  isAllSelected={selectedIds.size === enrichedData.length}
                  dataLength={enrichedData.length}
                />
              </thead>
              <tbody className="divide-y divide-zinc-5 dark:divide-zinc-900/50">
                {formattedRows.map((row) => {
                  if (row.isHeader) {
                    const dateIds = matchIdsByDate[row.date] || [];
                    const isAllDateSelected = dateIds.every(id => selectedIds.has(id));
                    const isSomeDateSelected = dateIds.some(id => selectedIds.has(id));
                    return (
                      <DateHeaderRow
                        key={row.id}
                        row={row}
                        isExpanded={expandedDates[row.date]}
                        dateIds={dateIds}
                        isAllDateSelected={isAllDateSelected}
                        isSomeDateSelected={isSomeDateSelected}
                        onToggleDateSelection={toggleDateSelection}
                        onToggleDateExpand={toggleDateExpand}
                      />
                    );
                  }
                  return (
                    <DataRow
                      key={row.id}
                      row={row}
                      isSelected={selectedIds.has(row.matchId)}
                      onToggleSelection={toggleSelection}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {enrichedData.map((match) => {
            if (match.startDate && !expandedDates[match.startDate]) return null;
            return (
              <CardItem
                key={match.id}
                match={match}
                isSelected={selectedIds.has(match.id)}
                onToggleSelection={toggleSelection}
              />
            );
          })}
        </div>
      )}
    </FormModal>
  );
}