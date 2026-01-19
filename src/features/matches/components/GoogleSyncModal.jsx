// file: src/features/matches/components/GoogleSyncModal.jsx
import React, { useState, memo } from 'react';
import {
  CloudDownload, Calendar, Loader2, AlertCircle, Save,
  CalendarRange, MousePointer2, CheckCircle2, X, RefreshCw,
  ArrowRight, FileDiff, Database, ChevronLeft, Layers
} from 'lucide-react';
import { writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { useStore } from '../../../store/useStore';
import { cn } from "@/lib/utils";
import { FormModal } from '../../../components/FormModal';

// ----------------------------------------------------------------------
// Constants & Utils
// ----------------------------------------------------------------------
const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_CALENDAR_URL || import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

const StatCard = memo(({ label, value, colorClass, icon }) => {
  const Icon = icon;
  return (
    <div className={cn(
      "flex-1 p-4 rounded-lg border transition-all hover:-translate-y-1 bg-white dark:bg-zinc-900",
      colorClass
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-1.5 rounded-lg bg-current opacity-20">
          <Icon size={12} className="opacity-100" />
        </div>
        <span className="text-xl font-black tabular-nums tracking-tighter">{value}</span>
      </div>
      <p className="text-[8px] font-medium opacity-60">{label}</p>
    </div>
  );
});

const PreviewRow = memo(({ item, type }) => (
  <div className="group px-5 py-3.5 bg-white dark:bg-transparent flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all">
    <div className="flex items-center gap-4 overflow-hidden">
      <div className={cn(
        "w-1.5 h-8 rounded-full shrink-0 transition-transform group-hover:scale-y-110",
        type === 'new' ? 'bg-emerald-400' : 'bg-amber-400'
      )} />
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 tracking-tight truncate max-w-[200px]">{item.match}</h4>
          {item.isMerged && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#0078D4]/10 text-[#0078D4] text-[6px] font-semibolder border border-[#0078D4]/20">
              <Layers size={8} /> Merged
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{item.league || 'Event'}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-[9px] font-mono font-bold text-zinc-500">{item.time}</span>
          {item.channel && (
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-[9px] font-bold text-[#0078D4] uppercase truncate max-w-[120px]">{item.channel}</span>
            </>
          )}
        </div>
      </div>
    </div>

    <div className={cn(
      "shrink-0 px-2.5 py-1 rounded-full text-[8px] font-medium border transition-colors",
      type === 'new'
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
        : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
    )}>
      {type === 'new' ? 'Add' : 'Edit'}
    </div>
  </div>
));

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function GoogleSyncModal({ isOpen, onClose, onSyncComplete }) {
  const { currentUser } = useStore();
  const [syncMode, setSyncMode] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  // States
  const [step, setStep] = useState('input'); // input -> analyzing -> review -> saving -> success
  const [analysis, setAnalysis] = useState({ newItems: [], updatedItems: [], uptodateItems: [] });
  const [error, setError] = useState(null);

  const resetState = () => {
    setStep('input');
    setAnalysis({ newItems: [], updatedItems: [], uptodateItems: [] });
    setError(null);
  };

  const handleAnalyze = async () => {
    setStep('analyzing');
    setError(null);
    const paramDate = syncMode === 'daily' ? date : month;

    try {
      if (!GOOGLE_SCRIPT_URL) throw new Error("Cloud URL not configured (VITE_GOOGLE_CALENDAR_URL)");

      const response = await fetch(`${GOOGLE_SCRIPT_URL}?date=${paramDate}`, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) throw new Error(`Fetch Failed: ${response.statusText}`);

      const result = await response.json();
      const rawData = Array.isArray(result) ? result : (result.data || []);

      if (rawData.length === 0) throw new Error("No operational records found for this period.");

      const matchMap = new Map();
      rawData.forEach((item) => {
        const fullMatchName = item.match || item.title || '';
        const time = item.time || item.startTime || '';
        const startDate = item.startDate || '';
        const cleanTitle = fullMatchName.toLowerCase().replace(/\s/g, '');
        const uniqueKey = `${startDate}|${time}|${cleanTitle}`;

        if (matchMap.has(uniqueKey)) {
          const existing = matchMap.get(uniqueKey);
          const newChannel = item.channel || '';
          existing.isMerged = true;
          if (newChannel && !existing.channel.includes(newChannel)) {
            existing.channel = existing.channel ? `${existing.channel}, ${newChannel}` : newChannel;
          }
        } else {
          let teamA = fullMatchName;
          let teamB = '';
          if (fullMatchName.includes(' vs ')) {
            const p = fullMatchName.split(' vs ');
            teamA = p[0].trim(); teamB = p[1]?.trim() || '';
          } else if (fullMatchName.includes(' - ')) {
            const p = fullMatchName.split(' - ');
            teamA = p[0].trim(); teamB = p[1]?.trim() || '';
          }
          matchMap.set(uniqueKey, {
            id: item.id?.toString(),
            time: time,
            league: item.league || item.calendar || '',
            match: fullMatchName,
            teamA,
            teamB,
            channel: item.channel || '',
            startDate: startDate,
            isMerged: false
          });
        }
      });

      const incomingMatches = Array.from(matchMap.values()).filter(m => m.id);
      const newItems = [];
      const updatedItems = [];
      const uptodateItems = [];

      await Promise.all(incomingMatches.map(async (incoming) => {
        const docRef = doc(db, 'schedules', incoming.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          newItems.push(incoming);
        } else {
          const existing = docSnap.data();
          const hasChanges = (
            existing.startTime !== incoming.time ||
            existing.title !== incoming.match ||
            existing.channel !== incoming.channel ||
            existing.startDate !== incoming.startDate
          );
          if (hasChanges) updatedItems.push({ ...incoming, _prev: existing });
          else uptodateItems.push(incoming);
        }
      }));

      setAnalysis({ newItems, updatedItems, uptodateItems });
      setStep('review');
    } catch (err) {
      setError(err.message);
      setStep('input');
    }
  };

  const handleConfirmSync = async () => {
    setStep('saving');
    try {
      const batch = writeBatch(db);
      const toSave = [...analysis.newItems, ...analysis.updatedItems];
      const userName = typeof currentUser === 'object' ? currentUser?.name : currentUser;
      const editorName = userName || 'System Sync';

      toSave.forEach(match => {
        const docRef = doc(db, 'schedules', match.id);
        const { _prev, ...data } = match;
        batch.set(docRef, {
          ...data,
          title: data.match,
          startTime: data.time,
          updatedAt: new Date().toISOString(),
          updatedBy: editorName,
          ...(!match._prev ? {
            hasStartStat: false,
            hasEndStat: false,
            createdAt: new Date().toISOString(),
            createdBy: editorName
          } : {})
        }, { merge: true });
      });

      await batch.commit();
      if (onSyncComplete) onSyncComplete();
      setStep('success');
      setTimeout(() => { onClose(); resetState(); }, 2000);
    } catch (err) {
      setError("Commit Failed: " + err.message);
      setStep('review');
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
      headerClassName="px-8 py-6 border-b border-zinc-50 dark:border-zinc-900 flex justify-between items-center bg-white dark:bg-[#0a0a0a]"
      header={
        <>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center shadow-lg">
              <CloudDownload size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Sync Portal</h2>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Record Synchronization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-900 rounded-full transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </>
      }
      bodyClassName="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#fdfdfd] dark:bg-[#050505]"
      footerClassName="shrink-0 p-8 border-t border-zinc-50 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white dark:bg-[#0a0a0a]"
      footer={
        <>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-300">
              <Database size={14} />
            </div>
            <div className="hidden xs:block">
              <p className="text-[8px] font-semibold text-zinc-400 tracking-widest">Active System</p>
              <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">Firebase Edge v4</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {step === 'input' && (
              <button
                onClick={handleAnalyze}
                className="flex-1 sm:flex-none h-14 px-10 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-semibold text-[11px]  shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                Analyze <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            {step === 'review' && (
              <>
                <button
                  onClick={resetState}
                  className="h-14 px-8 rounded-lg font-semibold text-[10px] tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handleConfirmSync}
                  disabled={analysis.newItems.length === 0 && analysis.updatedItems.length === 0}
                  className="flex-1 sm:flex-none h-14 px-10 bg-[#0078D4] text-white rounded-lg font-semibold text-[11px]  shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3"
                >
                  <Save size={14} /> Commit
                </button>
              </>
            )}
            {step === 'saving' && (
              <div className="h-14 px-10 flex items-center gap-4 text-[10px] font-semibold text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <Loader2 size={16} className="animate-spin" /> Recording Data
              </div>
            )}
          </div>
        </>
      }
    >
      {/* STEP: INPUT */}
      {step === 'input' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center">
            {['daily', 'monthly'].map(m => (
              <button
                key={m}
                onClick={() => setSyncMode(m)}
                className={cn(
                  "flex-1 h-11 rounded-lg text-[10px] font-medium transition-all",
                  syncMode === m
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                )}
              >
                {m} Range
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Temporal Target</label>
              <Calendar size={12} className="text-zinc-300" />
            </div>
            <div className="relative group">
              <input
                type={syncMode === 'daily' ? 'date' : 'month'}
                value={syncMode === 'daily' ? date : month}
                onChange={e => syncMode === 'daily' ? setDate(e.target.value) : setMonth(e.target.value)}
                className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg font-mono font-black text-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-[#0078D4]/5 focus:border-[#0078D4]/50 transition-all placeholder:text-zinc-300"
              />
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-transparent group-hover:ring-zinc-200 dark:group-hover:ring-zinc-700 pointer-events-none transition-all" />
            </div>
            <p className="text-[10px] text-zinc-400 font-medium px-1 italic">Selecting a range outside the current cycle may require longer processing time.</p>
          </div>

          {error && (
            <div className="p-5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-lg flex items-center gap-4 border border-rose-100 dark:border-rose-500/20 animate-shake">
              <div className="p-2 bg-rose-200/30 dark:bg-rose-500/20 rounded-lg"><AlertCircle size={14} /></div>
              <span className="uppercase tracking-tight leading-relaxed">{error}</span>
            </div>
          )}
        </div>
      )}

      {/* STEP: ANALYZING */}
      {step === 'analyzing' && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-[#0078D4]/20 animate-pulse scale-150" />
            <div className="w-20 h-20 rounded-lg border-4 border-zinc-100 dark:border-zinc-900 flex items-center justify-center bg-white dark:bg-zinc-950 relative">
              <RefreshCw size={32} className="animate-spin text-zinc-900 dark:text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Analyzing Stream</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Validating Schema Reconciliation</p>
          </div>
        </div>
      )}

      {/* STEP: REVIEW */}
      {step === 'review' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex gap-4">
            <StatCard label="Inbound" value={analysis.newItems.length} icon={Database} colorClass="text-emerald-500 border-emerald-100 dark:border-emerald-900/40 shadow-sm" />
            <StatCard label="Mutation" value={analysis.updatedItems.length} icon={RefreshCw} colorClass="text-amber-500 border-amber-100 dark:border-amber-900/40 shadow-sm" />
            <StatCard label="Stable" value={analysis.uptodateItems.length} icon={CheckCircle2} colorClass="text-zinc-400 border-zinc-100 dark:border-zinc-800" />
          </div>

          {(analysis.newItems.length > 0 || analysis.updatedItems.length > 0) ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-semibold text-zinc-400 flex items-center gap-2">
                  <FileDiff size={12} /> Staging Queue
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-[8px] font-black text-zinc-500 uppercase">{analysis.newItems.length + analysis.updatedItems.length} Changes Detected</span>
              </div>
              <div className="bg-white dark:bg-[#0c0c0c] border border-zinc-100 dark:border-zinc-900 rounded-lg overflow-hidden shadow-2xl shadow-zinc-200/20 dark:shadow-none">
                <div className="max-h-[320px] overflow-y-auto custom-scrollbar divide-y divide-zinc-50 dark:divide-zinc-900/50">
                  {analysis.newItems.map(item => <PreviewRow key={item.id} item={item} type="new" />)}
                  {analysis.updatedItems.map(item => <PreviewRow key={item.id} item={item} type="update" />)}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-lg bg-zinc-50/40 dark:bg-zinc-900/20 group hover:border-zinc-300 transition-colors">
              <div className="w-16 h-16 mx-auto mb-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Dataset Harmonized</h3>
              <p className="text-[10px] font-bold uppercase  text-zinc-400 mt-2">Remote source matches local system</p>
            </div>
          )}
        </div>
      )}

      {/* STEP: SUCCESS */}
      {step === 'success' && (
        <div className="py-20 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-30 animate-pulse scale-150" />
            <div className="w-24 h-24 bg-zinc-950 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <CheckCircle2 size={40} className="relative z-10" strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">Sync Sequence Complete</h3>
          <p className="text-[10px] font-black text-zinc-400 mt-3 uppercase ">Operational archives updated successfully</p>
        </div>
      )}
    </FormModal>
  );
}
