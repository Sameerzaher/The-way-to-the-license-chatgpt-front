import React, { useState, useEffect, useMemo } from 'react';
import './NotificationSystem.css';

const NotificationSystem = ({ user, lang = 'he' }) => {
  const [notifications, setNotifications] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [testNotification, setTestNotification] = useState(null);

  const labels = {
    he: {
      title: 'מערכת התראות וזיכרונות',
      subtitle: 'התראות חכמות לשמירה על רצף הלמידה',
      currentNotification: 'התראה נוכחית',
      settings: 'הגדרות',
      testNotification: 'בדיקת התראה',
      history: 'היסטוריית התראות',
      enabled: 'התראות מופעלות',
      disabled: 'התראות מושבתות',
      frequency: 'תדירות',
      time: 'שעה',
      types: 'סוגי התראות',
      dailyReminder: 'תזכורות יומיות',
      goalProgress: 'התקדמות מטרות',
      streakEncouragement: 'עידוד רצף',
      generalEncouragement: 'עידוד כללי',
      save: 'שמור',
      cancel: 'ביטול',
      sendTest: 'שלח התראה לבדיקה',
      close: 'סגור',
      noNotifications: 'אין התראות זמינות',
      loading: 'טוען התראות...',
      error: 'שגיאה בטעינת התראות'
    },
    ar: {
      title: 'نظام الإشعارات والتذكيرات',
      subtitle: 'إشعارات ذكية للحفاظ على استمرارية التعلم',
      currentNotification: 'الإشعار الحالي',
      settings: 'الإعدادات',
      testNotification: 'اختبار الإشعار',
      history: 'تاريخ الإشعارات',
      enabled: 'الإشعارات مفعلة',
      disabled: 'الإشعارات معطلة',
      frequency: 'التكرار',
      time: 'الوقت',
      types: 'أنواع الإشعارات',
      dailyReminder: 'تذكيرات يومية',
      goalProgress: 'تقدم الأهداف',
      streakEncouragement: 'تشجيع الاستمرارية',
      generalEncouragement: 'تشجيع عام',
      save: 'حفظ',
      cancel: 'إلغاء',
      sendTest: 'إرسال إشعار للاختبار',
      close: 'إغلاق',
      noNotifications: 'لا توجد إشعارات متاحة',
      loading: 'جاري تحميل الإشعارات...',
      error: 'خطأ في تحميل الإشعارات'
    }
  };

  const currentLabels = useMemo(() => labels[lang] || labels.he, [lang]);

  // ביטול קריאות API אוטומטיות
  useEffect(() => {
    if (user && user.id) {
      // נתונים סטטיים במקום קריאות שרת
      setNotifications({
        current: {
          message: 'זמן ללמוד! המשך את המסע שלך לקראת הרישיון',
          type: 'dailyReminder',
          createdAt: new Date().toISOString()
        },
        history: []
      });
      
      setSettings({
        enabled: true,
        frequency: 'daily',
        time: { hour: 19, minute: 0 },
        types: {
          dailyReminder: true,
          goalProgress: true,
          streakEncouragement: true,
          generalEncouragement: false
        }
      });
      
      setIsLoading(false);
    }
  }, [user?.id]); // רק כש-user.id משתנה

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/notifications/${user.id}?lang=${lang}`);
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Error fetching notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/notifications/${user.id}/settings`);
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const sendTestNotification = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/notifications/${user.id}/test?lang=${lang}`);
      
      if (response.ok) {
        const data = await response.json();
        setTestNotification(data);
      }
    } catch (err) {
      console.error('Error sending test notification:', err);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/notifications/${user.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setShowSettings(false);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTypeChange = (type, enabled) => {
    setSettings(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: enabled
      }
    }));
  };


  if (isLoading) {
    return (
      <div className="notification-system">
        <div className="notification-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{currentLabels.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-system">
        <div className="notification-container">
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>{currentLabels.error}</p>
            <button onClick={fetchNotifications} className="retry-button">
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-system">
      <div className="notification-container">
        <div className="notification-header">
          <h1 className="notification-title">{currentLabels.title}</h1>
          <p className="notification-subtitle">{currentLabels.subtitle}</p>
        </div>

        {/* Current Notification */}
        {notifications && (
          <div className="current-notification">
            <h2 className="section-title">{currentLabels.currentNotification}</h2>
            <div className="notification-card">
              <div className="notification-message">
                {notifications.message}
              </div>
              <div className="notification-stats">
                <div className="stat-item">
                  <span className="stat-label">היום:</span>
                  <span className="stat-value">{notifications.stats.todayCompleted}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">מטרה יומית:</span>
                  <span className="stat-value">{notifications.stats.dailyGoal}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">רצף:</span>
                  <span className="stat-value">{notifications.stats.streak} ימים</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Notification */}
        <div className="test-notification">
          <h2 className="section-title">{currentLabels.testNotification}</h2>
          <button onClick={sendTestNotification} className="test-button">
            {currentLabels.sendTest}
          </button>
          
          {testNotification && (
            <div className="test-notification-card">
              <div className="test-message">
                {testNotification.message}
              </div>
              <button 
                onClick={() => setTestNotification(null)} 
                className="close-button"
              >
                {currentLabels.close}
              </button>
            </div>
          )}
          </div>
        )}

        {/* Settings */}
        <div className="notification-settings">
          <div className="settings-header">
            <h2 className="section-title">{currentLabels.settings}</h2>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="settings-toggle"
            >
              {showSettings ? currentLabels.cancel : currentLabels.settings}
            </button>
          </div>

          {showSettings && settings && (
            <div className="settings-panel">
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
                  />
                  {settings.enabled ? currentLabels.enabled : currentLabels.disabled}
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">{currentLabels.frequency}</label>
                <select
                  value={settings.frequency}
                  onChange={(e) => handleSettingsChange('frequency', e.target.value)}
                  className="setting-select"
                >
                  <option value="daily">יומי</option>
                  <option value="weekly">שבועי</option>
                  <option value="monthly">חודשי</option>
                </select>
              </div>

              <div className="setting-group">
                <label className="setting-label">{currentLabels.time}</label>
                <input
                  type="time"
                  value={`${settings.time.hour.toString().padStart(2, '0')}:${settings.time.minute.toString().padStart(2, '0')}`}
                  onChange={(e) => {
                    const [hour, minute] = e.target.value.split(':');
                    handleSettingsChange('time', { hour: parseInt(hour), minute: parseInt(minute) });
                  }}
                  className="setting-input"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">{currentLabels.types}</label>
                <div className="type-settings">
                  <label className="type-label">
                    <input
                      type="checkbox"
                      checked={settings.types.dailyReminder}
                      onChange={(e) => handleTypeChange('dailyReminder', e.target.checked)}
                    />
                    {currentLabels.dailyReminder}
                  </label>
                  <label className="type-label">
                    <input
                      type="checkbox"
                      checked={settings.types.goalProgress}
                      onChange={(e) => handleTypeChange('goalProgress', e.target.checked)}
                    />
                    {currentLabels.goalProgress}
                  </label>
                  <label className="type-label">
                    <input
                      type="checkbox"
                      checked={settings.types.streakEncouragement}
                      onChange={(e) => handleTypeChange('streakEncouragement', e.target.checked)}
                    />
                    {currentLabels.streakEncouragement}
                  </label>
                  <label className="type-label">
                    <input
                      type="checkbox"
                      checked={settings.types.generalEncouragement}
                      onChange={(e) => handleTypeChange('generalEncouragement', e.target.checked)}
                    />
                    {currentLabels.generalEncouragement}
                  </label>
                </div>
              </div>

              <div className="settings-actions">
                <button 
                  onClick={() => updateSettings(settings)}
                  className="save-button"
                >
                  {currentLabels.save}
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="cancel-button"
                >
                  {currentLabels.cancel}
                </button>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;
