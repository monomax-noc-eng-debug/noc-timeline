import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, title, message, onConfirm, isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 overflow-hidden dark:bg-[#111] dark:border-[#333]">

        {/* Header */}
        <div className={`px-4 py-3 flex items-center gap-3 border-b border-gray-200 ${isDanger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-[#000]'}`}>
          <div className={`p-2 rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-[#1F2937] text-white dark:bg-[#F2F2F2] dark:text-[#000000]'}`}>
            {isDanger ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
          </div>
          <h3 className={`font-bold text-lg ${isDanger ? 'text-red-700 dark:text-red-400' : 'text-[#1F2937] dark:text-[#F2F2F2]'}`}>
            {title}
          </h3>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-gray-700 dark:text-[#F2F2F2] text-sm leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 flex justify-end gap-2 border-t border-gray-200 dark:bg-[#000] dark:border-[#333]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-[#222] dark:hover:text-[#F2F2F2] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-md transition-transform active:scale-95 ${isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#1F2937] hover:bg-black dark:bg-[#F2F2F2] dark:text-[#000000] dark:hover:bg-[#ccc]'
              }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}