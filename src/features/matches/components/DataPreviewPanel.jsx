import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet, Copy, Check, X, LayoutGrid, Zap, Layers,
  DownloadCloud, Loader2
} from 'lucide-react';
import { convertToGB, parseAbbrev, formatNumber, formatPercent } from '../../../utils/formatters';
import { useToast } from "@/hooks/use-toast";
import { googleSheetService } from '../../../services/googleSheetService';
import { format } from 'date-fns';

const DATA_HEADERS = [
  "No.", "League", "Match", "Time", "ECS Sport", "ECS Ent", "API Huawei",
  "WWW & API Peak", "CDN", "Channel", "Req Peak", "Req Total",
  "BW Peak", "BW Total", "Viewers", "Score", "Start", "End"
];

export default function DataPreviewPanel({ matches, isOpen, onClose }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [copyType, setCopyType] = useState('end_stat');
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState('table');
  const [isExporting, setIsExporting] = useState(false);

  // Sync selection when matches change
  useEffect(() => {
    if (isOpen && matches?.length > 0) {
      // รีเซ็ต Selection เมื่อเปิดใหม่ หรือข้อมูลเปลี่ยน
      setSelectedIds(new Set());
    }
  }, [isOpen, matches]);

  // 🔥🔥🔥 1. LOGIC ยุบรวมข้อมูลซ้ำ (Deduplicate) ที่นี่ 🔥🔥🔥
  const enrichedData = useMemo(() => {
    if (!matches || matches.length === 0) return [];

    const uniqueMap = new Map();

    matches.forEach((m) => {
      // 1.1 สร้าง Key สำหรับเช็คซ้ำ: "เวลา|ชื่อแมตช์" (ตัดช่องว่าง ทำตัวเล็ก)
      // ป้องกัน Error กรณีไม่มี field
      const title = (m.teamA && m.teamB) ? `${m.teamA} vs ${m.teamB}` : (m.title || m.match || "");
      const cleanTitle = title.toLowerCase().replace(/\s/g, '');
      const time = m.startTime || m.time || "";

      // Key: เช่น "15:00|lopburicityvsnakhonratchasima"
      // ถ้าไม่มีชื่อแมตช์ ให้ใช้ ID เดิมไปเลย (กันข้อมูลหาย)
      const key = cleanTitle ? `${time}|${cleanTitle}` : m.id;

      if (uniqueMap.has(key)) {
        // --- เจอข้อมูลซ้ำ! ให้ทำการรวม (Merge) ---
        const existing = uniqueMap.get(key);

        // รวมชื่อช่อง (เช่น "TPL 2" + "TPL 7" -> "TPL 2, TPL 7")
        const existingChannel = existing.liveChannel || existing.channel || "";
        const newChannel = m.liveChannel || m.channel || "";

        let mergedChannel = existingChannel;
        // เช็คก่อนว่ามี Channel นี้อยู่แล้วหรือยัง กันซ้ำใน text
        if (newChannel && !existingChannel.includes(newChannel)) {
          mergedChannel = existingChannel ? `${existingChannel}, ${newChannel}` : newChannel;
        }

        // อัปเดตข้อมูลใน Map
        uniqueMap.set(key, {
          ...existing,
          // รวม ID เผื่ออยากใช้ (แต่ในที่นี้ใช้ ID หลักตัวแรกก็พอ)
          liveChannel: mergedChannel,
          channel: mergedChannel, // อัปเดตทั้ง 2 field กันพลาด

          // ถ้าตัวใหม่มีสถิติแต่ตัวเก่าไม่มี ให้เอาตัวใหม่มาทับ
          startStats: existing.startStats || m.startStats,
          endStats: existing.endStats || m.endStats,

          // รวม League (เผื่อตัวแรกว่าง)
          league: existing.league || m.league
        });

      } else {
        // --- ไม่ซ้ำ! ใส่ลง Map เป็นรายการใหม่ ---
        uniqueMap.set(key, { ...m });
      }
    });

    // 1.2 แปลงกลับเป็น Array และรันเลข No. ใหม่ (1, 2, 3...)
    return Array.from(uniqueMap.values()).map((m, index) => {
      const statKey = copyType === 'start_stat' ? 'startStats' : 'endStats';
      const stats = m[statKey] || {};

      return {
        ...m,
        ...stats,
        originalNo: index + 1, // ✅ รันเลขใหม่ที่นี่! (จะไม่กระโดดข้าม)
        hasStats: !!m[statKey]
      };
    });

  }, [matches, copyType]);

  // Helpers
  const safeFormatNum = (val) => {
    try {
      if (val === undefined || val === null) return "0";
      const num = parseAbbrev(val);
      return formatNumber(num) || "0";
    } catch (e) { return "0"; }
  };

  const safeConvertGB = (valObj) => {
    try {
      const value = valObj?.val ?? valObj ?? 0;
      const unit = valObj?.unit || 'GB';
      const gb = convertToGB(value, unit);
      return gb?.toLocaleString('en-US', { maximumFractionDigits: 4 }) || "0";
    } catch (e) { return "0"; }
  };

  const safeFormatPercent = (val) => {
    try {
      return formatPercent(val, 2) || "0.00 %";
    } catch (e) { return "0.00 %"; }
  }

  // Format Row
  const formatMatchRow = (m) => {
    const common = {
      no: m.originalNo,
      league: m.league || m.calendar || "-",
      title: (m.teamA && m.teamB) ? `${m.teamA} vs ${m.teamB}` : (m.title || m.match || "-"),
      time: m.startTime || m.time || "-",
      ecsSport: safeFormatPercent(m.ecsSport),
      ecsEnt: safeFormatPercent(m.ecsEntitlement),
      api: safeFormatPercent(m.apiHuawei),
      reqPeak: safeFormatNum(m.requestPeak),
      viewers: safeFormatNum(m.muxViewerUniq),
      score: m.muxScore || "0",
      start: m.rangeStart || "-",
      end: m.rangeEnd || "-"
    };

    const rows = [];
    const isMultiCdn = m.cdn === 'Multi CDN' && Array.isArray(m.cdnDetails) && m.cdnDetails.length > 0;

    if (isMultiCdn) {
      m.cdnDetails.forEach((cdn, cdnIdx) => {
        rows.push({
          id: `${m.id}-cdn-${cdnIdx}`,
          matchId: m.id,
          hasStats: m.hasStats,
          cells: [
            common.no, common.league, common.title, common.time,
            common.ecsSport, common.ecsEnt, common.api, common.reqPeak,
            cdn.provider || "Unknown",
            cdn.key || "-",
            safeFormatNum(cdn.reqPeakMin),
            safeFormatNum(cdn.reqTotal),
            safeConvertGB(cdn.bwPeakGbps),
            safeConvertGB(cdn.bandwidth),
            common.viewers, common.score, common.start, common.end
          ]
        });
      });
    } else {
      rows.push({
        id: m.id,
        matchId: m.id,
        hasStats: m.hasStats,
        cells: [
          common.no, common.league, common.title, common.time,
          common.ecsSport, common.ecsEnt, common.api, common.reqPeak,
          m.cdn || "-",
          m.liveChannel || m.channel || "-", // ✅ จะโชว์ช่องที่รวมแล้ว (TPL 2, TPL 7)
          safeFormatNum(m.reqPeakMin),
          safeFormatNum(m.reqTotal),
          safeConvertGB(m.bwPeakGbps),
          safeConvertGB(m.bandwidth),
          common.viewers, common.score, common.start, common.end
        ]
      });
    }
    return rows;
  };

  // ใช้ enrichedData ในการแสดงผล
  const formattedRows = useMemo(() => {
    return enrichedData.flatMap((m) => formatMatchRow(m));
  }, [enrichedData]);

  const selectedRows = useMemo(() => {
    return formattedRows.filter(row => selectedIds.has(row.matchId));
  }, [formattedRows, selectedIds]);

  const toggleSelection = (matchId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(matchId)) newSelected.delete(matchId);
    else newSelected.add(matchId);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    // เลือกทั้งหมดจาก enrichedData (ข้อมูลที่ยุบรวมแล้ว)
    if (selectedIds.size === enrichedData?.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(enrichedData.map(m => m.id)));
  };

  const handleCopy = (copyAll = false) => {
    const rowsToCopy = copyAll ? formattedRows : selectedRows;
    if (rowsToCopy.length === 0) {
      toast({ title: 'Copy Failed', description: 'No data to copy', variant: "destructive" });
      return;
    }
    const textToCopy = rowsToCopy.map(row => row.cells.join('\t')).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({ title: 'Success', description: `Copied ${rowsToCopy.length} rows.`, variant: "success" });
    });
  };

  // ✅ Helper: ใช้ enrichedData ในการ Export เพื่อให้ข้อมูลตรงกับหน้าเว็บ
  const getRowsForType = (type) => {
    const statKey = type === 'start_stat' ? 'startStats' : 'endStats';

    // ใช้ enrichedData เป็นฐาน (ข้อมูลไม่ซ้ำ)
    const tempEnriched = enrichedData.map((m) => ({
      ...m,
      ...(m[statKey] || {}),
      // originalNo มีอยู่แล้วจากการทำ enrichedData ข้างบน
      hasStats: !!m[statKey]
    }));

    const targetMatches = selectedIds.size > 0
      ? tempEnriched.filter(m => selectedIds.has(m.id))
      : tempEnriched;

    return targetMatches.flatMap((m) => {
      const rows = formatMatchRow(m);
      return rows.map(r => r.cells);
    });
  };

  const handleExport = async (exportMode = 'all') => {
    const targetRows = selectedIds.size > 0 ? selectedRows : formattedRows;

    if (targetRows.length === 0) {
      toast({ title: "No Data", description: "No matches selected to export.", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    try {
      const dateStr = format(new Date(), 'dd-MM-yyyy');

      let startRows = [];
      let endRows = [];

      if (exportMode === 'all' || exportMode === 'start') {
        startRows = getRowsForType('start_stat');
      }
      if (exportMode === 'all' || exportMode === 'end') {
        endRows = getRowsForType('end_stat');
      }

      await googleSheetService.exportCombinedMatches(
        dateStr,
        DATA_HEADERS,
        startRows,
        endRows
      );

      const modeText = exportMode === 'all' ? 'All' : (exportMode === 'start' ? 'Start' : 'End');
      toast({
        title: "Export Success!",
        description: `Sent ${modeText} stats for ${selectedIds.size > 0 ? selectedIds.size : enrichedData.length} matches.`,
        variant: "default",
        className: "bg-emerald-500 text-white border-none"
      });

    } catch (error) {
      console.error(error);
      toast({ title: "Export Error", description: "Check console for details.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#080808] w-full max-w-[95vw] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-500">

        {/* --- HEADER --- */}
        <div className="shrink-0 px-3 py-2 bg-zinc-50/50 dark:bg-white/[0.01] border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg text-white shadow-md shadow-violet-500/20">
                <FileSpreadsheet size={16} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">
                  Data <span className="text-violet-500">Preview</span>
                </h2>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
                  <span className="flex items-center gap-0.5"><Zap size={8} className="text-amber-500" /> {matches?.length || 0} (Raw)</span>
                  <div className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="flex items-center gap-0.5"><Layers size={8} className="text-blue-500" /> {enrichedData.length} (Merged)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center p-0.5 bg-zinc-100/80 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button onClick={() => setCopyType('start_stat')} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${copyType === 'start_stat' ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm border border-zinc-200 dark:border-zinc-700' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>Start</button>
                <button onClick={() => setCopyType('end_stat')} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${copyType === 'end_stat' ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm border border-zinc-200 dark:border-zinc-700' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>End</button>
              </div>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
              <button onClick={() => setViewMode(viewMode === 'table' ? 'compact' : 'table')} className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white transition-all shadow-sm"><LayoutGrid size={12} /></button>
              <button onClick={onClose} className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-400 hover:text-red-500"><X size={12} /></button>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 overflow-hidden flex flex-col bg-zinc-50/30 dark:bg-black/20">
          <div className="flex-1 overflow-auto custom-scrollbar">
            {viewMode === 'table' ? (
              <div className="w-full">
                <div className="relative border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#0a0a0a] min-h-full">
                  <table className="min-w-full border-collapse">
                    <thead className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="pl-2 py-1.5 text-left w-6">
                          <button
                            onClick={toggleSelectAll}
                            className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center transition-all border ${selectedIds.size === enrichedData?.length && enrichedData.length > 0
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-transparent hover:border-violet-400'
                              }`}
                          >
                            <Check size={9} strokeWidth={4} />
                          </button>
                        </th>
                        {DATA_HEADERS.map((h, i) => (
                          <th key={i} className="px-1.5 py-1.5 text-left text-[8px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap select-none">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                      {formattedRows.map((row) => {
                        const isSelected = selectedIds.has(row.matchId);
                        return (
                          <tr
                            key={row.id}
                            onClick={() => toggleSelection(row.matchId)}
                            className={`group cursor-pointer transition-colors ${isSelected
                              ? 'bg-violet-50/50 dark:bg-violet-500/10'
                              : 'hover:bg-zinc-50 dark:hover:bg-white/[0.02]'
                              }`}
                          >
                            <td className="pl-2 py-1">
                              <div className={`w-3 h-3 rounded-[3px] flex items-center justify-center transition-all border ${isSelected
                                ? 'bg-violet-500 border-violet-500 text-white'
                                : 'bg-transparent border-zinc-300 dark:border-zinc-700 text-transparent group-hover:border-violet-300'
                                }`}>
                                <Check size={7} strokeWidth={4} />
                              </div>
                            </td>
                            {row.cells.map((cell, i) => (
                              <td
                                key={i}
                                className={`px-1.5 py-0.5 text-[9px] font-medium whitespace-nowrap font-mono ${isSelected
                                  ? 'text-violet-700 dark:text-violet-300 font-bold'
                                  : 'text-zinc-600 dark:text-zinc-400'
                                  }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {enrichedData.map((match) => {
                  const isSelected = selectedIds.has(match.id);
                  return (
                    <div
                      key={match.id}
                      onClick={() => toggleSelection(match.id)}
                      className={`group relative p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected
                        ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-500/10 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] hover:border-violet-300'
                        }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[7px] font-black uppercase text-zinc-400 tracking-widest truncate max-w-[100px]">{match.league || match.calendar}</span>
                          {isSelected && <div className="w-3 h-3 rounded-full bg-violet-500 flex items-center justify-center text-white"><Check size={8} strokeWidth={3} /></div>}
                        </div>
                        <h4 className={`text-[10px] font-bold tracking-tight leading-tight line-clamp-1 ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-zinc-700 dark:text-zinc-300'}`}>
                          {match.teamA && match.teamB ? `${match.teamA} vs ${match.teamB}` : match.title || match.match || '-'}
                        </h4>

                        <div className="flex flex-wrap gap-1">
                          <div className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[8px] font-mono font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                            {match.startTime || match.time || '-'}
                          </div>
                          {match.liveChannel && (
                            <div className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-[8px] font-mono font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 truncate max-w-[120px]">
                              {match.liveChannel}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="shrink-0 px-3 py-2 bg-white dark:bg-[#080808] border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {selectedRows.length} Selected
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Export Buttons Group */}
            <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 mr-2">
              <button
                onClick={() => handleExport('start')}
                disabled={isExporting}
                className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-zinc-800 rounded-md transition-all disabled:opacity-50"
                title="Export ONLY Start stats"
              >
                Ex. Start
              </button>
              <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />
              <button
                onClick={() => handleExport('end')}
                disabled={isExporting}
                className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-zinc-800 rounded-md transition-all disabled:opacity-50"
                title="Export ONLY End stats"
              >
                Ex. End
              </button>
              <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />
              <button
                onClick={() => handleExport('all')}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm hover:bg-emerald-600 transition-all disabled:opacity-50"
                title="Export BOTH Start & End"
              >
                {isExporting ? <Loader2 size={10} className="animate-spin" /> : <DownloadCloud size={10} />}
                All
              </button>
            </div>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

            <button
              onClick={() => handleCopy(true)}
              className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white rounded-md text-[8px] font-black uppercase tracking-widest transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Copy All
            </button>
            <button
              onClick={() => handleCopy(false)}
              disabled={selectedRows.length === 0}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg hover:shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <Copy size={10} />
              {copyType === 'start_stat' ? 'Copy Start' : 'Copy End'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}