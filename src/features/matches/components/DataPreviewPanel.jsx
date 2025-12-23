// file: src/features/matches/components/DataPreviewPanel.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet, Copy, Check, CheckSquare, Square,
  X, Eye, EyeOff, Table2, LayoutGrid
} from 'lucide-react';
// ❌ ลบ import firebase ที่ไม่จำเป็นออก (ลด bundle size)
import { convertToGB, parseAbbrev, formatNumber, formatPercent } from '../../../utils/formatters';
import Toast from '../../../components/ui/Toast';

const DATA_HEADERS = [
  "#", "League", "Match", "Time", "ECS Sport", "ECS Entitlement", "API Huawei",
  "WWW & API Peak/Min", "CDN", "Channel", "Req Peak (Min)", "Req Total",
  "BW Peak (Gb/s)", "BW Total (GB)", "Viewers", "Score", "Start", "End"
];

export default function DataPreviewPanel({ matches, isOpen, onClose }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [copyType, setCopyType] = useState('end_stat'); // 'start_stat' or 'end_stat'
  // ❌ ลบ isLoading state เพราะไม่ต้อง fetch แล้ว
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState('table');

  // Initialize selection when modal opens
  useEffect(() => {
    if (isOpen && matches?.length > 0) {
      setSelectedIds(new Set(matches.map(m => m.id)));
    }
  }, [isOpen]);

  // Sync selectedIds when matches disappear
  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds(prev => {
      const matchIds = new Set(matches.map(m => m.id));
      const newSelected = new Set([...prev].filter(id => matchIds.has(id)));
      return newSelected.size === prev.size ? prev : newSelected;
    });
  }, [matches, isOpen]);

  // ✅ สร้าง enrichedData จาก props โดยตรง (ไม่ต้อง fetch N+1)
  const enrichedData = useMemo(() => {
    if (!matches) return [];

    return matches.map((m) => {
      // แมป copyType ('start_stat', 'end_stat') ไปหา field ที่เราฝากไว้ ('startStats', 'endStats')
      const statKey = copyType === 'start_stat' ? 'startStats' : 'endStats';
      const stats = m[statKey] || {};
      const hasStats = !!m[statKey]; // เช็คว่ามีข้อมูลสถิติฝากไว้หรือไม่

      return {
        ...m,      // ข้อมูลพื้นฐาน match
        ...stats,  // ทับด้วยข้อมูลสถิติ (ถ้ามี)
        hasStats
      };
    });
  }, [matches, copyType]);

  // Format single match row
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

  // Generate all formatted rows
  const formattedRows = useMemo(() => {
    let rowIndex = 0;
    return enrichedData.flatMap((m) => {
      const rows = formatMatchRow(m, rowIndex);
      rowIndex++;
      return rows;
    });
  }, [enrichedData]);

  // Selected rows for copy
  const selectedRows = useMemo(() => {
    return formattedRows.filter(row => selectedIds.has(row.matchId));
  }, [formattedRows, selectedIds]);

  // Toggle single match selection
  const toggleSelection = (matchId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(matchId)) {
      newSelected.delete(matchId);
    } else {
      newSelected.add(matchId);
    }
    setSelectedIds(newSelected);
  };

  // Toggle all selection
  const toggleSelectAll = () => {
    if (selectedIds.size === matches.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(matches.map(m => m.id)));
    }
  };

  // Copy data to clipboard
  const handleCopy = (copyAll = false) => {
    const rowsToCopy = copyAll ? formattedRows : selectedRows;
    if (rowsToCopy.length === 0) {
      setToastMessage('No data to copy');
      setShowToast(true);
      return;
    }

    const textToCopy = rowsToCopy.map(row => row.cells.join('\t')).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setToastMessage(`Copied ${rowsToCopy.length} rows to clipboard!`);
      setShowToast(true);
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-[#0f0f0f] w-full max-w-7xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="shrink-0 p-4 md:p-6 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-violet-500/30">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                    Data Preview
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {matches?.length || 0} matches • {formattedRows.length} rows • {selectedRows.length} selected
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            {/* Controls Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* Stat Type Selector */}
              <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <button
                  onClick={() => setCopyType('start_stat')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${copyType === 'start_stat'
                    ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                >
                  Start Stats
                </button>
                <button
                  onClick={() => setCopyType('end_stat')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${copyType === 'end_stat'
                    ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                >
                  End Stats
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'table'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  title="Table View"
                >
                  <Table2 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'compact'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  title="Compact View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>

              <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-700 hidden md:block" />

              {/* Select All */}
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                {selectedIds.size === matches?.length ? (
                  <><CheckSquare size={16} className="text-violet-500" /> Deselect All</>
                ) : (
                  <><Square size={16} /> Select All</>
                )}
              </button>

              <div className="flex-1" />

              {/* Toggle Preview */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>

          {/* Preview Table - ❌ ลบ Loader ออกแล้ว */}
          {isExpanded && (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {viewMode === 'table' ? (
                <div className="flex-1 overflow-auto custom-scrollbar p-4">
                  <div className="inline-block min-w-full align-middle">
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/50">
                      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                        <thead className="bg-zinc-100 dark:bg-zinc-800/50 sticky top-0">
                          <tr>
                            <th className="px-3 py-3 text-left w-10">
                              <button
                                onClick={toggleSelectAll}
                                className="flex items-center justify-center"
                              >
                                {selectedIds.size === matches?.length ? (
                                  <CheckSquare size={16} className="text-violet-500" />
                                ) : selectedIds.size > 0 ? (
                                  <div className="w-4 h-4 border-2 border-violet-500 rounded bg-violet-500/20" />
                                ) : (
                                  <Square size={16} className="text-zinc-400" />
                                )}
                              </button>
                            </th>
                            {DATA_HEADERS.map((h, i) => (
                              <th
                                key={i}
                                className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {formattedRows.map((row, rowIndex) => {
                            const isSelected = selectedIds.has(row.matchId);
                            return (
                              <tr
                                key={row.id}
                                onClick={() => toggleSelection(row.matchId)}
                                className={`cursor-pointer transition-all ${isSelected
                                  ? 'bg-violet-50 dark:bg-violet-900/10 hover:bg-violet-100 dark:hover:bg-violet-900/20'
                                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                  }`}
                              >
                                <td className="px-3 py-2">
                                  {isSelected ? (
                                    <CheckSquare size={16} className="text-violet-500" />
                                  ) : (
                                    <Square size={16} className="text-zinc-300 dark:text-zinc-600" />
                                  )}
                                </td>
                                {row.cells.map((cell, i) => (
                                  <td
                                    key={i}
                                    className={`px-3 py-2 text-xs font-mono whitespace-nowrap ${isSelected
                                      ? 'text-zinc-800 dark:text-zinc-200'
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
                </div>
              ) : (
                /* Compact View */
                <div className="flex-1 overflow-auto custom-scrollbar p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {enrichedData.map((match) => {
                      const isSelected = selectedIds.has(match.id);
                      return (
                        <div
                          key={match.id}
                          onClick={() => toggleSelection(match.id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10 shadow-lg shadow-violet-500/10'
                            : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-200 dark:hover:border-zinc-700'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                                {match.teamA && match.teamB
                                  ? `${match.teamA} vs ${match.teamB}`
                                  : match.title || match.match || '-'}
                              </h4>
                              <p className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5 truncate">
                                {match.league || match.calendar || '-'}
                              </p>
                            </div>
                            {isSelected ? (
                              <CheckSquare size={20} className="text-violet-500 shrink-0" />
                            ) : (
                              <Square size={20} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mt-3">
                            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                              {match.startTime || '-'}
                            </span>
                            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                              {match.cdn || '-'}
                            </span>
                            {match.hasStats && (
                              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                Has Stats
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="shrink-0 p-4 md:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs font-bold text-zinc-400">
                {selectedRows.length} of {formattedRows.length} rows selected
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-xs font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white transition-colors rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCopy(true)}
                  disabled={formattedRows.length === 0}
                  className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-black uppercase text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Copy size={16} />
                  Copy All ({formattedRows.length})
                </button>
                <button
                  onClick={() => handleCopy(false)}
                  disabled={selectedRows.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-xs font-black uppercase text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 active:translate-y-0"
                >
                  <Copy size={16} />
                  Copy Selected ({selectedRows.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}