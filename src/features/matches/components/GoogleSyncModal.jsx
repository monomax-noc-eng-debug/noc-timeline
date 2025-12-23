import React, { useState } from 'react';
import { CloudDownload, Calendar, Loader2, AlertCircle, Save, CalendarRange, MousePointer2, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export default function GoogleSyncModal({ isOpen, onClose, onSyncComplete }) {
  // Mode: 'daily' หรือ 'monthly'
  const [syncMode, setSyncMode] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(null);

  const fetchFromGAS = async () => {
    setLoading(true);
    setError(null);
    setMatches([]);

    const paramDate = syncMode === 'daily' ? date : month;

    try {
      if (!GOOGLE_SCRIPT_URL) throw new Error("❌ API URL not found in environment variables.");

      console.log(`fetching mode: ${syncMode}, param: ${paramDate}`);
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?date=${paramDate}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (Array.isArray(result) && result.length > 0 && result[0].error) {
        setError(result[0].error);
        return;
      }

      const data = Array.isArray(result) ? result : (result.data || []);
      if (data.length === 0) {
        setError("No matches found for the selected period.");
        return;
      }

      const mappedData = data.map((item) => {
        // ใช้ชื่อแมตช์เต็มๆ
        const fullMatchName = item.match || item.title || item.Match || item.Title || '';

        // แยกทีม (ถ้ามี vs)
        let teamA = fullMatchName;
        let teamB = '';
        if (fullMatchName.includes(' vs ')) {
          const parts = fullMatchName.split(' vs ');
          teamA = parts[0].trim();
          teamB = parts[1] ? parts[1].trim() : '';
        }

        return {
          id: item.id,
          time: item.time || item.startTime || item.Time || '',
          league: item.league || item.calendar || item.League || '',
          match: fullMatchName,
          teamA,
          teamB,
          channel: item.channel || item.Channel || '',
          // ✅ ใช้ startDate จากข้อมูลที่ได้มา (เพราะถ้าดึงทั้งเดือน วันที่จะไม่เหมือนกัน)
          startDate: item.startDate || (syncMode === 'daily' ? date : ''),
          status: 'Scheduled'
        };
      });

      // ✅ กรองข้อมูลซ้ำ
      const uniqueMatches = mappedData.filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.startDate === item.startDate &&
          t.time === item.time &&
          t.match === item.match
        ))
      );

      // เรียงลำดับตามวันที่และเวลา
      uniqueMatches.sort((a, b) =>
        new Date(`${a.startDate}T${a.time}`) - new Date(`${b.startDate}T${b.time}`)
      );

      setMatches(uniqueMatches);

    } catch (err) {
      console.error("Fetch Error:", err);
      setError(`Failed to fetch: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (matches.length === 0) return;
    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const batch = writeBatch(db);
      const importCount = matches.length;

      matches.forEach(match => {
        const docId = match.id;
        const docRef = doc(db, 'schedules', docId);

        batch.set(docRef, {
          ...match,
          title: match.match,
          startTime: match.time,
          teamA: match.teamA,
          teamB: match.teamB,
          updatedAt: new Date().toISOString(),
          hasStartStat: false,
          hasEndStat: false
        }, { merge: true });
      });

      await batch.commit();

      setSuccess(`Successfully imported ${importCount} matches!`);
      setMatches([]);

      setTimeout(() => {
        setSuccess(null);
        if (onSyncComplete) onSyncComplete();
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save to database: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#121212] w-full max-w-2xl rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-inner"><CloudDownload size={24} /></div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight leading-none">Sync Matches</h2>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Import from Google Sheets</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"><X size={20} /></button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

          {/* Mode Selection */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => { setSyncMode('daily'); setMatches([]); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${syncMode === 'daily' ? 'bg-white dark:bg-black shadow-md text-blue-600 dark:text-blue-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              <MousePointer2 size={16} /> Daily Sync
            </button>
            <button
              onClick={() => { setSyncMode('monthly'); setMatches([]); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${syncMode === 'monthly' ? 'bg-white dark:bg-black shadow-md text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              <CalendarRange size={16} /> Monthly Sync
            </button>
          </div>

          {/* Date Picker & Fetch Action */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                {syncMode === 'daily' ? 'Select Date' : 'Select Month'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                  <Calendar size={18} />
                </div>
                {syncMode === 'daily' ? (
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm uppercase cursor-pointer"
                  />
                ) : (
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm uppercase cursor-pointer"
                  />
                )}
              </div>
            </div>

            <button
              onClick={fetchFromGAS}
              disabled={loading}
              className="w-full sm:w-auto h-[50px] px-8 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {loading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="shrink-0" />
              {success}
            </div>
          )}

          {/* Results Table */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-[#050505] min-h-[250px] shadow-sm relative">
            {matches.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                <CloudDownload size={48} className="mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">No Data Fetched Yet</p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-100 dark:bg-[#151515] text-[10px] font-black uppercase tracking-widest text-zinc-500 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-4 w-24">Date</th>
                      <th className="p-4 w-20">Time</th>
                      <th className="p-4">Match</th>
                      <th className="p-4 w-32">Channel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {matches.map((m, i) => (
                      <tr key={i} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                        <td className="p-4 text-zinc-500 whitespace-nowrap font-mono">{new Date(m.startDate).getDate()}/{new Date(m.startDate).getMonth() + 1}</td>
                        <td className="p-4 font-mono font-bold">{m.time}</td>
                        <td className="p-4 font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{m.match}</td>
                        <td className="p-4 text-blue-500 font-bold uppercase text-[10px]">{m.channel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-white dark:bg-[#121212] z-10">
          <button
            onClick={onClose}
            className="px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveToFirestore}
            disabled={matches.length === 0 || syncing}
            className={`px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${matches.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {syncing ? 'Importing...' : `Import ${matches.length} Matches`}
          </button>
        </div>

      </div>
    </div>
  );
}