// file: src/utils/imageOptimizer.js

/**
 * Image Optimization Utilities
 * Handles compression, format conversion, and optimization
 */

/**
 * Check if browser supports WebP format
 */
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Check if browser supports AVIF format
 */
export const supportsAVIF = async () => {
  if (typeof window === 'undefined') return false;
  const avif = new Image();
  return new Promise((resolve) => {
    avif.onload = avif.onerror = () => resolve(avif.height === 2);
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalFormat = async () => {
  const avifSupported = await supportsAVIF();
  if (avifSupported) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpeg';
};

/**
 * Compress image file before upload
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    format = null // null = keep original format
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Draw image with better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Determine file name and type
            const outputFormat = format || file.type || 'image/jpeg';
            const fileName = file.name.replace(/\.[^.]+$/, '') + 
              (outputFormat === 'image/webp' ? '.webp' : 
               outputFormat === 'image/avif' ? '.avif' : '.jpg');

            const compressedFile = new File([blob], fileName, {
              type: outputFormat,
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          format || file.type || 'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generate responsive image URLs with size variants
 * @param {string} baseUrl - Base image URL
 * @param {Array<number>} sizes - Array of width sizes
 * @returns {Object} Object with srcset and sizes
 */
export const generateResponsiveSrcSet = (baseUrl, sizes = [320, 640, 960, 1280, 1920]) => {
  if (!baseUrl) return { srcset: '', sizes: '' };

  // For Google Drive URLs, we can't easily resize, so return original
  if (baseUrl.includes('drive.google.com') || baseUrl.includes('docs.google.com')) {
    return { srcset: baseUrl, sizes: '100vw' };
  }

  // For Firebase Storage or other CDNs, generate srcset
  const srcset = sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');

  const sizesAttr = '(max-width: 640px) 320px, (max-width: 960px) 640px, (max-width: 1280px) 960px, 1280px';

  return { srcset, sizes: sizesAttr };
};

/**
 * Check if URL is from Google Drive (which doesn't support CORS)
 * @param {string} url - Image URL
 * @returns {boolean}
 */
const isGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
};

/**
 * Generate blur placeholder from image
 * Note: Google Drive URLs are skipped due to CORS restrictions
 * @param {string} imageUrl - Image URL
 * @returns {Promise<string>} Base64 blur placeholder or fallback
 */
export const generateBlurPlaceholder = async (imageUrl) => {
  // Skip Google Drive URLs - they don't support CORS
  if (isGoogleDriveUrl(imageUrl)) {
    return Promise.resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+');
  }

  return new Promise((resolve) => {
    const img = new Image();
    // Only set crossOrigin for non-Google Drive URLs
    img.crossOrigin = 'anonymous';
    
    // Set timeout to avoid hanging
    const timeout = setTimeout(() => {
      resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+');
    }, 3000); // 3 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 20, 20);
      
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        resolve(dataUrl);
      } catch {
        // Fallback to simple placeholder
        resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+');
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      // Fallback placeholder
      resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+');
    };
    img.src = imageUrl;
  });
};

/**
 * Preload image for better performance
 * @param {string} imageUrl - Image URL to preload
 * @returns {Promise<void>}
 */
export const preloadImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to preload image'));
    img.src = imageUrl;
  });
};

/**
 * Get image dimensions without loading full image
 * @param {string} imageUrl - Image URL
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

