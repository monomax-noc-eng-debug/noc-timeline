import React from 'react';

export default function TicketDetails({ incident, onUpdate }) {
  const labelClasses = "block text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5";
  const textareaClasses = "w-full text-[10px] font-medium text-zinc-700 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg p-2 border border-zinc-100 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900/50 focus:border-zinc-300 transition-all resize-none placeholder-zinc-300 outline-none min-h-[50px] leading-snug";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
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