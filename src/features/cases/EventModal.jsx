import React, { useState, useEffect, useRef } from 'react';
import { X, ImagePlus, Trash2, Save, Loader2, Clock, Calendar, FileText, ChevronRight, AlertCircle, Link as LinkIcon, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { getDirectImageUrl } from '../../utils/helpers';
import ImageUploader from '../../components/forms/ImageUploader';
import ConfirmModal from '../../components/ui/ConfirmModal';
import ImagePreviewModal from '../../components/ui/ImagePreviewModal';
import AlertModal from '../../components/ui/AlertModal';
import { uploadLocalFileToDrive } from '../../utils/driveUpload'; // ฟังก์ชันอัปโหลดที่เราสร้างไว้

export default function EventModal({ isOpen, onClose, onSubmit, initialData, saving = false }) {
  const [formData, setFormData] = useState({ date: '', time: '', desc: '', imageUrls: [] });
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState('link'); // 'link' หรือ 'upload'
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, index: null });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const fileInputRef = useRef(null);

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

  const handleAddImage = (url) => {
    const targetUrl = url || tempImageUrl;
    if (targetUrl && !formData.imageUrls.includes(targetUrl)) {
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, targetUrl] }));
      setTempImageUrl('');
    }
  };

  const handleLocalUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingLocal(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      const res = await uploadLocalFileToDrive(file);
      if (res.result === "success") {
        setUploadProgress(100);
        setTimeout(() => handleAddImage(res.url), 200);
      } else {
        setErrorModal({ isOpen: true, message: res.error || "Upload failed. Please check your connection." });
      }
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message || "An unexpected error occurred during upload." });
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsUploadingLocal(false);
        setUploadProgress(0);
      }, 500);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveImageUrl = (indexToRemove) => {
    setDeleteConfirm({ isOpen: true, index: indexToRemove });
  };

  const confirmRemoveImageUrl = () => {
    if (deleteConfirm.index !== null) {
      setFormData(prev => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, index) => index !== deleteConfirm.index)
      }));
    }
    setDeleteConfirm({ isOpen: false, index: null });
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

  const inputBaseClass = `w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-zinc-800 focus:border-black dark:focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800/50 placeholder:text-zinc-400`;
  const labelClass = "text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-900/40 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-[2rem] shadow-2xl ring-1 ring-zinc-900/5 dark:ring-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out">

        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl z-10 sticky top-0">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              {initialData ? <FileText className="text-blue-500" size={20} /> : <Clock className="text-violet-500" size={20} />}
              {initialData ? 'Edit Event' : 'New Event'}
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5 ml-7">Update incident timeline details</p>
          </div>
          <button onClick={onClose} disabled={saving} className="p-2.5 -mr-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all duration-200 hover:rotate-90 active:scale-90">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}><Calendar size={12} /> Date</label>
                <input type="date" className={`${inputBaseClass} ${errors.date ? 'border-red-500' : ''}`} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}><Clock size={12} /> Time</label>
                <input type="time" className={`${inputBaseClass} ${errors.time ? 'border-red-500' : ''}`} value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className={labelClass}><FileText size={12} /> Description</label>
              <textarea rows={3} placeholder="" className={`${inputBaseClass} resize-none min-h-[100px] ${errors.desc ? 'border-red-500' : ''}`} value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} />
            </div>

            {/* Attachments Section - Compact Design */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between px-1">
                <label className={labelClass.replace('mb-2', 'mb-0')}><ImagePlus size={12} /> Attachments</label>
                <span className="text-[10px] font-bold text-zinc-400">{formData.imageUrls.length} Files</span>
              </div>

              <div className="bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                {/* Mode Selector */}
                <div className="flex p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setUploadMode('link')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${uploadMode === 'link' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                  >
                    <LinkIcon size={12} strokeWidth={3} /> Link URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${uploadMode === 'upload' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                  >
                    <UploadCloud size={12} strokeWidth={3} /> Upload
                  </button>
                </div>

                {/* Controls */}
                <div className="mt-1 p-1">
                  {uploadMode === 'link' ? (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Paste image URL here..."
                          className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-xs outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700"
                          value={tempImageUrl}
                          onChange={e => setTempImageUrl(e.target.value)}
                        />
                        <LinkIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddImage()}
                        disabled={!tempImageUrl}
                        className="w-11 h-11 shrink-0 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-20"
                      >
                        <ChevronRight size={20} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer relative overflow-hidden" onClick={() => !isUploadingLocal && fileInputRef.current.click()}>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLocalUpload} />
                      {isUploadingLocal ? (
                        <div className="w-full px-8 flex flex-col gap-2">
                          <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2 text-blue-500">
                              <Loader2 size={12} className="animate-spin" />
                              <span className="text-[10px] font-black uppercase tracking-wider">Syncing to Drive...</span>
                            </div>
                            <span className="text-[10px] font-black text-blue-500">{Math.round(uploadProgress)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300 ease-out relative"
                              style={{ width: `${uploadProgress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon size={24} className="text-zinc-400" />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Click to select file</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Grid */}
              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 px-1">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <img
                        src={getDirectImageUrl(url)}
                        alt="attachment"
                        className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
                        onClick={() => setPreviewUrl(url)}
                        onError={(e) => { e.target.src = 'https://placehold.co/400?text=Image+Not+Found'; }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImageUrl(index);
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 pt-4 bg-white dark:bg-[#121212] sticky bottom-0 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={saving}
              className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-zinc-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Timeline Event
            </button>
          </div>
        </form>
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, index: null })}
          title="Delete Image?"
          message="Are you sure you want to remove this image from the gallery?"
          onConfirm={confirmRemoveImageUrl}
          isDanger={true}
        />
        <ImagePreviewModal
          isOpen={!!previewUrl}
          onClose={() => setPreviewUrl(null)}
          imageUrl={previewUrl}
          allImages={formData.imageUrls}
          initialIndex={formData.imageUrls.indexOf(previewUrl)}
        />
        <AlertModal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ isOpen: false, message: '' })}
          title="Upload Error"
          message={errorModal.message}
          type="error"
        />
      </div>
    </div>
  );
}