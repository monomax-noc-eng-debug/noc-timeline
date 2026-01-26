// file: e:\Project-NOCNTT\noc-timeline\src\features\ticket\components\TicketStats.jsx
import React, { memo } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * StatCard Component - Clean KPI Style
 */
const StatCard = memo(({ label, value, icon, colorClass, borderColorClass }) => {
  const Icon = icon;
  return (
    <div className={cn(
      "relative bg-white dark:bg-zinc-900 border-l-[3px] rounded-r-lg p-4",
      "shadow-sm hover:shadow-md transition-shadow",
      borderColorClass
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <h4 className="text-2xl font-bold text-zinc-900 dark:text-white leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h4>
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-50 dark:bg-zinc-800")}>
          <Icon size={20} className={colorClass} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

/**
 * TicketStats Component - Business Dashboard KPIs
 */
export default function TicketStats({ stats = {} }) {
  const cards = [
    {
      label: 'Total Tickets',
      value: stats?.total || 0,
      icon: FileText,
      colorClass: 'text-[#0078D4]',
      borderColorClass: 'border-[#0078D4]',
    },
    {
      label: 'Resolved',
      value: stats?.succeed || 0,
      icon: CheckCircle,
      colorClass: 'text-emerald-500',
      borderColorClass: 'border-emerald-500',
    },
    {
      label: 'Pending',
      value: stats?.pending || 0,
      icon: Clock,
      colorClass: 'text-amber-500',
      borderColorClass: 'border-amber-500',
    },
    {
      label: 'Incidents',
      value: stats?.incidents || 0,
      icon: AlertCircle,
      colorClass: 'text-red-500',
      borderColorClass: 'border-red-500',
    },
    {
      label: 'Requests',
      value: stats?.requests || 0,
      icon: HelpCircle,
      colorClass: 'text-violet-500',
      borderColorClass: 'border-violet-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((card, i) => (
        <StatCard
          key={i}
          label={card.label}
          value={card.value}
          icon={card.icon}
          colorClass={card.colorClass}
          borderColorClass={card.borderColorClass}
        />
      ))}
    </div>
  );
}