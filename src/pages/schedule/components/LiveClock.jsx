import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="w-full md:w-auto bg-white text-black px-4 md:px-6 py-2.5 rounded-xl font-mono text-lg md:text-xl font-bold shadow-lg flex items-center justify-center md:justify-start gap-3">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
      {format(time, 'HH:mm:ss')}
    </div>
  );
};

export default LiveClock;
