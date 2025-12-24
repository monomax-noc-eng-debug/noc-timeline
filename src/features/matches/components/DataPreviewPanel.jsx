// file: src/features/matches/components/DataPreviewPanel.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet, Copy, Check, CheckSquare, Square,
  X, Eye, EyeOff, Table2, LayoutGrid, Zap, Layers,
  ChevronRight, Calendar, ArrowRightLeft
} from 'lucide-react';
import { convertToGB, parseAbbrev, formatNumber, formatPercent } from '../../../utils/formatters';
import { useToast } from "@/hooks/use-toast";

const DATA_HEADERS = [
  "#", "League", "Match", "Time", "ECS Sport", "ECS Ent", "API Huawei",
  "WWW & API Peak", "CDN", "Channel", "Req Peak", "Req Total",
  "BW Peak", "BW Total", "Viewers", "Score", "Start", "End"
];

export default function DataPreviewPanel({ matches, isOpen, onClose }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [copyType, setCopyType] = useState('end_stat');
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    if (isOpen && matches?.length > 0) {
      setSelectedIds(new Set(matches.map(m => m.id)));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds(prev => {
      const matchIds = new Set(matches.map(m => m.id));
      const newSelected = new Set([...prev].filter(id => matchIds.has(id)));
      return newSelected.size === prev.size ? prev : newSelected;
    });
  }, [matches, isOpen]);

  const enrichedData = useMemo(() => {
    if (!matches) return [];
    return matches.map((m) => {
      const statKey = copyType === 'start_stat' ? 'startStats' : 'endStats';
      const stats = m[statKey] || {};
      return {
        ...m,
        ...stats,
        hasStats: !!m[statKey]
      };
    });
  }, [matches, copyType]);

  const formatMatchRow = (m, index) => {
    const common = {
      no: index + 1,
      league: m.league || m.calendar || "-",
      title: m.teamA && m.teamB ? `${m.teamA} vs ${m.teamB}` : (m.title || m.match || "-"),
      time: m.startTime || "-",
      ecsSport: formatPercent(m.ecsSport, 2) || "0.00 %",
      ecsEnt: formatPercent(m.ecsEntitlement, 2) || "0.00 %",
      api: formatPercent(m.apiHuawei, 2) || "0.00 %",
      reqPeak: formatNumber(parseAbbrev(m.requestPeak)) || "0",
      viewers: formatNumber(parseAbbrev(m.muxViewerUniq)) || "0",
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
            common.no,
            common.league,
            common.title,
            common.time,
            common.ecsSport,
            common.ecsEnt,
            common.api,
            common.reqPeak,
            cdn.provider || "Unknown",
            cdn.key || "-",
            formatNumber(parseAbbrev(cdn.reqPeakMin)) || "0",
            formatNumber(parseAbbrev(cdn.reqTotal)) || "0",
            convertToGB(cdn.bwPeakGbps?.val || cdn.bwPeakGbps, cdn.bwPeakGbps?.unit || 'GB')?.toLocaleString('en-US', { maximumFractionDigits: 4 }) || "0",
            convertToGB(cdn.bandwidth?.val || cdn.bandwidth, cdn.bandwidth?.unit || 'GB')?.toLocaleString('en-US', { maximumFractionDigits: 4 }) || "0",
            common.viewers,
            common.score,
            common.start,
            common.end
          ]
        });
      });
    } else {
      rows.push({
        id: m.id,
        matchId: m.id,
        hasStats: m.hasStats,
        cells: [
          common.no,
          common.league,
          common.title,
          common.time,
          common.ecsSport,
          common.ecsEnt,
          common.api,
          common.reqPeak,
          m.cdn || "-",
          m.liveChannel || m.channel || "-",
          formatNumber(parseAbbrev(m.reqPeakMin)) || "0",
          formatNumber(parseAbbrev(m.reqTotal)) || "0",
          convertToGB(m.bwPeakGbps?.val || m.bwPeakGbps, m.bwPeakGbps?.unit || 'GB')?.toLocaleString('en-US', { maximumFractionDigits: 4 }) || "0",
          convertToGB(m.bandwidth?.val || m.bandwidth, m.bandwidth?.unit || 'GB')?.toLocaleString('en-US', { maximumFractionDigits: 4 }) || "0",
          common.viewers,
          common.score,
          common.start,
          common.end
        ]
      });
    }
    return rows;
  };

  const formattedRows = useMemo(() => {
    let rowIndex = 0;
    return enrichedData.flatMap((m) => {
      const rows = formatMatchRow(m, rowIndex);
      rowIndex++;
      return rows;
    });
  }, [enrichedData]);

  const selectedRows = useMemo(() => {
    return formattedRows.filter(row => selectedIds.has(row.matchId));
  }, [formattedRows, selectedIds]);

  const toggleSelection = (matchId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(matchId)) {
      newSelected.delete(matchId);
    } else {
      newSelected.add(matchId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === matches.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(matches.map(m => m.id)));
    }
  };

  const handleCopy = (copyAll = false) => {
    const rowsToCopy = copyAll ? formattedRows : selectedRows;
    if (rowsToCopy.length === 0) {
      toast({ title: 'Copy Failed', description: 'No data to copy', variant: "destructive" });
      return;
    }

    const textToCopy = rowsToCopy.map(row => row.cells.join('\t')).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({ title: 'Success', description: `Copied ${rowsToCopy.length} rows to clipboard!`, variant: "success" });
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#080808] w-full max-w-7xl rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">

        {/* --- COMPACT PREMIUM HEADER --- */}
        <div className="shrink-0 p-4 md:p-5 bg-zinc-50/50 dark:bg-white/[0.01] border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white shadow-lg shadow-violet-500/20">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                  Data <span className="text-violet-500">Preview</span>
                </h2>
                <div className="flex items-center gap-2 text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Zap size={10} className="text-amber-500" /> {matches?.length || 0}</span>
                  <div className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <span className="flex items-center gap-1"><Layers size={10} className="text-blue-500" /> {formattedRows.length}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Selection Controller */}
              <div className="flex items-center p-1 bg-zinc-100/80 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 md:mr-2">
                <button
                  onClick={() => setCopyType('start_stat')}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${copyType === 'start_stat'
                    ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm border border-zinc-200 dark:border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                    }`}
                >
                  Start
                </button>
                <button
                  onClick={() => setCopyType('end_stat')}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${copyType === 'end_stat'
                    ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm border border-zinc-200 dark:border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                    }`}
                >
                  End
                </button>
              </div>

              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'compact' : 'table')}
                className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white transition-all shadow-sm"
                title="Switch View Mode"
              >
                {viewMode === 'table' ? <LayoutGrid size={14} /> : <Table2 size={14} />}
              </button>

              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

              <button onClick={onClose} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-400 hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          </div>
        </div>


        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 overflow-hidden flex flex-col bg-zinc-50/30 dark:bg-black/20">
          <div className="flex-1 overflow-auto custom-scrollbar p-3 md:p-4">
            {viewMode === 'table' ? (
              <div className="w-full">
                <div className="relative border border-zinc-100 dark:border-zinc-900 rounded-xl overflow-x-auto bg-white dark:bg-[#0a0a0a] shadow-sm custom-scrollbar">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-100 dark:border-zinc-900">
                        <th className="pl-3 py-2 text-left w-8">
                          <button
                            onClick={toggleSelectAll}
                            className={`w-4 h-4 rounded-sm flex items-center justify-center transition-all border-2 ${selectedIds.size === matches?.length
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-transparent'
                              }`}
                          >
                            <Check size={10} strokeWidth={4} />
                          </button>
                        </th>
                        {DATA_HEADERS.map((h, i) => (
                          <th key={i} className="px-2 py-2 text-left text-[8px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">
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
                            className={`group cursor-pointer transition-all ${isSelected
                              ? 'bg-violet-500/[0.03] dark:bg-violet-500/[0.05]'
                              : 'hover:bg-zinc-50/50 dark:hover:bg-white/[0.02]'
                              }`}
                          >
                            <td className="pl-3 py-1.5">
                              <div className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-all border ${isSelected
                                ? 'bg-violet-500 border-violet-500 text-white'
                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-transparent'
                                }`}>
                                <Check size={8} strokeWidth={4} />
                              </div>
                            </td>
                            {row.cells.map((cell, i) => (
                              <td
                                key={i}
                                className={`px-2 py-1.5 text-[9px] font-bold whitespace-nowrap transition-colors ${isSelected
                                  ? 'text-violet-600 dark:text-violet-400'
                                  : 'text-zinc-500 dark:text-zinc-400'
                                  } font-mono`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {enrichedData.map((match) => {
                  const isSelected = selectedIds.has(match.id);
                  return (
                    <div
                      key={match.id}
                      onClick={() => toggleSelection(match.id)}
                      className={`group relative p-3 rounded-xl border transition-all duration-300 cursor-pointer ${isSelected
                        ? 'border-violet-500 bg-white dark:bg-[#0a0a0a] shadow-sm'
                        : 'border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-[#0c0c0e] hover:border-zinc-200 dark:hover:border-zinc-800'
                        }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[7px] font-black uppercase text-zinc-400 tracking-widest truncate max-w-[100px]">{match.league || match.calendar}</span>
                          {isSelected && <Check size={10} className="text-violet-500" strokeWidth={3} />}
                        </div>
                        <h4 className={`text-xs font-black tracking-tight leading-tight line-clamp-1 ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                          {match.teamA && match.teamB ? `${match.teamA} vs ${match.teamB}` : match.title || match.match || '-'}
                        </h4>

                        <div className="flex flex-wrap gap-1">
                          <div className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[8px] font-black text-zinc-500">
                            {match.startTime || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* --- COMPACT FOOTER --- */}
        <div className="shrink-0 px-5 py-3 bg-white dark:bg-[#080808] border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 shrink-0">
              {[0, 1].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-[#080808] bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none mb-0.5 truncate">{selectedRows.length} Selected</p>
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tight">Injection Ready</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(true)}
              className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
            >
              All
            </button>
            <button
              onClick={() => handleCopy(false)}
              disabled={selectedRows.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-30"
            >
              <Copy size={12} />
              {copyType === 'start_stat' ? 'Start' : 'End'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}