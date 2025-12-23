import React from 'react';
import {
  Clock, Trophy, Tv, Pencil, Trash2, Eye, BarChart3,
  CheckCircle2, Radio
} from 'lucide-react';

export default function MatchCard({ match, onClick, onEdit, onDelete, selectable, selected, onSelect }) {

  // --- 1. Determine Status ---
  const getStatus = () => {
    if (match.hasEndStat) return 'FINISHED';
    if (match.hasStartStat && !match.hasEndStat) return 'LIVE';

    // Check for "Starting Soon" (within 15 mins)
    if (match.startTime) {
      const now = new Date();
      const [hours, minutes] = match.startTime.split(':').map(Number);
      const matchDate = new Date();
      matchDate.setHours(hours, minutes, 0, 0);

      const diffMs = matchDate - now;
      const diffMins = diffMs / (1000 * 60);

      if (diffMins > 0 && diffMins <= 15) return 'SOON';
    }

    return 'UPCOMING';
  };

  const status = getStatus();

  // --- 2. Get Stats ---
  // Change from BW to Viewers
  const getViewerCount = () => {
    if (match.endStats?.muxViewerUniq) return match.endStats.muxViewerUniq;
    if (match.startStats?.muxViewerUniq) return match.startStats.muxViewerUniq;
    return 0;
  };

  // Helper to format large numbers (e.g. 1.2M, 500k)
  const formatCompact = (numStr) => {
    if (!numStr) return '0';
    // If it's complex string with unit, try to parse
    const num = parseFloat(numStr.toString().replace(/,/g, ''));
    if (isNaN(num)) return numStr;

    return Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num);
  };

  const viewerCount = getViewerCount();

  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white dark:bg-zinc-900 rounded-2xl border-2 transition-all duration-300 
        hover:shadow-2xl hover:scale-[1.02] cursor-pointer overflow-hidden
        ${status === 'LIVE' ? 'border-red-500 shadow-lg shadow-red-500/20' : ''}
        ${status === 'SOON' ? 'border-orange-400 shadow-lg shadow-orange-500/10' : ''}
        ${status === 'FINISHED' ? 'border-emerald-500/30 dark:border-emerald-500/20' : ''}
        ${status === 'UPCOMING' ? 'border-zinc-200 dark:border-zinc-800' : ''}
      `}
    >
      {/* Accent Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status === 'LIVE' ? 'bg-red-500 animate-pulse' :
        status === 'SOON' ? 'bg-orange-500' :
          status === 'FINISHED' ? 'bg-emerald-500' :
            'bg-zinc-300 dark:bg-zinc-700'
        }`} />

      {/* LIVE/SOON Gradient Background */}
      {(status === 'LIVE' || status === 'SOON') && (
        <div className={`absolute inset-0 bg-gradient-to-r pointer-events-none ${status === 'LIVE' ? 'from-red-500/5 via-orange-500/5' : 'from-orange-500/5 via-yellow-500/5'
          } to-transparent`} />
      )}

      <div className="p-6 pl-8 relative">

        {/* Header Row: Status + Actions */}
        <div className="flex items-start justify-between mb-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {status === 'LIVE' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg shadow-lg shadow-red-500/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider">LIVE</span>
              </div>
            )}

            {status === 'SOON' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg shadow-md shadow-orange-500/20 animate-pulse">
                <Clock size={14} className="stroke-[3]" />
                <span className="text-xs font-black uppercase tracking-wider">Starting Soon</span>
              </div>
            )}

            {status === 'FINISHED' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg shadow-md">
                <CheckCircle2 size={14} />
                <span className="text-xs font-black uppercase tracking-wider">Finished</span>
              </div>
            )}

            {status === 'UPCOMING' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <Clock size={14} />
                <span className="text-xs font-black uppercase tracking-wider">Scheduled</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(match); }}
                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(match.id); }}
                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Match Info */}
        <div className="space-y-3">
          {/* League & Channel Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {match.league && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Trophy size={12} className="text-zinc-400" />
                <span className="font-semibold">{match.league}</span>
              </div>
            )}
            {match.channel && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                <Tv size={10} />
                {match.channel}
              </div>
            )}
          </div>

          {/* Match Title */}
          <div className="flex items-center gap-3">
            {/* Time Display */}
            <div className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border transition-colors ${status === 'SOON'
              ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
              : 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
              }`}>
              {(status === 'LIVE') ? (
                <>
                  <Radio size={16} className="text-red-500 mb-1 animate-pulse" />
                  <span className="text-[10px] font-black text-red-500 uppercase">Live</span>
                </>
              ) : (
                <>
                  <span className={`text-xl font-black font-mono leading-none ${status === 'SOON' ? 'text-orange-500' : 'text-zinc-900 dark:text-white'
                    }`}>{match.startTime?.split(':')[0] || '--'}</span>
                  <span className={`text-xs font-mono ${status === 'SOON' ? 'text-orange-400' : 'text-zinc-400'
                    }`}>{match.startTime?.split(':')[1] || '--'}</span>
                </>
              )}
            </div>

            {/* Teams */}
            <div className="flex-1 min-w-0">
              {match.teamA && match.teamB ? (
                <div className="space-y-1">
                  <div className="text-base font-black text-zinc-900 dark:text-white truncate">
                    {match.teamA}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                    <span className="text-xs font-bold text-zinc-400">VS</span>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                  <div className="text-base font-black text-zinc-900 dark:text-white truncate">
                    {match.teamB}
                  </div>
                </div>
              ) : (
                <div className="text-base font-black text-zinc-900 dark:text-white truncate">
                  {match.title || match.match || 'Match Event'}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row (Viewers instead of BW) */}
          {(status === 'LIVE' || status === 'FINISHED') && viewerCount && (
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <Eye size={14} className="text-violet-500" />
                <span>{formatCompact(viewerCount)} Viewers</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Details Button */}
      <button
        onClick={onClick}
        className="absolute bottom-4 right-4 p-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        title="View Details"
      >
        <Eye size={16} />
      </button>
    </div>
  );
}