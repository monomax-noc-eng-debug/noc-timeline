import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, UploadCloud, Check, AlertCircle, ImageOff, Ban } from 'lucide-react';
import { getDirectImageUrl } from '../../utils/helpers';
import { uploadLocalFileToDrive } from '../../utils/driveUpload';
import { cn } from "@/lib/utils";

export default function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

  const fileInputRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const isCancelledRef = useRef(false);

  // Clear state when value changes
  useEffect(() => {
    if (!value) {
      setImageLoadError(false);
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

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file only.');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(10);
    setImageLoadError(false);
    isCancelledRef.current = false;

    try {
      // Simulate progress
      progressIntervalRef.current = setInterval(() => {
        if (!isCancelledRef.current) {
          setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + 10;
          });
        }
      }, 300);

      const res = await uploadLocalFileToDrive(file);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (isCancelledRef.current) return;

      if (res && res.result === "success" && res.url) {
        setProgress(100);
        onChange(res.url);
        setError('');
      } else {
        throw new Error(res?.error || 'Upload failed');
      }
    } catch (err) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (isCancelledRef.current) return;
      console.error('Upload error:', err);
      setError(err.message || 'Drive upload failed. Check permissions.');
    } finally {
      if (!isCancelledRef.current) {
        setUploading(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      {!value ? (
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
              <UploadCloud size={24} strokeWidth={1.5} />
              <span className="text-xs font-semibold">Click to Upload Image</span>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
        </div>
      ) : (
        /* Preview Area */
        <div className="relative flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="relative h-14 w-14 rounded-md overflow-hidden border border-zinc-100 shrink-0 bg-zinc-50 flex items-center justify-center">
            {imageLoadError ? (
              <ImageOff size={24} className="text-zinc-300" />
            ) : (
              <img
                src={getDirectImageUrl(value)}
                alt="Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImageLoadError(true)}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-zinc-700 dark:text-zinc-200 mb-1">{value}</p>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Ready</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-2 rounded-lg animate-in slide-in-from-top-1">
          <AlertCircle size={14} />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}
    </div>
  );
}
