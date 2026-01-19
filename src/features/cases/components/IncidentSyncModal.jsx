import React, { useState, useCallback, memo } from 'react';
import { CloudDownload, Loader2, AlertCircle, CheckCircle2, X, ArrowRight, Database, RefreshCw } from 'lucide-react';
import { FormModal } from '../../../components/FormModal';
import { parse, isValid, addYears } from 'date-fns';
import incidentService from '../../../services/incidentService';

const SHEET_API_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

const parseDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString();
  const dateObj = new Date(dateStr);
  if (!isNaN(dateObj.getTime())) return dateObj.toISOString();
  // Fallback parsers
  try {
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
  } catch (e) { return new Date().toISOString(); }

  return new Date().toISOString();
};

// Sub-components
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
        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">#{item.ticket}</div>
        <div className="text-[10px] text-zinc-400 truncate">{item.subject}</div>
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

export default function IncidentSyncModal({ isOpen, onClose, onSyncComplete, currentIncidents }) {
  const [step, setStep] = useState('input');
  const [analysis, setAnalysis] = useState({ newItems: [], updatedItems: [], uptodateItems: [] });
  const [error, setError] = useState(null);

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
      if (rawData.length === 0) throw new Error("No data received");

      // Map Sheet Columns to Incident Fields
      const sheetData = rawData.map(item => ({
        ticket: item.ticketNo || item.ticketNumber || '',
        subject: item.subject || item.shortDescription || item.description || 'Untitled',
        status: item.status || 'Open',
        type: item.ticketType || item.type || 'Incident',
        project: item.project || 'General',
        priority: item.priority || item.severity || 'Medium',
        createdAt: parseDate(item.date || item.ticketDate || item.createdAt)
      })).filter(item => item.ticket); // Only valid tickets

      // Dedup
      const uniqueSheetData = Array.from(
        sheetData.reduce((map, item) => {
          const key = String(item.ticket).trim();
          map.set(key, { ...item, ticket: key });
          return map;
        }, new Map()).values()
      );

      const newItems = [];
      const updatedItems = [];
      const uptodateItems = [];

      uniqueSheetData.forEach(newItem => {
        // Find existing by ticket number
        const oldItem = currentIncidents.find(inc =>
          String(inc.ticket).trim() === newItem.ticket
        );

        if (!oldItem) {
          newItems.push(newItem);
        } else {
          // Compare Fields
          const hasChanges =
            oldItem.status !== newItem.status ||
            oldItem.subject !== newItem.subject ||
            oldItem.type !== newItem.type ||
            (oldItem.project || 'General') !== newItem.project ||
            (oldItem.priority || 'Medium') !== newItem.priority;

          if (hasChanges) {
            updatedItems.push({ ...newItem, _prev: oldItem });
          } else {
            uptodateItems.push(newItem);
          }
        }
      });

      // Sort
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
  }, [currentIncidents]);

  const handleConfirmSync = useCallback(async () => {
    setStep('saving');
    try {
      const dataToUpdate = [...analysis.newItems, ...analysis.updatedItems];
      // eslint-disable-next-line no-unused-vars
      const cleanData = dataToUpdate.map(({ _prev, ...item }) => item);

      if (cleanData.length > 0) {
        await incidentService.importIncidentsFromSheet(cleanData);
      }

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
  }, [analysis, onSyncComplete, onClose, resetState]);

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
            <div className="p-2 bg-[#0078D4] rounded-lg">
              <CloudDownload size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-900 dark:text-white">Incident Sync</h2>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Google Sheets Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400"><X size={18} /></button>
        </>
      }
      bodyClassName="p-5 overflow-y-auto custom-scrollbar flex-1"
      footerClassName="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex justify-end gap-2"
      footer={
        <>
          {step === 'input' && <button onClick={handleAnalyze} className="px-4 py-2 bg-[#0078D4] text-white rounded-lg text-xs font-bold hover:bg-[#106EBE]">Analyze Data</button>}
          {step === 'review' && (
            <>
              <button onClick={resetState} className="px-4 py-2 text-zinc-500 text-xs font-bold hover:bg-zinc-100 rounded-lg">Back</button>
              <button onClick={handleConfirmSync} disabled={totalChanges === 0} className="px-4 py-2 bg-[#0078D4] text-white rounded-lg text-xs font-bold disabled:opacity-50">Confirm Import</button>
            </>
          )}
          {step === 'success' && <button onClick={onClose} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold">Close</button>}
        </>
      }
    >
      {/* Steps Logic (Input -> Review -> Success) */}
      {step === 'input' && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-[#0078D4]/10 dark:bg-[#0078D4]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CloudDownload size={24} className="text-[#0078D4]" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Sync from Google Sheets</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Fetch incident records including ticket numbers, status, and project details.</p>
          {error && <div className="mt-4 p-2.5 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 justify-center"><AlertCircle size={14} /> {error}</div>}
        </div>
      )}

      {step === 'analyzing' && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Loader2 size={32} className="animate-spin text-[#0078D4] mb-4" />
          <h3 className="text-sm font-bold">Analyzing Incidents...</h3>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="New Incidents" value={analysis.newItems.length} variant="new" />
            <StatBox label="Updated" value={analysis.updatedItems.length} variant="update" />
            <StatBox label="No Change" value={analysis.uptodateItems.length} variant="unchanged" />
          </div>

          {totalChanges > 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden shadow-inner max-h-[300px] overflow-y-auto">
              {analysis.newItems.map(item => <PreviewRow key={item.ticket} item={item} type="new" />)}
              {analysis.updatedItems.map(item => <PreviewRow key={item.ticket} item={item} type="update" />)}
            </div>
          ) : (
            <div className="py-8 text-center border-dashed border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500/50 mb-2" />
              <p className="text-xs font-bold text-zinc-500">All incidents are up to date.</p>
              <button onClick={handleAnalyze} className="mt-2 text-[10px] text-[#0078D4] hover:underline">Force Check Again</button>
            </div>
          )}
        </div>
      )}

      {step === 'success' && (
        <div className="py-10 text-center animate-in zoom-in-95">
          <div className="w-14 h-14 bg-emerald-500 rounded-lg flex items-center justify-center text-white mx-auto mb-4"><CheckCircle2 size={28} strokeWidth={3} /></div>
          <h3 className="text-lg font-black dark:text-white">Import Successful</h3>
        </div>
      )}
    </FormModal>
  );
}

