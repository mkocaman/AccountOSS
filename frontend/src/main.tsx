import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import './styles/pro-components.css'
import './styles/themes.css'
import './styles/mobile-enhanced.css'
import { reportWebVitals, logPerformanceMetrics, monitorBundleSize } from '@/utils/performance';
import { initSentry } from '@/utils/sentry';

/**
 * Development modda Mock Service Worker'ı başlat (opsiyonel)
 * VITE_USE_MOCK_API=true ise MSW aktif olur
 */
async function enableMocking() {
  // Sadece development ve mock API enabled ise
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true') {
    const { worker } = await import('./mocks/browser');
    
    return worker.start({
      onUnhandledRequest: 'bypass', // 404'leri sessizce geç
      quiet: false // Console'da mock bilgileri göster
    }).then(() => {
      console.log('🔶 MSW Mock API started - Using mock data');
      console.log('💡 To use real API, set VITE_USE_MOCK_API=false in .env');
    });
  } else if (import.meta.env.DEV) {
    console.log('🔵 Using real API at:', import.meta.env.VITE_API_URL);
  }
}

// Initialize Sentry
initSentry();

// MSW'yi başlat (varsa), sonra React'i render et
enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
});

// React Query client oluştur - Gelişmiş error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika
      gcTime: 10 * 60 * 1000, // 10 dakika
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // 404 hatalarında retry yapma
        if (error?.response?.status === 404) return false;
        // Diğer hatalarda 1 kez daha dene
        return failureCount < 1;
      },
      // Error handling artık component seviyesinde yapılıyor
    },
    mutations: {
      retry: false
      // Error handling artık component seviyesinde yapılıyor
    }
  },
})

// Report web vitals
reportWebVitals((metric) => {
  console.log(metric);
  
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      non_interaction: true
    });
  }
});

// Log performance metrics (after page load)
window.addEventListener('load', () => {
  setTimeout(() => {
    logPerformanceMetrics();
    monitorBundleSize();
  }, 0);
});
