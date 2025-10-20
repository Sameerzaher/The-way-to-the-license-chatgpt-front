// PWA Utilities for Service Worker and Installation

// Register Service Worker
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                showUpdateNotification();
              }
            });
          });
        })
        .catch((registrationError) => {
          console.log('❌ SW registration failed: ', registrationError);
        });
    });
  }
};

// Show update notification
const showUpdateNotification = () => {
  if (window.confirm('גרסה חדשה זמינה! האם תרצה לעדכן?')) {
    window.location.reload();
  }
};

// Check if app can be installed
export const canInstallPWA = () => {
  return window.deferredPrompt !== null;
};

// Install PWA
export const installPWA = async () => {
  if (window.deferredPrompt) {
    const promptEvent = window.deferredPrompt;
    window.deferredPrompt = null;
    
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    
    console.log('PWA install result:', result);
    return result.outcome === 'accepted';
  }
  return false;
};

// Listen for install prompt
export const listenForInstallPrompt = (callback) => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    callback(true);
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA was installed');
    window.deferredPrompt = null;
    callback(false);
  });
};

// Check if running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Get connection status
export const getConnectionStatus = () => {
  return {
    online: navigator.onLine,
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
    effectiveType: navigator.connection?.effectiveType || 'unknown'
  };
};

// Listen for connection changes
export const listenForConnectionChanges = (callback) => {
  const handleOnline = () => callback({ online: true, type: 'online' });
  const handleOffline = () => callback({ online: false, type: 'offline' });

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Cache data for offline use
export const cacheDataForOffline = async (key, data) => {
  try {
    if ('caches' in window) {
      const cache = await caches.open('theory-app-v1.0.0');
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      await cache.put(`/offline-data/${key}`, response);
      console.log(`✅ Data cached for offline: ${key}`);
    } else {
      // Fallback to localStorage
      localStorage.setItem(`offline_${key}`, JSON.stringify(data));
    }
  } catch (error) {
    console.error('❌ Failed to cache data:', error);
  }
};

// Get cached data for offline use
export const getCachedDataForOffline = async (key) => {
  try {
    if ('caches' in window) {
      const cache = await caches.open('theory-app-v1.0.0');
      const response = await cache.match(`/offline-data/${key}`);
      if (response) {
        return await response.json();
      }
    }
    
    // Fallback to localStorage
    const data = localStorage.getItem(`offline_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Failed to get cached data:', error);
    return null;
  }
};

// Store offline action for later sync
export const storeOfflineAction = async (action, data) => {
  try {
    const offlineActions = await getCachedDataForOffline('offlineActions') || [];
    offlineActions.push({
      action,
      data,
      timestamp: Date.now(),
      id: Date.now() + Math.random()
    });
    
    await cacheDataForOffline('offlineActions', offlineActions);
    console.log('✅ Offline action stored:', action);
  } catch (error) {
    console.error('❌ Failed to store offline action:', error);
  }
};

// Sync offline actions when back online
export const syncOfflineActions = async () => {
  try {
    const offlineActions = await getCachedDataForOffline('offlineActions') || [];
    
    if (offlineActions.length === 0) {
      return { success: true, synced: 0 };
    }

    console.log(`🔄 Syncing ${offlineActions.length} offline actions...`);
    
    let syncedCount = 0;
    const failedActions = [];

    for (const actionItem of offlineActions) {
      try {
        // Here you would make the actual API call based on action type
        const result = await syncSingleAction(actionItem);
        if (result.success) {
          syncedCount++;
        } else {
          failedActions.push(actionItem);
        }
      } catch (error) {
        console.error('Failed to sync action:', actionItem, error);
        failedActions.push(actionItem);
      }
    }

    // Keep only failed actions for retry
    await cacheDataForOffline('offlineActions', failedActions);
    
    console.log(`✅ Synced ${syncedCount} actions, ${failedActions.length} failed`);
    
    return {
      success: true,
      synced: syncedCount,
      failed: failedActions.length
    };
  } catch (error) {
    console.error('❌ Failed to sync offline actions:', error);
    return { success: false, error: error.message };
  }
};

// Sync a single action
const syncSingleAction = async (actionItem) => {
  const { action, data } = actionItem;
  
  switch (action) {
    case 'answer':
      return await syncAnswer(data);
    case 'progress':
      return await syncProgress(data);
    case 'exam':
      return await syncExam(data);
    default:
      console.warn('Unknown action type:', action);
      return { success: false, error: 'Unknown action type' };
  }
};

// Sync answer
const syncAnswer = async (data) => {
  try {
    const response = await fetch('/api/answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sync progress
const syncProgress = async (data) => {
  try {
    const response = await fetch('/api/progress/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sync exam
const syncExam = async (data) => {
  try {
    const response = await fetch('/api/exams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission === 'granted';
  }
  return false;
};

// Show local notification
export const showLocalNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return notification;
  }
  return null;
};

console.log('🚀 PWA Utils loaded successfully');
