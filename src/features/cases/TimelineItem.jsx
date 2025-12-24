import React from 'react';
import { Pencil, Trash2, ChevronUp, ChevronDown, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { getDirectImageUrl } from '../../utils/helpers';

/**
 * TimelineItem - Individual event in the incident timeline
 */
export default function TimelineItem({
  event, index, isLastItem, showDateHeader, dateLabel,
  onMove, onEdit, onDelete
}) {
  // Handle multiple image formats
  let displayImages = (event.imageUrls || []).filter(u => u && typeof u === 'string');
  if (!displayImages.length && event.image && typeof event.image === 'string') displayImages = [event.image];
  if (!displayImages.length && event.imageUrl && typeof event.imageUrl === 'string') displayImages = [event.imageUrl];

  const hasDescription = event.desc && event.desc.trim().length > 0;
  const hasImages = displayImages.length > 0;

  return (
    <div className="relative flex items-start gap-3 md:gap-4 mb-4 z-10 group/item animate-in fade-in slide-in-from-left-2 duration-300">

      {/* --- Left Column: Time & Dot --- */}
      <div className="flex-none flex flex-col items-center w-14 pt-[4px]">
        {/* Dot with pulse effect (Compact) */}
        <div className={`
          w-2.5 h-2.5 rounded-full bg-white dark:bg-zinc-900 border-[2.5px] border-black dark:border-white shadow-sm z-20 transition-all
          ${index === 0 ? 'ring-2 ring-black/10 dark:ring-white/10' : ''}
          group-hover/item:scale-125
        `} />

        {/* Time (Compact) */}
        <div className="mt-1">
          <span className="font-mono text-[9px] font-black text-gray-400 dark:text-zinc-500 bg-gray-50/50 dark:bg-zinc-900 px-1 py-0.5 rounded uppercase">
            {event.time}
          </span>
        </div>

        {/* Image indicator (Compact) */}
        {hasImages && (
          <div className="mt-1 text-zinc-300">
            <ImageIcon size={9} />
          </div>
        )}
      </div>

      {/* --- Right Column: Content Card --- */}
      <div className="flex-1 min-w-0">
        {/* Date Header (Compact Style) */}
        {showDateHeader && (
          <div className="mb-2 -mt-1">
            <span className="inline-block text-[8px] font-black text-white dark:text-black uppercase tracking-wider bg-zinc-900 dark:bg-zinc-100 px-2 py-0.5 rounded shadow-sm">
              {dateLabel}
            </span>
          </div>
        )}

        <div className="bg-white dark:bg-[#0a0a0a] p-2.5 md:p-3 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex gap-2 relative hover:border-zinc-300 dark:hover:border-zinc-600 transition-all group-hover/item:shadow-md">

          {/* Reorder Buttons (Micro) */}
          <div className="flex flex-col gap-0.5 justify-center border-r pr-1.5 border-gray-100 dark:border-zinc-900 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity">
            <button
              onClick={() => onMove(index, 'up')}
              disabled={index === 0}
              className="p-0.5 text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-10 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              <ChevronUp size={12} />
            </button>
            <button
              onClick={() => onMove(index, 'down')}
              disabled={isLastItem}
              className="p-0.5 text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-10 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="flex-1 min-w-0 relative pr-10 md:pr-12">

            {/* Actions (Absolute Top Right - Tiny) */}
            <div className="absolute top-0 right-0 flex gap-0.5 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(event)}
                className="p-1 text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded transition-colors"
              >
                <Pencil size={10} />
              </button>
              <button
                onClick={() => onDelete(event.id)}
                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"
              >
                <Trash2 size={10} />
              </button>
            </div>

            {/* Description (Compact) */}
            <div className="text-[11px] font-medium text-gray-700 dark:text-zinc-400 leading-normal whitespace-pre-wrap pt-0.5">
              {hasDescription ? event.desc : <span className="text-gray-300 dark:text-zinc-800 italic">...</span>}
            </div>

            {/* Image Grid (Smaller) */}
            {hasImages && (
              <div className={`grid gap-1.5 mt-2.5 ${displayImages.length === 1
                ? 'grid-cols-1 max-w-[150px]'
                : displayImages.length === 2
                  ? 'grid-cols-2 max-w-[300px]'
                  : 'grid-cols-2 sm:grid-cols-3'
                }`}>
                {displayImages.map((url, imgIndex) => (
                  <div key={imgIndex} className="relative group/image rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-900 bg-gray-50 aspect-video">
                    <img
                      src={getDirectImageUrl(url)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                      alt={`Evidence ${imgIndex + 1}`}
                      loading="lazy"
                      onError={(e) => {
                        console.warn("Image load failed:", url);
                        e.target.src = 'https://placehold.co/400?text=Image+Load+Failed';
                      }}
                    />
                    <a href={url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                      <ExternalLink size={14} className="text-white" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}