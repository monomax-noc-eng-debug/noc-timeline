// src/pages/ShiftHandoverPage.jsx
import React, { useState } from 'react';
import {
  FileText, Plus, Search, Filter, Download,
  X, Loader2, LayoutPanelTop
} from 'lucide-react';

// ✅ Import Hook Logic หลัก (Path ถูกต้อง)
import { useShiftLogic } from '../features/handover/hooks/useShiftLogic';
import { useStore } from '../store/useStore';
import ShiftHandoverForm from '../features/handover/ShiftHandoverForm';
import ShiftDetailModal from '../features/handover/components/ShiftDetailModal';
import ShiftLogItem from '../features/handover/components/ShiftLogItem';
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
    getAckStats
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

  const onFormSubmit = async (formData) => {
    let finalData = { ...formData };
    if (!isEditing) {
      finalData.timestamp = new Date().toISOString();
      if (currentUser) {
        // ดึงชื่อถ้าเป็น Object
        const currentUserName = currentUser.name || currentUser;

        if (!finalData.onDuty?.includes(currentUserName)) {
          finalData.onDuty = [...(finalData.onDuty || []), currentUserName];
        }
        finalData.acknowledgedBy = [currentUserName];
      }
    }
    const success = await handleSave(finalData, isEditing, selectedData?.id);
    if (success) setIsModalOpen(false);
  };

  const hasActiveFilters = searchText || filterShift !== 'All' || filterStatus !== 'All';

  return (
    <div className="flex flex-col h-full bg-[#fafafa] dark:bg-black transition-colors duration-300 overflow-hidden">

      {/* Header & Controls ... (ส่วน UI คงเดิม) */}
      <header className="shrink-0 px-4 py-3 md:px-6 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800 z-20 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-none">Shift Transfer</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{stats.fullyAcked} Acked</span>
                </div>
                {stats.withIssues > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">{stats.withIssues} Issues</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-emerald-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-sm active:scale-95"
              title="Export CSV"
            >
              <Download size={16} />
            </button>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <button onClick={() => openForm()} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase hover:opacity-90 active:scale-95 transition-all shadow-md">
              <Plus size={14} /> New Log
            </button>
          </div>
        </div>
      </header>

      <div className="shrink-0 px-4 md:px-6 py-3 bg-white/50 dark:bg-[#050505]/50 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input
              type="text"
              placeholder="SEARCH LOGS OR DUTY STAFF..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-zinc-100 dark:bg-zinc-900 border-none rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-zinc-400"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={`h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border ${hasActiveFilters ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}>
              <Filter size={14} /> Filters {hasActiveFilters && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-colors"><X size={14} /></button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="max-w-[1400px] mx-auto mt-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-4 animate-in slide-in-from-top-2">
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Shift</span>
              <div className="flex gap-1">
                {['All', 'Morning', 'Night'].map(s => (
                  <button key={s} onClick={() => setFilterShift(s)} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${filterShift === s ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Status</span>
              <div className="flex gap-1">
                {['All', 'Normal', 'Issues'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${filterStatus === s ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Synchronizing Logs...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-white/50 dark:bg-white/[0.02]">
              <LayoutPanelTop size={48} className="text-zinc-200 dark:text-zinc-800 mb-4" strokeWidth={1} />
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">No transfer logs found</p>
            </div>
          ) : (
            <div className="space-y-2 pb-20">
              {filteredHistory.map(log => (
                <ShiftLogItem
                  key={log.id}
                  log={log}
                  // ✅ ส่งเฉพาะชื่อ (String)
                  currentUser={currentUser?.name || currentUser}
                  nocMembers={nocMembers}
                  getAckStats={getAckStats}
                  onView={() => { setSelectedData(log); setIsDetailOpen(true); }}
                  onEdit={openForm}
                  onDelete={(id) => setConfirmModal({
                    isOpen: true,
                    title: 'Delete Log?',
                    message: 'Are you sure? This action is permanent.',
                    isDanger: true,
                    onConfirm: () => { handleDelete(id); setConfirmModal({ isOpen: false }); }
                  })}
                  onAck={handleAcknowledge}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ShiftHandoverForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onFormSubmit}
        initialData={selectedData}
        isEditing={isEditing}
        currentUser={currentUser}
        saving={saving}
      />

      <ShiftDetailModal
        log={selectedData}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        nocMembers={nocMembers}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        {...confirmModal}
      />
    </div>
  );
}