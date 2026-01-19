import React, { useState } from 'react';
import { X, Copy, Check, FileText } from 'lucide-react';
import { FormModal } from '../../components/FormModal';

export default function CopyPreviewModal({ isOpen, onClose, data, headers }) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!data) return;
    try {
      const headerRow = headers.join('\t');
      const bodyRows = data.map(row => Object.values(row).join('\t')).join('\n');
      const textToCopy = `${headerRow}\n${bodyRows}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error('Failed to copy:', err); }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
      className="z-[150]"
      headerClassName="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900"
      header={
        <>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0078D4]/10 dark:bg-[#0078D4]/20 text-[#0078D4] rounded-lg"><FileText size={20} /></div>
            <div><h3 className="text-lg font-bold text-slate-800 dark:text-white">Data Preview</h3><p className="text-xs text-slate-500">Review data before exporting</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'}`}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Data'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
          </div>
        </>
      }
      bodyClassName="p-0 overflow-auto custom-scrollbar bg-slate-50 dark:bg-[#0c0c0e]"
      footerClassName="px-6 py-3 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-400 flex justify-between"
      footer={
        <>
          <span>Total Rows: {data ? data.length : 0}</span>
          <span>Tab-separated format ready for Excel/Sheets</span>
        </>
      }
    >
      {(!data || data.length === 0) ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 min-h-[300px]"><FileText size={48} className="opacity-20" /><p>No data available to preview</p></div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 dark:bg-zinc-900/50 sticky top-0 z-10 shadow-sm">
            <tr>{headers.map((h, i) => <th key={i} className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200 dark:border-zinc-800">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 bg-white dark:bg-zinc-900">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                {Object.values(row).map((cell, cellIdx) => <td key={cellIdx} className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap border-r border-transparent last:border-0">{cell === null || cell === '' ? <span className="text-slate-300">-</span> : cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </FormModal>
  );
}
