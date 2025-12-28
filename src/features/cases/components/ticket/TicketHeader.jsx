import React from 'react';
import {
  ArrowLeft, FileText, AlertCircle,
  CheckCircle2, Clock, PlayCircle, XCircle,
  AlertTriangle, Minus, Trash2, Settings, Zap, Download, UploadCloud
} from 'lucide-react';
import { useTicketOptions } from '../../../../hooks/useTicketOptions';

export default function TicketHeader({
  incident = {},
  onUpdate = () => { },
  onBack = () => { },
  onDelete = () => { },
  onEdit = () => { },
  onGenerateReport = () => { },
  onExport = () => { },
  onImport = () => { }
}) {
  // Get ticket options from Firestore
  const { ticketOptions } = useTicketOptions();

  // ตรวจสอบเงื่อนไข Auto Format (INC-PROJ | Type | Subject)
  const isAutoFormat = incident.subject?.includes('|') && incident.subject?.includes('-');

  // Configuration สำหรับ Status
  const getStatusConfig = (s) => {
    const configs = {
      'Open': { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20', icon: AlertCircle },
      'Pending': { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', icon: Clock },
      'In Progress': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', icon: PlayCircle },
      'Succeed': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', icon: CheckCircle2 },
      'Resolved': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', icon: CheckCircle2 },
      'Closed': { bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-500/20', icon: XCircle }
    };
    return configs[s] || { bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-500/20', icon: AlertCircle };
  };

  const getPriorityConfig = (p) => {
    const configs = {
      'Critical': { color: 'text-red-600', icon: AlertTriangle, bg: 'bg-red-500/10' },
      'High': { color: 'text-orange-600', icon: AlertTriangle, bg: 'bg-orange-500/10' },
      'Medium': { color: 'text-yellow-600', icon: Minus, bg: 'bg-yellow-500/10' },
      'Low': { color: 'text-blue-600', icon: Minus, bg: 'bg-blue-500/10' }
    };
    return configs[p] || { color: 'text-zinc-500', icon: Minus, bg: 'bg-zinc-500/10' };
  };

  const statusConfig = getStatusConfig(incident.status || 'Open');
  const StatusIcon = statusConfig.icon;
  const priorityConfig = getPriorityConfig(incident.priority || 'Medium');
  const PriorityIcon = priorityConfig.icon;

  // ฟังก์ชันช่วย Parse Subject อัตโนมัติ
  const handleSubjectChange = (e) => {
    const val = e.target.value;
    let updates = { subject: val };

    if (val.includes('|') && val.includes('-')) {
      const parts = val.split('|').map(p => p.trim());
      // คาดหวังรูปแบบ: Ticket-Project | Type | Subject
      if (parts.length >= 2) {
        const idProjectPart = parts[0].split('-').map(p => p.trim());
        if (idProjectPart.length >= 2) {
          updates.ticket = idProjectPart[0];
          updates.project = idProjectPart[1];

          const typeCandidate = parts[1];
          // Use types from ticketOptions
          const validTypes = ticketOptions.types || ['Incident', 'Request', 'Maintenance'];
          updates.type = validTypes.find(t => t.toLowerCase() === typeCandidate.toLowerCase()) || typeCandidate;

          if (parts.length >= 3) {
            updates.subject = parts.slice(2).join(' | ');
          }
        }
      }
    }
    onUpdate(updates);
  };

  return (
    <div className="relative px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 z-20 shrink-0 bg-white dark:bg-[#080808] transition-all duration-300">
      <div className="flex items-center justify-between gap-4">

        {/* Left Section: Actions & Tags */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white transition-all"
          >
            <ArrowLeft size={14} />
          </button>

          <div className="w-px h-4 bg-zinc-100 dark:bg-zinc-800 mx-1" />

          <div className="flex items-center gap-1">
            {/* Status Pill */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${statusConfig.border} ${statusConfig.bg}`}>
              <StatusIcon size={10} className={statusConfig.text} />
              <select
                value={incident.status || 'Open'}
                onChange={(e) => onUpdate({ status: e.target.value })}
                className={`bg-transparent font-black uppercase text-[8px] tracking-wider cursor-pointer outline-none border-none p-0 focus:ring-0 ${statusConfig.text}`}
              >
                {(ticketOptions.statuses || ['Open', 'Pending', 'Succeed', 'Closed']).map(s => (
                  <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">{s}</option>
                ))}
              </select>
            </div>

            {/* Priority Pill */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border border-transparent ${priorityConfig.bg}`}>
              <PriorityIcon size={10} className={priorityConfig.color} />
              <select
                value={incident.priority || 'Medium'}
                onChange={(e) => onUpdate({ priority: e.target.value })}
                className={`bg-transparent font-black uppercase text-[8px] tracking-wider cursor-pointer outline-none border-none p-0 focus:ring-0 ${priorityConfig.color}`}
              >
                {(ticketOptions.severities || ['Critical', 'High', 'Medium', 'Low']).map(p => (
                  <option key={p} value={p} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Meta Info (Desktop only) */}
          <div className="hidden lg:flex items-center gap-2 ml-2">
            <span className="text-[10px] font-mono font-black text-blue-500 tracking-tighter opacity-70">
              #{incident.ticket || 'NO-ID'}
            </span>
            <div className="h-1 w-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest truncate max-w-[100px]">
              {incident.project || 'GENERAL'}
            </span>
          </div>
        </div>

        {/* Center Section: Input Subject */}
        <div className="flex-1 max-w-2xl relative group px-2">
          <input
            type="text"
            className="w-full text-sm md:text-base font-black text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700 border-none bg-transparent p-0 focus:ring-0 leading-tight transition-all"
            value={incident.subject || ''}
            onChange={handleSubjectChange}
            placeholder="Auto Parsing..."
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <Zap
              size={12}
              className={`transition-all duration-500 ${isAutoFormat
                ? 'text-emerald-500 fill-current animate-pulse'
                : 'text-zinc-200 dark:text-zinc-800'
                }`}
            />
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-0.5">
          <button onClick={onExport} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500 transition-all" title="Export CSV">
            <Download size={14} />
          </button>
          <button onClick={onGenerateReport} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-blue-500 transition-all" title="Report">
            <FileText size={14} />
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-orange-500 transition-all" title="Settings">
            <Settings size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-all" title="Delete">
            <Trash2 size={14} />
          </button>

          <div className="w-px h-4 bg-zinc-100 dark:bg-zinc-800 mx-1 hidden sm:block" />

          {/* Timestamp */}
          <div className="flex flex-col items-end shrink-0 hidden sm:flex ml-1">
            <span className="text-[7px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">Date</span>
            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-tighter mt-0.5">
              {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('en-GB') : 'N/A'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}