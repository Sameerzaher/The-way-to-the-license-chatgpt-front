import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ size = 'medium', showLabel = true, showAutoMode = true }) => {
  const { theme, autoMode, toggleTheme, toggleAutoMode, getThemeInfo } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const themeInfo = getThemeInfo();

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    
    // סיום אנימציה
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleAutoToggle = () => {
    toggleAutoMode();
    setShowMenu(false);
  };

  const getThemeIcon = () => {
    if (autoMode) {
      return '🕐'; // אייקון אוטומטי
    }
    return theme === 'dark' ? '🌙' : '☀️';
  };

  const getThemeLabel = () => {
    if (autoMode) {
      return `אוטומטי (${themeInfo.nextChange})`;
    }
    return theme === 'dark' ? 'מצב לילה' : 'מצב יום';
  };

  const sizeClasses = {
    small: 'theme-toggle-small',
    medium: 'theme-toggle-medium',
    large: 'theme-toggle-large'
  };

  return (
    <div className={`theme-toggle-container ${sizeClasses[size]}`}>
      {/* כפתור Toggle ראשי */}
      <button
        className={`theme-toggle ${isAnimating ? 'animating' : ''}`}
        onClick={handleToggle}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
        title={getThemeLabel()}
        aria-label={`החלף למצב ${theme === 'dark' ? 'יום' : 'לילה'}`}
      >
        <span className="theme-icon">
          {getThemeIcon()}
        </span>
        
        {showLabel && (
          <span className="theme-label">
            {theme === 'dark' ? 'לילה' : 'יום'}
          </span>
        )}
      </button>

      {/* תפריט אפשרויות */}
      {showAutoMode && (
        <div 
          className={`theme-menu ${showMenu ? 'show' : ''}`}
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          <div className="theme-menu-header">
            <span className="theme-menu-title">הגדרות תצוגה</span>
          </div>
          
          <div className="theme-options">
            <button
              className={`theme-option ${theme === 'light' && !autoMode ? 'active' : ''}`}
              onClick={() => {
                if (theme !== 'light') {
                  handleToggle();
                }
                setShowMenu(false);
              }}
            >
              <span className="option-icon">☀️</span>
              <span className="option-label">מצב יום</span>
            </button>
            
            <button
              className={`theme-option ${theme === 'dark' && !autoMode ? 'active' : ''}`}
              onClick={() => {
                if (theme !== 'dark') {
                  handleToggle();
                }
                setShowMenu(false);
              }}
            >
              <span className="option-icon">🌙</span>
              <span className="option-label">מצב לילה</span>
            </button>
            
            <button
              className={`theme-option ${autoMode ? 'active' : ''}`}
              onClick={handleAutoToggle}
            >
              <span className="option-icon">🕐</span>
              <span className="option-label">אוטומטי</span>
              <span className="option-time">{themeInfo.nextChange}</span>
            </button>
          </div>
          
          <div className="theme-info">
            <div className="theme-info-item">
              <span className="info-label">שעה נוכחית:</span>
              <span className="info-value">{String(themeInfo.currentHour).padStart(2, '0')}:00</span>
            </div>
            
            {autoMode && (
              <div className="theme-info-item">
                <span className="info-label">שינוי הבא:</span>
                <span className="info-value">{themeInfo.nextChange}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* אינדיקטור מצב אוטומטי */}
      {autoMode && (
        <div className="auto-indicator" title="מצב אוטומטי פעיל">
          <span className="auto-icon">🔄</span>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
