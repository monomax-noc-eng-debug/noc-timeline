import { Clock, CheckCircle2, PlayCircle, Radio } from 'lucide-react';

/**
 * Determines the status of a match based on its data.
 * @param {Object} match - The match data object.
 * @returns {Object} Status configuration object containing text, icon, colors, and other UI properties.
 */
export const getMatchStatus = (match) => {
  const hasStart = match.hasStartStat;
  const hasEnd = match.hasEndStat;

  // Default: Scheduled
  let status = {
    text: 'Scheduled',
    value: 'scheduled',
    icon: Clock,
    colors: {
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-500 dark:text-zinc-400',
      border: 'border-zinc-200 dark:border-zinc-800',
      accent: 'bg-zinc-400',
      gradient: 'from-blue-500 to-indigo-600', // For modal headers
      softBg: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400', // For badges
    },
    pulse: false
  };

  if (hasEnd) {
    status = {
      text: 'Completed',
      value: 'completed',
      icon: CheckCircle2,
      colors: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/50',
        accent: 'bg-emerald-500',
        gradient: 'from-emerald-500 to-teal-600',
        softBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      },
      pulse: false
    };
  } else if (hasStart) {
    status = {
      text: 'Live',
      value: 'live',
      icon: Radio, // Or PlayCircle based on preference
      colors: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800/50',
        accent: 'bg-orange-500',
        gradient: 'from-orange-500 to-red-500',
        softBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      },
      pulse: true
    };
  }

  return status;
};

/**
 * Formats a date string to a readable format.
 * @param {string} dateStr - The date string to format.
 * @returns {string} Formatted date string.
 */
export const formatMatchDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
