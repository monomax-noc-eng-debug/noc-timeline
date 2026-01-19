// file: src/features/ticket/components/TicketFormModal.jsx
// Self-contained modal for Create/Edit ticket - fixes form state issues
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  X, Tag, Layout, Info, User, Activity, Save, Loader2, ChevronLeft
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTicketOptions } from '../../../hooks/useTicketOptions';
import { useTeam } from '../../../hooks/useTeam';

// ================== FORM COMPONENTS ==================

const FormInput = memo(({ label, required, icon: Icon, error, ...props }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1">
      {Icon && <Icon size={10} className="text-[#0078D4]" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className={cn(
        "w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border rounded-lg text-sm transition-all",
        "text-zinc-900 dark:text-white placeholder:text-zinc-400",
        "focus:ring-2 focus:ring-[#0078D4]/20 focus:border-[#0078D4] focus:outline-none disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900",
        error ? "border-red-400 dark:border-red-500" : "border-zinc-200 dark:border-zinc-700"
      )}
    />
    {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
  </div>
));
FormInput.displayName = 'FormInput';

const FormSelect = memo(({ label, value, onChange, options, required, icon: Icon, error }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1">
      {Icon && <Icon size={10} className="text-[#0078D4]" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border rounded-lg text-sm transition-all cursor-pointer",
        "text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#0078D4]/20 focus:border-[#0078D4] focus:outline-none",
        error ? "border-red-400 dark:border-red-500" : "border-zinc-200 dark:border-zinc-700"
      )}
    >
      <option value="">Select...</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
  </div>
));
FormSelect.displayName = 'FormSelect';

const FormTextarea = memo(({ label, icon: Icon, ...props }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1">
      {Icon && <Icon size={10} className="text-[#0078D4]" />}
      {label}
    </label>
    <textarea
      {...props}
      className={cn(
        "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm transition-all resize-none",
        "text-zinc-900 dark:text-white placeholder:text-zinc-400",
        "focus:ring-2 focus:ring-[#0078D4]/20 focus:border-[#0078D4] focus:outline-none"
      )}
    />
  </div>
));
FormTextarea.displayName = 'FormTextarea';

// ================== DEFAULT FORM DATA ==================

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
  responsibility: '',
  assign: '',
  remark: ''
};

// ================== MAIN COMPONENT ==================

const TicketFormModal = memo(({
  isOpen,
  onClose,
  onSubmit,
  initialData = null, // null = create mode, object = edit mode
  isSubmitting = false
}) => {
  const { ticketOptions } = useTicketOptions();
  const { team } = useTeam();
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  const isEdit = initialData !== null;

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...defaultFormData, ...initialData });
      } else {
        setFormData(defaultFormData);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.ticketNumber?.trim()) {
      newErrors.ticketNumber = 'Ticket Number is required';
    }
    if (!formData.type?.trim()) {
      newErrors.type = 'Type is required';
    }
    if (!formData.status?.trim()) {
      newErrors.status = 'Status is required';
    }
    if (!formData.shortDesc?.trim()) {
      newErrors.shortDesc = 'Subject is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validate() && onSubmit) {
      onSubmit(formData);
    }
  }, [formData, onSubmit, validate]);

  const handleClose = useCallback(() => {
    setFormData(defaultFormData);
    setErrors({});
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
              >
                <ChevronLeft size={18} className="text-zinc-500" />
              </button>
              <div>
                <span className={cn(
                  "px-2 py-0.5 text-[10px] font-semibold rounded",
                  isEdit ? "bg-amber-500 text-white" : "bg-[#0078D4] text-white"
                )}>
                  {isEdit ? 'EDIT' : 'NEW'}
                </span>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white mt-1">
                  {isEdit ? `Edit Ticket #${initialData?.ticketNumber}` : 'Create New Ticket'}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
            >
              <X size={18} className="text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Row 1: Ticket No & Type */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Ticket No."
              icon={Tag}
              required
              disabled={isEdit}
              value={formData.ticketNumber}
              onChange={e => handleChange('ticketNumber', e.target.value)}
              error={errors.ticketNumber}
              placeholder="e.g. SVR123456"
            />
            <FormSelect
              label="Type"
              icon={Layout}
              required
              value={formData.type}
              onChange={v => handleChange('type', v)}
              options={ticketOptions.types || ['Incident', 'Request', 'Problem']}
              error={errors.type}
            />
          </div>

          {/* Row 2: Status & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Status"
              required
              value={formData.status}
              onChange={v => handleChange('status', v)}
              options={ticketOptions.statuses || ['Open', 'Pending', 'In Progress', 'Succeed']}
              error={errors.status}
            />
            <FormSelect
              label="Severity"
              value={formData.severity}
              onChange={v => handleChange('severity', v)}
              options={ticketOptions.severities || ['Critical', 'High', 'Medium', 'Low']}
            />
          </div>

          {/* Row 3: Category & Sub-Category */}
          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Category"
              value={formData.category}
              onChange={v => handleChange('category', v)}
              options={ticketOptions.categories || []}
            />
            <FormSelect
              label="Sub Category"
              value={formData.subCategory}
              onChange={v => handleChange('subCategory', v)}
              options={ticketOptions.subCategories || []}
            />
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Subject */}
          <FormInput
            label="Subject / Short Description"
            icon={Info}
            required
            value={formData.shortDesc}
            onChange={e => handleChange('shortDesc', e.target.value)}
            error={errors.shortDesc}
            placeholder="Brief description of the issue"
          />

          {/* Details */}
          <FormTextarea
            label="Ticket Details"
            rows={3}
            value={formData.details}
            onChange={e => handleChange('details', e.target.value)}
            placeholder="Describe the incident or request in detail..."
          />

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Assignment */}
          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Responsibility"
              icon={User}
              value={formData.responsibility}
              onChange={v => handleChange('responsibility', v)}
              options={team.map(m => m.name)}
            />
            <FormInput
              label="Assignee"
              icon={User}
              value={formData.assign}
              onChange={e => handleChange('assign', e.target.value)}
              placeholder="Assigned to"
            />
          </div>

          {/* Action Taken */}
          <FormTextarea
            label="Action Taken / Mitigation"
            icon={Activity}
            rows={2}
            value={formData.action}
            onChange={e => handleChange('action', e.target.value)}
          />

          {/* Resolution & Remark */}
          <FormInput
            label="Resolution Result"
            value={formData.resolvedDetail}
            onChange={e => handleChange('resolvedDetail', e.target.value)}
          />

          <FormTextarea
            label="Remarks"
            rows={2}
            value={formData.remark}
            onChange={e => handleChange('remark', e.target.value)}
          />
        </form>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-10 px-4 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="ticket-form"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                "flex-[2] flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-medium text-white transition-all",
                isEdit ? "bg-amber-500 hover:bg-amber-600" : "bg-[#0078D4] hover:bg-[#106EBE]",
                "disabled:opacity-50"
              )}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  {isEdit ? 'Save Changes' : 'Create Ticket'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

TicketFormModal.displayName = 'TicketFormModal';

export default TicketFormModal;
