import React, { useState, useEffect } from 'react';
import { installPWA, listenForInstallPrompt, isPWA } from '../../utils/pwaUtils';
import './PWAInstaller.css';

const PWAInstaller = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already running as PWA
    if (isPWA()) {
      return;
    }

    // Listen for install prompt
    const cleanup = listenForInstallPrompt((canInstallNow) => {
      setCanInstall(canInstallNow);
      if (canInstallNow) {
        // Show prompt after a short delay
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    });

    return cleanup;
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await installPWA();
      if (installed) {
        setShowPrompt(false);
        setCanInstall(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if dismissed in this session
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  // Don't show if can't install or already PWA
  if (!canInstall || !showPrompt || isPWA()) {
    return null;
  }

  return (
    <div className="pwa-installer">
      <div className="pwa-installer-content">
        <div className="pwa-installer-icon">📱</div>
        <div className="pwa-installer-text">
          <h3>התקן את האפליקציה</h3>
          <p>קבל גישה מהירה ועבוד גם בלי אינטרנט!</p>
        </div>
        <div className="pwa-installer-actions">
          <button
            className="pwa-install-btn"
            onClick={handleInstall}
            disabled={isInstalling}
          >
            {isInstalling ? (
              <>
                <span className="loading-spinner"></span>
                מתקין...
              </>
            ) : (
              <>
                📲 התקן
              </>
            )}
          </button>
          <button
            className="pwa-dismiss-btn"
            onClick={handleDismiss}
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="pwa-benefits">
        <div className="pwa-benefit">
          <span className="pwa-benefit-icon">⚡</span>
          <span>טעינה מהירה</span>
        </div>
        <div className="pwa-benefit">
          <span className="pwa-benefit-icon">📡</span>
          <span>עבודה אופליין</span>
        </div>
        <div className="pwa-benefit">
          <span className="pwa-benefit-icon">🔔</span>
          <span>התראות</span>
        </div>
        <div className="pwa-benefit">
          <span className="pwa-benefit-icon">💾</span>
          <span>חיסכון בנתונים</span>
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller;
