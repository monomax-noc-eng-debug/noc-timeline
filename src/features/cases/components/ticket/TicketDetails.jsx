import React from 'react';

export default function TicketDetails({ incident, onUpdate }) {
  const labelClasses = "block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2";
  const textareaClasses = "w-full text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-white transition-all resize-none placeholder-zinc-400 outline-none min-h-[80px]";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-6 border-b border-zinc-200 dark:border-zinc-800">
      {['impact', 'root_cause', 'action'].map((field) => (
        <div key={field} className="relative group">
          <label className={labelClasses}>{field.replace('_', ' ')}</label>
          <textarea
            className={textareaClasses}
            value={incident[field] || ''}
            onChange={(e) => onUpdate({ [field]: e.target.value })}
            placeholder={`Describe ${field.replace('_', ' ')}...`}
          />
        </div>
      ))}
    </div>
  );
}
