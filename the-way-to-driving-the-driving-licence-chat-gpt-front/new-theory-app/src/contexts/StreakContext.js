import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const StreakContext = createContext();

// פונקציה לקבלת תאריך היום (ללא שעה)
const getTodayDate = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

// פונקציה להמרת תאריך ל-string
const dateToString = (date) => {
  return date.toISOString().split('T')[0];
};

// פונקציה לקבלת ימים ברצף
const calculateStreak = (activityDates) => {
  if (!activityDates || activityDates.length === 0) return 0;
  
  const sortedDates = [...activityDates].sort((a, b) => new Date(b) - new Date(a));
  const today = dateToString(getTodayDate());
  const yesterday = dateToString(new Date(getTodayDate().getTime() - 86400000));
  
  // בדיקה אם למד היום או אתמול
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }
  
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const previousDate = new Date(sortedDates[i - 1]);
    const diffDays = Math.floor((previousDate - currentDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const StreakProvider = ({ children }) => {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    activityDates: [],
    lastActivityDate: null,
    todayActivity: {
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
      goal: 10,
      completed: false
    },
    weekActivity: Array(7).fill(0),
    achievements: []
  });
  
  console.log('🔥 StreakProvider initialized with:', streakData);

  const [notifications, setNotifications] = useState([]);

  // טעינת נתונים מ-localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('streakData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setStreakData({
          ...parsed,
          activityDates: parsed.activityDates || [],
          achievements: parsed.achievements || []
        });
      } catch (error) {
        console.error('Error loading streak data:', error);
      }
    }
  }, []);

  // שמירת נתונים ל-localStorage
  useEffect(() => {
    localStorage.setItem('streakData', JSON.stringify(streakData));
  }, [streakData]);

  // בדיקת רצף כשמטעינים
  useEffect(() => {
    if (streakData.activityDates.length > 0) {
      const currentStreak = calculateStreak(streakData.activityDates);
      if (currentStreak !== streakData.currentStreak) {
        setStreakData(prev => ({
          ...prev,
          currentStreak
        }));
      }
    }
  }, [streakData.activityDates, streakData.currentStreak]);

  // פונקציה להוספת התראה
  const addNotification = useCallback((icon, title, message) => {
    const notification = {
      id: Date.now(),
      icon,
      title,
      message,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [notification, ...prev].slice(0, 50));
    
    // התראת דפדפן
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/logo192.png'
      });
    }
    
    return notification;
  }, []);

  // הוספת הישג
  const checkAndAddAchievement = useCallback((type, value) => {
    setStreakData(prev => {
      const achievements = [...prev.achievements];
      const achievementKey = `${type}_${value}`;
      
      if (!achievements.includes(achievementKey)) {
        achievements.push(achievementKey);
      }
      
      return { ...prev, achievements };
    });
  }, []);

  // בדיקת הישגי רצף
  const checkStreakAchievements = useCallback((newStreak, oldStreak) => {
    const milestones = [3, 7, 14, 30, 50, 100];
    
    for (const milestone of milestones) {
      if (newStreak >= milestone && oldStreak < milestone) {
        addNotification('🔥', `רצף של ${milestone} ימים!`, `מדהים! למדת ${milestone} ימים ברצף!`);
        checkAndAddAchievement('streak', newStreak);
      }
    }
  }, [addNotification, checkAndAddAchievement]);

  // פונקציה לרישום פעילות
  const recordActivity = useCallback((type, data = {}) => {
    console.log('🔥 recordActivity called:', { type, data });
    console.log('🔥 Current streakData before update:', streakData);
    const today = dateToString(getTodayDate());
    
    setStreakData(prev => {
      const activityDates = [...prev.activityDates];
      
      // הוספת היום אם לא קיים
      if (!activityDates.includes(today)) {
        activityDates.push(today);
      }
      
      const currentStreak = calculateStreak(activityDates);
      const longestStreak = Math.max(prev.longestStreak, currentStreak);
      
      // עדכון פעילות יומית
      const todayActivity = { ...prev.todayActivity };
      
      if (type === 'question') {
        todayActivity.questionsAnswered++;
        if (data.correct) {
          todayActivity.correctAnswers++;
        }
        
        // בדיקת השלמת יעד
        if (todayActivity.questionsAnswered >= todayActivity.goal && !todayActivity.completed) {
          todayActivity.completed = true;
          addNotification('🎯', 'כל הכבוד!', `השלמת את יעד היום של ${todayActivity.goal} שאלות!`);
          
          // הוספת הישג
          checkAndAddAchievement('daily_goal', currentStreak);
        }
      }
      
      if (type === 'time') {
        todayActivity.timeSpent += data.minutes || 1;
      }
      
      // בדיקת הישגי רצף
      checkStreakAchievements(currentStreak, prev.currentStreak);
      
      const newData = {
        ...prev,
        currentStreak,
        longestStreak,
        totalDays: activityDates.length,
        activityDates,
        lastActivityDate: today,
        todayActivity
      };
      
      console.log('🔥 StreakData updated:', {
        currentStreak,
        questionsToday: todayActivity.questionsAnswered,
        correctToday: todayActivity.correctAnswers,
        newData
      });
      
      return newData;
    });
  }, [addNotification, checkAndAddAchievement, checkStreakAchievements]);

  // קבלת סטטיסטיקות שבועיות
  const getWeekActivity = useCallback(() => {
    const today = getTodayDate();
    const weekActivity = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 86400000);
      const dateStr = dateToString(date);
      const hasActivity = streakData.activityDates.includes(dateStr);
      weekActivity.push(hasActivity ? 1 : 0);
    }
    
    return weekActivity;
  }, [streakData.activityDates]);

  // קבלת סטטיסטיקות חודשיות
  const getMonthActivity = useCallback(() => {
    const today = getTodayDate();
    const monthActivity = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 86400000);
      const dateStr = dateToString(date);
      const hasActivity = streakData.activityDates.includes(dateStr);
      monthActivity.push({
        date: dateStr,
        active: hasActivity
      });
    }
    
    return monthActivity;
  }, [streakData.activityDates]);

  // איפוס יעד יומי בחצות
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const timeUntilMidnight = midnight - now;
      
      setTimeout(() => {
        setStreakData(prev => ({
          ...prev,
          todayActivity: {
            questionsAnswered: 0,
            correctAnswers: 0,
            timeSpent: 0,
            goal: 10,
            completed: false
          }
        }));
        
        checkMidnight();
      }, timeUntilMidnight);
    };
    
    checkMidnight();
  }, []);

  // בקשת הרשאת התראות
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // קביעת יעד יומי חדש
  const setDailyGoal = useCallback((goal) => {
    setStreakData(prev => ({
      ...prev,
      todayActivity: {
        ...prev.todayActivity,
        goal
      }
    }));
  }, []);

  // קבלת התראות
  const getNotifications = useCallback(() => {
    return notifications;
  }, [notifications]);

  // סימון התראה כנקראה
  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // ניקוי כל ההתראות
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    streakData,
    recordActivity,
    addNotification,
    getWeekActivity,
    getMonthActivity,
    setDailyGoal,
    getNotifications,
    markNotificationAsRead,
    clearAllNotifications
  };
  
  console.log('🔥 StreakProvider value:', value);

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export default StreakContext;

