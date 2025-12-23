import React from 'react';
import { FilePlus2, Search, X, LayoutDashboard, Download, Filter, AlertCircle, PlayCircle, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import IncidentCard from './IncidentCard';

export default function CaseList({
  filteredIncidents,
  selectedId,
  onSelect,
  onAddIncident,
  onDeleteIncident,
  onExportCSV,
  stats,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  clearFilters,
  hasActiveFilters,
  loading
}) {
  // Quick filter by status
  const handleQuickFilter = (status) => {
    setFilterStatus(status === filterStatus ? 'All' : status);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-black border-r border-zinc-200 dark:border-zinc-800 relative">

      {/* HEADER & ACTIONS */}
      <div className="p-5 flex flex-col gap-4 shrink-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">

        {/* Title & Buttons */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white flex items-center gap-2">
              <LayoutDashboard size={20} className="text-zinc-400" />
              INCIDENTS
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 mt-1">
              {filteredIncidents?.length || 0} of {stats?.total || 0} cases
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onExportCSV(filteredIncidents)}
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              title="Export CSV"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onAddIncident}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity shadow-sm"
            >
              <FilePlus2 size={16} /> <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* ✅ Stats Mini Bar */}
        {stats && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:hidden">
            {[
              { status: 'Open', count: stats.open, color: 'bg-red-500', icon: AlertCircle },
              { status: 'In Progress', count: stats.inProgress, color: 'bg-blue-500', icon: PlayCircle },
              { status: 'Monitoring', count: stats.monitoring, color: 'bg-orange-500', icon: Clock },
              { status: 'Resolved', count: stats.resolved, color: 'bg-emerald-500', icon: CheckCircle2 },
              { status: 'Closed', count: stats.closed, color: 'bg-zinc-400', icon: XCircle },
            ].filter(item => item.count > 0).map(item => (
              <button
                key={item.status}
                onClick={() => handleQuickFilter(item.status)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold shrink-0 transition-all ${filterStatus === item.status
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="uppercase">{item.status.split(' ')[0]}</span>
                <span className="font-mono">{item.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tickets, subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-8 rounded-xl text-xs font-bold outline-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:border-black dark:focus:border-white transition-all placeholder-zinc-400 dark:placeholder-zinc-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-9 pl-3 pr-8 bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-300 appearance-none outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative flex-1">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full h-9 pl-3 pr-8 bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-300 appearance-none outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <option value="All">All Types</option>
              <option value="Incident">Incident</option>
              <option value="Request">Request</option>
              <option value="Maintenance">Maint.</option>
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Clear all filters"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* LIST AREA */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-zinc-50 dark:bg-[#050505]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-2 border-zinc-300 border-t-black dark:border-zinc-700 dark:border-t-white rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading...</span>
          </div>
        ) : filteredIncidents?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-3">
            <Search size={32} className="text-zinc-300 dark:text-zinc-700" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {hasActiveFilters ? 'No matching cases' : 'No incidents yet'}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-bold text-blue-500 hover:underline"
              >
                Clear Filters
              </button>
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