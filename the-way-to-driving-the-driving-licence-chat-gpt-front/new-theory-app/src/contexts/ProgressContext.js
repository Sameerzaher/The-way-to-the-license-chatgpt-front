import React, { createContext, useContext, useState, useCallback } from 'react';

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const [theoryProgress, setTheoryProgress] = useState(0);
  const [theorySubProgress, setTheorySubProgress] = useState({});
  const [recentUpdates, setRecentUpdates] = useState([]);

  // פונקציה לעדכון התקדמות בזמן אמת
  const updateProgress = useCallback((category, questionData) => {
    console.log('🔄 Real-time progress update:', { category, questionData });
    
    setTheorySubProgress(prev => {
      const currentCategory = prev[category] || { completed: 0, total: 0, percent: 0 };
      const newCompleted = currentCategory.completed + 1;
      const newPercent = currentCategory.total > 0 ? Math.round((newCompleted / currentCategory.total) * 100) : 0;
      
      const updatedCategory = {
        ...currentCategory,
        completed: newCompleted,
        percent: newPercent
      };
      
      // חישוב התקדמות כללית חדשה
      const allCategories = { ...prev, [category]: updatedCategory };
      const totalCompleted = Object.values(allCategories).reduce((sum, cat) => sum + (cat.completed || 0), 0);
      const totalQuestions = Object.values(allCategories).reduce((sum, cat) => sum + (cat.total || 0), 0);
      const overallProgress = totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;
      
      // עדכון התקדמות כללית
      setTimeout(() => setTheoryProgress(overallProgress), 100);
      
      return allCategories;
    });
    
    // הוספת עדכון לרשימת העדכונים האחרונים
    const updateInfo = {
      id: Date.now(),
      category,
      timestamp: new Date(),
      isCorrect: questionData.isCorrect,
      questionId: questionData.questionId
    };
    
    setRecentUpdates(prev => [updateInfo, ...prev.slice(0, 4)]); // שמירת 5 עדכונים אחרונים
    
    // הסרת העדכון אחרי 3 שניות
    setTimeout(() => {
      setRecentUpdates(prev => prev.filter(update => update.id !== updateInfo.id));
    }, 3000);
    
  }, []);

  // פונקציה לאתחול נתוני התקדמות
  const initializeProgress = useCallback((progressData) => {
    console.log('🏁 Initializing progress data:', progressData);
    setTheorySubProgress(progressData.theorySubProgress || {});
    setTheoryProgress(progressData.theoryProgress || 0);
  }, []);

  // פונקציה לעדכון התקדמות מהשרת
  const syncWithServer = useCallback(async (userId, lang) => {
    try {
      console.log('🔄 Syncing progress with server...');
      // כאן נוסיף קריאה לשרת לעדכון הנתונים
      // const response = await fetch(`/api/progress/sync/${userId}?lang=${lang}`);
      // const data = await response.json();
      // initializeProgress(data);
    } catch (error) {
      console.error('❌ Error syncing with server:', error);
    }
  }, [initializeProgress]);

  const value = {
    // State
    theoryProgress,
    theorySubProgress,
    recentUpdates,
    
    // Actions
    updateProgress,
    initializeProgress,
    syncWithServer,
    
    // Setters (for direct updates if needed)
    setTheoryProgress,
    setTheorySubProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressContext;
