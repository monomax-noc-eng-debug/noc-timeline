import React, { memo } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// Memoized StatCard component for performance
const StatCard = memo(({ label, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-wide">{label}</p>
        <p className="text-xl font-black text-zinc-900 dark:text-white leading-none mt-0.5">{value}</p>
      </div>
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

export default function TicketStats({ stats = {} }) {
  const cards = [
    {
      label: 'Total Tickets',
      value: stats?.total || 0,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      label: 'Succeed',
      value: stats?.succeed || 0,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      label: 'Pending',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      label: 'Incidents',
      value: stats?.incidents || 0,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/30'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <StatCard
          key={i}
          label={card.label}
          value={card.value}
          icon={card.icon}
          color={card.color}
          bgColor={card.bgColor}
        />
      ))}
    </div>
  );
}