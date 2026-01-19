import React from 'react';

export default function UnitInput({ label, value, unit, onChange, onUnitChange, placeholder }) {
  const getCalculatedPreview = () => {
    if (!value || isNaN(value)) return null;
    const num = parseFloat(value);
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

    const formattedNum = result.toLocaleString(undefined, {
      minimumFractionDigits: suffix === 'GB' ? 2 : 0,
      maximumFractionDigits: suffix === 'GB' ? 4 : 2
    });

    return suffix ? `${formattedNum} ${suffix}` : formattedNum;
  };

  const previewValue = getCalculatedPreview();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
          {label}
        </label>
        {previewValue && (
          <span className="text-[9px] font-black text-[#0078D4] italic">
            → {previewValue}
          </span>
        )}
      </div>

      <div className="flex shadow-sm rounded-lg overflow-hidden border border-zinc-200 dark:border-[#333]">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "0"}
          className="flex-1 px-3 py-2 bg-white dark:bg-[#111] text-sm focus:outline-none dark:text-white font-bold min-w-0"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className="bg-zinc-50 dark:bg-[#222] border-l border-zinc-200 dark:border-[#333] px-1 text-[10px] font-bold uppercase focus:outline-none dark:text-zinc-400 cursor-pointer hover:bg-zinc-100 dark:hover:bg-[#2a2a2a] transition-colors w-[65px] text-center"
        >
          <optgroup label="Count">
            <option value="k">k (10³)</option>
            <option value="m">m (10⁶)</option>
          </optgroup>
          <optgroup label="Data">
            <option value="GB">GB</option>
            <option value="TB">TB</option>
            <option value="MB">MB</option>
            <option value="KB">KB</option>
          </optgroup>
        </select>
      </div>
    </div>
  );
}