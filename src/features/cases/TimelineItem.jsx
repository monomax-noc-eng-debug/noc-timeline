import React, { useState, memo, useEffect } from 'react';
import {
  CheckCircle2, AlertCircle, Clock,
  Edit3, Trash2, Image as ImageIcon, MessageSquare, Plus,
  ChevronUp, ChevronDown, ImageOff
} from 'lucide-react';
import { getDirectImageUrl } from '../../utils/helpers';
import ImagePreviewModal from '../../components/ui/ImagePreviewModal';
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------
// Constants & Styles
// ----------------------------------------------------------------------

const getEventAttributes = (event) => {
  const type = event.type?.toLowerCase() || '';
  const desc = (event.desc || event.details || '').toLowerCase();
  const title = (event.title || '').toLowerCase();

  let category = 'default';

  if (type === 'create' || title.includes('create') || desc.includes('created')) category = 'create';
  else if (type === 'update' || title.includes('update') || desc.includes('updated') || desc.includes('edit')) category = 'update';
  else if (type === 'status_change' || desc.includes('resolved') || desc.includes('succeed') || desc.includes('completed') || desc.includes('closed')) category = 'resolved';
  else if (type === 'alert' || desc.includes('alert') || desc.includes('error') || desc.includes('failed') || desc.includes('critical')) category = 'alert';
  else if (type === 'image' || desc.includes('evidence') || desc.includes('photo') || desc.includes('upload')) category = 'evidence';
  else if (desc.includes('pending') || desc.includes('wait')) category = 'pending';

  const styles = {
    create: {
      icon: Plus,
      color: 'bg-[#0078D4]',
      text: 'text-[#0078D4]',
      border: 'border-[#0078D4]',
      lightBg: 'bg-[#0078D4]/10',
      label: 'Created'
    },
    update: {
      icon: Edit3,
      color: 'bg-amber-500',
      text: 'text-amber-600',
      border: 'border-amber-500',
      lightBg: 'bg-amber-500/10',
      label: 'Update'
    },
    resolved: {
      icon: CheckCircle2,
      color: 'bg-emerald-600',
      text: 'text-emerald-700',
      border: 'border-emerald-600',
      lightBg: 'bg-emerald-600/10',
      label: 'Resolved'
    },
    alert: {
      icon: AlertCircle,
      color: 'bg-rose-600',
      text: 'text-rose-700',
      border: 'border-rose-600',
      lightBg: 'bg-rose-600/10',
      label: 'Alert'
    },
    evidence: {
      icon: ImageIcon,
      color: 'bg-indigo-500',
      text: 'text-indigo-600',
      border: 'border-indigo-500',
      lightBg: 'bg-indigo-500/10',
      label: 'Evidence'
    },
    pending: {
      icon: Clock,
      color: 'bg-orange-500',
      text: 'text-orange-600',
      border: 'border-orange-500',
      lightBg: 'bg-orange-500/10',
      label: 'Pending'
    },
    default: {
      icon: MessageSquare,
      color: 'bg-zinc-400',
      text: 'text-zinc-500',
      border: 'border-zinc-400',
      lightBg: 'bg-zinc-400/10',
      label: 'Note'
    }
  };

  const attributes = styles[category] || styles.default;

  if (event.iconType) {
    const icons = { message: MessageSquare, alert: AlertCircle, check: CheckCircle2, clock: Clock, update: Edit3 };
    if (icons[event.iconType]) attributes.icon = icons[event.iconType];
  }

  return { ...attributes, label: event.statusOnLine || attributes.label };
};

// ----------------------------------------------------------------------
// Sub-Component: SafeImage
// ----------------------------------------------------------------------
const SafeImage = ({ src, index, onClick, className }) => {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => { setHasError(false); }, [src]);

  useEffect(() => {
    if (!src) { setImageSrc(null); return; }
    let objectUrl = null;
    if (typeof src === 'object' && (src instanceof File || src instanceof Blob)) {
      objectUrl = URL.createObjectURL(src);
      setImageSrc(objectUrl);
    } else if (typeof src === 'string') {
      setImageSrc(getDirectImageUrl(src));
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);

  if (hasError || !imageSrc) {
    return (
      <div className={cn(className, "flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed rounded-lg")} title="Image failed to load">
        <ImageOff className="text-zinc-400 mb-1" size={14} />
      </div>
    );
  }

  return (
    <button onClick={() => onClick(src)} className={cn("relative group/img overflow-hidden cursor-zoom-in", className)}>
      <img src={imageSrc} alt={`evidence-${index}`} className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110" onError={() => setHasError(true)} loading="lazy" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
        <ImageIcon size={14} className="text-white opacity-0 group-hover/img:opacity-100 transform translate-y-2 group-hover/img:translate-y-0 transition-all duration-300" />
      </div>
    </button>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

function TimelineItem({ event, index, isLastItem, onEdit, onDelete, onMove, showDateHeader, dateLabel }) {
  const [preview, setPreview] = useState(null);
  const { icon: EventIcon, color, text, border, lightBg, label } = getEventAttributes(event);

  const timeStr = event.time || '00:00';
  let displayImages = (event.imageUrls || []).filter(u => u);
  if (!displayImages.length && event.image) displayImages = [event.image];

  return (
    <div className="relative group flex gap-6 pb-2 pl-2">

      {/* --- DATE HEADER ROW (If needed) --- */}
      {showDateHeader && (
        <div className="absolute -top-3 left-0 right-0 flex items-center gap-4 z-10 mb-6">
          <div className="w-4 flex justify-center">{/* Spacer for line */}</div>
          <div className="bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 shadow-sm backdrop-blur-sm">
            {dateLabel}
          </div>
        </div>
      )}

      {/* --- LEFT RAIL (Line & Node) --- */}
      <div className="relative flex flex-col items-center shrink-0 w-8 pt-2">
        {/* Connected Line */}
        <div className={cn(
          "absolute top-0 bottom-0 w-[2px] z-0",
          "bg-zinc-200 dark:bg-zinc-800",
          index === 0 && !showDateHeader ? "top-4" : "-top-6",
          isLastItem && "bottom-auto h-full"
        )} />

        {/* Node (Square/Circle based on image inspiration but simplified) */}
        <div className={cn(
          "relative w-4 h-4 rounded-[4px] z-20 flex items-center justify-center shadow-sm transition-all duration-300",
          color
        )}>
          <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90" />
        </div>
      </div>

      {/* --- CONTENT CARD --- */}
      <div className={cn("flex-1 min-w-0 pb-8 relative", showDateHeader && "mt-8")}>

        {/* Time - Absolute or inline? Inline is better for Outlook style */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 tabular-nums bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded">
            {timeStr}
          </span>
          <span className={cn("text-[10px] font-bold uppercase tracking-wide", text)}>
            {label}
          </span>
        </div>

        {/* Card */}
        <div className={cn(
          "relative bg-white dark:bg-zinc-900 border rounded-lg p-4 shadow-sm transition-all duration-200 group/card",
          "border-l-4", // Thick Left Border
          border.replace('border-', 'border-l-'), // Dynamic Left Border Color
          "border-y-zinc-200 border-r-zinc-200 dark:border-y-zinc-800 dark:border-r-zinc-800", // Standard borders other sides
          "hover:shadow-md hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50"
        )}>

          {/* Header Row */}
          <div className="flex justify-between items-start gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-full shrink-0", lightBg)}>
                <EventIcon size={14} className={text} />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {event.title || 'Update'}
              </h4>
            </div>

            {/* Actions (Hidden by default) */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
              {onMove && (
                <div className="flex flex-col mr-1">
                  <button onClick={() => onMove(index, 'up')} className="p-0.5 hover:text-[#0078D4]"><ChevronUp size={12} /></button>
                  <button onClick={() => onMove(index, 'down')} className="p-0.5 hover:text-[#0078D4]"><ChevronDown size={12} /></button>
                </div>
              )}
              <button onClick={() => onEdit(event)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-[#0078D4]" title="Edit"><Edit3 size={14} /></button>
              <button onClick={() => onDelete(event.id)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-rose-600" title="Delete"><Trash2 size={14} /></button>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap pl-9 break-words">
            {event.desc || event.details}
          </div>

          {/* Images */}
          {displayImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pl-9">
              {displayImages.map((imgSource, i) => (
                <SafeImage
                  key={i}
                  index={i}
                  src={imgSource}
                  onClick={setPreview}
                  className="w-16 h-16 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm hover:ring-2 ring-offset-1 ring-[#0078D4]"
                />
              ))}
            </div>
          )}

          {/* Footer Metadata */}
          {(event.updatedBy || event.createdBy) && (
            <div className="mt-3 pl-9 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-4 h-4 rounded-full bg-[#0078D4] text-white flex items-center justify-center text-[8px] font-bold">
                {(event.updatedBy || event.createdBy || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                {event.updatedBy || event.createdBy}
              </span>
            </div>
          )}

        </div>
      </div>
      <ImagePreviewModal isOpen={!!preview} onClose={() => setPreview(null)} imageUrl={preview} allImages={displayImages} />
    </div>
  );
}

export default memo(TimelineItem);