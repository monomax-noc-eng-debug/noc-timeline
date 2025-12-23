import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// ✅ เพิ่มค่า Default ให้ stats เป็น Object ว่างๆ เพื่อป้องกันพัง
export default function TicketStats({ stats = {} }) {
  const cards = [
    { 
      label: 'Total Tickets', 
      value: stats?.total || 0, // ✅ ใช้ Optional Chaining และ fallback เป็น 0
      icon: FileText, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Succeed', 
      value: stats?.succeed || 0, 
      icon: CheckCircle, 
      color: 'text-green-500', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Pending', 
      value: stats?.pending || 0, 
      icon: Clock, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50' 
    },
    { 
      label: 'Incidents', 
      value: stats?.incidents || 0, 
      icon: AlertCircle, 
      color: 'text-red-500', 
      bg: 'bg-red-50' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${card.bg} dark:bg-opacity-10 ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{card.label}</p>
              <p className="text-2xl font-black dark:text-white leading-none mt-1">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}