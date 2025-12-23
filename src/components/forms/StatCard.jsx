import React from 'react';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';

export default function StatCard({
  label, value, unit, onChange, onUnitChange, // รับ unit และ onUnitChange
  placeholder, icon: Icon, color = 'blue',
  type = 'number', // 'number' (มีหน่วย), 'abbrev' (แบบเดิม), 'percentage'
  tooltip, previousValue
}) {
  const colorSchemes = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400', accent: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400', accent: 'bg-emerald-500' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400', accent: 'bg-orange-500' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-800', text: 'text-purple-600 dark:text-purple-400', accent: 'bg-purple-500' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-100 dark:border-pink-800', text: 'text-pink-600 dark:text-pink-400', accent: 'bg-pink-500' },
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-100 dark:border-cyan-800', text: 'text-cyan-600 dark:text-cyan-400', accent: 'bg-cyan-500' }
  };
  const scheme = colorSchemes[color] || colorSchemes.blue;

  // ✅ Logic คำนวณ Preview (เหมือน UnitInput)
  const getPreview = () => {
    if (!value || isNaN(value)) return null;
    const num = parseFloat(value);
    let result = num;
    let suffix = '';

    if (onUnitChange && unit) {
      switch (unit) {
        case 'TB': result = num * 1024; suffix = 'GB'; break;
        case 'MB': result = num / 1024; suffix = 'GB'; break;
        case 'KB': result = num / (1024 * 1024); suffix = 'GB'; break;
        case 'GB': result = num; suffix = 'GB'; break;
        case 'k': result = num * 1000; suffix = ''; break;
        case 'm': result = num * 1000000; suffix = ''; break;
        default: result = num;
      }
    } else if (type === 'abbrev') {
      // Fallback for old simple inputs
      return null;
    }

    const formatted = result.toLocaleString(undefined, {
      minimumFractionDigits: suffix === 'GB' ? 2 : 0,
      maximumFractionDigits: suffix === 'GB' ? 4 : 2
    });
    return suffix ? `${formatted} ${suffix}` : formatted;
  };

  const preview = getPreview();

  return (
    <div className={`relative group rounded-2xl border-2 ${scheme.border} ${scheme.bg} p-4 transition-all hover:shadow-lg`}>
      <div className={`absolute top-0 left-4 right-4 h-1 ${scheme.accent} rounded-b-full opacity-60`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 pt-2">
        <div className="flex items-center gap-2">
          {Icon && <div className={`p-2 rounded-xl ${scheme.bg} ${scheme.text}`}><Icon size={16} /></div>}
          <div>
            <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">{label}</label>
            {tooltip && <div className="flex items-center gap-1 text-[8px] text-zinc-400 mt-0.5"><HelpCircle size={8} /><span>{tooltip}</span></div>}
          </div>
        </div>
      </div>

      {/* Input Group */}
      <div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
        <input
          type={type === 'abbrev' ? 'text' : 'number'}
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "0"}
          className="flex-1 px-4 py-3 text-lg font-bold bg-transparent outline-none dark:text-white placeholder-zinc-300 dark:placeholder-zinc-600 min-w-0"
        />

        {/* ✅ Unit Selector (Dropdown) */}
        {onUnitChange ? (
          <select
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 px-2 text-xs font-black uppercase outline-none dark:text-zinc-400 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-center w-[70px]"
          >
            <optgroup label="Count">
              <option value="k">k</option>
              <option value="m">m</option>
            </optgroup>
            <optgroup label="Data">
              <option value="GB">GB</option>
              <option value="TB">TB</option>
              <option value="MB">MB</option>
              <option value="KB">KB</option>
            </optgroup>
          </select>
        ) : type === 'percentage' && (
          <div className="bg-zinc-50 dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 px-4 flex items-center">
            <span className="text-sm font-black text-zinc-500">%</span>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="mt-2 flex items-center justify-end gap-1">
          <span className="text-[9px] font-black text-zinc-400">→</span>
          <span className={`text-[10px] font-black ${scheme.text}`}>{preview}</span>
        </div>
      )}
    </div>
  );
}