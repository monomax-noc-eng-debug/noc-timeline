import React, { useState, useRef, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebaseConfig';
import { ImagePlus, X, Loader2, Link as LinkIcon, UploadCloud, Check, AlertCircle } from 'lucide-react';

export default function ImageUploader({ value, onChange, folder = 'uploads', placeholder = "Paste image URL..." }) {
  const [mode, setMode] = useState('url');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setProgress(0);
      setError('');
    }
  }, [value]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file only.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(prog));
        },
        (err) => {
          console.error(err);
          if (err.message.includes('billing') || err.code === 'storage/unauthorized') {
            setError('Storage not enabled. Please use URL mode.');
          } else {
            setError('Upload failed. Try URL mode.');
          }
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onChange(downloadURL);
          setUploading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setError('Error starting upload.');
      setUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    onChange(e.target.value);
    setError('');
  };

  const handleRemove = () => {
    onChange('');
    setProgress(0);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">

      {/* Mode Switcher */}
      {!value && (
        <div className="flex bg-zinc-200/50 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${mode === 'url'
                ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm scale-100'
                : 'text-zinc-400 hover:text-zinc-600 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
          >
            <LinkIcon size={14} /> Link URL
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${mode === 'upload'
                ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm scale-100'
                : 'text-zinc-400 hover:text-zinc-600 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
          >
            <UploadCloud size={14} /> Upload
          </button>
        </div>
      )}

      {/* Input Area */}
      {!value ? (
        mode === 'upload' ? (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl h-14 flex items-center justify-center cursor-pointer transition-all duration-200 group
              ${uploading
                ? 'bg-zinc-50 border-zinc-300 cursor-wait'
                : 'border-zinc-300 hover:border-violet-500 hover:bg-violet-50 dark:border-zinc-700 dark:hover:border-violet-500 dark:hover:bg-violet-900/10 active:scale-[0.99]'}
            `}
          >
            {uploading ? (
              <div className="flex items-center gap-3 text-violet-600">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-xs font-bold">Uploading... {progress}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-zinc-400 group-hover:text-violet-600 transition-colors">
                <ImagePlus size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Choose File</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
              disabled={uploading}
            />
          </div>
        ) : (
          <div className="relative group">
            <input
              type="text"
              placeholder={placeholder}
              onChange={handleUrlChange}
              className="w-full h-14 px-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-transparent text-sm font-medium outline-none focus:border-violet-500 focus:bg-violet-50/10 transition-all placeholder:text-zinc-400"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-focus-within:text-violet-500 transition-colors">
              <LinkIcon size={16} />
            </div>
          </div>
        )
      ) : (
        // Preview Area (Compact)
        <div className="relative flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in zoom-in-95">
          <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 truncate">{value}</p>
            <p className="text-[9px] font-bold text-green-500 flex items-center gap-1"><Check size={10} /> Image Ready</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-all hover:rotate-90 active:scale-90"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <p className="text-[10px] font-bold text-red-500 flex items-center gap-1.5 animate-pulse ml-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}