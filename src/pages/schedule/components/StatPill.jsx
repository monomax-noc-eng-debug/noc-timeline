import React from 'react';

const StatPill = ({ label, count, active, onClick, isLive }) => {
  return (
    <button
      onClick={onClick}
      className={`
        h-10 px-4 rounded-lg border-2 flex items-center gap-2 font-bold text-sm transition-all
        ${active
          ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-lg'
          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
        }
      `}
    >
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-md text-xs font-black ${active
        ? 'bg-white/20 text-white dark:text-black'
        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
        }`}>
        {count}
      </span>
      {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
    </button>
  );
};

export default StatPill;
