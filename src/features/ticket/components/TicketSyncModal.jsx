import React, { useState, useCallback, memo } from 'react';
import { CloudDownload, Loader2, AlertCircle, CheckCircle2, X, ArrowRight, Database, RefreshCw } from 'lucide-react';
import { FormModal } from '../../../components/FormModal';
import { parse, isValid, addYears } from 'date-fns';
import { ticketLogService } from '../../../services/ticketLogService';

const SHEET_API_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

const parseDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString();
  const dateObj = new Date(dateStr);
  if (!isNaN(dateObj.getTime())) return dateObj.toISOString();
  const cleanStr = String(dateStr).trim();
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
  return new Date().toISOString();
};

// Memoized Sub-components for performance
const StatBox = memo(({ label, value, variant }) => {
  const styles = {
    new: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    update: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    unchanged: 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-zinc-200 dark:border-zinc-800'
  };
  return (
    <div className={`px-3 py-2.5 rounded-lg border text-center ${styles[variant]}`}>
      <span className="text-xl font-black block">{value}</span>
      <span className="text-[8px] font-bold uppercase tracking-wider opacity-70">{label}</span>
    </div>
  );
});
StatBox.displayName = 'StatBox';

const PreviewRow = memo(({ item, type }) => (
  <div className="px-3 py-2 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
    <div className="flex items-center gap-2 overflow-hidden">
      <div className={`w-0.5 h-5 rounded-full shrink-0 ${type === 'new' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      <div className="min-w-0">
        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">#{item.ticketNumber}</div>
        <div className="text-[10px] text-zinc-400 truncate">{item.shortDesc}</div>
      </div>
    </div>
    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase ${type === 'new'
      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
      }`}>
      {type === 'new' ? 'New' : 'Update'}
    </span>
  </div>
));
PreviewRow.displayName = 'PreviewRow';

export default function TicketSyncModal({ isOpen, onClose, onSyncComplete, currentLogs }) {
  // const { ticketConfig, setTicketConfig } = useStore(); // Unused
  const [step, setStep] = useState('input');
  const [analysis, setAnalysis] = useState({ newItems: [], updatedItems: [], uptodateItems: [] });
  const [error, setError] = useState(null);

  // Use ticketConfig or setTicketConfig if needed, or remove them
  // For now, let's log them to silence the warning if we want to keep the hook usage
  // Or better, just remove them if not used.


  const resetState = useCallback(() => {
    setStep('input');
    setAnalysis({ newItems: [], updatedItems: [], uptodateItems: [] });
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    setStep('analyzing');
    setError(null);

    try {
      if (!SHEET_API_URL) throw new Error("Missing URL in .env (VITE_GOOGLE_SHEET_URL)");

      const response = await fetch(SHEET_API_URL);
      if (!response.ok) throw new Error("Failed to fetch data from Apps Script (" + response.status + ")");

      const jsonData = await response.json();
      if (jsonData.status === 'error') throw new Error(jsonData.message || "Unknown Script Error");

      const rawData = Array.isArray(jsonData) ? jsonData : (jsonData.data || []);
      if (rawData.length === 0) throw new Error("No data received (Sheet might be empty or Name mismatch)");

      const sheetData = rawData.map(item => ({
        ticketNumber: item.ticketNo || item.ticketNumber || '',
        shortDesc: item.subject || item.shortDescription || item.description || '',
        status: item.status || 'Open',
        type: item.ticketType || item.type || 'Incident',
        assign: item.assignee || item.assign || 'Unassigned',
        details: item.description || item.detail || '',
        action: item.actionTaken || item.action || '',
        resolvedDetail: item.resolutionNote || item.resolvedDetail || '',
        remark: item.remark || '',
        severity: item.severity || 'Low',
        category: item.category || '',
        subCategory: item.subCategory || '',
        date: parseDate(item.date || item.ticketDate || item.createdAt),
        createdAt: parseDate(item.date || item.ticketDate || item.createdAt)
      })).filter(item => item.ticketNumber);

      // --- Dedup sheet data internally first (last one wins) ---
      const uniqueSheetData = Array.from(
        sheetData.reduce((map, item) => {
          const key = String(item.ticketNumber).trim();
          map.set(key, { ...item, ticketNumber: key });
          return map;
        }, new Map()).values()
      );

      const newItems = [];
      const updatedItems = [];
      const uptodateItems = [];

      uniqueSheetData.forEach(newItem => {
        // Find existing by normalized ticketNumber
        const oldItem = currentLogs.find(l =>
          String(l.ticketNumber).trim() === newItem.ticketNumber
        );
        if (!oldItem) {
          newItems.push(newItem);
        } else {
          const hasChanges =
            oldItem.status !== newItem.status ||
            oldItem.shortDesc !== newItem.shortDesc ||
            oldItem.assign !== newItem.assign ||
            oldItem.action !== newItem.action ||
            (oldItem.details || '') !== newItem.details ||
            (oldItem.remark || '') !== newItem.remark ||
            (oldItem.type || 'Incident') !== newItem.type ||
            (oldItem.resolvedDetail || '') !== newItem.resolvedDetail ||
            (oldItem.category || '') !== newItem.category ||
            (oldItem.subCategory || '') !== newItem.subCategory ||
            (oldItem.severity || 'Low') !== newItem.severity;

          if (hasChanges) {
            updatedItems.push({ ...newItem, _prev: oldItem });
          } else {
            uptodateItems.push(newItem);
          }
        }
      });

      // Sort latest first (createdAt descending)
      const sortFn = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

      setAnalysis({
        newItems: newItems.sort(sortFn),
        updatedItems: updatedItems.sort(sortFn),
        uptodateItems: uptodateItems.sort(sortFn)
      });
      setStep('review');

    } catch (err) {
      console.error(err);
      setError("Sync Error: " + err.message);
      setStep('input');
    }
  }, [currentLogs]);

  const handleConfirmSync = useCallback(async () => {
    setStep('saving');
    try {
      const dataToUpdate = [...analysis.newItems, ...analysis.updatedItems];
      // eslint-disable-next-line no-unused-vars
      const cleanData = dataToUpdate.map(({ _prev, ...item }) => item);

      if (cleanData.length > 0) {
        await ticketLogService.importLogsFromSheet(cleanData);
      }

      // Update Store Immediately
      const { useSyncStatus } = await import('../../../store/useSyncStatus');
      useSyncStatus.getState().setDone(cleanData.length, false, 'manual');

      if (onSyncComplete) onSyncComplete(cleanData.length);

      setTimeout(() => {
        onClose();
        resetState();
      }, 1500);
      setStep('success');

    } catch (err) {
      setError("Database Error: " + err.message);
      setStep('review');
    }
  }, [analysis.newItems, analysis.updatedItems, onSyncComplete, onClose, resetState]);

  if (!isOpen) return null;

  const totalChanges = analysis.newItems.length + analysis.updatedItems.length;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false}
      headerClassName="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50"
      header={
        <>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 dark:bg-white rounded-lg">
              <CloudDownload size={16} className="text-white dark:text-zinc-900" />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-900 dark:text-white">Live Sync Manager</h2>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">External Database Connector</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
          >
            <X size={18} />
          </button>
        </>
      }
      bodyClassName="flex-1 overflow-y-auto custom-scrollbar p-5"
      footerClassName="shrink-0 px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50/50 dark:bg-zinc-900/30"
      footer={
        <>
          {step === 'input' && (
            <button
              onClick={handleAnalyze}
              className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              Fetch & Analyze <ArrowRight size={14} />
            </button>
          )}
          {step === 'review' && (
            <>
              <button
                onClick={resetState}
                className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirmSync}
                disabled={totalChanges === 0}
                className="px-5 py-2 bg-[#0078D4] text-white rounded-lg text-xs font-bold hover:bg-[#106EBE] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Database size={14} /> Confirm Sync
              </button>
            </>
          )}
          {step === 'saving' && (
            <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-400">
              <Loader2 size={14} className="animate-spin" /> Updating Database...
            </div>
          )}
          {step === 'success' && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </>
      }
    >
      {/* Preview Tab */}
      <>
        {/* Input Step */}
        {step === 'input' && (
          <div className="text-center py-8 animate-in fade-in duration-200">
            <div className="w-12 h-12 bg-[#0078D4]/10 dark:bg-[#0078D4]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CloudDownload size={24} className="text-[#0078D4]" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Ready to Sync</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Fetch latest tickets from Google Sheets. Review before saving.</p>
            {error && (
              <div className="mt-4 p-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg flex items-center gap-2 justify-center">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>
        )}

        {/* Analyzing Step */}
        {step === 'analyzing' && (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
            <Loader2 size={32} className="animate-spin text-[#0078D4] mb-4" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Analyzing Data...</h3>
            <p className="text-xs text-zinc-400 mt-1">Comparing Remote vs Database</p>
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="New" value={analysis.newItems.length} variant="new" />
              <StatBox label="Updates" value={analysis.updatedItems.length} variant="update" />
              <StatBox label="Unchanged" value={analysis.uptodateItems.length} variant="unchanged" />
            </div>

            {totalChanges > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-500">Pending Sync Records</span>
                    <span className="text-[10px] font-bold text-zinc-400">{totalChanges} items to process</span>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={step === 'analyzing'}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 hover:text-[#0078D4] transition-all font-black text-[9px] uppercase border border-zinc-200/50 dark:border-zinc-700/50 active:scale-95"
                    title="Re-fetch latest data"
                  >
                    <RefreshCw size={12} className={step === 'analyzing' ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden shadow-inner">
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar divide-y divide-zinc-100 dark:divide-zinc-800">
                    {analysis.newItems.map(item => <PreviewRow key={item.ticketNumber} item={item} type="new" />)}
                    {analysis.updatedItems.map(item => <PreviewRow key={item.ticketNumber} item={item} type="update" />)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30">
                <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-500/40" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">System Synchronized</h3>
                <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Your local database matches the remote Google Sheets source.</p>
                <button
                  onClick={handleAnalyze}
                  className="mt-6 flex items-center gap-1.5 px-4 py-2 mx-auto bg-white dark:bg-zinc-800 rounded-lg text-zinc-500 hover:text-[#0078D4] transition-all font-black text-[9px] uppercase border border-zinc-200/50 dark:border-zinc-700/50 active:scale-95 shadow-sm"
                >
                  <RefreshCw size={12} /> Force Re-Check
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-emerald-500 rounded-lg flex items-center justify-center text-white mb-4">
              <CheckCircle2 size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white">Sync Complete</h3>
            <p className="text-xs text-zinc-400 mt-1">Database updated successfully</p>
          </div>
        )}
      </>
    </FormModal>
  );
}
