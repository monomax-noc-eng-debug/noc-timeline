import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-5 right-5 z-[80] animate-in slide-in-from-right duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${isSuccess
          ? 'bg-[#1F2937] border-gray-300 text-white dark:bg-[#F2F2F2] dark:text-[#000000]'
          : 'bg-red-50 border-red-200 text-red-800'
        }`}>
        {isSuccess ? <CheckCircle2 size={20} className="text-gray-300 dark:text-[#333]" /> : <XCircle size={20} className="text-red-500" />}

        <p className="text-sm font-bold pr-2">{message}</p>

        <button onClick={onClose} className={`p-1 rounded-full hover:bg-white/10 ${isSuccess ? 'text-gray-300' : 'text-red-400'}`}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}