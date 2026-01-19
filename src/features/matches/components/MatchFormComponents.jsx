import React from 'react';
import { Label } from "@/components/ui/label";

export const SectionHeader = ({ icon: Icon, title }) => {
  return (
    <div className="flex items-center gap-2.5 pb-2.5 mb-4 border-b border-zinc-100 dark:border-zinc-800/50">
      <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-500">
        <Icon size={16} />
      </div>
      <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</span>
    </div>
  );
};

export const FormField = ({ label, icon: Icon, children }) => {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-semibold text-zinc-400 flex items-center gap-2 ml-1">
        {Icon && <Icon size={12} className="text-zinc-400" />}
        {label}
      </Label>
      {children}
    </div>
  );
};
