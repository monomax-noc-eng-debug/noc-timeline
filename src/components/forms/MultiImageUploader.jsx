import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, UploadCloud, AlertCircle, ImageOff, Ban, Plus, Expand } from 'lucide-react';
import { getDirectImageUrl } from '../../utils/helpers';
import { uploadLocalFileToDrive } from '../../utils/driveUpload';
import { cn } from "@/lib/utils";
import ImagePreviewModal from '../ui/ImagePreviewModal';

/**
 * MultiImageUploader - อัปโหลดรูปหลายรูปไปยัง Google Drive
 * รองรับ preview และ gallery view
 * 
 * @param {Array} value - Array of image URLs or objects {url, name, id}
 * @param {Function} onChange - Callback when images change
 * @param {number} maxImages - Maximum number of images allowed (default: 10)
 */
export default function MultiImageUploader({ value = [], onChange, maxImages = 10 }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const fileInputRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const isCancelledRef = useRef(false);

  // Normalize value to array of objects
  const images = (value || []).map((img, idx) => {
    if (typeof img === 'string') {
      return { url: img, name: `Image ${idx + 1}`, id: `img-${idx}` };
    }
    return img;
  });

  const imageUrls = images.map(img => img.url);

  // ล้างค่าเมื่อไม่มีรูป
  useEffect(() => {
    if (!value || value.length === 0) {
      setImageLoadErrors({});
      setError('');
      setProgress(0);
    }
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // ฟังก์ชันยกเลิกการอัปโหลด
  const handleCancelUpload = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    isCancelledRef.current = true;

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setUploading(false);
    setProgress(0);
    setError('Upload canceled');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file only.');
      return;
    }

    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    // Reset states
    setError('');
    setUploading(true);
    setProgress(10);
    isCancelledRef.current = false;

    try {
      // จำลอง Progress
      progressIntervalRef.current = setInterval(() => {
        if (!isCancelledRef.current) {
          setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + 10;
          });
        }
      }, 300);

      // Upload to Drive
      const res = await uploadLocalFileToDrive(file);

      // Clear interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Check if cancelled
      if (isCancelledRef.current) {
        return;
      }

      // Check result
      if (res && res.result === "success" && res.url) {
        setProgress(100);
        const newImage = {
          url: res.url,
          name: file.name,
          id: res.id || `img-${Date.now()}`
        };
        onChange([...images, newImage]);
        setError('');
      } else {
        throw new Error(res?.error || 'Upload failed');
      }
    } catch (err) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (isCancelledRef.current) {
        return;
      }

      console.error('Upload error:', err);
      setError(err.message || 'Drive upload failed. Check permissions.');
    } finally {
      if (!isCancelledRef.current) {
        setUploading(false);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove, e) => {
    e?.stopPropagation();
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    // Clear load error for removed image
    setImageLoadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[indexToRemove];
      return newErrors;
    });
  };

  const handleImageError = (idx) => {
    setImageLoadErrors(prev => ({ ...prev, [idx]: true }));
  };

  const handlePreview = (idx, e) => {
    e?.stopPropagation();
    setPreviewIndex(idx);
    setPreviewOpen(true);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              className="relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-100 dark:bg-zinc-900 cursor-pointer hover:ring-2 hover:ring-[#0078D4]/50 transition-all"
              onClick={(e) => handlePreview(idx, e)}
            >
              {imageLoadErrors[idx] ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1">
                  <ImageOff size={24} />
                  <span className="text-[10px] font-semibold text-zinc-500">Preview N/A</span>
                </div>
              ) : (
                <img
                  src={getDirectImageUrl(img.url)}
                  alt={img.name || 'Preview'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => handleImageError(idx)}
                />
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Expand size={20} className="text-white" />
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => handleRemoveImage(idx, e)}
                className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                title="Remove Image"
              >
                <X size={12} strokeWidth={2.5} />
              </button>

              {/* Image Name */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-4 pb-1.5 px-2">
                <span className="text-[10px] font-bold text-white/90 truncate block">
                  {img.name || 'Image'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            "relative border border-dashed rounded-lg h-24 flex items-center justify-center transition-all group bg-zinc-50 dark:bg-zinc-900/50",
            uploading
              ? "border-zinc-200 cursor-default"
              : "border-zinc-300 dark:border-zinc-700 hover:border-[#0078D4] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer"
          )}
        >
          {uploading ? (
            <div
              className="w-full px-6 flex flex-col gap-3 relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#0078D4]">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs font-semibold">Syncing to Drive...</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#0078D4] tabular-nums">
                    {progress}%
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all shrink-0"
                    title="Cancel Upload"
                  >
                    <Ban size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0078D4] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover:text-[#0078D4] transition-colors">
              {images.length > 0 ? (
                <>
                  <Plus size={24} strokeWidth={1.5} />
                  <span className="text-xs font-semibold">Add More ({images.length}/{maxImages})</span>
                </>
              ) : (
                <>
                  <UploadCloud size={24} strokeWidth={1.5} />
                  <span className="text-xs font-semibold">Click to Upload Images (Gallery)</span>
                </>
              )}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-md animate-in slide-in-from-top-1">
          <AlertCircle size={14} />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        imageUrl={imageUrls[previewIndex]}
        allImages={imageUrls}
        initialIndex={previewIndex}
      />
    </div>
  );
}
