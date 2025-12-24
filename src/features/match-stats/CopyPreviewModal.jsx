import React, { useState } from 'react';
import { X, Copy, Check, FileSpreadsheet, Zap, ExternalLink, Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function CopyPreviewModal({ isOpen, onClose, data, headers }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleCopy = () => {
    let textToCopy = "";
    if (Array.isArray(data) && Array.isArray(data[0])) {
      textToCopy = data.map(row => row.join('\t')).join('\n');
    } else {
      textToCopy = data.join('\t');
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Data successfully copied to clipboard.",
        variant: "success",
      });

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    });
  };

  const isMultiRow = Array.isArray(data) && Array.isArray(data[0]);

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-5xl rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.6)] border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-500">

        {/* --- COMPACT PREMIUM HEADER --- */}
        <div className="shrink-0 px-6 py-5 md:px-8 bg-zinc-50/50 dark:bg-white/[0.01] border-b border-zinc-100 dark:border-zinc-900 relative">
          <div className="absolute top-0 right-0 p-4">
            <button onClick={onClose} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
              <X size={16} className="text-zinc-500" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <FileSpreadsheet size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Data Capture</span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
                Data <span className="text-emerald-500">Preview</span>
              </h3>
            </div>
          </div>
        </div>

        {/* --- MAIN PREVIEW AREA --- */}
        <div className="flex-1 overflow-hidden p-4 bg-zinc-50/30 dark:bg-black/20">
          <div className="h-full border border-zinc-100 dark:border-zinc-900 rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c0c] shadow-inner flex flex-col">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800">
                    {headers.map((h, i) => (
                      <th key={i} className="px-3 py-3 text-left text-[8px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap first:pl-6 last:pr-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                  {isMultiRow ? (
                    data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="group hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        {row.map((cell, i) => (
                          <td key={i} className="px-3 py-2 text-[10px] font-bold font-mono text-zinc-500 whitespace-nowrap group-hover:text-zinc-900 dark:group-hover:text-white transition-colors first:pl-6 last:pr-6">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr className="group hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      {data.map((cell, i) => (
                        <td key={i} className="px-3 py-2 text-[10px] font-bold font-mono text-zinc-500 whitespace-nowrap group-hover:text-zinc-900 dark:group-hover:text-white transition-colors first:pl-6 last:pr-6">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- PREMIUM FOOTER --- */}
        <div className="shrink-0 p-4 md:px-8 bg-white dark:bg-[#0a0a0a] border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-400 uppercase">
            <ExternalLink size={12} /> Spreadsheet Ready
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors rounded-xl"
            >
              Discard
            </button>
            <button
              onClick={handleCopy}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all ${copied
                ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                : 'bg-black dark:bg-white text-white dark:text-black shadow-zinc-500/20'
                }`}
            >
              {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
              {copied ? 'Captured' : 'Transfer'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}