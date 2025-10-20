import React, { useState, useEffect } from 'react';
import { getConnectionStatus, listenForConnectionChanges, syncOfflineActions } from '../../utils/pwaUtils';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState(getConnectionStatus());
  const [showStatus, setShowStatus] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    // Listen for connection changes
    const cleanup = listenForConnectionChanges(async (status) => {
      setConnectionStatus(prev => ({ ...prev, ...status }));
      setShowStatus(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowStatus(false);
      }, 5000);

      // If back online, try to sync offline actions
      if (status.online) {
        setSyncStatus('syncing');
        try {
          const result = await syncOfflineActions();
          if (result.success && result.synced > 0) {
            setSyncStatus(`synced-${result.synced}`);
            setTimeout(() => setSyncStatus(null), 3000);
          } else {
            setSyncStatus(null);
          }
        } catch (error) {
          console.error('Sync failed:', error);
          setSyncStatus('error');
          setTimeout(() => setSyncStatus(null), 3000);
        }
      }
    });

    // Show initial status if offline
    if (!connectionStatus.online) {
      setShowStatus(true);
    }

    return cleanup;
  }, [connectionStatus.online]);

  const getStatusText = () => {
    if (syncStatus === 'syncing') {
      return 'מסנכרן נתונים...';
    }
    
    if (syncStatus && syncStatus.startsWith('synced-')) {
      const count = syncStatus.split('-')[1];
      return `סונכרנו ${count} פעולות`;
    }
    
    if (syncStatus === 'error') {
      return 'שגיאה בסנכרון';
    }

    if (connectionStatus.online) {
      return 'מחובר לאינטרנט';
    } else {
      return 'מצב אופליין - נתונים שמורים זמינים';
    }
  };

  const getStatusIcon = () => {
    if (syncStatus === 'syncing') {
      return '🔄';
    }
    
    if (syncStatus && syncStatus.startsWith('synced-')) {
      return '✅';
    }
    
    if (syncStatus === 'error') {
      return '⚠️';
    }

    if (connectionStatus.online) {
      return '🟢';
    } else {
      return '📡';
    }
  };

  const getConnectionQuality = () => {
    if (!connectionStatus.online) return null;
    
    const connection = connectionStatus.connection;
    if (!connection) return null;

    const effectiveType = connection.effectiveType;
    switch (effectiveType) {
      case 'slow-2g':
        return { quality: 'איטי', color: '#e74c3c' };
      case '2g':
        return { quality: 'בסיסי', color: '#f39c12' };
      case '3g':
        return { quality: 'טוב', color: '#f1c40f' };
      case '4g':
        return { quality: 'מהיר', color: '#2ecc71' };
      default:
        return { quality: 'מהיר', color: '#2ecc71' };
    }
  };

  if (!showStatus && !syncStatus) {
    return null;
  }

  const connectionQuality = getConnectionQuality();

  return (
    <div className={`connection-status ${connectionStatus.online ? 'online' : 'offline'} ${syncStatus ? 'syncing' : ''}`}>
      <div className="connection-status-content">
        <span className="connection-icon">{getStatusIcon()}</span>
        <div className="connection-text">
          <div className="connection-main-text">{getStatusText()}</div>
          {connectionQuality && (
            <div 
              className="connection-quality"
              style={{ color: connectionQuality.color }}
            >
              איכות חיבור: {connectionQuality.quality}
            </div>
          )}
        </div>
        {showStatus && !syncStatus && (
          <button
            className="connection-close"
            onClick={() => setShowStatus(false)}
          >
            ✕
          </button>
        )}
      </div>
      
      {syncStatus === 'syncing' && (
        <div className="sync-progress">
          <div className="sync-progress-bar"></div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
