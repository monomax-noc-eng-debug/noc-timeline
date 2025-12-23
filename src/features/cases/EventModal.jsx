import React, { useState, useEffect } from 'react';
import { X, ImagePlus, Trash2, Save, Loader2, Clock, Calendar, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { getDirectImageUrl } from '../../utils/helpers';
import ImageUploader from '../../components/forms/ImageUploader';

export default function EventModal({ isOpen, onClose, onSubmit, initialData, saving = false }) {
  const [formData, setFormData] = useState({ date: '', time: '', desc: '', imageUrls: [] });
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, saving]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        let urls = initialData.imageUrls || [];
        if (!urls.length && initialData.image) urls = [initialData.image];
        setFormData({ ...initialData, imageUrls: urls });
      } else {
        const now = new Date();
        setFormData({
          date: now.toISOString().split('T')[0],
          time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          desc: '',
          imageUrls: []
        });
      }
      setTempImageUrl('');
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleAddImage = () => {
    if (tempImageUrl && !formData.imageUrls.includes(tempImageUrl)) {
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, tempImageUrl] }));
      setTempImageUrl('');
    }
  };

  const handleRemoveImageUrl = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Required';
    if (!formData.time) newErrors.time = 'Required';
    if (!formData.desc?.trim()) newErrors.desc = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    let finalImageUrls = [...formData.imageUrls];
    if (tempImageUrl && !finalImageUrls.includes(tempImageUrl)) {
      finalImageUrls.push(tempImageUrl);
    }

    const autoTitle = formData.title ||
      formData.desc.trim().split('\n')[0].substring(0, 50) +
      (formData.desc.length > 50 ? '...' : '') ||
      'Log Update';

    onSubmit({
      ...formData,
      title: autoTitle,
      imageUrls: finalImageUrls,
      image: null
    });
  };

  if (!isOpen) return null;

  // Input Style ที่ดูนุ่มนวลและมี Focus State ชัดเจน
  const inputBaseClass = `
    w-full bg-zinc-50 dark:bg-zinc-800/50 
    border border-zinc-200 dark:border-zinc-700 
    rounded-xl p-3.5 text-sm font-medium 
    text-zinc-900 dark:text-zinc-100
    outline-none transition-all duration-200 ease-out
    focus:bg-white dark:focus:bg-zinc-800 
    focus:border-black dark:focus:border-zinc-500
    focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800/50
    focus:shadow-sm
    placeholder:text-zinc-400
  `;

  const labelClass = "text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-zinc-900/40 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-[2rem] shadow-2xl ring-1 ring-zinc-900/5 dark:ring-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out">

        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl z-10 sticky top-0">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              {initialData ? <FileText className="text-blue-500" size={20} /> : <Clock className="text-violet-500" size={20} />}
              {initialData ? 'Edit Event' : 'New Event'}
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5 ml-7">
              {initialData ? 'Update incident timeline details' : 'Record a new update to timeline'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2.5 -mr-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all duration-200 hover:rotate-90 active:scale-90"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-7">

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className={labelClass}><Calendar size={12} /> Date</label>
                <input
                  type="date"
                  className={`${inputBaseClass} ${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}><Clock size={12} /> Time</label>
                <input
                  type="time"
                  className={`${inputBaseClass} ${errors.time ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className={labelClass}><FileText size={12} /> Description</label>
              <textarea
                rows={4}
                placeholder="What happened? Describe the details..."
                className={`${inputBaseClass} resize-none leading-relaxed min-h-[120px] ${errors.desc ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                value={formData.desc}
                onChange={e => setFormData({ ...formData, desc: e.target.value })}
              />
              {errors.desc && (
                <p className="text-[10px] font-bold text-red-500 mt-1.5 flex items-center gap-1.5 animate-pulse ml-1">
                  <AlertCircle size={10} /> {errors.desc}
                </p>
              )}
            </div>

            {/* Image Attachments Section */}
            <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between px-1">
                <label className={labelClass.replace('mb-2', 'mb-0')}><ImagePlus size={12} /> Attachments</label>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${formData.imageUrls.length > 0 ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white' : 'text-zinc-300'}`}>
                  {formData.imageUrls.length} Files
                </span>
              </div>

              {/* Add Image Control */}
              <div className="bg-zinc-50 dark:bg-zinc-800/30 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 flex gap-2">
                <div className="flex-1">
                  <ImageUploader
                    value={tempImageUrl}
                    onChange={setTempImageUrl}
                    folder="incidents"
                    placeholder="Paste image URL here..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={!tempImageUrl}
                  className="w-14 shrink-0 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:bg-black dark:hover:bg-zinc-200 hover:shadow-lg hover:shadow-zinc-300 dark:hover:shadow-none hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:transform-none disabled:shadow-none flex items-center justify-center"
                  title="Add Image"
                >
                  <ChevronRight size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Gallery Grid (Interactive) */}
              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={getDirectImageUrl(url)}
                        alt={`attachment-${index}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://placehold.co/100?text=Error'; }}
                      />
                      {/* Overlay & Remove Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          className="p-2.5 bg-white/90 text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white hover:scale-110 active:scale-90 transition-all duration-200"
                          title="Remove Image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm pointer-events-none">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm sticky bottom-0">
            <button
              type="submit"
              disabled={saving}
              className="w-full h-14 bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-white dark:to-zinc-200 text-white dark:text-black rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-zinc-500/20 dark:shadow-zinc-900/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Timeline Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}