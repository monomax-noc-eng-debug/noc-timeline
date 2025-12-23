import React, { useState, useEffect } from 'react';
import { X, Clock, Trophy, Tv, Calendar, Activity, Hash, Copy, Loader2, Server, Globe, ArrowRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { getMatchStatus, formatMatchDate } from '../../../utils/matchStatus';

export default function MatchViewModal({ isOpen, onClose, matchData }) {
  const [detailedStats, setDetailedStats] = useState({ start: null, end: null, loading: false });

  useEffect(() => {
    const fetchStats = async () => {
      if (!matchData?.id || !isOpen) return;
      setDetailedStats(prev => ({ ...prev, loading: true }));
      try {
        const startRef = doc(db, 'schedules', matchData.id, 'statistics', 'start_stat');
        const endRef = doc(db, 'schedules', matchData.id, 'statistics', 'end_stat');

        const [startSnap, endSnap] = await Promise.all([getDoc(startRef), getDoc(endRef)]);

        setDetailedStats({
          start: startSnap.exists() ? startSnap.data() : null,
          end: endSnap.exists() ? endSnap.data() : null,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setDetailedStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (isOpen) {
      fetchStats();
    }
  }, [matchData?.id, isOpen]);

  if (!isOpen || !matchData) return null;

  const status = getMatchStatus(matchData);
  const StatusIcon = status.icon;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatBw = (bw) => bw?.val ? `${bw.val} ${bw.unit || 'GB'}` : '-';

  const formatReq = (req) => {
    if (!req?.val) return req || '-';

    const value = parseFloat(req.val);
    const unit = req.unit || 'k';

    let fullValue;
    switch (unit.toLowerCase()) {
      case 'm':
        fullValue = value * 1000000;
        break;
      case 'k':
        fullValue = value * 1000;
        break;
      case 'b':
        fullValue = value * 1000000000;
        break;
      default:
        fullValue = value;
    }

    // Format with commas
    return fullValue.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const startStat = detailedStats.start || {};
  const endStat = detailedStats.end || {};

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#0a0a0a] w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Background Blur */}
        <div className="absolute top-0 left-0 right-0 h-64 overflow-hidden -z-10">
          <div className={`absolute -top-[50%] -left-[20%] w-[140%] h-[140%] bg-gradient-to-br ${status.colors.gradient} opacity-20 blur-3xl`} />
        </div>

        {/* Header content */}
        <div className="relative p-8 pb-0">
          <div className="flex justify-between items-start mb-6">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide shadow-sm ${status.colors.softBg}`}>
              <StatusIcon size={12} className={status.pulse ? 'animate-pulse' : ''} />
              {status.text}
            </div>

            <button
              onClick={onClose}
              className="p-2 -mr-2 -mt-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-500 dark:text-zinc-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-tight">
              {matchData.teamA && matchData.teamB ? (
                <span className="flex flex-col gap-1">
                  <span>{matchData.teamA}</span>
                  <span className="text-xl text-zinc-400 font-bold">vs</span>
                  <span>{matchData.teamB}</span>
                </span>
              ) : (
                matchData.title || matchData.match || 'Match Details'
              )}
            </h2>
          </div>

          {matchData.league && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-white/5 rounded-lg text-zinc-600 dark:text-zinc-300">
              <Trophy size={14} className="text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-wider">{matchData.league}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left Column: Match Data */}
            <div className="space-y-6">
              {/* Match ID Card */}
              <div
                onClick={() => copyToClipboard(matchData.id)}
                className="group relative overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4 transition-all hover:shadow-md cursor-pointer"
                title="Click to copy ID"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy size={14} className="text-zinc-400" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    <Hash size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-0.5">Match Reference ID</span>
                    <span className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300 tracking-wide group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {matchData.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/50 flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500 mb-1">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Date</span>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{formatMatchDate(matchData.startDate)}</span>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/50 flex flex-col items-center text-center gap-2 relative overflow-hidden">
                  {status.value === 'live' && <span className="absolute top-2 right-2 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}

                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-full text-orange-500 mb-1">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Kick Off</span>
                    <span className="text-xl font-black text-zinc-900 dark:text-white">{matchData.startTime || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Channel Card */}
              {matchData.channel && (
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Tv size={64} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                      <Tv size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Broadcast Channel</span>
                    </div>
                    <div className="text-2xl font-black tracking-tight leading-none break-words">
                      {matchData.channel}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Performance Report */}
            <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-zinc-400" />
                  <h4 className="text-xs font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">
                    Performance Report
                  </h4>
                </div>
                {(status.value === 'live' || status.value === 'completed') && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.value === 'live' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                    {status.text}
                  </span>
                )}
              </div>

              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-zinc-50/30 dark:bg-black/20">
                {(status.value === 'live' || status.value === 'completed') ? (
                  <>
                    {detailedStats.loading ? (
                      <div className="flex flex-col items-center justify-center h-48 space-y-4">
                        <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Fetching Data...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {detailedStats.start && (
                          <DetailedStatCard
                            title="Start Phase"
                            range={detailedStats.start.rangeStart}
                            data={detailedStats.start}
                            color="indigo"
                            formatBw={formatBw}
                            formatReq={formatReq}
                          />
                        )}

                        {detailedStats.end && (
                          <DetailedStatCard
                            title="End Phase"
                            range={detailedStats.end.rangeEnd}
                            data={detailedStats.end}
                            color="emerald"
                            formatBw={formatBw}
                            formatReq={formatReq}
                          />
                        )}

                        {!detailedStats.start && !detailedStats.end && (
                          <div className="text-center py-12 flex flex-col items-center opacity-50">
                            <Activity size={32} className="text-zinc-300 mb-2" />
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wide">No statistics recorded</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-50">
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full text-zinc-300 dark:text-zinc-600 mb-3">
                      <Activity size={32} />
                    </div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Awaiting Data</h4>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2">
          <button
            onClick={onClose}
            className="w-full py-4 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-2xl text-white dark:text-black text-sm font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            Close Details
          </button>
        </div>

      </div>

    </div>
  );
}

// --- Sub-components ---

function DetailedStatCard({ title, range, data, color, formatBw, formatReq }) {
  const isMultiCdn = data.cdnDetails && data.cdnDetails.length > 0;

  // Theme colors
  const theme = {
    indigo: {
      text: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-100 dark:border-indigo-800/50',
      gradient: 'from-indigo-50 to-white dark:from-indigo-900/10 dark:to-transparent'
    },
    emerald: {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-100 dark:border-emerald-800/50',
      gradient: 'from-emerald-50 to-white dark:from-emerald-900/10 dark:to-transparent'
    }
  }[color] || theme.indigo;

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-2 bg-gradient-to-r ${theme.gradient} border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>{title}</span>
          {isMultiCdn && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded uppercase">Multi-CDN</span>}
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-white dark:bg-zinc-800 px-1.5 rounded">{range || '-'}</span>
      </div>

      <div className="p-4">
        {/* Main Stats (Total) */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
          <StatItem label="Total Bandwidth" value={formatBw(data.bandwidth)} highlight color={theme.text} />
          <StatItem label="Total Requests" value={formatReq(data.reqTotal)} />

          {!isMultiCdn && (
            <>
              <StatItem label="Peak Bandwidth" value={formatBw(data.bwPeakGbps)} />
              <StatItem label="Peak Requests" value={data.reqPeakMin || data.requestPeak || '-'} />
              <StatItem label="CDN Provider" value={data.cdn || 'Single'} colSpan={2} />
            </>
          )}
        </div>

        {/* Multi-CDN Breakdown */}
        {isMultiCdn && (
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
            <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Server size={10} /> Provider Breakdown
            </h5>
            <div className="grid gap-2">
              {data.cdnDetails.map((cdn, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white dark:bg-zinc-800 rounded-md shadow-sm">
                      <Globe size={12} className="text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 block leading-none">{cdn.provider}</span>
                      <span className="text-[9px] text-zinc-400 font-mono">{cdn.key || '-'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-zinc-900 dark:text-white leading-none mb-0.5">
                      {formatBw(cdn.bandwidth)}
                    </div>
                    <div className="text-[9px] font-medium text-zinc-400">
                      {formatReq(cdn.reqTotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value, highlight, color, colSpan }) {
  return (
    <div className={`flex flex-col ${colSpan ? `col-span-${colSpan}` : ''}`}>
      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</span>
      <span className={`font-mono font-bold truncate ${highlight ? `text-lg ${color || 'text-zinc-900 dark:text-white'}` : 'text-sm text-zinc-700 dark:text-zinc-300'}`}>
        {value || '-'}
      </span>
    </div>
  );
}
