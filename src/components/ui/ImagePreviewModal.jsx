import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ChevronLeft, ChevronRight, Maximize2, Minimize2, Move } from 'lucide-react';
import { getDirectImageUrl } from '../../utils/helpers';
import OptimizedImage from './OptimizedImage';

export default function ImagePreviewModal({ isOpen, onClose, imageUrl, allImages = [], initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const images = allImages.length > 0 ? allImages : [imageUrl];
  const currentUrl = images[currentIndex] || imageUrl;

  const containerRef = React.useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track fullscreen state
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const resetZoom = React.useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleNext = React.useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  }, [images.length, resetZoom]);

  const handlePrev = React.useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  }, [images.length, resetZoom]);

  const toggleFullscreen = React.useCallback((e) => {
    e?.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error("Fullscreen failed:", err);
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case '0':
          resetZoom();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, resetZoom, toggleFullscreen]);

  // Handle Mouse Wheel Zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (!isOpen) return;
      e.preventDefault();

      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.1 : 0.9;
      const newScale = Math.min(Math.max(scale * factor, 0.5), 10);

      setScale(newScale);

      // If zooming out to small, reset position
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isOpen, scale]);

  // resetZoom defined above

  // Sync index when initialIndex changes or modal opens (defer setState)
  useEffect(() => {
    let isMounted = true;
    let timer = null;
    if (isOpen) {
      timer = setTimeout(() => {
        if (!isMounted) return;
        const idx = initialIndex || (imageUrl ? (allImages.indexOf(imageUrl) >= 0 ? allImages.indexOf(imageUrl) : 0) : 0);
        setCurrentIndex(idx);
        resetZoom();
        document.body.style.overflow = 'hidden';
      }, 0);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex, imageUrl, allImages, resetZoom]);

  if (!isOpen) return null;

  // handleNext/handlePrev defined above

  // Pan handlers
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleZoom = (e) => {
    e?.stopPropagation();
    if (scale === 1) setScale(2.5);
    else resetZoom();
  };

  return createPortal(
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : ''}`}
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* GLOSS OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* TOP BAR / CONTROLS - Responsive */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-center z-50">
        <div
          className="flex items-center gap-4 cursor-pointer group/header"
          onClick={toggleFullscreen}
        >
          <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center backdrop-blur-xl shadow-2xl group-hover/header:bg-white/20 transition-all">
            {isFullscreen ? <Minimize2 size={24} className="text-white" /> : <Maximize2 size={24} className="text-white" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] md:text-[14px] font-black text-white uppercase ">NOC Visual Intel</span>
            <span className="text-[10px] md:text-[11px] font-bold text-white/30 uppercase tracking-widest leading-none mt-1 group-hover/header:text-white/50 transition-colors">
              Ref ID {currentIndex + 1} of {images.length} • Click to {isFullscreen ? 'Exit' : 'Maximize'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
          <button
            onClick={toggleZoom}
            className={`p-4 rounded-lg border border-white/10 transition-all active:scale-90 flex backdrop-blur-md ${scale > 1 ? 'bg-white text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
            title={scale > 1 ? "Reset Zoom" : "Quick Zoom"}
          >
            {scale > 1 ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
          </button>

          <a
            href={getDirectImageUrl(currentUrl)}
            download
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all active:scale-90 backdrop-blur-md"
          >
            <Download size={22} />
          </a>

          <button
            onClick={onClose}
            className="p-4 bg-white text-black rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-white/10 hover:bg-zinc-200 transition-all active:scale-90"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* IMAGE VIEWER AREA */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
          }}
          onClick={e => {
            e.stopPropagation();
            if (scale === 1) setScale(2.5);
            else resetZoom();
          }}
          onMouseDown={handleMouseDown}
        >
          <OptimizedImage
            src={currentUrl}
            alt="Preview"
            className="max-w-[90vw] max-h-[80vh] md:max-w-[85vw] md:max-h-[85vh] rounded-lg md:rounded-xl shadow-[0_0_120px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 duration-500 pointer-events-none"
            style={{ imageRendering: 'auto' }}
            loading="eager"
            fallback="https://placehold.co/1200x800?text=Failed+to+load+image"
          />

          {/* ZOOM INDICATOR */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            {scale === 1 && <Move size={64} className="text-white/10" />}
          </div>
        </div>
      </div>

      {/* NAVIGATION CONTROLS */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 w-14 h-14 md:w-20 md:h-20 rounded-lg bg-black/40 hover:bg-white text-white hover:text-black border border-white/10 transition-all duration-500 flex items-center justify-center group active:scale-90 z-50 backdrop-blur-xl shadow-2xl"
          >
            <ChevronLeft size={32} className="group-hover:-translate-x-1.5 transition-transform" strokeWidth={4} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-14 h-14 md:w-20 md:h-20 rounded-lg bg-black/40 hover:bg-white text-white hover:text-black border border-white/10 transition-all duration-500 flex items-center justify-center group active:scale-90 z-50 backdrop-blur-xl shadow-2xl"
          >
            <ChevronRight size={32} className="group-hover:translate-x-1.5 transition-transform" strokeWidth={4} />
          </button>
        </>
      )}

      {/* FOOTER INFO */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col items-center gap-6 pointer-events-none z-50">

        {/* THUMBNAIL TRACKER */}
        {images.length > 1 && (
          <div className="flex gap-2 p-2 bg-black/60 backdrop-blur-2xl rounded-lg border border-white/10 pointer-events-auto overflow-x-auto max-w-[85vw] no-scrollbar shadow-2xl">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); resetZoom(); }}
                className={`h-2.5 rounded-full transition-all duration-700 ease-out ${currentIndex === idx ? 'bg-white w-12 md:w-16 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/10 hover:bg-white/30 w-2.5'}`}
              />
            ))}
          </div>
        )}

        <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-lg px-6 py-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
          <p className="text-[10px] md:text-[11px] font-black text-white/40 uppercase truncate max-w-[250px] md:max-w-2xl">
            SRC: {currentUrl.split('/').pop().substring(0, 60)}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}


