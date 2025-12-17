import React from 'react';
import { Pencil, Trash2, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

// Helper: Convert Google Drive Link to Direct Image
const getDirectImageUrl = (url) => {
  if (!url) return '';
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const idMatch = url.match(/\/d\/(.*?)(?:\/|$)/);
    if (idMatch && idMatch[1]) return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }
  return url;
};

export default function TimelineItem({
  event, index, isLastItem, showDateHeader, dateLabel,
  onMove, onEdit, onDelete
}) {
  let displayImages = event.imageUrls || [];
  if (!displayImages.length && event.imageUrl) displayImages = [event.imageUrl]; // Legacy support

  return (
    <div className="relative flex items-start gap-4 sm:gap-6 mb-8 z-10">

      {/* Timeline Dot & Time */}
      <div className="flex-none w-[56px] sm:w-[90px] flex flex-col items-center pt-1 z-10">
        <div className="w-4 h-4 rounded-full bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white shadow-md ring-4 ring-gray-50 dark:ring-zinc-950 z-20"></div>
        <div className="mt-2 flex flex-col items-center">
          <span className="font-mono text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-center">
            {event.time}
          </span>
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 min-w-0">
        {showDateHeader && (
          <div className="mb-4 -mt-2">
            <span className="inline-block text-[10px] font-black text-white dark:text-black uppercase tracking-widest bg-black dark:bg-white px-3 py-1 rounded-full shadow-md opacity-90">
              {dateLabel}
            </span>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border-2 border-gray-200 dark:border-zinc-800 shadow-sm flex gap-4 relative group/card hover:border-black dark:hover:border-white transition-all duration-200 hover:shadow-md">

          {/* Arrow Pointer */}
          <div className="absolute top-5 -left-[9px] w-4 h-4 bg-white dark:bg-zinc-900 border-l-2 border-b-2 border-gray-200 dark:border-zinc-800 transform rotate-45 group-hover/card:border-black dark:group-hover/card:border-white transition-colors duration-200"></div>

          {/* Reorder Buttons */}
          <div className="flex flex-col gap-1 justify-center border-r pr-3 border-gray-100 dark:border-zinc-800 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <button onClick={() => onMove(index, 'up')} disabled={index === 0} className="p-1 text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-0 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-all"><ChevronUp size={16} /></button>
            <button onClick={() => onMove(index, 'down')} disabled={isLastItem} className="p-1 text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-0 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-all"><ChevronDown size={16} /></button>
          </div>

          <div className="flex-1 min-w-0">
            {/* Event Header */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mr-4">{event.title || event.time}</h3>
              <div className="flex gap-2 flex-none opacity-0 group-hover/card:opacity-100 transition-opacity">
                <button onClick={() => onEdit(event)} className="text-gray-400 hover:text-black dark:hover:text-white" title="Edit Event"><Pencil size={12} /></button>
                <button onClick={() => onDelete(event.id)} className="text-gray-400 hover:text-red-500" title="Delete Event"><Trash2 size={12} /></button>
              </div>
            </div>

            {/* Description */}
            {event.desc && <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-3">{event.desc}</p>}

            {/* Image Grid */}
            {displayImages.length > 0 && (
              <div className={`grid gap-3 mt-3 ${displayImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
                {displayImages.map((url, imgIndex) => (
                  <div key={imgIndex} className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 relative group/image h-auto shadow-sm">
                    <img src={getDirectImageUrl(url)} className="w-full h-auto block" alt={`Evidence ${imgIndex + 1}`} onError={(e) => e.target.style.display = 'none'} />
                    <a href={url} target="_blank" rel="noreferrer" className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1.5 rounded-lg opacity-0 group-hover/image:opacity-100 transition backdrop-blur-sm"><ExternalLink size={14} /></a>
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