// src/features/matches/components/MatchCard.jsx
import React, { memo, useMemo } from 'react';
import { getMatchStatus } from '@/utils/matchStatus';
import { cn } from "@/lib/utils";
import {
  Clock, Trophy, Tv, Pencil, Trash2, Eye,
  CheckCircle2, Radio, Timer
} from 'lucide-react';

/**
 * Outlook-style MatchCard Component
 * Clean, professional design with subtle semantic colors
 */
const MatchCard = memo(({ match = {}, onClick, onEdit, onDelete }) => {

  const status = useMemo(() => getMatchStatus(match), [match]);
  const statusLower = status?.toLowerCase() || 'upcoming';

  // Statistics
  const viewerCount = useMemo(() => {
    if (match?.endStats?.muxViewerUniq) return match.endStats.muxViewerUniq;
    if (match?.startStats?.muxViewerUniq) return match.startStats.muxViewerUniq;
    return 0;
  }, [match?.endStats, match?.startStats]);

  const formatCompact = (numStr) => {
    if (!numStr) return '0';
    const num = parseFloat(numStr.toString().replace(/,/g, ''));
    if (isNaN(num)) return numStr;
    return Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num);
  };

  const isCountingDown = status === 'SOON' && match?.countdown && match.countdown.includes('m');

  // Outlook-style status config
  const statusConfig = {
    LIVE: {
      bg: 'bg-red-500',
      text: 'text-white',
      timeBg: 'bg-red-500',
      timeText: 'text-white'
    },
    SOON: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      timeBg: 'bg-amber-50 dark:bg-amber-900/20',
      timeText: 'text-amber-600 dark:text-amber-400'
    },
    UPCOMING: {
      bg: 'bg-[#0078D4]/10',
      text: 'text-[#0078D4]',
      timeBg: 'bg-[#0078D4]/5 dark:bg-[#0078D4]/10',
      timeText: 'text-[#0078D4]'
    },
    FINISHED: {
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-600 dark:text-zinc-400',
      timeBg: 'bg-zinc-100 dark:bg-zinc-800',
      timeText: 'text-zinc-500 dark:text-zinc-400'
    }
  };

  const config = statusConfig[status] || statusConfig.UPCOMING;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-white dark:bg-zinc-900 border rounded-lg p-4 cursor-pointer transition-all duration-200",
        "border-zinc-200 dark:border-zinc-800",
        "hover:border-[#0078D4] hover:shadow-md",
        status === 'LIVE' && "border-l-4 border-l-red-500"
      )}
    >
      {/* Header Row: Time + Teams */}
      <div className="flex items-start gap-3">

        {/* Time Box - Compact Outlook Style */}
        <div className={cn(
          "shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-md transition-colors",
          config.timeBg,
          status === 'LIVE' && "bg-red-500"
        )}>
          {status === 'LIVE' ? (
            <>
              <Radio size={16} className="text-white mb-0.5 animate-pulse" />
              <span className="text-[9px] font-semibold text-white uppercase">Live</span>
            </>
          ) : isCountingDown ? (
            <>
              <span className={cn("text-xl font-bold font-mono leading-none", config.timeText)}>
                {match.countdown.replace('m', '')}
              </span>
              <span className={cn("text-[9px] font-medium uppercase", config.timeText)}>min</span>
            </>
          ) : (
            <>
              <span className={cn("text-xl font-bold font-mono leading-none", config.timeText)}>
                {match.startTime?.split(':')[0] || '--'}
              </span>
              <span className={cn("text-[10px] font-mono", config.timeText)}>
                :{match.startTime?.split(':')[1] || '00'}
              </span>
            </>
          )}
        </div>

        {/* Match Content */}
        <div className="flex-1 min-w-0">

          {/* Status Badge Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold",
              config.bg, config.text
            )}>
              {status === 'LIVE' && (
                <>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  </span>
                  LIVE
                </>
              )}
              {status === 'SOON' && (
                <>
                  <Timer size={12} />
                  {isCountingDown ? `In ${match.countdown}` : 'Soon'}
                </>
              )}
              {status === 'UPCOMING' && (
                <>
                  <Clock size={12} />
                  Scheduled
                </>
              )}
              {status === 'FINISHED' && (
                <>
                  <CheckCircle2 size={12} />
                  Finished
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(match); }}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-[#0078D4] hover:bg-[#0078D4]/10 transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(match.id); }}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Teams / Title */}
          {match.teamA && match.teamB ? (
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {match.teamA}
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {match.teamB}
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
              {match.title || match.match || 'Match Event'}
            </div>
          )}
        </div>
      </div>

      {/* Footer Row: League, Channel, Stats Status */}
      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 min-w-0">
          {match.league && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Trophy size={12} className="text-zinc-400" />
              <span className="font-medium truncate max-w-[100px]">{match.league}</span>
            </div>
          )}
          {match.channel && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#0078D4]/10 text-[#0078D4] rounded text-[10px] font-semibold shrink-0">
              <Tv size={10} />
              {match.channel}
            </div>
          )}
        </div>

        {/* S/E Status + Viewers */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Stats Status Dots */}
          <div className="flex items-center gap-1.5 text-[9px] font-medium text-zinc-400">
            <div className="flex items-center gap-0.5" title="Start Stats">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                match.hasStartStat ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
              )} />
              <span>S</span>
            </div>
            <div className="flex items-center gap-0.5" title="End Stats">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                match.hasEndStat ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
              )} />
              <span>E</span>
            </div>
          </div>

          {/* Viewer Count */}
          {viewerCount > 0 && (
            <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
              <Eye size={12} className="text-[#0078D4]" />
              <span>{formatCompact(viewerCount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MatchCard.displayName = 'MatchCard';
export default MatchCard;