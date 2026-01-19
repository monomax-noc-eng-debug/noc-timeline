import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_COLORS = {
  'NOC Lead': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  'NOC Engineer': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'Support': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'Viewer': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
};

const ROLE_OPTIONS = ['NOC Lead', 'NOC Engineer', 'Support', 'Viewer'];

export default function RoleSelector({ value, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (role) => {
    onChange(role);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
          ROLE_COLORS[value],
          !disabled && "cursor-pointer hover:shadow-md",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {value}
        {!disabled && <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full mt-2 left-0 z-50 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSelect(role)}
                className={cn(
                  "w-full px-4 py-2.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left",
                  value === role && "bg-zinc-50 dark:bg-zinc-800/50"
                )}
              >
                <span className={cn(
                  "inline-flex px-2.5 py-1 rounded-full text-xs font-bold border",
                  ROLE_COLORS[role]
                )}>
                  {role}
                </span>
                {value === role && (
                  <Check size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
