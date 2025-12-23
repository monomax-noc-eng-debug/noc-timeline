import React, { useState } from 'react';
import { X, Copy, Check, FileSpreadsheet } from 'lucide-react';

// ✅ 1. Import Component Toast ของคุณ
// (กรุณาเช็ค Path ให้ตรงกับที่เก็บไฟล์จริงของคุณ เช่น ../../components/ui/Toast)
import Toast from '../../components/ui/Toast';

export default function CopyPreviewModal({ isOpen, onClose, data, headers }) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
      setShowToast(true); // สั่งเปิด Toast

      // Reset ปุ่ม Copy ให้กลับเป็นปกติหลังจาก 3 วิ (ส่วน Toast จะปิดตัวเองตาม duration)
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">

      {/* ✅ 2. เรียกใช้ Toast Component ตรงนี้ */}
      {showToast && (
        <Toast
          message="Copied to clipboard successfully!"
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)} // เมื่อ Toast ปิดตัวเอง ให้ set state กลับ
        />
      )}

      {/* --- ส่วน Modal (เหมือนเดิม) --- */}
      <div className="bg-white dark:bg-[#121212] w-full max-w-5xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white">Data Preview</h3>
              <p className="text-xs text-zinc-500">
                {Array.isArray(data) && Array.isArray(data[0])
                  ? `Ready to copy ${data.length} rows`
                  : "Ready to copy single row"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6 overflow-x-auto custom-scrollbar bg-zinc-50/50 dark:bg-black/50 flex-1">
          <div className="inline-block min-w-full align-middle">
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-black">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-100 dark:bg-zinc-900">
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap border-r border-zinc-100 dark:border-zinc-800 last:border-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {Array.isArray(data) && Array.isArray(data[0]) ? (
                    data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        {row.map((cell, i) => (
                          <td key={i} className="px-4 py-3 text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap border-r border-zinc-100 dark:border-zinc-800 last:border-0">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      {data.map((cell, i) => (
                        <td key={i} className="px-4 py-3 text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap border-r border-zinc-100 dark:border-zinc-800 last:border-0">
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

        {/* Footer */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end gap-3 z-10">
          <button onClick={onClose} className="px-6 py-3 text-xs font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            Close
          </button>
          <button
            onClick={handleCopy}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transform ${copied
                ? 'bg-emerald-500 text-white'
                : 'bg-black dark:bg-white text-white dark:text-black'
              }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Data to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}