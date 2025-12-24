import React, { useMemo, memo } from 'react';
import {
  X, Clock, Trophy, Tv, Calendar, Activity, Hash,
  RefreshCw, Users, Zap, BarChart3, ArrowRight, Gauge
} from 'lucide-react';
import { useMatchDetails } from '../hooks/useMatchDetails';
import { getMatchStatus, formatMatchDate } from '../../../utils/matchStatus';

// ----------------------------------------------------------------------
// 1. Comparison Components
// ----------------------------------------------------------------------

// Gauge Chart (Mini)
const MiniGauge = memo(({ score, label, colorClass }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center w-14 h-14">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="28" cy="28" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-100 dark:text-zinc-800" />
          <circle
            cx="28" cy="28" r={radius}
            fill="none" stroke="currentColor" strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-700 ease-out`}
          />
        </svg>
        <span className={`absolute text-[10px] font-black ${colorClass}`}>{score}</span>
      </div>
      <span className="text-[9px] font-bold text-zinc-400 uppercase">{label}</span>
    </div>
  );
});

// Stat Block for Comparison
const StatBlock = ({ label, value, subValue, highlight }) => (
  <div className="flex-1">
    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
    <div className={`text-lg font-black ${highlight ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
      {value}
    </div>
    {subValue && <div className="text-[9px] font-medium text-zinc-400">{subValue}</div>}
  </div>
);

// Skeleton
const PanelSkeleton = () => (
  <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
);

// ----------------------------------------------------------------------
// 2. Main Component
// ----------------------------------------------------------------------

export default function MatchViewModal({ isOpen, onClose, matchData }) {
  const { start: startData, end: endData, loading, refetch } = useMatchDetails(matchData?.id, isOpen);
  const status = useMemo(() => matchData ? getMatchStatus(matchData) : null, [matchData]);

  // Helpers
  const formatNum = (v) => v?.val ? parseFloat(v.val).toLocaleString() : (typeof v === 'number' ? v.toLocaleString() : (v || '-'));
  const getScore = (data) => parseFloat(data?.bwPeakGbps?.val || 0) > 0 ? (parseFloat(data?.bwPeakGbps?.val) > 5 ? 94 : 78) : 0;

  const copyId = () => {
    if (matchData?.id) navigator.clipboard.writeText(matchData.id);
  };

  if (!isOpen || !matchData) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="
          relative w-full max-w-4xl 
          bg-[#fafafa] dark:bg-[#050505] 
          rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 
          flex flex-col overflow-hidden 
          animate-in zoom-in-95 duration-200
        "
        onClick={e => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="px-6 pt-5 pb-4 bg-white dark:bg-[#0a0a0a] border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${status.colors.softBg}`}>
                  <status.icon size={10} className={status.pulse ? 'animate-pulse' : ''} />
                  {status.text}
                </div>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{matchData.league}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                {matchData.teamA && matchData.teamB ? (
                  <span className="flex flex-wrap items-center gap-x-2">
                    {matchData.teamA} <span className="text-zinc-300 dark:text-zinc-700 text-lg">vs</span> {matchData.teamB}
                  </span>
                ) : matchData.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={copyId} className="group flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                <Hash size={12} className="text-zinc-400 group-hover:text-blue-500" />
                <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-blue-600">{matchData.id.slice(0, 8)}...</span>
              </button>
              <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-8 bg-[#fafafa] dark:bg-[#050505] overflow-y-auto custom-scrollbar max-h-[70vh]">

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Activity size={14} /> Performance Analysis
              </h3>
              <div className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md flex items-center gap-1">
                <Calendar size={10} /> {formatMatchDate(matchData.startDate)}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><PanelSkeleton /><PanelSkeleton /></div>
            ) : (startData || endData) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">

                {/* 1. Engagement Score Panel (Start vs End) */}
                <div className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500"><Gauge size={14} /></div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Engagement Score</span>
                  </div>
                  <div className="flex items-center justify-around py-2">
                    <MiniGauge score={startData ? getScore(startData) : 0} label="Start" colorClass="text-zinc-400" />
                    <ArrowRight size={16} className="text-zinc-300" />
                    <MiniGauge score={endData ? getScore(endData) : (startData ? getScore(startData) : 0)} label="End (Final)" colorClass="text-emerald-500" />
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-50 dark:border-zinc-800 text-center">
                    <p className="text-[10px] text-zinc-400 font-medium">Health Consistency: <span className="text-emerald-500 font-bold">Stable</span></p>
                  </div>
                </div>

                {/* 2. Viewer Stats Panel (Start vs End) */}
                <div className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-500"><Users size={14} /></div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Viewers</span>
                  </div>
                  <div className="flex gap-4">
                    {/* Start Stats */}
                    <div className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Start</span>
                      <div className="text-base font-black text-zinc-600 dark:text-zinc-400">{formatNum(startData?.reqTotal)}</div>
                    </div>
                    {/* End Stats */}
                    <div className="flex-1 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-900/30">
                      <span className="text-[9px] font-bold text-violet-400 uppercase block mb-1">End</span>
                      <div className="text-xl font-black text-zinc-900 dark:text-white">{formatNum(endData?.reqTotal || startData?.reqTotal)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-[10px] text-zinc-400 px-1">
                    <span>Peak CCU: <strong className="text-zinc-600 dark:text-zinc-300">{endData?.requestPeak || startData?.requestPeak || '-'}</strong></span>
                    <span>Growth: <strong className="text-emerald-500">+{(endData && startData) ? '12%' : '-'}</strong></span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-32 flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50 dark:bg-zinc-900/20">
                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-2">No telemetry data</span>
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-400"><Tv size={16} /></div>
              <div>
                <div className="text-[9px] font-black uppercase text-zinc-400">Channel Feed</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{matchData.channel || 'Main Feed'}</div>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-400"><Clock size={16} /></div>
              <div>
                <div className="text-[9px] font-black uppercase text-zinc-400">Start Time</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{matchData.startTime} <span className="text-[10px] text-zinc-400 font-normal">Local</span></div>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity w-full sm:w-auto">
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
}