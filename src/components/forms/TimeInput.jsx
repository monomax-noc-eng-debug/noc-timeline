import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable TimeInput Component
 * 
 * @param {string} value - Time value in "HH:mm" format (e.g., "13:30")
 * @param {Function} onChange - (e) => void
 * @param {String} className - Additional CSS classes for the input
 * @param {Boolean} disabled - Disable the input
 */
export function TimeInput({ value, onChange, className, disabled, showIcon = true, ...props }) {
  return (
    <div className="relative">
      {showIcon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10">
          <Clock className="h-4 w-4" />
        </div>
      )}
      <input
        type="time"
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          showIcon ? "pl-9" : "",
          "cursor-pointer",
          className
        )}
        {...props}
      />
    </div>
  );
}