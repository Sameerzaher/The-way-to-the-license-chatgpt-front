import { useCallback } from 'react';
import { useProgress } from '../contexts/ProgressContext';

// Hook לעדכון התקדמות בזמן אמת
export const useProgressUpdater = () => {
  const { updateProgress } = useProgress();

  // פונקציה לעדכון התקדמות כשעונים על שאלה
  const handleQuestionAnswered = useCallback(async (questionData) => {
    const { questionId, isCorrect, category, responseTime, attempts } = questionData;
    
    console.log('📝 Question answered:', questionData);
    
    try {
      // עדכון מיידי ב-Context (אנימציה מיידית)
      updateProgress(category, {
        questionId,
        isCorrect,
        responseTime,
        attempts
      });
      
      // עדכון בשרת (ברקע)
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          isCorrect,
          category,
          responseTime,
          attempts,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        console.warn('⚠️ Failed to sync progress with server');
      } else {
        console.log('✅ Progress synced with server');
      }
      
    } catch (error) {
      console.error('❌ Error updating progress:', error);
    }
  }, [updateProgress]);

  // פונקציה לעדכון התקדמות בתרגול
  const handlePracticeCompleted = useCallback(async (practiceData) => {
    const { practiceId, correctAnswers, totalQuestions, categories } = practiceData;
    
    console.log('🎯 Practice completed:', practiceData);
    
    try {
      // עדכון עבור כל קטגוריה שהייתה בתרגול
      for (const category of categories) {
        const categoryCorrect = correctAnswers.filter(q => q.category === category).length;
        
        for (let i = 0; i < categoryCorrect; i++) {
          updateProgress(category, {
            questionId: `practice_${practiceId}_${category}_${i}`,
            isCorrect: true,
            responseTime: 0,
            attempts: 1
          });
          
          // השהיה קטנה בין עדכונים לאנימציה יפה
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
    } catch (error) {
      console.error('❌ Error updating practice progress:', error);
    }
  }, [updateProgress]);

  // פונקציה לעדכון התקדמות ממקורות חיצוניים
  const handleExternalUpdate = useCallback((updateData) => {
    const { category, increment = 1, questionData } = updateData;
    
    for (let i = 0; i < increment; i++) {
      updateProgress(category, questionData || {
        questionId: `external_${Date.now()}_${i}`,
        isCorrect: true,
        responseTime: 0,
        attempts: 1
      });
    }
  }, [updateProgress]);

  return {
    handleQuestionAnswered,
    handlePracticeCompleted,
    handleExternalUpdate
  };
};

export default useProgressUpdater;
