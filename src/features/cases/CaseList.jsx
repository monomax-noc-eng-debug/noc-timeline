import React, { useState, useEffect, useRef } from 'react';
import { FilePlus2, Search, X, LayoutDashboard, Download, Filter, AlertCircle, PlayCircle, CheckCircle2, Clock, XCircle, RefreshCw, Inbox, Layers } from 'lucide-react';
import IncidentCard from './IncidentCard';
import LogCard from './LogCard';
import { useTicketOptions } from '../../hooks/useTicketOptions';

// ✅ Custom Hook: สำหรับหน่วงเวลาการค้นหา (Debounce)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function CaseList({
  // Existing Props (Incidents)
  filteredIncidents,
  selectedId,
  onSelect,
  onAddIncident,
  onDeleteIncident,
  onExportCSV,
  stats,

  // New Props (Inbox)
  logs,
  selectedLogId,
  onSelectLog,
  logsLoading,
  logStats,

  // Shared Props
  viewMode,         // 'incidents' | 'logs'
  onViewModeChange,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  clearFilters,
  hasActiveFilters,
  loading
}) {
  // Get ticket options from Firestore
  const { ticketOptions } = useTicketOptions();

  // 1. ✅ Local State สำหรับ Search Input (พิมพ์ลื่น ไม่กระตุก)
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 300); // รอ 300ms ค่อยส่งค่า

  // เมื่อค่า debounced เปลี่ยน ค่อยส่งไปกรองที่ Parent
  useEffect(() => {
    setSearchTerm(debouncedSearch);
  }, [debouncedSearch, setSearchTerm]);

  // ถ้ามีการกด Clear จากที่อื่น ให้ล้างค่าใน Input ด้วย
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Quick filter helper
  const handleQuickFilter = (status) => {
    setFilterStatus(status === filterStatus ? 'All' : status);
  };

  // 2. ✅ Optimized Infinite Scroll (ใช้ IntersectionObserver)
  const [visibleItems, setVisibleItems] = useState(20);
  const observerTarget = useRef(null);

  // Data Source Decision
  const isInbox = viewMode === 'logs';
  const currentData = isInbox ? logs : filteredIncidents;
  const currentLoading = isInbox ? logsLoading : loading;

  // Reset จำนวนรายการเมื่อมีการเปลี่ยน Filter หรือข้อมูลใหม่มา
  useEffect(() => {
    setVisibleItems(20);
  }, [currentData, filterStatus, filterType, debouncedSearch, viewMode]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        // ถ้าเลื่อนมาเจอ Element ท้ายสุด ให้โหลดเพิ่ม
        if (entries[0].isIntersecting && currentData) {
          setVisibleItems(prev => Math.min(prev + 20, currentData.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [currentData]);

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-black border-r border-zinc-200 dark:border-zinc-800 relative">

      {/* COMPACT HEADER */}
      <div className="shrink-0 pt-4 pb-3 px-4 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800 z-10 shadow-sm transition-all">
        <div className="flex flex-col gap-3">

          {/* Top Row: Title & Action Icons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all ${isInbox ? 'bg-blue-600 text-white' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'}`}>
                {isInbox ? <Inbox size={18} /> : <Layers size={18} />}
              </div>

              {/* View Switcher */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => onViewModeChange('incidents')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wide rounded-md transition-all ${!isInbox ? 'bg-white dark:bg-black shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Cases
                </button>
                <button
                  onClick={() => onViewModeChange('logs')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wide rounded-md transition-all ${isInbox ? 'bg-white dark:bg-black shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Inbox
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {!isInbox && (
                <>
                  <button
                    onClick={() => onExportCSV(filteredIncidents)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-95"
                    title="Export Database"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={onAddIncident}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md hover:opacity-90 active:scale-95 transition-all"
                    title="New Case"
                  >
                    <FilePlus2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar: Ultra Slim (Show DIFFERENT stats based on mode) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {isInbox ? (
              // Inbox Stats
              logStats && [
                { status: 'All', count: logStats.total, color: 'bg-zinc-400', icon: Inbox },
                { status: 'Incidents', count: logStats.incidents, color: 'bg-red-500', icon: AlertCircle },
                { status: 'Requests', count: logStats.requests, color: 'bg-blue-500', icon: PlayCircle },
              ].map(item => (
                <div key={item.status} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[8px] font-black uppercase bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border border-zinc-100 dark:border-zinc-800">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                  <span>{item.status}</span>
                  <span className="opacity-50 ml-0.5">{item.count}</span>
                </div>
              ))
            ) : (
              // Case Stats
              stats && [
                { status: 'Open', count: stats.open, color: 'bg-red-500', icon: AlertCircle },
                { status: 'In Progress', count: stats.inProgress, color: 'bg-blue-500', icon: PlayCircle },
                { status: 'Pending', count: stats.pending, color: 'bg-amber-500', icon: Clock },
                { status: 'Monitoring', count: stats.monitoring, color: 'bg-orange-500', icon: Clock },
                { status: 'Succeed', count: stats.succeed, color: 'bg-emerald-500', icon: CheckCircle2 },
                { status: 'Resolved', count: stats.resolved, color: 'bg-emerald-600', icon: CheckCircle2 },
                { status: 'Closed', count: stats.closed, color: 'bg-zinc-400', icon: XCircle },
              ].filter(item => item.count > 0).map(item => (
                <button
                  key={item.status}
                  onClick={() => handleQuickFilter(item.status)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all border ${filterStatus === item.status
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.color} ${filterStatus === item.status ? 'animate-pulse' : ''}`} />
                  <span>{item.status.split(' ')[0]}</span>
                  <span className="opacity-50 ml-0.5">{item.count}</span>
                </button>
              ))
            )}
          </div>

          {/* Integrated Search & Filter Row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={isInbox ? "Search ticket logs..." : "Search cases..."}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-7 rounded-lg text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all placeholder-zinc-400"
              />
              {localSearch && (
                <button onClick={() => setLocalSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-red-500">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex bg-zinc-100/50 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-8 pl-2 pr-1 bg-transparent border-none text-[9px] font-black uppercase text-zinc-500 dark:text-zinc-400 outline-none cursor-pointer appearance-none"
              >
                <option value="All">Type: All</option>
                {(ticketOptions.types || ['Incident', 'Request', 'Maintenance']).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-500 transition-colors"
                  title="Clear filters"
                >
                  <RefreshCw size={12} />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* LIST AREA */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-zinc-50 dark:bg-[#050505]"
      >
        {currentLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-2 border-zinc-300 border-t-black dark:border-zinc-700 dark:border-t-white rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading...</span>
          </div>
        ) : currentData?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-3">
            <Search size={32} className="text-zinc-300 dark:text-zinc-700" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {hasActiveFilters ? 'No matching items' : (isInbox ? 'No records in Inbox' : 'No incidents yet')}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-bold text-blue-500 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {currentData.slice(0, visibleItems).map((item) => (
              isInbox ? (
                <LogCard
                  key={item.id || item.ticketNumber}
                  log={item}
                  isSelected={selectedLogId === (item.id || item.ticketNumber)}
                  onClick={() => onSelectLog(item)}
                />
              ) : (
                <IncidentCard
                  key={item.id}
                  incident={item}
                  isSelected={selectedId === item.id}
                  onClick={() => onSelect(item.id)}
                  onDelete={onDeleteIncident}
                />
              )
            ))}

            {/* ✅ Observer Target (ตัวล่องหน สำหรับตรวจจับว่าเลื่อนถึงท้ายหรือยัง) */}
            <div ref={observerTarget} className="h-4 w-full" />

            {currentData.length > visibleItems && (
              <div className="py-2 text-center text-[10px] text-zinc-400 animate-pulse">
                Loading more...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}