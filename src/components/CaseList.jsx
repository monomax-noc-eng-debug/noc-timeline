import React, { useState } from 'react';
// ✅ เปลี่ยน Plus -> FilePlus2 (สื่อถึงการสร้างไฟล์งานใหม่)
import { FilePlus2, Moon, Sun, Trash2, AlertCircle, CheckCircle2, Clock, PlayCircle, XCircle, Search, X } from 'lucide-react';

export default function CaseList({ incidents, selectedId, onSelect, onAddIncident, onDeleteIncident, darkMode, toggleTheme, onLoadMore, hasMore, isLoadingMore }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIncidents = incidents.filter(incident => {
    const term = searchTerm.toLowerCase();
    const subject = (incident.subject || '').toLowerCase();
    const project = (incident.project || '').toLowerCase();
    const ticket = (incident.ticket || '').toLowerCase();
    return subject.includes(term) || project.includes(term) || ticket.includes(term);
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-500/30';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500/30';
      case 'Monitoring': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-500/30';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'Completed':
      case 'Closed': return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertCircle size={12} />;
      case 'In Progress': return <PlayCircle size={12} />;
      case 'Monitoring': return <Clock size={12} />;
      case 'Resolved': return <CheckCircle2 size={12} />;
      case 'Closed': return <XCircle size={12} />;
      default: return <AlertCircle size={12} />;
    }
  }

  return (
    <div className="lg:col-span-3 flex flex-col h-full border-r-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">

      {/* HEADER */}
      <div className="p-4 border-b-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex justify-between items-center shrink-0 z-10 shadow-sm">
        <h1 className="font-black text-xl tracking-tighter text-gray-900 dark:text-white">INCIDENTS</h1>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* ✅ ปุ่ม NEW CASE (ใช้ FilePlus2) */}
          <button onClick={onAddIncident} className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md">
            <FilePlus2 size={16} /> <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search project, ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 outline-none border-2 border-transparent focus:border-black dark:focus:border-white transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white p-1">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* LIST AREA */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-50 space-y-2">
            <Search size={24} className="text-gray-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">No matching incidents</span>
            {searchTerm && <button onClick={() => setSearchTerm('')} className="text-[10px] text-blue-500 hover:underline">Clear Search</button>}
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSelected = selectedId === incident.id;
            return (
              <div
                key={incident.id}
                onClick={() => onSelect(incident.id)}
                className={`
                  group relative p-4 rounded-xl cursor-pointer border-2 transition-all duration-200
                  ${isSelected
                    ? 'bg-white dark:bg-zinc-900 border-black dark:border-white shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-zinc-900 border-transparent hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest line-clamp-1">
                    {incident.project || 'No Project'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteIncident(incident.id); }}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Incident"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className={`font-bold text-sm leading-tight mb-3 ${isSelected ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {incident.subject || 'New Incident'}
                </h3>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 font-mono mb-1">{incident.ticket || '-'}</span>
                    <span className="text-[9px] font-bold text-gray-300">
                      {new Date(incident.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-wide ${getStatusColor(incident.status || 'Open')}`}>
                    {getStatusIcon(incident.status)}
                    <span>{incident.status || 'Open'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {!searchTerm && hasMore && (
          <button onClick={onLoadMore} disabled={isLoadingMore} className="w-full py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50">
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
}