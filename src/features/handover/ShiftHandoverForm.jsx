// src/features/handover/ShiftHandoverForm.jsx
import React, { useEffect } from 'react';
import { X, Save, Clock, FileText, AlertTriangle, CheckCircle2, Sun, Moon, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, parseISO } from 'date-fns'

// ✅ Import Hook ที่เราสร้างใหม่
import { useShiftForm } from './hooks/useShiftForm';

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

  // ✅ เรียกใช้ Logic ทั้งหมดบรรทัดเดียว จบ!
  const {
    formData,
    errors,
    setField,
    toggleMember,
    handleSubmit,
    displayMembers
  } = useShiftForm(isOpen, initialData, currentUser, nocMembers, onSubmit);

  // Handle ESC key (UI Logic เก็บไว้ที่นี่ได้ เพราะเกี่ยวกับ DOM events)
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Styles
  const labelClass = "block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2";
  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:border-black dark:focus:border-white outline-none transition-all";
  const errorClass = "text-[9px] font-bold text-red-500 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-lg bg-white dark:bg-[#18181b] rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>

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
          <button onClick={onClose} disabled={saving} className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white rounded-full transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-6 bg-white dark:bg-[#18181b] [&::-webkit-scrollbar]:hidden">

          {/* 1. Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className={cn(inputClass, "px-4 text-left flex items-center justify-between", !formData.date && "text-zinc-400", errors.date ? 'border-red-400' : '')}>
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
                        setField('date', `${yyyy}-${mm}-${dd}`); // ✅ ใช้ setField
                      }
                    }}
                    initialFocus
                    classNames={{ selected: "bg-black! text-white! dark:bg-white! dark:text-black!", }}
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
                onChange={(e) => setField('time', e.target.value)} // ✅ ใช้ setField
                className={`${inputClass} px-2 text-center ${errors.time ? 'border-red-400' : ''}`}
              />
              {errors.time && <p className={errorClass}>{errors.time}</p>}
            </div>
          </div>

          {/* 2. Shift Type & On Duty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Shift Type</label>
              <div className="flex flex-col gap-2">
                {['Morning', 'Night'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setField('shift', s)} // ✅ ใช้ setField
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2
                      ${formData.shift === s
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md'
                        : 'bg-zinc-50 text-zinc-400 border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                  >
                    {s === 'Morning' ? <Sun size={14} /> : <Moon size={14} />}
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>On Duty</label>
              <div className="flex flex-wrap gap-2">
                {displayMembers.map((member) => {
                  const isSelected = formData.onDuty.includes(member.name);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.name)} // ✅ ใช้ฟังก์ชันจาก Hook
                      className={`flex flex-col items-center justify-center p-2 w-full rounded-xl border-2 transition-all
                        ${isSelected ? 'bg-zinc-50 dark:bg-zinc-800 border-black dark:border-white opacity-100' : 'bg-white dark:bg-transparent border-zinc-100 opacity-60 hover:opacity-100'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black ${isSelected ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-zinc-500'}`}>
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
            </div>
          </div>

          {/* 3. Status & Note (ตัวอย่างย่อ) */}
          <div>
            <label className={labelClass}>Shift Status</label>
            <div className="flex gap-3 p-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              {['Normal', 'Issues'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setField('status', status)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.status === status ? 'bg-emerald-500 text-white' : 'text-zinc-400'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Handover Remarks</label>
            <textarea
              rows={4}
              value={formData.note}
              onChange={(e) => setField('note', e.target.value)}
              className={inputClass}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181b]/50 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-3.5 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-500 font-black uppercase text-[10px] hover:bg-zinc-100 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-[2] py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase text-[10px] shadow-lg flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Log
          </button>
        </div>

      </div>
    </div>
  );
}