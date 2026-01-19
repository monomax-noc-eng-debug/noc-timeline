import React from 'react';
import { HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Outlook-style StatCard Component
 * Clean, flat design with subtle semantic color accents
 */
export default function StatCard({
  label, value, unit, onChange, onUnitChange,
  placeholder, color = 'blue',
  type = 'text',
  tooltip,
  compact = false,
  max,
  readOnly = false,
  thresholds, // { warning: 80, critical: 90 }
  thresholdType = 'lower-is-bad' // 'lower-is-bad' | 'higher-is-bad'
}) {
  // --- Health Check Logic ---
  let statusColor = null; // Only show color when threshold is triggered
  let StatusIcon = null;

  if (thresholds && value !== '' && value !== null && value !== undefined) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (thresholdType === 'higher-is-bad') {
        if (num >= thresholds.critical) {
          statusColor = 'red';
          StatusIcon = AlertTriangle;
        } else if (num >= thresholds.warning) {
          statusColor = 'orange';
          StatusIcon = AlertTriangle;
        } else {
          statusColor = 'emerald';
          StatusIcon = CheckCircle2;
        }
      } else {
        if (num <= thresholds.critical) {
          statusColor = 'red';
          StatusIcon = AlertTriangle;
        } else if (num <= thresholds.warning) {
          statusColor = 'orange';
          StatusIcon = AlertTriangle;
        } else {
          statusColor = 'emerald';
          StatusIcon = CheckCircle2;
        }
      }
    }
  }

  const handleChange = (v) => {
    if (readOnly) return;
    if (max !== undefined && v !== '') {
      const num = parseFloat(v);
      if (!isNaN(num) && num > max) { onChange(max.toString()); return; }
      if (num < 0) { onChange("0"); return; }
    }
    onChange(v);
  };

  // Outlook-style: Neutral default, semantic colors only for status
  const statusStyles = {
    emerald: { indicator: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
    orange: { indicator: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    red: { indicator: 'bg-red-500', text: 'text-red-600 dark:text-red-400' }
  };

  const status = statusColor ? statusStyles[statusColor] : null;

  // --- Smart Preview Logic ---
  const getPreview = () => {
    if (!value || isNaN(value)) return null;
    const num = parseFloat(value);

    if (onUnitChange) {
      if (!unit || unit === 'raw') return num.toLocaleString();

      let result = num;
      let suffix = '';
      switch (unit) {
        case 'TB': result = num * 1024; suffix = 'GB'; break;
        case 'MB': result = num / 1024; suffix = 'GB'; break;
        case 'KB': result = num / (1024 * 1024); suffix = 'GB'; break;
        case 'GB': result = num; suffix = 'GB'; break;
        case 'k': result = num * 1000; suffix = ''; break;
        case 'm': result = num * 1000000; suffix = ''; break;
        default: result = num;
      }
      return suffix ?
        `${result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${suffix}` :
        result.toLocaleString();
    }
    return null;
  };

  const preview = getPreview();

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-white dark:bg-zinc-900 transition-all",
        "border-zinc-200 dark:border-zinc-800",
        compact ? "p-3" : "p-4",
        readOnly && "opacity-70",
        !readOnly && "hover:border-[#0078D4]/50 hover:shadow-sm"
      )}
    >
      {/* Left accent bar for status */}
      {status && (
        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", status.indicator)} />
      )}

      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label className={cn(
          "font-semibold uppercase tracking-wide leading-none truncate pr-2 flex items-center gap-1.5",
          compact ? "text-[10px]" : "text-[11px]",
          "text-zinc-600 dark:text-zinc-400"
        )}>
          {StatusIcon && <StatusIcon size={12} className={status?.text} />}
          {label}
        </label>
        {tooltip && <HelpCircle size={12} className="text-zinc-400 cursor-help" />}
      </div>

      {/* Input Container */}
      <div className={cn(
        "flex items-center rounded-md overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 transition-all",
        !readOnly && "focus-within:border-[#0078D4] focus-within:ring-1 focus-within:ring-[#0078D4]/30",
        compact ? "h-9" : "h-10"
      )}>
        <input
          type={type === 'percentage' ? 'number' : type}
          step="any"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder || "0"}
          className={cn(
            "flex-1 bg-transparent border-none outline-none px-3 font-mono font-semibold tabular-nums transition-colors min-w-0",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
            compact ? "text-sm" : "text-base",
            "text-zinc-900 dark:text-white",
            readOnly && "cursor-not-allowed text-zinc-500",
            status?.text
          )}
        />

        {onUnitChange ? (
          <select
            value={unit || ''}
            onChange={(e) => !readOnly && onUnitChange(e.target.value)}
            disabled={readOnly}
            className="h-full w-[55px] shrink-0 bg-zinc-100 dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 px-1 text-[10px] font-semibold uppercase text-zinc-600 dark:text-zinc-400 outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-center disabled:cursor-not-allowed"
          >
            <option value="">Raw</option>
            <optgroup label="Count" className="dark:bg-zinc-900">
              <option value="k">k</option>
              <option value="m">m</option>
            </optgroup>
            <optgroup label="Data" className="dark:bg-zinc-900">
              <option value="GB">GB</option>
              <option value="TB">TB</option>
              <option value="MB">MB</option>
              <option value="KB">KB</option>
            </optgroup>
          </select>
        ) : type === 'percentage' ? (
          <div className="h-full px-3 flex items-center bg-zinc-100 dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 shrink-0">
            <span className="text-xs font-semibold text-zinc-500">%</span>
          </div>
        ) : null}
      </div>

      {/* Preview Value */}
      {preview && (
        <div className="mt-2 flex items-center justify-end gap-1.5">
          <span className="text-[9px] font-medium text-zinc-400 uppercase">Converted</span>
          <span className="text-[11px] font-semibold text-[#0078D4] dark:text-[#4ba0e8]">{preview}</span>
        </div>
      )}
    </div>
  );
}
