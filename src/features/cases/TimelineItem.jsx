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
  let displayImages = event.imageUrls || [];
  if (!displayImages.length && event.image) displayImages = [event.image];
  if (!displayImages.length && event.imageUrl) displayImages = [event.imageUrl];

  const hasDescription = event.desc && event.desc.trim().length > 0;
  const hasImages = displayImages.length > 0;

  return (
    <div className="relative flex items-start gap-3 md:gap-4 mb-6 z-10 group/item animate-in fade-in slide-in-from-left-2 duration-300">

      {/* --- Left Column: Time & Dot --- */}
      <div className="flex-none flex flex-col items-center w-16 pt-[6px]">
        {/* Dot with pulse effect for first item */}
        <div className={`
          w-3 h-3 rounded-full bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white shadow-sm z-20 transition-all
          ${index === 0 ? 'ring-4 ring-black/10 dark:ring-white/10' : ''}
          group-hover/item:scale-125
        `} />

        {/* Time */}
        <div className="mt-1.5">
          <span className="font-mono text-[10px] font-bold text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
            {event.time}
          </span>
        </div>

        {/* Image indicator */}
        {hasImages && (
          <div className="mt-1 text-zinc-400">
            <ImageIcon size={10} />
          </div>
        )}
      </div>

      {/* --- Right Column: Content Card --- */}
      <div className="flex-1 min-w-0">
        {/* Date Header */}
        {showDateHeader && (
          <div className="mb-3 -mt-2">
            <span className="inline-block text-[9px] font-black text-white dark:text-black uppercase tracking-widest bg-gradient-to-r from-black to-zinc-700 dark:from-white dark:to-zinc-300 px-3 py-1 rounded-full shadow-sm">
              {dateLabel}
            </span>
          </div>
        )}

        <div className="bg-white dark:bg-[#111] p-3 md:p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex gap-3 relative hover:border-black dark:hover:border-white transition-all group-hover/item:shadow-md">

          {/* Reorder Buttons */}
          <div className="flex flex-col gap-1 justify-center border-r pr-2 border-gray-100 dark:border-zinc-800 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity">
            <button
              onClick={() => onMove(index, 'up')}
              disabled={index === 0}
              className="p-1 text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 rounded transition-colors"
              title="Move up"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => onMove(index, 'down')}
              disabled={isLastItem}
              className="p-1 text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 rounded transition-colors"
              title="Move down"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex-1 min-w-0 relative pr-12 md:pr-14">

            {/* Actions (Absolute Top Right) */}
            <div className="absolute top-0 right-0 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity bg-white dark:bg-[#111] pl-2 pb-2 rounded-bl-xl">
              <button
                onClick={() => onEdit(event)}
                className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Edit event"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => onDelete(event.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete event"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Description */}
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap pt-0.5">
              {hasDescription ? (
                event.desc
              ) : (
                <span className="text-gray-400 dark:text-zinc-600 italic font-normal">
                  No details provided.
                </span>
              )}
            </div>

            {/* Image Grid */}
            {hasImages && (
              <div className={`grid gap-2 mt-3 ${displayImages.length === 1
                  ? 'grid-cols-1 max-w-[200px]'
                  : displayImages.length === 2
                    ? 'grid-cols-2 max-w-[400px]'
                    : 'grid-cols-2 sm:grid-cols-3'
                }`}>
                {displayImages.map((url, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="relative group/image rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 aspect-video"
                  >
                    <img
                      src={getDirectImageUrl(url)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                      alt={`Evidence ${imgIndex + 1}`}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/300x200/222/fff?text=Image+Error';
                      }}
                    />
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                    >
                      <ExternalLink size={16} className="text-white drop-shadow-lg" />
                    </a>

                    {/* Image counter for multiple images */}
                    {displayImages.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        {imgIndex + 1}/{displayImages.length}
                      </div>
                    )}
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