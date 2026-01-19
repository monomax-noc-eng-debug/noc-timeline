// file: src/features/matches/components/MatchViewModal.jsx
import React, { useMemo, memo, useState, useCallback } from 'react';
import {
  X, Clock, Tv, Activity, Hash,
  RefreshCw, Users, ArrowRight, Gauge, Layout
} from 'lucide-react';
import { useMatchDetails } from '../hooks/useMatchDetails';
import { getMatchStatus, formatMatchDate } from '../../../utils/matchStatus';
import { cn } from "@/lib/utils";
import { FormModal } from '../../../components/FormModal';

// ----------------------------------------------------------------------
// 1. Internal Sub-Components
// ----------------------------------------------------------------------

/**
 * MiniGauge Component - Minimalist SVG Gauge (Scaled Down)
 */
const MiniGauge = memo(({ score, label, colorClass, statusLabel }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="relative flex items-center justify-center w-14 h-14 transition-transform group-hover:scale-105 duration-500">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="28" cy="28" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-zinc-100 dark:text-zinc-800/50"
          />
          <circle
            cx="28" cy="28" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(colorClass, "transition-all duration-1000 ease-out")}
          />
        </svg>
        <div className="absolute flex flex-col items-center leading-none">
          <span className={cn("text-[10px] font-black tracking-tighter", colorClass)}>{score}</span>
          <span className="text-[5px] font-semibold text-zinc-400 mt-0.5">%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
        {statusLabel && (
          <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-tight mt-0.5">{statusLabel}</p>
        )}
      </div>
    </div>
  );
});

/**
 * StatCard Component - Minimalist Data Point (Scaled Down)
 */
const InfoTile = memo(({ icon, label, value, subValue, colorClass = "text-zinc-400", bgClass = "bg-zinc-50 dark:bg-zinc-900/50" }) => {
  const Icon = icon;
  return (
    <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50 flex items-center gap-3 transition-all hover:bg-white dark:hover:bg-zinc-900 hover:shadow-lg hover:shadow-zinc-200/20 dark:hover:shadow-none bg-white dark:bg-[#09090b] group">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner shrink-0", bgClass, colorClass)}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-medium text-zinc-400 mb-0.5 leading-none">{label}</p>
        <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate leading-tight uppercase tracking-tight">{value}</p>
        {subValue && <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
});

/**
 * Skeleton Loader
 */
const PanelSkeleton = () => (
  <div className="h-32 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-lg animate-pulse border border-zinc-100 dark:border-zinc-800/50" />
);

// ----------------------------------------------------------------------
// 2. Main Component
// ----------------------------------------------------------------------

export default function MatchViewModal({ isOpen, onClose, matchData }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { start: startData, end: endData, loading, refetch } = useMatchDetails(matchData?.id, isOpen);

  const status = useMemo(() => matchData ? getMatchStatus(matchData) : { text: '-', colors: {}, icon: Activity }, [matchData]);

  const formatNum = useCallback((v) => {
    if (v === null || v === undefined) return '-';
    const val = v?.val !== undefined ? v.val : v;
    const num = parseFloat(val);
    return isNaN(num) ? val : num.toLocaleString();
  }, []);

  const getScore = (data) => parseFloat(data?.bwPeakGbps?.val || 0) > 0 ? (parseFloat(data?.bwPeakGbps?.val) > 5 ? 94 : 78) : 0;

  const copyId = () => {
    if (matchData?.id) navigator.clipboard.writeText(matchData.id);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refetch) await refetch();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  if (!isOpen || !matchData) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
      headerClassName="relative shrink-0 overflow-hidden border-b border-zinc-50 dark:border-zinc-900/50 p-0"
      header={
        <>
          <div className={cn("absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none", status.colors?.bg || 'bg-zinc-500')} />
          <div className="px-6 py-4 flex items-center justify-between gap-4 relative w-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 overflow-x-auto no-scrollbar">
                <div className={cn(
                  "px-3 py-0.5 rounded-full text-[9px] font-medium flex items-center gap-1.5 shrink-0 shadow-sm border",
                  status.colors?.softBg || 'bg-zinc-50 text-zinc-400 border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800'
                )}>
                  {status.icon && React.createElement(status.icon, { size: 10, className: status.pulse ? 'animate-pulse' : '' })}
                  {status.text}
                </div>
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest truncate">{matchData.league || 'Standby'}</span>
              </div>
              <h1 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none truncate">
                {matchData.teamA && matchData.teamB ? (
                  <span className="flex items-center gap-1.5">
                    {matchData.teamA} <span className="text-zinc-300 dark:text-zinc-800 italic font-medium px-0.5">/</span> {matchData.teamB}
                  </span>
                ) : (
                  matchData.title || 'Untitled'
                )}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copyId}
                className="hidden sm:flex h-9 px-3 items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95"
              >
                <Hash size={12} />
                <span className="text-[9px] font-mono font-black">{matchData.id.slice(0, 6).toUpperCase()}</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
                className="w-9 h-9 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-zinc-400 hover:text-[#0078D4] transition-all active:rotate-180 duration-500 disabled:opacity-30"
              >
                <RefreshCw size={16} className={cn(isRefreshing || loading ? 'animate-spin' : '')} />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 active:scale-90 transition-all shadow-lg"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </>
      }
      bodyClassName="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#fcfcfc] dark:bg-[#050505] space-y-8"
      footerClassName="p-4 bg-white dark:bg-[#0a0a0a] border-t border-zinc-50 dark:border-zinc-900 transition-all flex flex-col gap-3"
      footer={
        <button
          onClick={onClose}
          className="h-11 w-full bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
        >
          Dismiss View
          <ArrowRight size={14} />
        </button>
      }
    >
      {/* 1. ANALYTICS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-semibold text-zinc-400 flex items-center gap-2">
            <Activity size={12} /> Live Performance
          </h3>
          <span className="text-[9px] font-semibold text-zinc-300 bg-zinc-100 dark:bg-zinc-900/50 px-2 py-0.5 rounded-full">{formatMatchDate(matchData.startDate)}</span>
        </div>

        {loading || isRefreshing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PanelSkeleton />
            <PanelSkeleton />
          </div>
        ) : (startData || endData) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-500">

            {/* Gauge Panel */}
            <div className="bg-white dark:bg-zinc-900/40 rounded-lg border border-zinc-100 dark:border-zinc-800/50 p-5 shadow-sm relative group overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 shrink-0">
                  <Gauge size={12} />
                </div>
                <span className="text-[9px] font-medium text-zinc-400">Stream Health</span>
              </div>
              <div className="flex items-center justify-around py-2">
                <MiniGauge score={startData ? getScore(startData) : 0} label="Start" colorClass="text-zinc-300" />
                <ArrowRight className="text-zinc-100 dark:text-zinc-800" size={14} />
                <MiniGauge score={endData ? getScore(endData) : (startData ? getScore(startData) : 0)} label="Final" colorClass="text-emerald-500" statusLabel="Optimal" />
              </div>
            </div>

            {/* Audience Panel */}
            <div className="bg-white dark:bg-zinc-900/40 rounded-lg border border-zinc-100 dark:border-zinc-800/50 p-5 shadow-sm relative group overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-500 shrink-0">
                  <Users size={12} />
                </div>
                <span className="text-[9px] font-medium text-zinc-400">Audience</span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-[7px] font-black text-zinc-300 uppercase tracking-widest">Base</span>
                    <p className="text-sm font-black text-zinc-400 tabular-nums">{formatNum(startData?.reqTotal)}</p>
                  </div>
                  <div className="text-center sm:text-right space-y-0.5">
                    <span className="text-[7px] font-black text-violet-400 uppercase tracking-widest">Final</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tighter leading-none">{formatNum(endData?.reqTotal || startData?.reqTotal)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg">
                    <p className="text-[7px] font-black text-zinc-400 uppercase mb-0.5">Peak CCU</p>
                    <p className="text-[10px] font-black text-zinc-800 dark:text-zinc-200">{formatNum(endData?.requestPeak || startData?.requestPeak)}</p>
                  </div>
                  <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                    <p className="text-[7px] font-black text-emerald-500 uppercase mb-0.5">Growth</p>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">+12.4%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-[8px] font-medium text-zinc-400">Telemetry engine idle</p>
          </div>
        )}
      </section>

      {/* 2. TECH SPECS */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-semibold text-zinc-400 px-1 flex items-center gap-2">
          <Layout size={12} /> Specifications
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoTile
            icon={Tv}
            label="Stream Feed"
            value={matchData.channel || 'Standard'}
            bgClass="bg-[#0078D4]/10 dark:bg-[#0078D4]/20"
            colorClass="text-[#0078D4]"
          />
          <InfoTile
            icon={Clock}
            label="Kick-Off"
            value={matchData.startTime || '--:--'}
            bgClass="bg-zinc-50 dark:bg-zinc-900/50"
            colorClass="text-zinc-400"
          />
        </div>
      </section>
    </FormModal>
  );
}
