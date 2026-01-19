import React from 'react';
import { ChevronDown, User, Tag, Hash, FolderKanban } from 'lucide-react';

export default function TicketInfo({ incident, onUpdate }) {
  const inputClasses = "w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 font-black text-[11px] text-zinc-800 dark:text-zinc-200 transition-all pb-1 placeholder-zinc-300 dark:placeholder-zinc-700 outline-none uppercase tracking-tight";
  const labelClasses = "block text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1 flex items-center gap-1.5";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border-b border-zinc-200 dark:border-zinc-800">

      {/* Project */}
      <div className="group">
        <label className={labelClasses}><FolderKanban size={10} /> Project</label>
        <input
          type="text"
          className={inputClasses}
          value={incident.project || ''}
          onChange={(e) => onUpdate({ project: e.target.value })}
          placeholder="Project"
        />
      </div>

      {/* Type */}
      <div className="group">
        <label className={labelClasses}><Tag size={10} /> Type</label>
        <div className="relative">
          <select
            value={incident.type || 'Incident'}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className={`${inputClasses} appearance-none cursor-pointer`}
          >
            <option className="dark:bg-zinc-800" value="Incident">Incident</option>
            <option className="dark:bg-zinc-800" value="Request">Request</option>
            <option className="dark:bg-zinc-800" value="Maintenance">Maint</option>
          </select>
          <ChevronDown size={10} className="absolute right-0 top-1.5 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Ticket ID */}
      <div className="group">
        <label className={labelClasses}><Hash size={10} /> Ticket</label>
        <input
          type="text"
          className={`${inputClasses} font-mono text-[#0078D4] dark:text-[#4ba0e8] uppercase`}
          value={incident.ticket || ''}
          onChange={(e) => onUpdate({ ticket: e.target.value })}
          placeholder="NO-TICKET"
        />
      </div>

      {/* Reporter */}
      <div className="group">
        <label className={labelClasses}><User size={10} /> Reporter</label>
        <div className="flex items-center gap-2 py-1 border-b border-white dark:border-black opacity-60">
          <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 truncate">
            {incident.createdBy?.split(' ')[0] || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}