import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { FormModal } from '../FormModal';

export default function ConfirmModal({ isOpen, onClose, title, message, onConfirm, isDanger = false }) {
  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      headerClassName={`px-4 py-3 flex items-center gap-2.5 ${isDanger ? 'bg-red-50/50 dark:bg-red-950/20' : 'bg-zinc-50/50 dark:bg-zinc-900/40'}`}
      header={
        <>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDanger ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'}`}>
            {isDanger ? <AlertTriangle size={16} /> : <HelpCircle size={16} />}
          </div>
          <h3 className={`text-xs font-semibold ${isDanger ? 'text-red-700 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {title}
          </h3>
        </>
      }
      bodyClassName="px-5 py-4"
      footerClassName="px-3 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/20 flex justify-end gap-1.5 border-t border-zinc-100 dark:border-zinc-800/50"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-[9px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-medium text-white shadow-lg transition-all active:scale-95 ${isDanger
              ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
              : 'bg-zinc-900 dark:bg-white dark:text-black hover:opacity-90 shadow-zinc-500/20'
              }`}
          >
            Confirm
          </button>
        </>
      }
    >
      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal font-bold uppercase tracking-tight">
        {message}
      </p>
    </FormModal>
  );
}
