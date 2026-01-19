import React from 'react';
import { AlertCircle, XCircle, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { FormModal } from '../FormModal';

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
      color: 'text-[#0078D4]',
      bg: 'bg-[#0078D4]/10 dark:bg-[#0078D4]/20',
      btn: 'bg-[#0078D4] hover:bg-[#106EBE] shadow-[#0078D4]/20',
      accent: 'border-[#0078D4]/20 dark:border-[#0078D4]/30'
    }
  };

  const config = configs[type] || configs.error;
  const Icon = config.icon;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      headerClassName={`pt-8 pb-4 flex flex-col items-center justify-center gap-4 border-b-0 ${config.bg}`}
      header={
        <>
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${config.bg} border-2 ${config.accent} animate-bounce-subtle`}>
            <Icon size={32} className={config.color} />
          </div>
          <h3 className={`text-sm font-medium text-zinc-900 dark:text-zinc-100`}>
            {title || 'System Notification'}
          </h3>
        </>
      }
      bodyClassName="px-8 py-6"
      footerClassName="px-6 pb-6 pt-2 border-t-0"
      footer={
        <button
          onClick={onClose}
          className={`w-full h-11 ${config.btn} text-white rounded-lg text-[10px] font-semibold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}
        >
          Dismiss <ChevronRight size={14} />
        </button>
      }
    >
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold text-center uppercase tracking-tight">
        {message}
      </p>
    </FormModal>
  );
}

