import { useState, useEffect } from 'react';

/**
 * Hook לזיהוי מצב offline/online
 */
export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connection restored');
      setWasOffline(isOffline); // שמירת המצב הקודם
      setIsOffline(false);
    };

    const handleOffline = () => {
      console.log('📡 Connection lost');
      setIsOffline(true);
    };

    // האזנה לאירועי חיבור
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // ניקוי
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline]);

  return {
    isOffline,
    isOnline: !isOffline,
    wasOffline, // האם היה offline לפני שחזר online
    connectionStatus: isOffline ? 'offline' : 'online'
  };
};

export default useOffline;
