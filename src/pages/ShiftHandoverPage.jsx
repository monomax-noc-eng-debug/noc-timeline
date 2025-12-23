import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Download, X, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { useShiftLogic } from '../features/handover/hooks/useShiftLogic';
import { useStore } from '../store/useStore';
import ShiftHandoverForm from '../features/handover/ShiftHandoverForm';
import ShiftDetailModal from '../features/handover/components/ShiftDetailModal';
import ShiftLogItem from '../features/handover/components/ShiftLogItem';
import Toast from '../components/ui/Toast';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function ShiftHandoverPage() {
  const { currentUser, nocMembers } = useStore();

  const {
    filteredHistory, loading, saving, stats,
    searchText, setSearchText,
    filterShift, setFilterShift,
    filterStatus, setFilterStatus,
    clearFilters,
    handleSave, handleDelete, handleAcknowledge, handleExportCSV,
    toast, setToast, getAckStats
  } = useShiftLogic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [showFilters, setShowFilters] = useState(false);

  const openForm = (data = null) => {
    setIsEditing(!!data);
    setSelectedData(data);
    setIsModalOpen(true);
  };

  // ✅ Handle form submission with Auto-Acknowledge
  const onFormSubmit = async (formData) => {
    let finalData = { ...formData };

    // New Log: Set timestamp and auto-acknowledge
    if (!isEditing) {
      finalData.timestamp = new Date().toISOString();

      if (currentUser) {
        // Ensure current user is in onDuty
        if (!finalData.onDuty || finalData.onDuty.length === 0) {
          finalData.onDuty = [currentUser];
        } else if (!finalData.onDuty.includes(currentUser)) {
          finalData.onDuty = [...finalData.onDuty, currentUser];
        }

        // ✅ Auto-Acknowledge: Creator appears as acknowledged immediately
        finalData.acknowledgedBy = [currentUser];
      }
    }

    const success = await handleSave(finalData, isEditing, selectedData?.id);
    if (success) setIsModalOpen(false);
  };

  const confirmDelete = async (id) => {
    await handleDelete(id);
    setConfirmModal({ isOpen: false });
  };

  // Check if any filters are active
  const hasActiveFilters = searchText || filterShift !== 'All' || filterStatus !== 'All';

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-black overflow-hidden relative">

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        {...confirmModal}
      />

      {/* Form Modal */}
      <ShiftHandoverForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onFormSubmit}
        initialData={selectedData}
        isEditing={isEditing}
        currentUser={currentUser}
        saving={saving}
      />

      {/* Detail Modal */}
      <ShiftDetailModal
        log={selectedData}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        nocMembers={nocMembers}
      />

      {/* ✨ Premium Header with Gradient */}
      <div className="flex-shrink-0 relative overflow-hidden bg-white dark:bg-[#050505] border-b border-zinc-200 dark:border-zinc-800 z-10 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 dark:from-blue-600/10 dark:to-indigo-600/10" />

        <div className="relative px-4 md:px-8 py-6">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-6">

            {/* Title Block */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                <FileText size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight dark:text-white leading-none">
                  Handover
                </h1>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                  Shift Logs & Acknowledgment
                </p>
              </div>
            </div>

            {/* Stats Cards (Integrated in Header) */}
            <div className="flex flex-wrap gap-3 w-full xl:w-auto">
              <div className="flex-1 min-w-[120px] bg-white dark:bg-black/50 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                  <BarChart3 size={16} />
                </div>
                <div>
                  <div className="text-xl font-black dark:text-white leading-none">{stats.total}</div>
                  <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Total Logs</div>
                </div>
              </div>

              <div className="flex-1 min-w-[120px] bg-white dark:bg-black/50 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{stats.fullyAcked}</div>
                  <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Acked</div>
                </div>
              </div>

              {stats.withIssues > 0 && (
                <div className="flex-1 min-w-[120px] bg-white dark:bg-black/50 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-3 shadow-sm ring-1 ring-red-500/20">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 animate-pulse">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-red-600 dark:text-red-400 leading-none">{stats.withIssues}</div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Issues</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search logs by note, duty staff..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all placeholder:text-zinc-400"
              />
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-2 ${hasActiveFilters
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
              >
                <Filter size={14} />
                <span className="hidden sm:inline">Filter</span>
                {hasActiveFilters && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
              </button>

              <button
                onClick={handleExportCSV}
                className="h-11 w-11 flex items-center justify-center bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                title="Export to CSV"
              >
                <Download size={16} />
              </button>

              <button
                onClick={() => openForm()}
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus size={16} /> <span className="hidden sm:inline">New Log</span>
              </button>
            </div>
          </div>

          {/* Filter Panel (Collapsible) */}
          {showFilters && (
            <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-wrap gap-6 items-center">
                {/* Shift Filter */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Shift Type</span>
                  <div className="flex flex-wrap gap-1">
                    {['All', 'Morning', 'Night'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilterShift(s)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${filterShift === s
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm'
                          : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Status</span>
                  <div className="flex flex-wrap gap-1">
                    {['All', 'Normal', 'Issues'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${filterStatus === s
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm'
                          : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto px-4 py-2 rounded-xl text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 border border-transparent hover:border-red-200 transition-colors flex items-center gap-1"
                  >
                    <X size={14} /> Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-4 pb-20">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-zinc-300 border-t-black dark:border-zinc-700 dark:border-t-white rounded-full animate-spin mb-4" />
              <p className="text-zinc-400 text-xs font-bold uppercase">Loading Logs...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20">
              <FileText size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">
                {hasActiveFilters ? 'No matching logs' : 'No logs found'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-[10px] font-bold uppercase bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredHistory.map(log => (
              <ShiftLogItem
                key={log.id}
                log={log}
                currentUser={currentUser}
                nocMembers={nocMembers}
                getAckStats={getAckStats}
                onView={() => { setSelectedData(log); setIsDetailOpen(true); }}
                onEdit={openForm}
                onDelete={(id) => setConfirmModal({
                  isOpen: true,
                  title: 'Delete Log?',
                  message: 'This action cannot be undone.',
                  isDanger: true,
                  onConfirm: () => confirmDelete(id)
                })}
                onAck={handleAcknowledge}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}