import { useEffect, useCallback } from 'react';
import { useStreak } from '../contexts/StreakContext';

/**
 * Hook לעדכון אוטומטי של רצף למידה
 * משתמש ב-context כדי לעדכן רצף כשמשתמש עונה על שאלות
 */
export const useStreakTracker = () => {
  const { recordActivity } = useStreak();

  // פונקציה לעדכון רצף אחרי תשובה לשאלה
  const trackQuestion = useCallback((isCorrect) => {
    console.log('🔥 useStreakTracker trackQuestion called with:', isCorrect);
    recordActivity('question', { correct: isCorrect });
  }, [recordActivity]);

  // פונקציה לעדכון זמן למידה
  const trackTime = useCallback((minutes) => {
    recordActivity('time', { minutes });
  }, [recordActivity]);

  // פונקציה לעדכון רצף כללי (למידה היום)
  const trackActivity = useCallback(() => {
    recordActivity('general');
  }, [recordActivity]);

  return {
    trackQuestion,
    trackTime,
    trackActivity
  };
};

export default useStreakTracker;

