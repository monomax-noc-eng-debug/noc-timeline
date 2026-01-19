import React from 'react';

export default function AbbrevInput({ label, value, onChange, placeholder }) {
  const getParsedPreview = (val) => {
    if (!val) return null;
    const cleanVal = val.toString().toLowerCase().trim();
    const num = parseFloat(cleanVal);

    if (isNaN(num)) return "Invalid Number";

    let result = num;
    if (cleanVal.endsWith('m')) result = num * 1000000;
    else if (cleanVal.endsWith('k')) result = num * 1000;

    return result.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const previewValue = getParsedPreview(value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
          {label}
        </label>
        {previewValue && (
          <span className={`text-[9px] font-black italic ${previewValue === "Invalid Number" ? 'text-red-500' : 'text-emerald-500'}`}>
            {previewValue === "Invalid Number" ? '⚠️ Form Error' : `→ Raw: ${previewValue}`}
          </span>
        )}
      </div>

      <div className="flex shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-[#333]">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "e.g. 5.37m"}
          className="flex-1 px-3 py-2 bg-white dark:bg-[#111] text-sm focus:outline-none dark:text-white font-bold uppercase"
        />
        <div className="bg-gray-50 dark:bg-[#222] border-l border-gray-200 dark:border-[#333] px-3 flex items-center justify-center">
          <span className="text-[9px] font-black text-gray-400">K / M</span>
        </div>
      </div>
    </div>
  );
}