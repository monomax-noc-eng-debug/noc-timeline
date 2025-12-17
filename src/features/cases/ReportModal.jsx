import React from 'react';
import { X, Copy } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, text }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all z-[100]">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl h-[70vh] rounded-2xl border-2 border-gray-300 dark:border-zinc-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 relative">
        <div className="flex justify-between items-center p-5 border-b-2 border-gray-300 dark:border-zinc-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white uppercase">Report Preview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white"><X size={20} /></button>
        </div>
        <textarea readOnly value={text} className="flex-1 p-6 font-mono text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-950 resize-none border-none outline-none custom-scrollbar" />
        <div className="p-5 border-t-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex justify-end">
          <button onClick={() => { navigator.clipboard.writeText(text); alert('Copied!'); onClose(); }} className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-md flex items-center gap-2 border-2 border-transparent hover:border-black dark:hover:border-white">
            <Copy size={16} /> Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}