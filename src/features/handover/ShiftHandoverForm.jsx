import React, { memo } from 'react';
import {
  X, Save, Clock, FileText, Sun, Moon, Loader2,
  Users, Activity, CheckCircle2, AlertTriangle, AlertCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { parseISO } from 'date-fns';

import { useTeam } from '../../hooks/useTeam';
import { useShiftForm } from './hooks/useShiftForm';
import { useTicketOptions } from '../../hooks/useTicketOptions';
import { DatePicker } from '../../components/forms/DatePicker';
import { TimeInput } from '../../components/forms/TimeInput';
import { formatDateAPI } from '../../utils/formatters';
import MultiImageUploader from '../../components/forms/MultiImageUploader';

// --- Static Styles (Defined outside to prevent re-allocation) ---
const CLASSES = {
  sectionTitle: "flex items-center gap-2 text-xs font-bold text-[#0078D4] uppercase tracking-wider mb-4",
  label: "block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2",
  inputContainer: "relative transition-all group",
  input: "w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 text-sm font-medium text-zinc-900 dark:text-white focus:ring-1 focus:ring-[#0078D4] focus:border-[#0078D4] outline-none transition-all placeholder:text-zinc-400",
  error: "text-[10px] font-semibold text-red-600 mt-1 flex items-center gap-1",
  btnOption: "flex-1 flex items-center justify-center gap-2 rounded-md text-[10px] font-bold uppercase transition-all",
  btnActive: "bg-white dark:bg-zinc-800 text-[#0078D4] shadow-sm border border-zinc-200 dark:border-zinc-700",
  btnInactive: "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200",
  memberCard: "relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 group"
};

const ShiftHandoverForm = memo(({
  onSubmit,
  initialData,
  isEditing,
  currentUser,
  saving = false,
  onCancel // New prop for Cancel action
}) => {
  const { team } = useTeam();
  const { ticketOptions } = useTicketOptions();

  // Logic Hook
  const {
    formData,
    errors,
    setField,
    toggleMember,
    handleSubmit,
    displayMembers
  } = useShiftForm(true, initialData, currentUser, team, onSubmit);

  // Handle image changes from MultiImageUploader
  const handleImagesChange = (newImages) => {
    setField('images', newImages);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 overflow-hidden">

      {/* HEADER */}
      <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap justify-between items-center gap-3 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            {isEditing ? <FileText size={20} className="text-[#0078D4] shrink-0" /> : <Clock size={20} className="text-[#0078D4] shrink-0" />}
            <span className="truncate">{isEditing ? 'Edit Shift Log' : 'New Handover'}</span>
          </h2>
          <p className="text-xs font-medium text-zinc-500 mt-0.5 truncate">Record details for the next shift team.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditing && (
            <div className="px-2 sm:px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-orange-100 dark:border-orange-900/30 flex items-center gap-1.5">
              <AlertCircle size={12} /> <span className="hidden sm:inline">Editing</span>
            </div>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

        {/* Section 1: Shift Information */}
        <section>
          <h3 className={CLASSES.sectionTitle}><Clock size={14} /> Shift Information</h3>
          {/* Responsive Grid: 1 col on mobile, 2 on sm, 3 on lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

            {/* Date */}
            <div className={CLASSES.inputContainer}>
              <label className={cn(CLASSES.label, "truncate")}>Date</label>
              <DatePicker
                date={formData.date ? parseISO(formData.date) : undefined}
                setDate={(date) => date && setField('date', formatDateAPI(date))}
                placeholder="Pick a date"
                className={cn(
                  CLASSES.input,
                  errors.date && 'border-red-500 bg-red-50 dark:bg-red-950/20'
                )}
              />
              {errors.date && <p className={CLASSES.error}><AlertTriangle size={10} /> {errors.date}</p>}
            </div>

            {/* Time */}
            <div className={CLASSES.inputContainer}>
              <label className={cn(CLASSES.label, "truncate")}>Start Time</label>
              <TimeInput
                value={formData.time}
                onChange={(e) => setField('time', e.target.value)}
                className={cn(
                  CLASSES.input,
                  "text-center tracking-widest",
                  errors.time && 'border-red-500 bg-red-50 dark:bg-red-950/20'
                )}
              />
              {errors.time && <p className={CLASSES.error}><AlertTriangle size={10} /> {errors.time}</p>}
            </div>

            <div className={cn(CLASSES.inputContainer, "sm:col-span-2 lg:col-span-1")}>
              <label className={cn(CLASSES.label, "truncate")}>Period</label>
              <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800/50 p-1 border border-zinc-200 dark:border-zinc-700 h-10 overflow-hidden">
                {['Morning', 'Night'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setField('shift', s)}
                    className={cn(CLASSES.btnOption, "min-w-0 overflow-hidden", formData.shift === s ? CLASSES.btnActive : CLASSES.btnInactive)}
                  >
                    {s === 'Morning' ? <Sun size={14} className="shrink-0" /> : <Moon size={14} className="shrink-0" />}
                    <span className="truncate">{s}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* Section 2: Responsibility */}
        <section>
          <h3 className={CLASSES.sectionTitle}><Users size={14} /> Responsibility</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ticketOptions.responsibilities?.map((name) => {
              const isSelected = formData.onDuty.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleMember(name)}
                  className={cn(
                    CLASSES.memberCard,
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-[#0078D4] shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-[#0078D4] hover:shadow-sm'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-[#0078D4]">
                      <CheckCircle2 size={14} fill="currentColor" className="text-white dark:text-blue-900" />
                    </div>
                  )}
                  <div className={cn(
                    "w-8 h-8 mb-2 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    isSelected ? 'bg-[#0078D4] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
                  )}>
                    {name.charAt(0)}
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase truncate w-full text-center", isSelected ? 'text-[#0078D4]' : 'text-zinc-600')}>
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.onDuty && <p className={CLASSES.error}><AlertTriangle size={10} /> {errors.onDuty}</p>}
        </section>

        <hr className="border-zinc-100 dark:border-zinc-800/50" />

        {/* Section 3: Log Details */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className={CLASSES.sectionTitle}><Activity size={14} /> Log Details</h3>
            <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5">
              {['Normal', 'Issues'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setField('status', status)}
                  className={cn(
                    "px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5",
                    formData.status === status
                      ? status === 'Normal' ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'bg-white dark:bg-zinc-800 text-red-500 shadow-sm'
                      : 'text-zinc-400'
                  )}
                >
                  {formData.status === status && (status === 'Normal' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />)}
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className={CLASSES.inputContainer}>
            <label className={CLASSES.label}>Handover Remarks / Incidents</label>
            <textarea
              rows={6}
              value={formData.note}
              onChange={(e) => setField('note', e.target.value)}
              className={cn(CLASSES.input, "h-auto py-3 resize-none leading-relaxed")}
              placeholder="Enter handover details here..."
            />
          </div>

          {/* Image Upload Section */}
          <div className="mt-4">
            <label className={CLASSES.label}>Attached Images</label>
            <MultiImageUploader
              value={formData.images || []}
              onChange={handleImagesChange}
              maxImages={10}
            />
          </div>

        </section>

        {/* Bottom Spacer */}
        <div className="h-10" />
      </div>

      {/* FOOTER */}
      <div className="shrink-0 p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex gap-3">
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel Edit
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-[2] py-2.5 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-lg font-bold text-xs uppercase shadow-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isEditing ? 'Update Handover' : 'Submit Handover'}
        </button>
      </div>
    </div>
  );
});

ShiftHandoverForm.displayName = 'ShiftHandoverForm';
export default ShiftHandoverForm;