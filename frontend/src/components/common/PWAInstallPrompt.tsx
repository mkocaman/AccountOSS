import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Space } from 'antd';
import { DownloadOutlined, CloseOutlined, MobileOutlined } from '@ant-design/icons';
import './PWAInstallPrompt.css';

/**
 * PWA install prompt
 * Kullanıcıya uygulamayı yüklemesini öner
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Don't show immediately, wait 30 seconds
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('PWA installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Install uygulamayı
   */
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show install prompt
    await deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome} the install prompt`);

    // Clear deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  /**
   * Dismiss prompt
   */
  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  /**
   * Show install instructions for iOS
   */
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;

  const handleIOSInstall = () => {
    setShowIOSInstructions(true);
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Android/Desktop Install Prompt */}
      <Modal
        open={showPrompt}
        onCancel={handleDismiss}
        footer={null}
        centered
        closable={false}
        className="pwa-install-modal"
      >
        <div className="pwa-install-content">
          <div className="pwa-icon">
            <MobileOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </div>

          <h3>{t('pwa.install.title')}</h3>
          <p>{t('pwa.install.description')}</p>

          <ul className="pwa-features">
            <li>✓ {t('pwa.install.feature1')}</li>
            <li>✓ {t('pwa.install.feature2')}</li>
            <li>✓ {t('pwa.install.feature3')}</li>
            <li>✓ {t('pwa.install.feature4')}</li>
          </ul>

          <Space style={{ width: '100%', marginTop: 24 }}>
            <Button
              block
              size="large"
              onClick={handleDismiss}
              icon={<CloseOutlined />}
            >
              {t('pwa.install.later')}
            </Button>
            <Button
              type="primary"
              block
              size="large"
              onClick={handleInstall}
              icon={<DownloadOutlined />}
            >
              {t('pwa.install.install')}
            </Button>
          </Space>
        </div>
      </Modal>

      {/* iOS Install Instructions */}
      {isIOS && (
        <Modal
          open={showIOSInstructions}
          onCancel={() => setShowIOSInstructions(false)}
          footer={null}
          title={t('pwa.ios.title')}
          centered
        >
          <div className="ios-install-instructions">
            <p>{t('pwa.ios.step1')}</p>
            <div className="instruction-step">
              <span className="step-number">1</span>
              <span>{t('pwa.ios.tapShare')}</span>
            </div>

            <div className="instruction-step">
              <span className="step-number">2</span>
              <span>{t('pwa.ios.addToHome')}</span>
            </div>

            <div className="instruction-step">
              <span className="step-number">3</span>
              <span>{t('pwa.ios.confirm')}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Floating install button (for iOS) */}
      {isIOS && !showPrompt && (
        <div className="pwa-floating-button" onClick={handleIOSInstall}>
          <DownloadOutlined style={{ fontSize: 20 }} />
        </div>
      )}
    </>
  );
};
