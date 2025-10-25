/**
 * Performance monitoring utilities
 */

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName: string) => {
  if (import.meta.env.DEV) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Slower than 60fps
        console.warn(
          `⚠️ [Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`
        );
      }
    };
  }
  
  return () => {}; // No-op in production
};

/**
 * Web Vitals'ı raporla
 */
export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Türkçe yorum: web-vitals dinamik import - eğer paket yoksa hata vermez
    import('web-vitals')
      .then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        // Türkçe yorum: web-vitals v4 API - on prefix kullanıyor
        onCLS(onPerfEntry);
        onFID(onPerfEntry);
        onFCP(onPerfEntry);
        onLCP(onPerfEntry);
        onTTFB(onPerfEntry);
      })
      .catch((error) => {
        // Türkçe yorum: web-vitals paketi yoksa veya eski versiyonsa sessizce atla
        console.warn('web-vitals paketi yüklenemedi:', error.message);
      });
  }
};

/**
 * Log performance metrics to analytics
 */
export const logPerformanceMetrics = () => {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    const metrics = {
      // Page load time
      pageLoad: timing.loadEventEnd - navigationStart,
      
      // DNS lookup time
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      
      // TCP connection time
      tcpConnection: timing.connectEnd - timing.connectStart,
      
      // Server response time
      serverResponse: timing.responseEnd - timing.requestStart,
      
      // DOM processing time
      domProcessing: timing.domComplete - timing.domLoading,
      
      // Time to first byte
      ttfb: timing.responseStart - navigationStart,
      
      // DOM content loaded
      domContentLoaded: timing.domContentLoadedEventEnd - navigationStart
    };

    console.table(metrics);
    
    // Send to analytics service
    if (window.gtag) {
      Object.entries(metrics).forEach(([key, value]) => {
        window.gtag('event', 'timing_complete', {
          name: key,
          value: Math.round(value),
          event_category: 'Performance'
        });
      });
    }
  }
};

/**
 * Monitor bundle size
 */
export const monitorBundleSize = () => {
  if (import.meta.env.DEV) {
    const entries = performance.getEntriesByType('resource');
    let totalSize = 0;

    entries.forEach((entry: any) => {
      if (entry.initiatorType === 'script' || entry.initiatorType === 'link') {
        totalSize += entry.transferSize || 0;
      }
    });

    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(`📦 Total bundle size: ${totalSizeMB}MB`);
  }
};
