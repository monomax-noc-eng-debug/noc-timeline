import React from 'react';
import { AlertCircle, XCircle, Info, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AlertModal({ isOpen, onClose, title, message, type = 'error' }) {
  if (!isOpen) return null;

  const configs = {
    error: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950/20',
      btn: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
      accent: 'border-red-100 dark:border-red-900/30'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20',
      accent: 'border-amber-100 dark:border-amber-900/30'
    },
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
      accent: 'border-emerald-100 dark:border-emerald-900/30'
    },
    info: {
      icon: Info,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
      accent: 'border-blue-100 dark:border-blue-900/30'
    }
  };

  const config = configs[type] || configs.error;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-[340px] rounded-[24px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Visual Header */}
        <div className={`pt-8 pb-4 flex flex-col items-center justify-center gap-4 ${config.bg}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg} border-2 ${config.accent} animate-bounce-subtle`}>
            <Icon size={32} className={config.color} />
          </div>
          <h3 className={`text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100`}>
            {title || 'System Notification'}
          </h3>
        </div>

        {/* Message Area */}
        <div className="px-8 py-6">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold text-center uppercase tracking-tight">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className={`w-full h-11 ${config.btn} text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}
          >
            Dismiss <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
