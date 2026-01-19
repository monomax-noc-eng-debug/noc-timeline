// file: e:\Project-NOCNTT\noc-timeline\src\features\ticket\components\TicketLogFormModal.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Save, Loader2, X, FileText, Layout, Info, User, Tag } from 'lucide-react';
import { useTicketOptions } from '../../../hooks/useTicketOptions';
import { useTeam } from '../../../hooks/useTeam';
import { cn } from "@/lib/utils";
import { FormModal } from '../../../components/FormModal';

/**
 * Modern Input Component
 */
const ModernInput = memo(({ label, required, icon: Icon, ...props }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1 flex items-center gap-1.5">
      {Icon && <Icon size={10} className="text-[#0078D4]" strokeWidth={2.5} />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className={cn(
        "w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm transition-all",
        "text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-950",
        "focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none disabled:opacity-50",
        props.className
      )}
    />
  </div>
));
ModernInput.displayName = 'ModernInput';

/**
 * Modern Select Component
 */
const ModernSelect = memo(({ label, value, onChange, options, required, icon: Icon }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1 flex items-center gap-1.5">
      {Icon && <Icon size={10} className="text-[#0078D4]" strokeWidth={2.5} />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full h-11 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm transition-all cursor-pointer",
        "text-zinc-900 dark:text-white focus:bg-white dark:focus:bg-zinc-950",
        "focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
      )}
    >
      <option value="">Select...</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
));
ModernSelect.displayName = 'ModernSelect';

/**
 * Modern Textarea Component 
 */
const ModernTextarea = memo(({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1 flex items-center gap-1.5">
      {Icon && <Icon size={10} className="text-[#0078D4]" strokeWidth={2.5} />}
      {label}
    </label>
    <textarea
      {...props}
      className={cn(
        "w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm transition-all resize-none",
        "text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-950",
        "focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none",
        props.className
      )}
    />
  </div>
));
ModernTextarea.displayName = 'ModernTextarea';

/**
 * Modern Pill Picker
 */
const ModernPillPicker = memo(({ label, value, onChange, options, colorMap = {} }) => (
  <div className="space-y-2">
    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isActive = value === opt;
        const colorKey = opt?.toLowerCase() || 'zinc';
        const color = colorMap[colorKey] || 'zinc';

        const activeClasses = {
          red: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30',
          orange: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30',
          amber: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30',
          emerald: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30',
          blue: 'bg-[#0078D4] text-white shadow-lg shadow-[#0078D4]/30',
          purple: 'bg-purple-600 text-white shadow-lg shadow-purple-500/30',
          zinc: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg'
        }[color];

        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "h-10 px-4 rounded-lg text-[11px] font-medium transition-all duration-300 active:scale-95",
              isActive
                ? activeClasses
                : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
));
ModernPillPicker.displayName = 'ModernPillPicker';

const defaultFormData = {
  ticketNumber: '',
  type: 'Incident',
  status: 'Open',
  severity: 'Low',
  category: '',
  subCategory: '',
  shortDesc: '',
  details: '',
  action: '',
  resolvedDetail: '',
  responsibility: '',  // ✅ เพิ่ม Responsibility
  assign: '',
  remark: ''
};

export default function TicketLogFormModal({ isOpen, onClose, initialData, onSubmit, isSubmitting }) {
  const { ticketOptions } = useTicketOptions();
  const { team } = useTeam();
  const [formData, setFormData] = useState(defaultFormData);

  const statusColors = { open: 'red', pending: 'amber', succeed: 'emerald', closed: 'zinc' };
  const severityColors = { low: 'emerald', medium: 'blue', high: 'orange', critical: 'red' };

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      // Use setTimeout to defer state update to avoid synchronous set state in effect
      setTimeout(() => {
        if (isMounted) {
          setFormData(initialData || defaultFormData);
        }
      }, 0);
    }
    return () => {
      isMounted = false;
    };
  }, [initialData, isOpen]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  if (!isOpen) return null;

  const isEdit = !!initialData;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
      headerClassName="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 relative"
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transform -rotate-3",
              isEdit ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' : 'bg-[#0078D4]/10 dark:bg-[#0078D4]/20 text-[#0078D4]'
            )}>
              <FileText size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                {isEdit ? 'Edit Ticket' : 'Create New Ticket'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", isEdit ? "bg-amber-500" : "bg-[#0078D4]")} />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {isEdit ? `Modifying Record ${formData.ticketNumber}` : 'Deploying Operational Log'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-all active:scale-90"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      }
      footerClassName="px-8 py-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40"
      footer={
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500">*</span> Required fields
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 md:flex-none h-10 px-5 rounded-md text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              form="ticket-form"
              disabled={isSubmitting}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 h-10 px-6 rounded-md text-sm font-medium text-white shadow-md",
                "transition-all active:scale-95 disabled:opacity-50",
                isEdit ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#0078D4] hover:bg-[#106EBE]'
              )}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Save size={16} strokeWidth={2.5} />
                  {isEdit ? 'Update Log' : 'Commit Ticket'}
                </>
              )}
            </button>
          </div>
        </div>
      }
      bodyClassName="px-6 py-6"
    >
      <form
        id="ticket-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* --- TOP ROW: Identity & State --- */}
        <div className="grid grid-cols-12 gap-4">
          {/* Ticket No */}
          <div className="col-span-12 md:col-span-3">
            <ModernInput
              label="Ticket No."
              icon={Tag}
              required
              disabled={isEdit}
              value={formData.ticketNumber}
              onChange={e => handleChange('ticketNumber', e.target.value)}
            />
          </div>

          {/* Responsibility */}
          <div className="col-span-12 md:col-span-3">
            <ModernSelect
              label="Responsibility"
              icon={User}
              value={formData.responsibility}
              onChange={v => handleChange('responsibility', v)}
              options={team.map(m => m.name)}
            />
          </div>

          {/* Type */}
          <div className="col-span-12 md:col-span-3">
            <ModernSelect
              label="Type"
              icon={Layout}
              value={formData.type}
              onChange={v => handleChange('type', v)}
              options={ticketOptions.types || []}
            />
          </div>

          {/* Status (Compact Select instead of Pill) */}
          <div className="col-span-12 md:col-span-3">
            <ModernSelect
              label="Status"
              value={formData.status}
              onChange={v => handleChange('status', v)}
              options={ticketOptions.statuses || []}
            />
          </div>
        </div>

        {/* --- SECOND ROW: Classification --- */}
        <div className="grid grid-cols-12 gap-4">
          {/* Severity */}
          <div className="col-span-12 md:col-span-3">
            <ModernSelect
              label="Severity"
              value={formData.severity}
              onChange={v => handleChange('severity', v)}
              options={ticketOptions.severities || []}
            />
          </div>

          {/* Category */}
          <div className="col-span-12 md:col-span-4">
            <ModernSelect
              label="Category"
              value={formData.category}
              onChange={v => handleChange('category', v)}
              options={ticketOptions.categories || []}
            />
          </div>

          {/* Sub-Category */}
          <div className="col-span-12 md:col-span-5">
            <ModernSelect
              label="Sub-Category"
              value={formData.subCategory}
              onChange={v => handleChange('subCategory', v)}
              options={ticketOptions.subCategories || []}
            />
          </div>
        </div>

        <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />

        {/* --- NARRATIVE SECTION --- */}
        <div className="space-y-4">
          <ModernInput
            label="Subject / Short Description"
            icon={Info}
            required
            value={formData.shortDesc}
            onChange={e => handleChange('shortDesc', e.target.value)}
            className="font-bold"
          />
          <ModernTextarea
            label="Ticket Details"
            rows={5}
            value={formData.details}
            onChange={e => handleChange('details', e.target.value)}
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />

        {/* --- CLOSURE SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {/* Left Column: Action Taken (Full Height) */}
          <div className="flex flex-col h-full">
            <ModernTextarea
              label="Action Taken / Mitigation"
              icon={Info}
              value={formData.action}
              onChange={e => handleChange('action', e.target.value)}
              className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 flex-1 min-h-[180px]"
              wrapperClassName="flex-1 flex flex-col"
            />
          </div>

          {/* Right Column: Resolution & Remarks */}
          <div className="flex flex-col gap-4">
            <ModernInput
              label="Resolution Result"
              value={formData.resolvedDetail}
              onChange={e => handleChange('resolvedDetail', e.target.value)}
            />

            <ModernInput
              label="Assignee"
              icon={User}
              value={formData.assign}
              onChange={e => handleChange('assign', e.target.value)}
            />

            <ModernTextarea
              label="Remarks"
              rows={2}
              value={formData.remark}
              onChange={e => handleChange('remark', e.target.value)}
            />
          </div>
        </div>
      </form>

    </FormModal>
  );
}
