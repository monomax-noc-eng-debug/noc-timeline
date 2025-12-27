import React, { useState, useEffect, useCallback, memo } from 'react';
import { Save, Loader2, X, FileText } from 'lucide-react';
import { useTicketOptions } from '../../../hooks/useTicketOptions';

// Memoized Compact Input
const CompactInput = memo(({ label, required, ...props }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wide flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className={`w-full h-8 px-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50 ${props.className || ''}`}
    />
  </div>
));
CompactInput.displayName = 'CompactInput';

// Memoized Compact Textarea
const CompactTextarea = memo(({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wide">{label}</label>
    <textarea
      {...props}
      className={`w-full px-2.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none ${props.className || ''}`}
    />
  </div>
));
CompactTextarea.displayName = 'CompactTextarea';

// Memoized Compact Select
const CompactSelect = memo(({ label, value, onChange, options, required }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wide flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-8 px-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
    >
      <option value="">Select...</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
));
CompactSelect.displayName = 'CompactSelect';

// Memoized Pill Picker
const PillPicker = memo(({ label, value, onChange, options, colorMap = {} }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wide">{label}</label>
    <div className="flex flex-wrap gap-1">
      {options.map(opt => {
        const isActive = value === opt;
        const color = colorMap[opt?.toLowerCase()] || 'zinc';
        const activeClass = {
          red: 'bg-red-500 text-white',
          orange: 'bg-orange-500 text-white',
          amber: 'bg-amber-500 text-white',
          emerald: 'bg-emerald-500 text-white',
          blue: 'bg-blue-500 text-white',
          purple: 'bg-purple-500 text-white',
          zinc: 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
        }[color];
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${isActive
                ? activeClass
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
));
PillPicker.displayName = 'PillPicker';

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
  assign: '',
  remark: ''
};

export default function TicketLogFormModal({ isOpen, onClose, initialData, onSubmit, isSubmitting }) {
  // Use ticketOptions from Firestore
  const { ticketOptions } = useTicketOptions();
  const [formData, setFormData] = useState(defaultFormData);

  // Color mappings for visual pickers
  const statusColors = { open: 'red', pending: 'amber', succeed: 'emerald', closed: 'zinc' };
  const severityColors = { low: 'emerald', medium: 'blue', high: 'orange', critical: 'red' };

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || defaultFormData);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/50 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header - Compact */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${isEdit ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
              <FileText size={14} className={isEdit ? 'text-amber-500' : 'text-blue-500'} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                {isEdit ? 'Edit Ticket' : 'New Ticket'}
              </h2>
              {isEdit && <p className="text-[9px] text-zinc-400">#{formData.ticketNumber}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form - Compact */}
        <form id="ticket-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {/* Row 1: ID & Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <CompactInput
              label="Ticket Number"
              required
              disabled={isEdit}
              value={formData.ticketNumber}
              onChange={e => handleChange('ticketNumber', e.target.value)}
              placeholder="INC-0001"
            />
            <CompactInput
              label="Assignee"
              value={formData.assign}
              onChange={e => handleChange('assign', e.target.value)}
              placeholder="Person in charge"
            />
          </div>

          {/* Row 2: Type & Category */}
          <div className="grid grid-cols-3 gap-3">
            <CompactSelect
              label="Type"
              value={formData.type}
              onChange={v => handleChange('type', v)}
              options={ticketOptions.types || []}
            />
            <CompactSelect
              label="Category"
              value={formData.category}
              onChange={v => handleChange('category', v)}
              options={ticketOptions.categories || []}
            />
            <CompactSelect
              label="Sub Category"
              value={formData.subCategory}
              onChange={v => handleChange('subCategory', v)}
              options={ticketOptions.subCategories || []}
            />
          </div>

          {/* Row 3: Status Pills */}
          <PillPicker
            label="Status"
            value={formData.status}
            onChange={v => handleChange('status', v)}
            options={ticketOptions.statuses || []}
            colorMap={statusColors}
          />

          {/* Row 4: Severity Pills */}
          <PillPicker
            label="Severity"
            value={formData.severity}
            onChange={v => handleChange('severity', v)}
            options={ticketOptions.severities || []}
            colorMap={severityColors}
          />

          {/* Row 5: Subject */}
          <CompactInput
            label="Subject"
            required
            value={formData.shortDesc}
            onChange={e => handleChange('shortDesc', e.target.value)}
            placeholder="Brief description of the issue"
          />

          {/* Row 6: Details */}
          <CompactTextarea
            label="Details"
            rows={2}
            value={formData.details}
            onChange={e => handleChange('details', e.target.value)}
            placeholder="Detailed description..."
          />

          {/* Row 7: Action & Resolution */}
          <div className="grid grid-cols-2 gap-3">
            <CompactTextarea
              label="Action Taken"
              rows={2}
              value={formData.action}
              onChange={e => handleChange('action', e.target.value)}
              placeholder="Steps taken..."
            />
            <div className="space-y-3">
              <CompactInput
                label="Resolution"
                value={formData.resolvedDetail}
                onChange={e => handleChange('resolvedDetail', e.target.value)}
                placeholder="How it was resolved"
              />
              <CompactInput
                label="Remark"
                value={formData.remark}
                onChange={e => handleChange('remark', e.target.value)}
                placeholder="Internal notes"
              />
            </div>
          </div>
        </form>

        {/* Footer - Compact */}
        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
          <span className="text-[9px] text-zinc-400"><span className="text-red-500">*</span> Required</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="ticket-form"
              disabled={isSubmitting}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 ${isEdit ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  {isEdit ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}