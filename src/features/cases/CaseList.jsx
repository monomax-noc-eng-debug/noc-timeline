import React, { useState } from 'react';
import { FilePlus2, Search, X, LayoutDashboard, Download, Filter } from 'lucide-react';
import IncidentCard from './IncidentCard';

export default function CaseList({
  incidents, selectedId, onSelect, onAddIncident, onDeleteIncident,
  onExportCSV
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const filteredIncidents = incidents.filter(incident => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (incident.subject || '').toLowerCase().includes(term) ||
      (incident.project || '').toLowerCase().includes(term) ||
      (incident.ticket || '').toLowerCase().includes(term)
    );
    const matchesStatus = filterStatus === 'All' || incident.status === filterStatus;
    const matchesType = filterType === 'All' || incident.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="lg:col-span-3 flex flex-col h-full overflow-hidden transition-colors duration-300
      bg-[#F9FAFB] dark:bg-[#000000] border-r-2 border-gray-200 dark:border-[#333]">

      {/* HEADER & ACTIONS */}
      <div className="p-4 flex flex-col gap-4 shrink-0 z-10 shadow-sm bg-white dark:bg-[#111] border-b-2 border-gray-200 dark:border-[#333]">

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight text-[#1F2937] dark:text-[#F2F2F2]">
              <span className="bg-white text-[#1F2937] p-1.5 rounded-lg shadow-sm border border-gray-200 dark:bg-[#333] dark:text-[#F2F2F2] dark:border-[#444]">
                <LayoutDashboard size={20} />
              </span>
              INCIDENTS
            </h1>
            <p className="text-[10px] mt-1 ml-1 font-mono font-bold tracking-widest uppercase text-gray-400">
              {filteredIncidents.length} LOGS
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => onExportCSV(filteredIncidents)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors shadow-md bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-black dark:bg-[#222] dark:text-[#F2F2F2] dark:border-[#333]" title="Export CSV">
              <Download size={16} />
            </button>
            <button onClick={onAddIncident} className="flex items-center gap-2 px-3 h-8 rounded-lg text-xs font-black uppercase tracking-widest transition-colors shadow-md bg-[#1F2937] text-white hover:bg-black dark:bg-[#F2F2F2] dark:text-[#000000]">
              <FilePlus2 size={16} /> <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* ADVANCED FILTERS (Responsive Grid) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-8 pl-2 pr-6 bg-gray-100 dark:bg-[#222] border-none rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 appearance-none outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <Filter size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full h-8 pl-2 pr-6 bg-gray-100 dark:bg-[#222] border-none rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 appearance-none outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Incident">Incident</option>
              <option value="Request">Request</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <Filter size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg text-xs font-bold outline-none border-2 transition-all bg-white text-[#1F2937] border-gray-200 focus:border-gray-400 placeholder-gray-400 dark:bg-[#000] dark:text-[#F2F2F2] dark:border-[#333] dark:focus:border-[#666]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1">
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
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#F2F2F2]">No matching incidents</span>
            {(searchTerm || filterStatus !== 'All' || filterType !== 'All') && (
              <button onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterType('All'); }} className="text-[10px] text-blue-500 hover:underline">Reset Filters</button>
            )}
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              isSelected={selectedId === incident.id}
              onClick={() => onSelect(incident.id)}
              onDelete={onDeleteIncident}
            />
          ))
        )}
      </div>
    </div>
  );
}