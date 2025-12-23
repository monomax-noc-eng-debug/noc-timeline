import React from 'react';
import { ChevronDown, User, Tag, Hash, FolderKanban } from 'lucide-react';

export default function TicketInfo({ incident, onUpdate }) {
  const inputClasses = "w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-black dark:focus:border-white font-bold text-xs text-zinc-900 dark:text-white transition-all pb-1 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none";
  const labelClasses = "block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-zinc-200 dark:border-zinc-800">

      {/* Project */}
      <div className="group">
        <label className={labelClasses}><FolderKanban size={10} /> Project</label>
        <input
          type="text"
          className={inputClasses}
          value={incident.project || ''}
          onChange={(e) => onUpdate({ project: e.target.value })}
          placeholder="Project Name"
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
            <option className="dark:bg-zinc-800" value="Maintenance">Maint.</option>
          </select>
          <ChevronDown size={12} className="absolute right-0 top-1 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Ticket ID */}
      <div className="group">
        <label className={labelClasses}><Hash size={10} /> Ticket ID</label>
        <input
          type="text"
          className={`${inputClasses} font-mono text-blue-600 dark:text-blue-400`}
          value={incident.ticket || ''}
          onChange={(e) => onUpdate({ ticket: e.target.value })}
          placeholder="NO-TICKET"
        />
      </div>

      {/* Reporter (Read Only for now, or editable) */}
      <div className="group">
        <label className={labelClasses}><User size={10} /> Reporter</label>
        <div className="flex items-center gap-2 py-0.5 border-b border-zinc-200 dark:border-zinc-800 opacity-70">
          <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
            {incident.createdBy || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}
