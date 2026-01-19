import React, { useState, useEffect, useRef, memo } from 'react';
import {
  X, ImagePlus, Trash2, Save, Loader2, Clock,
  UploadCloud, Check, Hash, Fingerprint, Layout,
  Plus, Ban, ImageOff, ShieldCheck, MessageSquare,
  AlertCircle, CheckCircle2, Edit3, Activity,
  Link as LinkIcon
} from 'lucide-react';
import { parseISO, isValid, format } from 'date-fns';
import { getDirectImageUrl } from '../../utils/helpers';
import { uploadLocalFileToDrive, deleteFileFromDrive } from '../../utils/driveUpload';
import { cn } from "@/lib/utils";
import { FormModal } from '../../components/FormModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { DatePicker } from '../../components/forms/DatePicker';
import { TimeInput } from '../../components/forms/TimeInput';
import { formatDateAPI } from '../../utils/formatters';

// ----------------------------------------------------------------------
// Compact Sub-Components
// ----------------------------------------------------------------------

const InputLabel = memo(({ label, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-2 ml-0.5">
    {Icon && <Icon size={10} className="text-zinc-400" />}
    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
      {label}
    </span>
  </div>
));

const CompactInput = memo(({ error, className, ...props }) => (
  <input
    {...props}
    className={cn(
      "w-full h-10 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-lg px-4 text-sm font-bold transition-all duration-300 outline-none",
      "focus:bg-white dark:focus:bg-zinc-900 focus:border-[#0078D4]/50 focus:ring-4 focus:ring-[#0078D4]/5",
      error ? "border-rose-500" : "",
      className
    )}
  />
));

const RowGroup = memo(({ children, title, icon: Icon, badge }) => (
  <div className="group/row space-y-4">
    <div className="flex items-center justify-between border-b border-zinc-50 dark:border-white/5 pb-2">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={14} className="text-zinc-400 group-hover/row:text-[#0078D4] transition-colors" />}
        <h4 className="text-[10px] font-black text-zinc-900 dark:text-zinc-400 uppercase ">{title}</h4>
      </div>
      {badge && (
        <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">{badge}</span>
      )}
    </div>
    <div className="animate-in fade-in duration-500">
      {children}
    </div>
  </div>
));

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function EventModal({
  isOpen,
  onClose,
  initialData,
  incidentId,
  onSave
}) {
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    date: null,
    time: '',
    desc: '',
    imageUrls: [],
    iconType: 'message',
    statusOnLineColor: 'white'
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');

  // Upload State
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const uploadControllerRef = useRef(null);

  // Delete Confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, index: null });

  // Load initial data
  useEffect(() => {
    if (initialData) {
      let urls = initialData.imageUrls || [];
      if (!urls.length && initialData.image) urls = [initialData.image];

      setFormData({
        date: initialData.date ? (isValid(parseISO(initialData.date)) ? parseISO(initialData.date) : null) : null,
        time: initialData.time || '',
        desc: initialData.desc || initialData.title || '',
        imageUrls: urls,
        iconType: initialData.iconType || 'message',
        statusOnLineColor: initialData.statusOnLineColor || 'white'
      });
    } else {
      setFormData({ date: new Date(), time: format(new Date(), 'HH:mm'), desc: '', imageUrls: [], iconType: 'message', statusOnLineColor: 'white' });
    }
    setErrors({});
    setTempImageUrl('');
    setImageLoadErrors({});
  }, [initialData, isOpen]);

  // Handlers
  const handleAddImage = (url) => {
    const urlToAdd = url || tempImageUrl.trim();
    if (urlToAdd && !formData.imageUrls.includes(urlToAdd)) {
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, urlToAdd] }));
      setTempImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    const urlToRemove = formData.imageUrls[index];
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
    if (urlToRemove?.includes('drive.google.com')) {
      deleteFileFromDrive(urlToRemove).catch(console.error);
    }
  };

  const handleLocalUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = null;

    setIsUploadingLocal(true);
    setUploadProgress(0);
    setUploadError(null);
    uploadControllerRef.current = new AbortController();

    try {
      // Note: uploadLocalFileToDrive currently doesn't support progress or abort signal
      const result = await uploadLocalFileToDrive(file);
      console.log("Upload Result:", result);

      // Support multiple possible return keys from different script versions
      const fileUrl = result?.webViewLink || result?.url || result?.link;

      if (fileUrl) {
        handleAddImage(fileUrl);
      } else {
        console.error("Upload successful but no URL found in response:", result);
        setUploadError("Upload succeeded but returned no URL");
      }
    } catch (err) {
      if (err.name !== 'AbortError') setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploadingLocal(false);
      setUploadProgress(100); // Force completion since we don't have real progress
    }
  };

  const handleCancelUpload = () => {
    uploadControllerRef.current?.abort();
    setIsUploadingLocal(false);
    setUploadProgress(0);
  };

  const internalSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!formData.desc?.trim()) validationErrors.desc = true;
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        date: formData.date ? formatDateAPI(formData.date) : null,
        id: initialData?.id
      });
      onClose();
    } catch (err) {
      console.error('Failed to save event:', err);
    } finally {
      setSaving(false);
    }
  };

  const confirmAction = async () => {
    if (deleteConfirm.type === 'image') {
      handleRemoveImage(deleteConfirm.index);
    } else if (deleteConfirm.type === 'item') {
      // Trigger delete via onSave with _delete flag
      setSaving(true);
      try {
        await onSave({ ...initialData, _delete: true });
        onClose();
      } finally {
        setSaving(false);
      }
    }
    setDeleteConfirm({ isOpen: false, type: null, index: null });
  };

  return (
    <>
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        isLoading={saving}
        size="md"
        showCloseButton={false}
        headerClassName="p-6 pb-4 flex justify-between items-center border-b border-zinc-50 dark:border-white/5"
        header={
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0078D4] text-white flex items-center justify-center shadow-lg">
                <ShieldCheck size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                {initialData ? 'Edit Operation' : 'New Deployment'}
              </h3>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-white/5 text-zinc-400 hover:text-rose-500 transition-all">
              <X size={18} />
            </button>
          </>
        }
        footerClassName="p-6 pt-2 flex items-center gap-3 border-t-0"
        footer={
          <>
            {initialData && (
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: true, type: 'item' })}
                className="w-12 h-14 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all active:scale-95 shrink-0"
                title="Purge Record"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              type="submit"
              form="event-form"
              disabled={saving || isUploadingLocal}
              className="flex-1 h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
              <span className="text-xs font-semibold">Commit Record</span>
            </button>
          </>
        }
        bodyClassName="p-6 space-y-8"
      >
        <form id="event-form" onSubmit={internalSubmit} className="space-y-8">

          {/* Temporal Matrix */}
          <RowGroup title="Temporal Matrix" icon={Clock}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <InputLabel label="Deployment Date" />
                <DatePicker
                  date={formData.date}
                  setDate={(d) => setFormData({ ...formData, date: d })}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-1">
                <InputLabel label="Sync Time" />
                <TimeInput
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
          </RowGroup>

          {/* Visual Configuration */}
          <RowGroup title="Visual Personalization" icon={Fingerprint}>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-white/5 p-3 rounded-lg border border-zinc-100 dark:border-white/5">
                <InputLabel label="Marker Status" icon={Hash} />
                <div className="flex gap-2">
                  {['white', 'rose', 'emerald'].map(c => (
                    <button key={c} type="button" onClick={() => setFormData({ ...formData, statusOnLineColor: c })} className={cn(
                      "w-5 h-5 rounded-full border-2 transition-all",
                      c === 'white' ? "bg-white border-zinc-200" : c === 'rose' ? "bg-rose-500 border-rose-600" : "bg-emerald-500 border-emerald-600",
                      formData.statusOnLineColor === c ? "ring-4 ring-[#0078D4]/20 scale-110 shadow-lg border-[#0078D4]" : "opacity-30 border-transparent"
                    )} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2 p-2 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-lg">
                {[
                  { id: 'message', icon: MessageSquare }, { id: 'alert', icon: AlertCircle },
                  { id: 'check', icon: CheckCircle2 }, { id: 'clock', icon: Clock },
                  { id: 'update', icon: Edit3 }, { id: 'activity', icon: Activity }
                ].map(item => (
                  <button key={item.id} type="button" onClick={() => setFormData({ ...formData, iconType: item.id })} className={cn(
                    "h-9 flex items-center justify-center rounded-lg transition-all",
                    formData.iconType === item.id ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md scale-105" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}><item.icon size={14} strokeWidth={2.5} /></button>
                ))}
              </div>
            </div>
          </RowGroup>

          {/* Narrative Data */}
          <RowGroup title="Operational Narrative" icon={Layout}>
            <textarea className={cn(
              "w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-lg p-4 text-sm font-bold placeholder:text-zinc-400 text-zinc-900 dark:text-white outline-none min-h-[120px] resize-none transition-all focus:bg-white dark:focus:bg-zinc-900",
              errors.desc ? "border-rose-500 ring-4 ring-rose-500/5" : ""
            )} placeholder="Enter mission narrative and technical synchronization details..." value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} />
          </RowGroup>

          {/* Evidence Matrix */}
          <RowGroup title="Intelligence Evidence" icon={ImagePlus}>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative group">
                  <CompactInput placeholder="Asset URL..." value={tempImageUrl} onChange={e => setTempImageUrl(e.target.value)} />
                  <LinkIcon size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300" />
                </div>
                <button type="button" onClick={() => handleAddImage()} disabled={!tempImageUrl} className="h-10 w-10 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg transition-all active:scale-95 disabled:opacity-20 shadow-lg"><Plus size={18} strokeWidth={3} /></button>
                <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploadingLocal} className="h-10 w-10 flex items-center justify-center bg-[#0078D4] text-white rounded-lg transition-all active:scale-95 shadow-lg relative overflow-hidden">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLocalUpload} />
                  {isUploadingLocal ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                </button>
              </div>

              {/* Upload Status Bar */}
              {(isUploadingLocal || uploadError) && (
                <div className="bg-zinc-50 dark:bg-white/5 rounded-lg p-3 border border-zinc-100 dark:border-white/5 animate-in slide-in-from-top-2">
                  {isUploadingLocal ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                          <Loader2 size={12} className="animate-spin text-[#0078D4]" />
                          <span className="text-[9px] font-medium text-zinc-500">Transmitting Asset</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-[#0078D4] tabular-nums">{Math.round(uploadProgress)}%</span>
                          <button type="button" onClick={handleCancelUpload} className="p-1.5 rounded-md bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200 shadow-sm shrink-0 transition-colors">
                            <Ban size={10} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0078D4] transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-500 px-1">
                      <AlertCircle size={12} />
                      <span className="text-[9px] font-medium">{uploadError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Asset Grid Display */}
              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                  {formData.imageUrls.map((url, i) => (
                    <div key={i} className="group relative aspect-square rounded-lg overflow-hidden bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 shadow-sm hover:scale-105 transition-all">
                      {imageLoadErrors[i] ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 bg-zinc-100 dark:bg-zinc-800/50">
                          <ImageOff size={16} />
                        </div>
                      ) : (
                        <img
                          src={getDirectImageUrl(url)}
                          className="w-full h-full object-cover"
                          alt="intelligence-asset"
                          referrerPolicy="no-referrer"
                          onError={() => setImageLoadErrors(prev => ({ ...prev, [i]: true }))}
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, type: 'image', index: i }); }}
                        className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </RowGroup>
        </form>
      </FormModal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: null, index: null })}
        title={deleteConfirm.type === 'image' ? 'Remove Asset?' : 'Delete Record?'}
        message={deleteConfirm.type === 'image' ? 'This asset will be permanently removed.' : 'This record will be permanently deleted.'}
        confirmLabel={deleteConfirm.type === 'image' ? 'Remove' : 'Delete'}
        isDanger={true}
        onConfirm={confirmAction}
      />
    </>
  );
}
