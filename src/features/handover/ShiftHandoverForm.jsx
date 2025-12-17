import React, { useState, useEffect } from 'react';
import { X, Sun, Moon, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ShiftHandoverForm({
  isOpen, onClose, onSubmit,
  initialData, isEditing, currentUser, isLoading
}) {
  const [formData, setFormData] = useState({
    date: '', time: '', shift: 'Morning', onDuty: [], status: 'Normal', note: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`;
        const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const hour = now.getHours();
        const targetShift = (hour >= 8 && hour < 20) ? 'Morning' : 'Night';

        setFormData({
          date: todayDate,
          time: currentTime,
          shift: targetShift,
          onDuty: currentUser ? [currentUser] : [],
          status: 'Normal',
          note: ''
        });
      }
    }
  }, [isOpen, initialData, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.onDuty.length === 0) return alert('Please assign an officer');
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden bg-white dark:bg-[#111]">

        {/* HEADER */}
        <div className="px-5 py-4 bg-gray-50 dark:bg-[#000] flex justify-between items-center border-b border-gray-200 dark:border-[#333]">
          <h2 className="text-sm font-bold uppercase text-[#1F2937] dark:text-[#F2F2F2] tracking-wider">
            {isEditing ? 'Edit Log' : 'New Shift Log'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-[#F2F2F2] transition-colors"><X size={18} /></button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-5 bg-white dark:bg-[#111]">

          {/* Date / Time */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none font-bold
                bg-white text-[#1F2937] dark:bg-[#222] dark:text-[#F2F2F2] dark:border-[#333]" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400">Time</label>
              <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none font-bold
                bg-white text-[#1F2937] dark:bg-[#222] dark:text-[#F2F2F2] dark:border-[#333]" />
            </div>
          </div>

          {/* Shift Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-gray-400">Shift</label>
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-[#222] rounded-lg">
              {['Morning', 'Night'].map(s => (
                <button key={s} type="button" onClick={() => setFormData({ ...formData, shift: s })}
                  className={`flex-1 h-9 flex items-center justify-center gap-2 text-xs font-bold rounded-md transition-all 
                  ${formData.shift === s ? 'bg-black text-white shadow-md dark:bg-[#F2F2F2] dark:text-[#000000]' : 'text-gray-500 hover:bg-gray-200 dark:text-[#F2F2F2]'}`}>
                  {s === 'Morning' ? <Sun size={14} /> : <Moon size={14} />} {s}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-gray-400">Status</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setFormData({ ...formData, status: 'Normal' })}
                className={`flex-1 h-9 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition-all 
                ${formData.status === 'Normal' ? 'bg-[#1F2937] border-[#1F2937] text-white dark:bg-[#F2F2F2] dark:text-[#000000]' : 'bg-white border-gray-200 text-gray-400 dark:bg-[#222] dark:border-[#333]'}`}>
                <CheckCircle2 size={14} /> Normal
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, status: 'Issue Found' })}
                className={`flex-1 h-9 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition-all 
                ${formData.status === 'Issue Found' ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-200 text-gray-400 dark:bg-[#222] dark:border-[#333]'}`}>
                <AlertTriangle size={14} /> Issues
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-gray-400">Note</label>
            <textarea rows={4} value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })}
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none resize-none 
              bg-white text-[#1F2937] dark:bg-[#222] dark:text-[#F2F2F2] dark:border-[#333]"
              placeholder="Type handover notes here..." />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 dark:bg-[#000] dark:border-[#333]">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-[#222]">CANCEL</button>
          <button type="button" onClick={handleSubmit} disabled={isLoading}
            className="px-6 py-2 bg-[#1F2937] text-white rounded-lg text-xs font-bold uppercase hover:bg-black shadow-lg transition-all dark:bg-[#F2F2F2] dark:text-[#000000] dark:hover:bg-[#ccc]">
            {isLoading ? 'Saving...' : 'SAVE LOG'}
          </button>
        </div>
      </div>
    </div>
  );
}