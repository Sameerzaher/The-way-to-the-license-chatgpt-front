import React, { createContext, useContext, useState, useEffect } from 'react';

// יצירת ה-Context
const ThemeContext = createContext();

// פונקציה לקבלת העדפות משתמש
const getInitialTheme = () => {
  // בדיקה אם יש העדפה שמורה
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }

  // בדיקה אם המשתמש מעדיף מצב לילה במערכת
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  // ברירת מחדל - מצב יום
  return 'light';
};

// פונקציה לקבלת זמן נוכחי
const getCurrentTime = () => {
  const now = new Date();
  return now.getHours();
};

// פונקציה לקביעת מצב לילה אוטומטי
const getAutoTheme = () => {
  const currentHour = getCurrentTime();
  // מצב לילה בין 19:00 ל-07:00
  return currentHour >= 19 || currentHour < 7 ? 'dark' : 'light';
};

// Provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const [autoMode, setAutoMode] = useState(localStorage.getItem('autoTheme') === 'true');

  // עדכון מצב לילה אוטומטי
  useEffect(() => {
    if (autoMode) {
      const autoTheme = getAutoTheme();
      setTheme(autoTheme);
    }
  }, [autoMode]);

  // בדיקה כל שעה למצב אוטומטי
  useEffect(() => {
    if (!autoMode) return;

    const checkTime = () => {
      const autoTheme = getAutoTheme();
      setTheme(autoTheme);
    };

    // בדיקה ראשונית
    checkTime();

    // בדיקה כל שעה
    const interval = setInterval(checkTime, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoMode]);

  // עדכון HTML attribute כשהמצב משתנה
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // פונקציה להחלפת מצב
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setAutoMode(false); // ביטול מצב אוטומטי כשמשתמש משנה ידנית
  };

  // פונקציה להפעלת מצב אוטומטי
  const toggleAutoMode = () => {
    const newAutoMode = !autoMode;
    setAutoMode(newAutoMode);
    localStorage.setItem('autoTheme', newAutoMode.toString());
    
    if (newAutoMode) {
      const autoTheme = getAutoTheme();
      setTheme(autoTheme);
    }
  };

  // פונקציה לקביעת מצב ספציפי
  const setSpecificTheme = (newTheme) => {
    setTheme(newTheme);
    setAutoMode(false);
  };

  // פונקציה לקבלת מידע על המצב הנוכחי
  const getThemeInfo = () => {
    const currentHour = getCurrentTime();
    const isNightTime = currentHour >= 19 || currentHour < 7;
    
    return {
      currentTheme: theme,
      autoMode,
      isNightTime,
      currentHour,
      nextChange: autoMode ? (isNightTime ? '07:00' : '19:00') : null
    };
  };

  const value = {
    theme,
    autoMode,
    toggleTheme,
    toggleAutoMode,
    setSpecificTheme,
    getThemeInfo,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook לשימוש ב-Context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
