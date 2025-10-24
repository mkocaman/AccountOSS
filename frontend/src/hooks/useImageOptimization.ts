import { useState, useEffect } from 'react';

/**
 * Image optimization hook
 * Progressive image loading ve lazy loading
 */

interface ImageOptimizationOptions {
  src: string;
  placeholder?: string;
  lazy?: boolean;
}

export const useImageOptimization = ({
  src,
  placeholder,
  lazy = true
}: ImageOptimizationOptions) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Lazy loading observer
    if (lazy && 'IntersectionObserver' in window) {
      const img = new Image();
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              img.src = src;
              observer.disconnect();
            }
          });
        },
        { rootMargin: '50px' }
      );

      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };

      img.onerror = () => {
        setError(true);
      };

      // Start observing
      const element = document.createElement('div');
      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    } else {
      // No lazy loading, load immediately
      const img = new Image();
      img.src = src;

      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };

      img.onerror = () => {
        setError(true);
      };
    }
  }, [src, lazy]);

  return {
    imageSrc,
    isLoaded,
    error
  };
};

/**
 * Generate optimized image URL (for CDN/image service)
 */
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number,
  _quality: number = 80
): string => {
  // TODO: CDN/image service entegrasyonu
  // Örnek: Cloudinary, imgix, etc.
  
  // Şimdilik orijinal URL'i döndür
  return url;
};
