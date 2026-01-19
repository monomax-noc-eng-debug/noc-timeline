import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils"; // ถ้ามี util นี้ หรือใช้ string template ธรรมดาก็ได้

const LiveClock = ({ className }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm font-mono text-zinc-700 dark:text-zinc-300 font-bold",
      className
    )}>
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="min-w-[64px] text-center">
        {format(time, 'HH:mm:ss')}
      </span>
    </div>
  );
};

export default LiveClock;