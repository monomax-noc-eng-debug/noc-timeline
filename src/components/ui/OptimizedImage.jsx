// file: src/components/ui/OptimizedImage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { ImageOff } from 'lucide-react';
import { getDirectImageUrl } from '../../utils/helpers';
import { generateResponsiveSrcSet, generateBlurPlaceholder, preloadImage } from '../../utils/imageOptimizer';
import { cn } from '@/lib/utils';

/**
 * OptimizedImage Component
 * Features:
 * - Lazy loading
 * - Responsive images (srcset)
 * - Blur placeholder
 * - Progressive loading
 * - Error handling
 * - Intersection Observer for performance
 */
export default function OptimizedImage({
  src,
  alt = '',
  className = '',
  onClick,
  sizes,
  loading = 'lazy',
  placeholder = 'blur',
  fallback,
  onLoad,
  onError,
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [blurDataUrl, setBlurDataUrl] = useState(null);
  // Start with false for non-lazy images (they load immediately)
  const [hasError, setHasError] = useState(false);
  // Initialize isInView based on loading prop
  const [isInView, setIsInView] = useState(loading !== 'lazy');
  const imgRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const observerRef = React.useRef(null);

  // Process image source
  useEffect(() => {
    if (!src) {
      setTimeout(() => setImageSrc(null), 0);
      return;
    }

    try {
      // Handle File/Blob objects
      if (typeof src === 'object' && (src instanceof File || src instanceof Blob)) {
        const objectUrl = URL.createObjectURL(src);
        setTimeout(() => setImageSrc(objectUrl), 0);
        return () => URL.revokeObjectURL(objectUrl);
      }

      // Handle string URLs
      if (typeof src === 'string') {
        const processedUrl = getDirectImageUrl(src);
        setTimeout(() => setImageSrc(processedUrl), 0);
        
        // Generate blur placeholder for string URLs (skip Google Drive due to CORS)
        if (placeholder === 'blur' && processedUrl) {
          // Check if it's a Google Drive URL
          const isGoogleDrive = processedUrl.includes('drive.google.com') || processedUrl.includes('docs.google.com');
          
          if (!isGoogleDrive) {
            generateBlurPlaceholder(processedUrl)
              .then((data) => { setTimeout(() => setBlurDataUrl(data), 0); })
              .catch(() => {
                // Silent fail for placeholder - use fallback
                setTimeout(() => setBlurDataUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'), 0);
              });
          } else {
            // Use simple placeholder for Google Drive
            setTimeout(() => setBlurDataUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'), 0);
          }
        }
      }
    } catch (e) {
      console.error('Error processing image source:', e);
      setTimeout(() => setImageSrc(null), 0);
    }
  }, [src, placeholder]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    // If not lazy loading, always show image
    if (loading !== 'lazy') {
      setTimeout(() => setIsInView(true), 0);
      return;
    }

    // For lazy loading, use containerRef (the placeholder div)
    const containerElement = containerRef.current || imgRef.current;
    if (!containerElement) {
      // Fallback: if no element yet, show after short delay
      const timer = setTimeout(() => setIsInView(true), 50);
      return () => clearTimeout(timer);
    }

    // If already in view, skip observer
    if (isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observerRef.current.observe(containerElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, isInView]);

  // Generate responsive srcset
  const { srcset, sizesAttr } = useMemo(() => {
    if (!imageSrc) return { srcset: '', sizesAttr: '' };
    return generateResponsiveSrcSet(imageSrc);
  }, [imageSrc]);

  // Handle image load
  const handleLoad = (e) => {
    if (onLoad) onLoad(e);
  };

  // Handle image error
  const handleError = (e) => {
    setHasError(true);
    if (fallback && e.target.src !== fallback) {
      e.target.src = fallback;
      setHasError(false);
    } else if (onError) {
      onError(e);
    }
  };

  // Preload image when in view
  useEffect(() => {
    if (isInView && imageSrc && !hasError) {
      preloadImage(imageSrc).catch(() => {
        // Silent fail for preload
      });
    }
  }, [isInView, imageSrc, hasError]);

  // Show error state
  if (hasError && !fallback) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
          className
        )}
        onClick={onClick}
      >
        <ImageOff className="text-zinc-400 mb-1" size={20} />
        <span className="text-[10px] font-bold text-zinc-400 uppercase">Failed to load</span>
      </div>
    );
  }

  // Show placeholder while lazy loading and not in view
  if (loading === 'lazy' && !isInView) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-zinc-100 dark:bg-zinc-900',
          className
        )}
        ref={containerRef}
      >
        {blurDataUrl && (
          <img
            src={blurDataUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110 opacity-50"
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc || fallback}
      srcSet={srcset || undefined}
      sizes={sizes || sizesAttr || undefined}
      alt={alt}
      className={cn(
        className
      )}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      onClick={onClick}
      decoding="async"
      {...props}
    />
  );
}

