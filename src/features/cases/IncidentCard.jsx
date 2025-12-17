import React from 'react';
import { Trash2, AlertCircle, PlayCircle, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';

const getStatusConfig = (status) => {
  switch (status) {
    case 'Open': return { color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800', icon: AlertCircle };
    case 'In Progress': return { color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800', icon: PlayCircle };
    case 'Monitoring': return { color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800', icon: Clock };
    case 'Resolved': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800', icon: CheckCircle2 };
    case 'Completed':
    case 'Closed': return { color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-[#111] dark:text-gray-400 dark:border-[#333]', icon: XCircle };
    default: return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: AlertCircle };
  }
};

export default function IncidentCard({ incident, isSelected, onClick, onDelete }) {
  const { color, icon: Icon } = getStatusConfig(incident.status);

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-4 rounded-xl cursor-pointer border-2 transition-all duration-200
        ${isSelected
          ? 'bg-white border-[#1F2937] shadow-md scale-[1.02] dark:bg-[#000000] dark:border-[#F2F2F2]'
          : 'bg-white border-transparent hover:border-gray-300 hover:shadow-sm dark:bg-[#111] dark:hover:border-[#333]'
        }
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest line-clamp-1 text-gray-400">
          {incident.project || 'No Project'}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(incident.id); }}
          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete Incident"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Subject */}
      <h3 className={`font-bold text-sm leading-tight mb-3 ${isSelected ? 'text-[#1F2937] dark:text-[#F2F2F2]' : 'text-[#1F2937] dark:text-[#F2F2F2]'}`}>
        {incident.subject || 'New Incident'}
      </h3>

      {/* Footer */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold font-mono text-gray-400">{incident.ticket || '-'}</span>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold flex items-center gap-1 text-gray-400">
              <Calendar size={10} />
              {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '-'}
            </span>
            {incident.createdBy && (
              <div className="flex items-center gap-1.5" title={`Created by ${incident.createdBy}`}>
                {/* วงกลมตัวอักษรย่อ */}
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shadow-sm 
                  bg-[#1F2937] text-white dark:bg-[#F2F2F2] dark:text-[#000000]">
                  {incident.createdBy.charAt(0).toUpperCase()}
                </div>
                {/* ✅ เพิ่มส่วนแสดงชื่อเต็มกลับเข้ามาครับ */}
                <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                  {incident.createdBy}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-wide ${color}`}>
          <Icon size={12} />
          <span>{incident.status || 'Open'}</span>
        </div>
      </div>
    </div>
  );
}