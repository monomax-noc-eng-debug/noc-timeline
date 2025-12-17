import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, ImagePlus } from 'lucide-react';

export default function EventModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({ date: '', time: '', desc: '', imageUrls: [] });
  const [currentInputUrl, setCurrentInputUrl] = useState('');

  // Styles
  const inputClasses = "w-full bg-transparent border-b-2 border-gray-200 dark:border-zinc-700 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white font-bold text-xs text-gray-900 dark:text-white transition-all pb-0.5 placeholder-gray-400 dark:placeholder-zinc-600 outline-none";
  const labelClasses = "block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5";

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        let urls = initialData.imageUrls || [];
        if (!urls.length && initialData.imageUrl) urls = [initialData.imageUrl];
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
      setCurrentInputUrl('');
    }
  }, [isOpen, initialData]);

  const handleAddImageUrl = () => {
    if (currentInputUrl.trim()) {
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, currentInputUrl.trim()] }));
      setCurrentInputUrl('');
    }
  };

  const handleRemoveImageUrl = (indexToRemove) => {
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const autoTitle = formData.desc.trim().split('\n')[0].substring(0, 50) + (formData.desc.length > 50 ? '...' : '') || 'Log Update';
    onSubmit({ ...formData, title: autoTitle });
  };

  // Helper for previewing images in modal
  const getDirectImageUrl = (url) => {
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      const idMatch = url.match(/\/d\/(.*?)(?:\/|$)/);
      if (idMatch && idMatch[1]) return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
    return url;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all z-[100]">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl border-2 border-gray-300 dark:border-zinc-700 shadow-2xl p-6 animate-in zoom-in-95 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">{initialData ? 'Edit Event' : 'New Event'}</h3>
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2 space-y-1">
              <label className={labelClasses}>Date</label>
              <input required type="date" className={`${inputClasses} bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5 border-2 border-gray-300 dark:border-zinc-700 focus:border-black dark:focus:border-white`} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="w-1/2 space-y-1">
              <label className={labelClasses}>Time</label>
              <input required type="time" className={`${inputClasses} bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5 border-2 border-gray-300 dark:border-zinc-700 focus:border-black dark:focus:border-white`} value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClasses}>Description</label>
            <textarea required rows={5} placeholder="What happened?..." className="w-full text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 rounded-lg p-2 border-2 border-gray-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-white transition-all resize-none placeholder-gray-400 dark:placeholder-zinc-600 outline-none" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Image Links</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon size={14} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="Paste image/drive URL here..." className={`${inputClasses} bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5 pl-9 border-2 border-gray-300 dark:border-zinc-700 focus:border-black dark:focus:border-white`} value={currentInputUrl} onChange={e => setCurrentInputUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())} />
              </div>
              <button type="button" onClick={handleAddImageUrl} disabled={!currentInputUrl.trim()} className="px-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-lg border-2 border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors disabled:opacity-50">
                <ImagePlus size={18} />
              </button>
            </div>

            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="relative group/preview rounded-lg overflow-hidden border-2 border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 h-20 flex items-center justify-center">
                    <img src={getDirectImageUrl(url)} alt="Preview" className="h-full w-full object-cover" onError={(e) => e.target.style.opacity = '0.3'} />
                    <button type="button" onClick={() => handleRemoveImageUrl(index)} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity shadow-sm hover:bg-red-600"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md border-2 border-transparent hover:border-black dark:hover:border-white">SAVE EVENT</button>
        </form>
      </div>
    </div>
  );
}