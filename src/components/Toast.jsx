import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, XCircle } from 'lucide-react';

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 3000); // 3 วินาทีหายไปเอง
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  // เลือกสีและไอคอนตามประเภท
  const isSuccess = toast.type === 'success';
  const bgColor = isSuccess ? 'bg-white dark:bg-zinc-800' : 'bg-white dark:bg-zinc-800';
  const borderColor = isSuccess ? 'border-emerald-500' : 'border-red-500';
  const iconColor = isSuccess ? 'text-emerald-500' : 'text-red-500';
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-75
        rounded-xl shadow-lg border-l-4 ${bgColor} ${borderColor}
        animate-in slide-in-from-right fade-in duration-300
      `}
    >
      <div className={iconColor}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
          {isSuccess ? 'Success' : 'Error'}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}