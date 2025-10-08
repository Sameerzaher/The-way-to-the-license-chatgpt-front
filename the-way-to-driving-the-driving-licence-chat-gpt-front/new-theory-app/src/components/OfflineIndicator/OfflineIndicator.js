import React, { useState, useEffect } from 'react';
import { useOffline } from '../../hooks/useOffline';
import './OfflineIndicator.css';

const OfflineIndicator = () => {
  const { isOffline, isOnline, wasOffline } = useOffline();
  const [showReconnected, setShowReconnected] = useState(false);

  // הצגת הודעת חיבור מחדש
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // אם אנחנו online ולא צריך להציג הודעת חיבור מחדש
  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div className={`offline-indicator ${isOffline ? 'offline' : 'reconnected'}`}>
      <div className="offline-content">
        {isOffline ? (
          <>
            <div className="offline-icon">📡</div>
            <div className="offline-text">
              <div className="offline-title">אין חיבור לאינטרנט</div>
              <div className="offline-subtitle">
                חלק מהתכונות עלולות להיות מוגבלות
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="online-icon">✅</div>
            <div className="online-text">
              <div className="online-title">החיבור חודש!</div>
              <div className="online-subtitle">
                כל התכונות זמינות שוב
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
