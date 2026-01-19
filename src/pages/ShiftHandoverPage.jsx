import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus, Search, Loader2, Filter, X, Download
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useShiftLogic } from '../features/handover/hooks/useShiftLogic';
import { cn } from "@/lib/utils";
import { parseISO, format } from 'date-fns';
import { ROLES, hasRole } from '../utils/permissions';

// Components
import ShiftHandoverForm from '../features/handover/ShiftHandoverForm';
import ShiftDetailPanel from '../features/handover/components/ShiftDetailPanel';
import { FormModal } from "@/components/FormModal";
import ConfirmModal from '@/components/ui/ConfirmModal';
import { DatePicker } from '../components/forms/DatePicker';
import { formatDateAPI } from '../utils/formatters';
import VirtualizedList from '../components/ui/VirtualizedList';
import FilterBar from '../components/common/FilterBar';

// --- Filter Chip Component ---
const FilterChip = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all border",
      isActive
        ? "bg-[#dde7ee] text-[#0078D4] border-[#0078D4] shadow-sm"
        : "bg-white dark:bg-zinc-900 text-zinc-600 border-zinc-200 dark:border-zinc-700 hover:border-[#0078D4] dark:hover:border-[#0078D4]"
    )}
  >
    {label}
  </button>
);

// --- Compact List Item (Outlook Style) ---
const ShiftListItem = React.memo(({ data: log, onClick, isSelected, currentUser }) => {
  const hasIssues = log.status === 'Issues';
  const isAcked = currentUser && (log.acknowledgedBy || []).includes(currentUser.name);

  let dateDay = '--';
  let dateMonth = '';
  try {
    if (log.date) {
      const parsed = parseISO(log.date);
      dateDay = format(parsed, 'dd');
      dateMonth = format(parsed, 'MMM');
    }
  } catch { /* ignore */ }

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 transition-all",
        isSelected
          ? "bg-[#0078D4]/5 border-l-2 border-l-[#0078D4]"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-900 border-l-2 border-l-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Date Box */}
        <div className={cn(
          "flex flex-col items-center justify-center w-10 h-10 rounded-md border shrink-0 transition-colors",
          hasIssues
            ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-600"
            : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
        )}>
          <span className="text-sm font-bold leading-none">{dateDay}</span>
          <span className="text-[8px] font-bold uppercase text-zinc-500">{dateMonth}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Top Row: Author + Time */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {log.createdBy || 'Unknown'}
            </span>
            <span className="text-[10px] font-medium text-zinc-400">{log.time}</span>
          </div>

          {/* Middle: Note Preview */}
          <p className={cn(
            "text-xs line-clamp-2 leading-relaxed",
            isSelected ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-500 dark:text-zinc-400"
          )}>
            {log.note || <span className="italic opacity-50">No remarks</span>}
          </p>

          {/* Bottom: Badges */}
          <div className="flex items-center gap-2 pt-1">
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
              log.shift === 'Morning'
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400"
                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400"
            )}>
              {log.shift}
            </span>
            {hasIssues ? (
              <span className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Issues
              </span>
            ) : (
              <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Normal
              </span>
            )}
            {isAcked && (
              <span className="text-[9px] font-bold text-[#0078D4]">✓ Acked</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
ShiftListItem.displayName = 'ShiftListItem';

// --- Main Page Component ---
export default function ShiftHandoverPage() {
  const { currentUser } = useStore();
  const canEdit = hasRole(currentUser, [ROLES.LEAD, ROLES.ENGINEER]);

  const {
    filteredHistory,
    loading,
    saving,
    stats,
    filterDate, setFilterDate,
    filterShift, setFilterShift,
    filterStatus, setFilterStatus,
    searchText, setSearchText,
    clearFilters,
    handleSave,
    handleDelete,
    handleExportCSV,
    handleAcknowledge
  } = useShiftLogic();

  // Panel State: 'view' | 'create' | 'edit'
  const [selectedLog, setSelectedLog] = useState(null);
  const [panelMode, setPanelMode] = useState('view');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSelect = useCallback((log) => {
    setSelectedLog(log);
    setPanelMode('view');
  }, []);

  const handleCreateNew = useCallback(() => {
    setSelectedLog(null);
    setPanelMode('create');
  }, []);

  const handleEdit = useCallback((log) => {
    setSelectedLog(log);
    setPanelMode('edit');
  }, []);

  const closePanel = useCallback(() => {
    setSelectedLog(null);
    setPanelMode('view');
  }, []);

  const onFormSubmit = async (formData) => {
    const isEditing = panelMode === 'edit' && selectedLog;
    const success = await handleSave(formData, isEditing, selectedLog?.id);
    if (success) {
      closePanel();
    }
  };

  const onConfirmDelete = () => {
    if (deleteTarget) {
      handleDelete(deleteTarget.id, deleteTarget.images);
      setDeleteTarget(null);
      if (selectedLog?.id === deleteTarget.id) {
        closePanel();
      }
    }
  };

  const renderItem = useCallback((item) => (
    <ShiftListItem
      key={item.id}
      data={item}
      onClick={() => handleSelect(item)}
      isSelected={selectedLog?.id === item.id}
      currentUser={currentUser}
    />
  ), [selectedLog, currentUser, handleSelect]);

  const hasActiveFilters = filterDate || filterShift !== 'All' || filterStatus !== 'All';
  const isPanelOpen = selectedLog !== null || panelMode === 'create';

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-black transition-colors">

      {/* HEADER */}
      <FilterBar
        title="Shift Handovers"
        icon={null}
        searchTerm={searchText}
        onSearch={setSearchText}
        actions={[
          {
            label: 'New',
            icon: Plus,
            onClick: handleCreateNew,
            variant: 'primary',
            disabled: !canEdit,
            hideTextOnMobile: true
          },
          {
            label: 'Export',
            icon: Download,
            onClick: handleExportCSV,
            variant: 'secondary',
            hideTextOnMobile: true
          }
        ]}
        isFilterActive={hasActiveFilters}
        onFilterClick={() => setIsFilterOpen(true)}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: List */}
        <div className={cn(
          "flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] transition-all",
          isPanelOpen ? "hidden lg:flex lg:w-[350px] xl:w-[400px]" : "w-full lg:w-[350px] xl:w-[400px]"
        )}>
          {/* List Header */}
          <div className="shrink-0 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">{stats.total} records</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[10px] font-semibold text-[#0078D4] hover:underline">
                Clear Filters
              </button>
            )}
          </div>

          {/* List Body */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-zinc-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs font-medium">Syncing...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3 text-zinc-300">
                  <Filter size={20} />
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">No logs found</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Try adjusting your filters or create a new handover.</p>
              </div>
            ) : (
              <VirtualizedList
                items={filteredHistory}
                itemHeight={100}
                renderItem={renderItem}
                containerHeight="100%"
              />
            )}
          </div>
        </div>

        {/* RIGHT: Detail / Form Panel */}
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-900 transition-all",
          !isPanelOpen && "hidden lg:flex"
        )}>
          {panelMode === 'view' && selectedLog ? (
            <ShiftDetailPanel
              log={selectedLog}
              onClose={closePanel}
              onEdit={handleEdit}
              onDelete={(log) => setDeleteTarget(log)}
              onAcknowledge={handleAcknowledge}
              currentUser={currentUser}
            />
          ) : (panelMode === 'create' || panelMode === 'edit') ? (
            <ShiftHandoverForm
              onSubmit={onFormSubmit}
              initialData={selectedLog}
              isEditing={panelMode === 'edit'}
              currentUser={currentUser}
              saving={saving}
              onCancel={closePanel}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
              <p className="text-sm font-medium">Select a log to view details</p>
              <p className="text-xs mt-1">or create a new handover</p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE: Bottom Sheet for Panel */}
      {isPanelOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full max-h-[90vh] bg-white dark:bg-zinc-900 rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {panelMode === 'view' && selectedLog ? (
              <ShiftDetailPanel
                log={selectedLog}
                onClose={closePanel}
                onEdit={handleEdit}
                onDelete={(log) => setDeleteTarget(log)}
                onAcknowledge={handleAcknowledge}
                currentUser={currentUser}
              />
            ) : (
              <ShiftHandoverForm
                onSubmit={onFormSubmit}
                initialData={selectedLog}
                isEditing={panelMode === 'edit'}
                currentUser={currentUser}
                saving={saving}
                onCancel={closePanel}
              />
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      <FormModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        size="sm"
        header={
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-zinc-900">Filters</span>
            <button onClick={() => setIsFilterOpen(false)}><X size={18} className="text-zinc-400" /></button>
          </div>
        }
        footer={
          <button onClick={() => setIsFilterOpen(false)} className="w-full py-3 bg-zinc-900 text-white rounded-lg text-xs font-bold uppercase">Done</button>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Date</label>
            <DatePicker
              date={filterDate ? parseISO(filterDate) : undefined}
              setDate={(d) => setFilterDate(d ? formatDateAPI(d) : '')}
              className="w-full bg-zinc-50 border-zinc-200"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Shift</label>
            <div className="flex gap-2">
              {['All', 'Morning', 'Night'].map(s => <FilterChip key={s} label={s} isActive={filterShift === s} onClick={() => setFilterShift(s)} />)}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Status</label>
            <div className="flex gap-2">
              {['All', 'Normal', 'Issues'].map(s => <FilterChip key={s} label={s} isActive={filterStatus === s} onClick={() => setFilterStatus(s)} />)}
            </div>
          </div>
        </div>
      </FormModal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
        title="Delete Log"
        message="Are you sure you want to remove this handover log? Associated images will also be deleted."
        isDanger
      />
    </div>
  );
}