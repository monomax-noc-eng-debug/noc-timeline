import React, { useState } from 'react';
import {
  CloudDownload, Calendar, Loader2, AlertCircle, Save,
  CalendarRange, MousePointer2, CheckCircle2, X, RefreshCw,
  ArrowRight, FileDiff, Database
} from 'lucide-react';
import { writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export default function GoogleSyncModal({ isOpen, onClose, onSyncComplete }) {
  const [syncMode, setSyncMode] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  // States
  const [step, setStep] = useState('input'); // input -> analyzing -> review -> saving -> success
  const [analysis, setAnalysis] = useState({ newItems: [], updatedItems: [], uptodateItems: [] });
  const [error, setError] = useState(null);

  // Reset
  const resetState = () => {
    setStep('input');
    setAnalysis({ newItems: [], updatedItems: [], uptodateItems: [] });
    setError(null);
  };

  // 1. Fetch & Analyze
  const handleAnalyze = async () => {
    setStep('analyzing');
    setError(null);
    const paramDate = syncMode === 'daily' ? date : month;

    try {
      if (!GOOGLE_SCRIPT_URL) throw new Error("API URL not configured.");

      // A. Fetch from Google Sheet
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?date=${paramDate}`);
      if (!response.ok) throw new Error("Failed to fetch from Google Script");
      const result = await response.json();

      const rawData = Array.isArray(result) ? result : (result.data || []);
      if (rawData.length === 0) throw new Error("No data found in Sheet.");
      if (rawData[0]?.error) throw new Error(rawData[0].error);

      // Map Data
      const incomingMatches = rawData.map((item) => {
        const fullMatchName = item.match || item.title || item.Match || '';
        let teamA = fullMatchName;
        let teamB = '';
        if (fullMatchName.includes(' vs ')) {
          const p = fullMatchName.split(' vs ');
          teamA = p[0].trim(); teamB = p[1]?.trim() || '';
        }

        return {
          id: item.id?.toString(),
          time: item.time || item.startTime || '',
          league: item.league || item.calendar || '',
          match: fullMatchName,
          teamA, teamB,
          channel: item.channel || item.Channel || '',
          startDate: item.startDate || (syncMode === 'daily' ? date : ''),
        };
      }).filter(m => m.id); // ต้องมี ID

      // B. Compare with Firestore (Batch Check)
      const newItems = [];
      const updatedItems = [];
      const uptodateItems = [];

      // ใช้ Promise.all เพื่อเช็ค DB ทีละรายการ (หรือถ้าข้อมูลเยอะควร query เป็น chunk)
      // ในที่นี้สมมติว่า sync ทีละวัน/เดือน ข้อมูลไม่เกิน 100 รายการ เช็คตรงๆ ได้
      await Promise.all(incomingMatches.map(async (incoming) => {
        const docRef = doc(db, 'schedules', incoming.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          newItems.push(incoming);
        } else {
          const existing = docSnap.data();
          // Check Diff (เทียบเฉพาะ field ที่สำคัญ)
          const hasChanges = (
            existing.startTime !== incoming.time ||
            existing.title !== incoming.match ||
            existing.channel !== incoming.channel ||
            existing.startDate !== incoming.startDate
          );

          if (hasChanges) {
            updatedItems.push({ ...incoming, _prev: existing });
          } else {
            uptodateItems.push(incoming);
          }
        }
      }));

      setAnalysis({ newItems, updatedItems, uptodateItems });
      setStep('review');

    } catch (err) {
      console.error(err);
      setError(err.message);
      setStep('input');
    }
  };

  // 2. Save Changes
  const handleConfirmSync = async () => {
    setStep('saving');
    try {
      const batch = writeBatch(db);
      const toSave = [...analysis.newItems, ...analysis.updatedItems];

      toSave.forEach(match => {
        const docRef = doc(db, 'schedules', match.id);
        // Clean up internal props
        const { _prev, ...data } = match;

        batch.set(docRef, {
          ...data,
          title: data.match,
          startTime: data.time,
          updatedAt: new Date().toISOString(),
          // Default fields for new items only
          ...(match._prev ? {} : { hasStartStat: false, hasEndStat: false })
        }, { merge: true });
      });

      await batch.commit();

      if (onSyncComplete) onSyncComplete();

      // Auto close after success
      setTimeout(() => {
        onClose();
        resetState();
      }, 1500);
      setStep('success');

    } catch (err) {
      setError("Database Error: " + err.message);
      setStep('review');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-[#121212] w-full max-w-2xl rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 bg-zinc-900 text-white sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg"><CloudDownload size={20} /></div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Sync Manager</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Google Sheets Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

          {/* Step 1: Input */}
          {step === 'input' && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                {['daily', 'monthly'].map(m => (
                  <button key={m} onClick={() => setSyncMode(m)} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase ${syncMode === m ? 'bg-white dark:bg-black shadow text-blue-600' : 'text-zinc-400'}`}>
                    {m} Mode
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase">Target Period</label>
                {syncMode === 'daily' ? (
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono font-bold" />
                ) : (
                  <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono font-bold" />
                )}
              </div>
              {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}
            </div>
          )}

          {/* Step 2: Analyzing */}
          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
              <Loader2 size={40} className="animate-spin text-blue-500" />
              <div>
                <h3 className="text-sm font-black uppercase">Analyzing Data...</h3>
                <p className="text-xs text-zinc-400">Comparing Sheet vs Database</p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-3 gap-3">
                <StatBox label="New Entities" value={analysis.newItems.length} color="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10" />
                <StatBox label="Modifications" value={analysis.updatedItems.length} color="bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/10" />
                <StatBox label="Verified" value={analysis.uptodateItems.length} color="bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800" />
              </div>

              {(analysis.newItems.length > 0 || analysis.updatedItems.length > 0) ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Structural Comparison</h4>
                    <span className="text-[10px] font-bold text-zinc-400">{analysis.newItems.length + analysis.updatedItems.length} changes pending</span>
                  </div>
                  <div className="bg-white dark:bg-[#0c0c0c] border border-zinc-100 dark:border-zinc-900 rounded-2xl overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-zinc-50 dark:divide-zinc-900/50">
                      {analysis.newItems.map(item => <PreviewRow key={item.id} item={item} type="new" />)}
                      {analysis.updatedItems.map(item => <PreviewRow key={item.id} item={item} type="update" />)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl bg-zinc-50/30 dark:bg-white/[0.01]">
                  <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-500/30" />
                  <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white">All Synchronized</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Local database matches remote source</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg relative">
                  <CheckCircle2 size={32} strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Sync Finalized</h3>
              <p className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-widest">Operational records updated successfully</p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="shrink-0 p-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row justify-end gap-3 bg-white dark:bg-[#0c0c0c]">
          {step === 'input' && (
            <button onClick={handleAnalyze} className="w-full sm:w-auto px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl shadow-black/20 dark:shadow-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group">
              Analyze <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          {step === 'review' && (
            <>
              <button onClick={resetState} className="px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">Back</button>
              <button
                onClick={handleConfirmSync}
                disabled={analysis.newItems.length === 0 && analysis.updatedItems.length === 0}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:transform-none flex items-center justify-center gap-2"
              >
                <Database size={12} /> Commit
              </button>
            </>
          )}
          {step === 'saving' && (
            <div className="flex items-center gap-2 px-8 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400">
              <Loader2 size={12} className="animate-spin" /> Recording...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const StatBox = ({ label, value, color }) => (
  <div className={`px-4 py-3 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 ${color}`}>
    <span className="text-2xl font-black tracking-tighter mb-0.5">{value}</span>
    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-center">{label}</span>
  </div>
);

const PreviewRow = ({ item, type }) => (
  <div className="px-4 py-3 bg-white dark:bg-transparent flex items-center justify-between group hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors">
    <div className="flex items-center gap-3 overflow-hidden">
      <div className={`w-1 h-6 rounded-full ${type === 'new' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      <div className="truncate">
        <div className="text-xs font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{item.match}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{item.league || 'Event'}</span>
          <span className="text-[8px] font-mono font-bold text-zinc-300">•</span>
          <span className="text-[8px] font-mono font-bold text-zinc-400">{item.time}</span>
        </div>
      </div>
    </div>
    <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${type === 'new'
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      }`}>
      {type === 'new' ? 'New' : 'Update'}
    </div>
  </div>
);
