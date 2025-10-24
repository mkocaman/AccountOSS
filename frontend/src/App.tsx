import { ConfigProvider, App as AntApp } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import trTR from 'antd/locale/tr_TR';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { useEffect } from 'react';

function App() {
  const { i18n } = useTranslation();
  
  // Dile göre Ant Design locale seç
  const antdLocale = i18n.language === 'en' ? enUS : trTR;

  /**
   * Register service worker
   */
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <ConfigProvider
        locale={antdLocale}
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
        }}
      >
        <AntApp>
          <RouterProvider router={router} />
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
          
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
