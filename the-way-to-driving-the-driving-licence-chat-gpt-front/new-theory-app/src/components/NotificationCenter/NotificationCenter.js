import React, { useState, useEffect } from 'react';
import { useStreak } from '../../contexts/StreakContext';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const { getNotifications, markNotificationAsRead, clearAllNotifications } = useStreak();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(getNotifications());
    };
    
    updateNotifications();
    const interval = setInterval(updateNotifications, 1000);
    
    return () => clearInterval(interval);
  }, [getNotifications]);

  const handleNotificationClick = (id) => {
    markNotificationAsRead(id);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'עכשיו';
    if (diffMins < 60) return `לפני ${diffMins} דקות`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `לפני ${diffDays} ימים`;
  };

  return (
    <div className="notification-center">
      {/* כפתור התראות */}
      <button 
        className={`notification-button ${notifications.length > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="התראות"
      >
        <span className="notification-icon">🔔</span>
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {/* חלון התראות */}
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>התראות</h3>
            {notifications.length > 0 && (
              <button 
                className="clear-all-button"
                onClick={clearAllNotifications}
              >
                נקה הכל
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="empty-icon">🔕</span>
                <p>אין התראות חדשות</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="notification-item"
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="notification-icon-large">
                    {notification.icon}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTime(notification.timestamp)}
                    </div>
                  </div>
                  <button 
                    className="notification-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* רקע כהה */}
      {isOpen && (
        <div 
          className="notification-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;

