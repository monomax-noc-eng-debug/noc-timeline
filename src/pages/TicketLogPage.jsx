import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  Activity, User, Calendar, ArrowDownCircle, Loader2, DownloadCloud,
  CheckCircle2, Search, Filter, X, ShieldAlert, Zap, Globe, Plus,
  Edit, Trash2, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useTicketLog } from '../features/ticket/hooks/useTicketLog';
import { useTicketAutoSync } from '../features/ticket/hooks/useTicketAutoSync';
import { incidentService } from '../services/incidentService';
import { ticketLogService } from '../services/ticketLogService';
import { useStore } from '../store/useStore';
import { useTicketOptions } from '../hooks/useTicketOptions';
import { useToast } from "@/hooks/use-toast";

import TicketSyncModal from '../features/ticket/components/TicketSyncModal';
import TicketLogFormModal from '../features/ticket/components/TicketLogFormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

// --- Utility Functions ---
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'open': return 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50';
    case 'pending': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
    case 'succeed': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
    default: return 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-zinc-200 dark:border-zinc-800';
  }
};

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'text-red-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-blue-500';
    case 'low': return 'text-emerald-500';
    default: return 'text-zinc-400';
  }
};

// --- Memoized LogItem Component ---
const LogItem = memo(({ log, onClick, onSendToIncident, onEdit, onDelete }) => {
  const dateObj = log.createdAt ? new Date(log.createdAt) : null;
  const day = dateObj ? dateObj.getDate() : '-';
  const month = dateObj ? dateObj.toLocaleDateString('en-GB', { month: 'short' }) : '-';

  const handleIncidentClick = useCallback((e) => {
    e.stopPropagation();
    onSendToIncident(log, e);
  }, [onSendToIncident, log]);

  const handleEditClick = useCallback((e) => {
    e.stopPropagation();
    onEdit(log);
  }, [onEdit, log]);

  const handleDeleteClick = useCallback((e) => {
    e.stopPropagation();
    onDelete(log.ticketNumber);
  }, [onDelete, log.ticketNumber]);

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 p-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
    >
      <div className="flex gap-3 items-center">
        {/* Date Badge */}
        <div className="flex flex-col items-center justify-center w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-lg shrink-0 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
          <span className="text-[8px] font-bold uppercase leading-none opacity-60">{month}</span>
          <span className="text-sm font-black leading-none">{day}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">#{log.ticketNumber}</span>
            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${getStatusColor(log.status)}`}>{log.status}</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-[9px] font-medium text-zinc-400">{log.type}</span>
          </div>

          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200 line-clamp-1 leading-snug">
            {log.shortDesc || log.details || 'No Description'}
          </p>

          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-zinc-400">
              <User size={10} />
              <span className="text-[9px] font-medium">{log.assign || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle size={10} className={getSeverityColor(log.severity)} />
              <span className={`text-[9px] font-medium ${getSeverityColor(log.severity)}`}>{log.severity || 'Low'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 flex items-center gap-1">
          <button
            onClick={handleEditClick}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={handleIncidentClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 dark:hover:bg-white dark:hover:text-black transition-colors active:scale-95"
            title="Add to Timeline"
          >
            <Zap size={12} />
            <span className="text-[9px] font-bold hidden sm:inline">Incident</span>
          </button>
        </div>
      </div>
    </div>
  );
});
LogItem.displayName = 'LogItem';

// --- Memoized TicketDetailModal Component ---
const TicketDetailModal = memo(({ log, onClose, onSendToIncident, onEdit, onDelete }) => {
  if (!log) return null;
  const dateStr = log.createdAt ? format(new Date(log.createdAt), 'dd MMM yyyy') : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh] shadow-xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded">TICKET</span>
              <span className="text-xl font-black text-zinc-900 dark:text-white">#{log.ticketNumber}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1"><Calendar size={11} /> {dateStr}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><ShieldAlert size={11} /> {log.type}</span>
              <span>•</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getStatusColor(log.status)}`}>{log.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onEdit} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-400 hover:bg-blue-500 hover:text-white transition-colors">
              <Edit size={14} />
            </button>
            <button onClick={onDelete} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-400 hover:bg-red-500 hover:text-white transition-colors">
              <Trash2 size={14} />
            </button>
            <button onClick={onClose} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
              <span className="text-[9px] font-bold uppercase text-zinc-400 block">Severity</span>
              <span className={`text-sm font-bold ${getSeverityColor(log.severity)}`}>{log.severity || 'Low'}</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
              <span className="text-[9px] font-bold uppercase text-zinc-400 block">Category</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{log.category || '-'}</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
              <span className="text-[9px] font-bold uppercase text-zinc-400 block">Sub Category</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{log.subCategory || '-'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[10px] font-bold uppercase text-zinc-400 mb-2 tracking-wide">Description</h3>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono">
              {log.details || log.shortDesc || 'No details available'}
            </div>
          </div>

          {/* Action & Resolution */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-[10px] font-bold uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
                <Activity size={12} className="text-blue-500" /> Action Taken
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{log.action || 'No action recorded'}</p>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" /> Resolution
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{log.resolvedDetail || 'Pending'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold">
              {log.assign?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase text-zinc-400">Assignee</div>
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{log.assign || 'Unassigned'}</div>
            </div>
          </div>
          <button
            onClick={() => { onSendToIncident(); onClose(); }}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            <Zap size={14} /> Add to Timeline
          </button>
        </div>
      </div>
    </div>
  );
});
TicketDetailModal.displayName = 'TicketDetailModal';

// --- Main Component ---
export default function TicketLogPage() {
  const { logs, loading, loadingMore, hasMore, loadMore, stats } = useTicketLog();
  const { toast } = useToast();
  const { currentUser } = useStore();
  const { ticketOptions } = useTicketOptions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  // CRUD States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useTicketAutoSync(logs);

  const openCreateModal = useCallback(() => {
    setEditingTicket(null);
    setIsFormOpen(true);
  }, []);

  const openEditModal = useCallback((log) => {
    setEditingTicket(log);
    setIsFormOpen(true);
  }, []);

  const handleCreateOrUpdate = useCallback(async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTicket) {
        await ticketLogService.updateLog(editingTicket.ticketNumber, formData);
        toast({ title: "Updated", description: "Ticket updated successfully." });
      } else {
        await ticketLogService.createLog(formData);
        toast({ title: "Created", description: "New ticket created." });
      }
      queryClient.invalidateQueries(['ticketLogs']);
      setIsFormOpen(false);
      setEditingTicket(null);
      setSelectedLog(null);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }, [editingTicket, queryClient, toast]);

  const confirmDelete = useCallback((ticketId) => {
    setDeleteId(ticketId);
  }, []);

  const executeDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await ticketLogService.deleteLog(deleteId);
      toast({ title: "Deleted", description: "Ticket deleted." });
      queryClient.invalidateQueries(['ticketLogs']);
      setSelectedLog(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setDeleteId(null);
    }
  }, [deleteId, queryClient, toast]);

  const handleAddToIncidents = useCallback(async (log, e) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      toast({ variant: "destructive", title: "Auth Required", description: "Please login first." });
      return;
    }

    try {
      const creatorData = typeof currentUser === 'object' && currentUser !== null
        ? { name: currentUser.name, id: currentUser.id, role: currentUser.role }
        : { name: currentUser };

      const incidentData = {
        subject: log.shortDesc || log.details || 'New Incident from Log',
        ticket: log.ticketNumber || '',
        project: 'MONOMAX',
        type: ['Incident', 'Request', 'Maintenance'].includes(log.type) ? log.type : 'Incident',
        status: 'Open',
        createdBy: creatorData,
        impact: '',
        root_cause: log.details || '',
        action: log.action || ''
      };

      await incidentService.createIncident(incidentData);

      toast({
        title: "Successfully Added",
        description: `Ticket #${log.ticketNumber} is now in Ticket Timeline.`,
        action: (
          <button
            onClick={() => navigate('/incidents')}
            className="px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded text-[9px] font-bold"
          >
            Go Now
          </button>
        )
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add to ticket timeline." });
    }
  }, [currentUser, navigate, toast]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.shortDesc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
      const matchesType = filterType === 'All' || log.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [logs, searchTerm, filterStatus, filterType]);

  const handleLogClick = useCallback((log) => {
    setSelectedLog(log);
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 transition-colors">

      {/* HEADER */}
      <div className="shrink-0 py-4 px-5 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-1.5 py-0.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[8px] font-bold rounded">SYSTEM</span>
                <span className="text-[10px] font-bold text-blue-500">{stats.total} Records</span>
              </div>
              <h1 className="text-lg font-black text-zinc-900 dark:text-white">Ticket Log</h1>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={openCreateModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 active:scale-95 transition-all">
                <Plus size={12} /> New
              </button>
              <button onClick={() => setIsSyncModalOpen(true)} disabled={loading} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all">
                <DownloadCloud size={12} /> Sync
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-9 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <Filter size={12} className="text-zinc-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-xs font-medium outline-none cursor-pointer text-zinc-600 dark:text-zinc-300"
              >
                <option value="All">All Status</option>
                {ticketOptions.statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-xs font-medium outline-none cursor-pointer text-zinc-600 dark:text-zinc-300"
              >
                <option value="All">All Types</option>
                {ticketOptions.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
              <div className="w-10 h-10 border-3 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
              <span className="text-xs font-medium text-zinc-400">Loading tickets...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-zinc-300 dark:text-zinc-700">
              <Globe size={60} strokeWidth={1} />
              <div className="text-center">
                <p className="text-sm font-medium mb-2">No records found</p>
                <button
                  onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterType('All'); }}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <LogItem
                  key={log.id}
                  log={log}
                  onClick={() => handleLogClick(log)}
                  onSendToIncident={handleAddToIncidents}
                  onEdit={openEditModal}
                  onDelete={confirmDelete}
                />
              ))}

              {hasMore && (
                <div className="pt-8 pb-16 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="flex flex-col items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-40"
                  >
                    <div className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:scale-105 transition-transform">
                      {loadingMore ? <Loader2 className="animate-spin" size={16} /> : <ArrowDownCircle size={16} />}
                    </div>
                    <span className="text-[10px] font-medium">Load More</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {selectedLog && (
        <TicketDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onSendToIncident={() => handleAddToIncidents(selectedLog)}
          onEdit={() => openEditModal(selectedLog)}
          onDelete={() => confirmDelete(selectedLog.ticketNumber)}
        />
      )}

      <TicketLogFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingTicket}
        onSubmit={handleCreateOrUpdate}
        isSubmitting={isSubmitting}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Delete Confirmation"
        message={`Are you sure you want to delete ticket #${deleteId}? This action cannot be undone.`}
        isDanger={true}
      />

      <TicketSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentLogs={logs}
        onSyncComplete={(count) => {
          toast({ title: "Sync Completed", description: `Updated ${count} records.` });
          queryClient.invalidateQueries({ queryKey: ['ticketLogs'] });
          setIsSyncModalOpen(false);
        }}
      />
    </div>
  );
}