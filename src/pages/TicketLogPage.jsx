// src/pages/TicketLogPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText, Activity, User, Calendar,
  ArrowDownCircle, Loader2, Hash, RefreshCw,
  DownloadCloud, CheckCircle2, Search, Filter, X,
  ArrowRight, ShieldAlert, Zap, Globe
} from 'lucide-react';
import { parse, isValid, format, addYears } from 'date-fns';
import Papa from 'papaparse';

import { useTicketLog } from '../features/ticket/hooks/useTicketLog';
import { ticketLogService } from '../services/ticketLogService';
import { incidentService } from '../services/incidentService';
import { useStore } from '../store/useStore';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

// --- Utility Functions ---
const parseDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString();
  const cleanStr = dateStr.trim();
  let parsedDate = parse(cleanStr, 'd/M/yy', new Date());
  if (isValid(parsedDate)) {
    if (parsedDate.getFullYear() < 2000) {
      parsedDate = addYears(parsedDate, 100);
      if (parsedDate.getFullYear() < 2000) {
        parsedDate.setFullYear(2000 + parseInt(cleanStr.split(/[-/]/)[2]));
      }
    }
    return parsedDate.toISOString();
  }
  parsedDate = parse(cleanStr, 'd/M/yyyy', new Date());
  if (isValid(parsedDate)) return parsedDate.toISOString();
  const stdDate = new Date(cleanStr);
  if (!isNaN(stdDate.getTime())) return stdDate.toISOString();
  return new Date().toISOString();
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'open': return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'in progress': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'succeed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'resolved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'closed': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
  }
};

// --- Main Component ---
export default function TicketLogPage() {
  const { logs, loading, loadingMore, hasMore, loadMore, stats } = useTicketLog();
  const { toast } = useToast();
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  const SHEET_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

  const handleAddToIncidents = async (log, e) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      toast({ variant: "destructive", title: "Auth Required", description: "Please login first." });
      return;
    }

    try {
      // Map Log fields to Incident fields
      const incidentData = {
        subject: log.shortDesc || log.details || 'New Incident from Log',
        ticket: log.ticketNumber || '',
        project: 'MONOMAX',
        type: ['Incident', 'Request', 'Maintenance'].includes(log.type) ? log.type : 'Incident',
        status: ['Open', 'In Progress', 'Pending', 'Monitoring', 'Succeed', 'Resolved', 'Closed'].includes(log.status) ? log.status : 'Open',
        createdBy: currentUser,
        impact: '',
        root_cause: log.details || '',
        action: log.action || ''
      };

      const newDoc = await incidentService.createIncident(incidentData);

      toast({
        title: "Successfully Added",
        description: `Ticket #${log.ticketNumber} is now in Incidents.`,
        action: (
          <button
            onClick={() => navigate('/incidents')}
            className="px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-[9px] font-black uppercase tracking-widest"
          >
            Go Now
          </button>
        )
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add to incidents." });
    }
  };

  const handleSyncSheet = async () => {
    if (!SHEET_CSV_URL) {
      toast({ variant: "destructive", title: "Config Error", description: "Missing URL in .env" });
      return;
    }
    try {
      setIsSyncing(true);
      const response = await fetch(SHEET_CSV_URL);
      if (!response.ok) throw new Error("Failed to fetch CSV");
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        complete: async (results) => {
          const sheetData = results.data.map(item => ({
            ticketNumber: item['Ticket Number'] || item['Ticket No'] || '',
            shortDesc: item['Short Description & Detail'] || item['Detail'] || item['Description'] || '',
            status: item['Status'] || 'Open',
            type: item['Ticket Type'] || 'Incident',
            assign: item['Assign'] || 'Unassigned',
            details: item['Detail'] || '',
            action: item['Ation'] || item['Action'] || '',
            resolvedDetail: item['Resolved detail'] || '',
            remark: item['Remark'] || '',
            date: parseDate(item['Date']),
            createdAt: parseDate(item['Date'])
          })).filter(item => item.ticketNumber);

          const dataToUpdate = sheetData.filter(newItem => {
            const oldItem = logs.find(l => l.ticketNumber === newItem.ticketNumber);
            if (!oldItem) return true;
            return oldItem.status !== newItem.status || oldItem.shortDesc !== newItem.shortDesc || oldItem.assign !== newItem.assign || oldItem.action !== newItem.action;
          });

          if (dataToUpdate.length > 0) {
            await ticketLogService.importLogsFromSheet(dataToUpdate);
            toast({ title: "Sync Completed", description: `Updated ${dataToUpdate.length} records.` });
          } else {
            toast({ title: "Up to Date", description: "No changes found." });
          }
          setIsSyncing(false);
        },
        error: () => setIsSyncing(false)
      });
    } catch (error) {
      console.error(error);
      setIsSyncing(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const result = logs.filter(log => {
      const matchesSearch = log.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
      const matchesType = filterType === 'All' || log.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
    return result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [logs, searchTerm, filterStatus, filterType]);

  return (
    <div className="flex flex-col h-full bg-[#fdfdfd] dark:bg-[#050505] transition-colors duration-500">

      {/* COMPACT OPERATIONAL HEADER */}
      <div className="shrink-0 pt-6 pb-3 px-6 bg-white dark:bg-[#080808] border-b border-zinc-100 dark:border-zinc-900 shadow-sm z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="px-2 py-0.5 rounded bg-black dark:bg-white text-[8px] font-black text-white dark:text-black uppercase tracking-widest">System</div>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{stats.total} Records</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">Operational <span className="text-zinc-300 dark:text-zinc-800">Logs</span></h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncSheet}
                disabled={isSyncing || loading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${isSyncing ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'}`}
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={12} /> : <DownloadCloud size={12} />}
                {isSyncing ? 'Syncing' : 'Sync Data'}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-2">
            {/* Compact Search */}
            <div className="flex-1 relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search ticket, desc, assign..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-9 bg-zinc-50 dark:bg-white/[0.01] border border-zinc-100 dark:border-zinc-800/50 rounded-xl text-[10px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-inner"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Compact Filter Pills */}
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-white/[0.01] p-1 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center px-3 gap-1.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-200 dark:border-zinc-800">
                <Filter size={10} />
                Filter
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-[8px] font-black uppercase px-2 outline-none cursor-pointer text-zinc-500 hover:text-black transition-colors"
              >
                <option value="All">Status</option>
                {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-[8px] font-black uppercase px-2 outline-none cursor-pointer text-zinc-500 hover:text-black transition-colors"
              >
                <option value="All">Type</option>
                <option value="Incident">Incident</option>
                <option value="Request">Request</option>
              </select>
            </div>
          </div>
        </div>
      </div>


      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
              <div className="w-12 h-12 border-4 border-zinc-100 border-t-black dark:border-t-white rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Initializing Logs</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-6 text-zinc-300 dark:text-zinc-800">
              <Globe size={80} strokeWidth={1} />
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest mb-2">No records found</p>
                <button onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterType('All'); }} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-all">Reset Database View</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <LogItem
                  key={log.id}
                  log={log}
                  onClick={() => setSelectedLog(log)}
                  onSendToIncident={(e) => handleAddToIncidents(log, e)}
                />
              ))}

              {hasMore && (
                <div className="pt-12 pb-24 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="group flex flex-col items-center gap-3 text-zinc-400 hover:text-black dark:hover:text-white transition-all disabled:opacity-30"
                  >
                    <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {loadingMore ? <Loader2 className="animate-spin" size={16} /> : <ArrowDownCircle size={16} />}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Load Archived Logs</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedLog && (
        <TicketDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onSendToIncident={() => handleAddToIncidents(selectedLog)}
        />
      )}

    </div>
  );
}

// LogItem Component
function LogItem({ log, onClick, onSendToIncident }) {
  const dateObj = log.createdAt ? new Date(log.createdAt) : null;
  const day = dateObj ? dateObj.getDate() : '-';
  const month = dateObj ? dateObj.toLocaleDateString('en-GB', { month: 'short' }) : '-';

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-[#0a0a0a] rounded-xl border border-zinc-100 dark:border-zinc-900 p-3 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer"
    >
      <div className="flex gap-4 items-center">
        {/* Compact Date Box */}
        <div className="flex flex-col items-center justify-center w-10 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-lg shrink-0 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
          <span className="text-[7px] font-black uppercase leading-none opacity-60 tracking-tighter">{month}</span>
          <span className="text-sm font-black leading-none mt-0.5 tracking-tighter">{day}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[9px] font-mono font-black text-blue-500 bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">
              #{log.ticketNumber}
            </span>
            <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getStatusColor(log.status)}`}>
              {log.status}
            </span>
            <div className="h-2.5 w-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{log.type}</span>
          </div>

          <p className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1 leading-tight mb-1">
            {log.shortDesc || log.details || 'No Operational Description'}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-zinc-400">
              <User size={8} strokeWidth={4} />
              <span className="text-[8px] font-black uppercase tracking-tight">{log.assign || 'UNASSIGNED'}</span>
            </div>
          </div>
        </div>

        {/* Improved Action Block */}
        <div className="shrink-0">
          <button
            onClick={onSendToIncident}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-white hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all active:scale-95 group/btn"
          >
            <Zap size={12} className="group-hover/btn:fill-current" />
            <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Incident</span>
          </button>
        </div>
      </div>
    </div>
  );
}


// Modal Component
function TicketDetailModal({ log, onClose, onSendToIncident }) {
  if (!log) return null;
  const dateStr = log.createdAt ? format(new Date(log.createdAt), 'dd MMMM yyyy') : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-[32px] shadow-2xl border border-zinc-100 dark:border-zinc-900 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="px-10 py-8 bg-zinc-50/50 dark:bg-white/[0.02] border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-blue-500 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">Ticket Log</div>
              <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">#{log.ticketNumber}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Calendar size={12} className="text-zinc-300" /> {dateStr}</span>
              <div className="h-1 w-1 rounded-full bg-zinc-300" />
              <span className="flex items-center gap-1.5"><ShieldAlert size={12} className="text-zinc-300" /> {log.type}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:scale-110 active:scale-95 text-zinc-400 hover:text-black dark:hover:text-white transition-all"><X size={20} /></button>
        </div>

        <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
          {/* Detail Grid */}
          <div className="space-y-8">
            <div>
              <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4">Description & Operational Details</h3>
              <div className="p-6 bg-zinc-50 dark:bg-white/[0.01] rounded-[24px] border border-zinc-100 dark:border-zinc-900/50 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap shadow-inner font-mono">
                {log.details || log.shortDesc}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Activity size={14} className="text-blue-500" /> Action Taken</h3>
                <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">{log.action || 'No action recorded'}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Resolution</h3>
                <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">{log.resolvedDetail || 'Resolution pending'}</p>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-10 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex gap-10">
              <div>
                <span className="block text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.2em] mb-1.5">Lead Assignee</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[9px] font-black">{log.assign?.[0] || 'U'}</div>
                  <span className="text-xs font-black uppercase text-zinc-700 dark:text-zinc-300 tracking-tight">{log.assign || 'UNASSIGNED'}</span>
                </div>
              </div>
              <div>
                <span className="block text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.2em] mb-1.5">Operational Remark</span>
                <span className="text-xs font-bold text-zinc-400">{log.remark || 'N/A'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onSendToIncident();
                onClose();
              }}
              className="group flex items-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 dark:shadow-white/10 active:scale-95 transition-all hover:opacity-90"
            >
              <Zap size={16} className="fill-current" />
              Transfer to Incidents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}