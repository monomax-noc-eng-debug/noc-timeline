import React, { useState, useEffect } from 'react';
import { X, Save, Clock, FileText, AlertTriangle, CheckCircle2, Sun, Moon, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, parseISO } from 'date-fns'

/**
 * ShiftHandoverForm - Modal form for creating/editing shift handover logs
 */
export default function ShiftHandoverForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  currentUser,
  saving = false
}) {
  const { nocMembers } = useStore();

  // Default State
  const getDefaultState = React.useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    // Morning = 08:00-20:00, Night = 20:00-08:00
    const isNight = currentHour >= 20 || currentHour < 8;
    const currentTime = now.toTimeString().slice(0, 5);

    return {
      date: now.toISOString().split('T')[0],
      time: currentTime,
      shift: isNight ? 'Night' : 'Morning',
      onDuty: currentUser ? [currentUser] : [],
      status: 'Normal',
      note: '',
      acknowledgedBy: []
    };
  }, [currentUser]);

  const [formData, setFormData] = useState(getDefaultState());
  const [errors, setErrors] = useState({});

  // Load Initial Data or reset
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          ...initialData,
          onDuty: initialData.onDuty || [],
          acknowledgedBy: initialData.acknowledgedBy || []
        });
      } else {
        setFormData(getDefaultState());
      }
      setErrors({});
    }
  }, [isOpen, initialData, getDefaultState]);

  const toggleMember = (name) => {
    setFormData(prev => {
      const exists = prev.onDuty.includes(name);
      if (exists) {
        return { ...prev, onDuty: prev.onDuty.filter(m => m !== name) };
      } else {
        return { ...prev, onDuty: [...prev.onDuty, name] };
      }
    });
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.onDuty || formData.onDuty.length === 0) {
      newErrors.onDuty = 'At least one staff member required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Common Styles
  const labelClass = "block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2";
  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:border-black dark:focus:border-white outline-none transition-all";
  const errorClass = "text-[9px] font-bold text-red-500 mt-1";

  // Show all members when editing, only current user when creating
  const displayMembers = isEditing
    ? nocMembers
    : nocMembers.filter(m => m.name === currentUser);

  return (
    // Backdrop - click to close
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-lg bg-white dark:bg-[#18181b] rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-white to-zinc-50 dark:from-[#18181b] dark:to-zinc-900 flex justify-between items-center sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white flex items-center gap-2">
              {isEditing ? <FileText size={20} className="text-zinc-400" /> : <Clock size={20} className="text-zinc-400" />}
              {isEditing ? 'Edit Log' : 'New Shift Log'}
            </h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
              {isEditing ? 'Update handover details' : 'Record shift handover'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto space-y-6 bg-white dark:bg-[#18181b] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

          {/* 1. Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      inputClass,
                      "px-4 text-left flex items-center justify-between",
                      !formData.date && "text-zinc-400",
                      errors.date ? 'border-red-400' : ''
                    )}
                  >
                    {formData.date ? format(parseISO(formData.date), "PPP") : <span>Pick a date</span>}
                    <CalendarIcon size={14} className="text-zinc-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date ? parseISO(formData.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        setFormData({ ...formData, date: `${yyyy}-${mm}-${dd}` });
                      }
                    }}
                    initialFocus
                    classNames={{
                      selected: "bg-black! text-white! dark:bg-white! dark:text-black!",
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className={errorClass}>{errors.date}</p>}
            </div>

            <div>
              <label className={labelClass}>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={`${inputClass} px-2 text-center ${errors.time ? 'border-red-400' : ''}`}
              />
              {errors.time && <p className={errorClass}>{errors.time}</p>}
            </div>
          </div>

          {/* 2. Shift Type & On Duty */}
          <div className="grid grid-cols-2 gap-4">

            {/* Shift Type */}
            <div>
              <label className={labelClass}>Shift Type</label>
              <div className="flex flex-col gap-2">
                {['Morning', 'Night'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, shift: s })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2
                      ${formData.shift === s
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md'
                        : 'bg-zinc-50 text-zinc-400 border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                  >
                    {s === 'Morning' ? <Sun size={14} /> : <Moon size={14} />}
                    {s} <span className="text-[8px] opacity-60">({s === 'Morning' ? '08-20' : '20-08'})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* On Duty */}
            <div>
              <label className={labelClass}>On Duty</label>
              <div className="flex flex-wrap gap-2">
                {displayMembers.map((member) => {
                  const isSelected = formData.onDuty.includes(member.name);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.name)}
                      className={`
                        flex flex-col items-center justify-center p-2 w-full rounded-xl border-2 transition-all
                        ${isSelected
                          ? 'bg-zinc-50 dark:bg-zinc-800 border-black dark:border-white opacity-100 shadow-sm'
                          : 'bg-white dark:bg-transparent border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 opacity-60 hover:opacity-100'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-colors
                          ${isSelected ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}
                        `}>
                          {member.name.charAt(0)}
                        </div>
                        <span className={`text-[10px] font-bold uppercase truncate ${isSelected ? 'text-black dark:text-white' : 'text-zinc-400'}`}>
                          {member.name.split(' ')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.onDuty && <p className={errorClass}>{errors.onDuty}</p>}

              {/* Auto-Ack Indicator */}
              {currentUser && formData.onDuty.includes(currentUser) && !isEditing && (
                <div className="mt-2 flex items-center justify-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 py-1.5 px-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  <CheckCircle2 size={10} /> Will auto-acknowledge
                </div>
              )}
            </div>
          </div>

          {/* 3. Status */}
          <div>
            <label className={labelClass}>Shift Status</label>
            <div className="flex gap-3 p-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              {['Normal', 'Issues'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: status })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all
                    ${formData.status === status
                      ? (status === 'Normal'
                        ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-200 dark:ring-emerald-900'
                        : 'bg-red-500 text-white shadow-lg ring-2 ring-red-200 dark:ring-red-900')
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                    }
                  `}
                >
                  {status === 'Normal' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Note */}
          <div>
            <label className={labelClass}>Handover Remarks</label>
            <textarea
              rows={4}
              placeholder="Summary of events, pending tasks, or issues to hand over..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className={`${inputClass} resize-none min-h-[100px] leading-relaxed`}
            />
            <div className="text-[9px] text-zinc-400 mt-1 text-right">
              {(formData.note || '').length} characters
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181b]/50 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3.5 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-[2] py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Log
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}