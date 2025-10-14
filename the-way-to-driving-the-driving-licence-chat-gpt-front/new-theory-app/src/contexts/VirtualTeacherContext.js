import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const VirtualTeacherContext = createContext();

export const VirtualTeacherProvider = ({ children }) => {
  // לא משתמשים ב-useProgress ו-useStreak כאן כי הם לא זמינים בשלב זה
  // במקום זאת, נקבל את הנתונים ישירות מ-localStorage או דרך props
  
  const [teacherState, setTeacherState] = useState({
    personality: 'encouraging', // encouraging, strict, friendly, professional
    currentAdvice: null,
    learningPlan: null,
    insights: [],
    conversationHistory: []
  });

  const [teacherStats, setTeacherStats] = useState({
    totalInteractions: 0,
    adviceGiven: 0,
    plansCreated: 0,
    userSatisfaction: 0
  });

  // טעינת נתונים מ-localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('virtualTeacherState');
    const savedStats = localStorage.getItem('virtualTeacherStats');
    
    if (savedState) {
      try {
        setTeacherState(JSON.parse(savedState));
      } catch (error) {
        console.error('Error loading teacher state:', error);
      }
    }
    
    if (savedStats) {
      try {
        setTeacherStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Error loading teacher stats:', error);
      }
    }
  }, []);

  // שמירת נתונים ל-localStorage
  useEffect(() => {
    localStorage.setItem('virtualTeacherState', JSON.stringify(teacherState));
  }, [teacherState]);

  useEffect(() => {
    localStorage.setItem('virtualTeacherStats', JSON.stringify(teacherStats));
  }, [teacherStats]);

  // ניתוח מצב המשתמש
  const analyzeUserStatus = useCallback(() => {
    const analysis = {
      overallProgress: 0,
      weakAreas: [],
      strongAreas: [],
      recommendedFocus: [],
      motivationLevel: 'medium'
    };

    // קריאת נתונים מ-localStorage
    try {
      const savedProgress = localStorage.getItem('theoryProgress');
      const savedStreak = localStorage.getItem('streakData');
      
      // חישוב התקדמות כללית
      if (savedProgress) {
        const theoryProgress = JSON.parse(savedProgress);
        const categories = Object.keys(theoryProgress);
        let totalProgress = 0;
        
        categories.forEach(cat => {
          const progress = theoryProgress[cat];
          if (progress && progress.total > 0) {
            const percentage = (progress.solved / progress.total) * 100;
            totalProgress += percentage;
            
            if (percentage < 50) {
              analysis.weakAreas.push({ category: cat, percentage });
            } else if (percentage > 80) {
              analysis.strongAreas.push({ category: cat, percentage });
            }
          }
        });
        
        analysis.overallProgress = categories.length > 0 ? totalProgress / categories.length : 0;
      }

      // ניתוח רצף למידה
      if (savedStreak) {
        const streakData = JSON.parse(savedStreak);
        if (streakData.currentStreak >= 7) {
          analysis.motivationLevel = 'high';
        } else if (streakData.currentStreak <= 2) {
          analysis.motivationLevel = 'low';
        }
      }

      // המלצות ממוקדות
      if (analysis.weakAreas.length > 0) {
        analysis.recommendedFocus = analysis.weakAreas
          .sort((a, b) => a.percentage - b.percentage)
          .slice(0, 3)
          .map(area => area.category);
      }
    } catch (error) {
      console.error('Error analyzing user status:', error);
    }

    return analysis;
  }, []);

  // יצירת עצה אישית
  const generatePersonalAdvice = useCallback((analysis) => {
    const advice = {
      type: 'general',
      message: '',
      actionItems: [],
      priority: 'medium',
      timestamp: new Date().toISOString()
    };

    // עצה לפי התקדמות
    if (analysis.overallProgress < 30) {
      advice.type = 'beginner';
      advice.message = 'אתה בתחילת הדרך! בואו נתחיל בנושאים הבסיסיים ונבנה בסיס איתן.';
      advice.actionItems = [
        'התחל עם 5 שאלות ביום',
        'התמקד בנושא אחד בכל פעם',
        'חזור על שאלות שגויות'
      ];
      advice.priority = 'high';
    } else if (analysis.overallProgress >= 30 && analysis.overallProgress < 70) {
      advice.type = 'intermediate';
      advice.message = 'התקדמת יפה! עכשיו זה הזמן להתמקד בנושאים שצריכים שיפור.';
      advice.actionItems = [
        `התמקד ב${analysis.recommendedFocus[0] || 'נושאים חלשים'}`,
        'נסה לפתור 10 שאלות ביום',
        'עשה בחינה מדומה פעם בשבוע'
      ];
      advice.priority = 'medium';
    } else {
      advice.type = 'advanced';
      advice.message = 'מצוין! אתה כמעט מוכן לבחינה. בואו נשכלל את הידע.';
      advice.actionItems = [
        'עשה בחינות מדומות מלאות',
        'חזור על נושאים שגויים',
        'תרגל בזמן מוגבל'
      ];
      advice.priority = 'low';
    }

    // עצה לפי רצף
    if (analysis.motivationLevel === 'low') {
      advice.message += '\n\n💡 שים לב: הרצף שלך נמוך. נסה לפתור לפחות שאלה אחת ביום!';
    } else if (analysis.motivationLevel === 'high') {
      advice.message += '\n\n🔥 מדהים! הרצף שלך מעולה! המשך כך!';
    }

    return advice;
  }, []);

  // יצירת תוכנית למידה
  const createLearningPlan = useCallback((analysis) => {
    const plan = {
      duration: '30 ימים',
      dailyGoals: [],
      weeklyGoals: [],
      milestones: [],
      createdAt: new Date().toISOString()
    };

    // יעדים יומיים
    if (analysis.overallProgress < 50) {
      plan.dailyGoals = [
        'פתור 5 שאלות לפחות',
        'חזור על שאלה אחת שגויה',
        'למד נושא חדש למשך 15 דקות'
      ];
    } else {
      plan.dailyGoals = [
        'פתור 10 שאלות לפחות',
        'עשה בחינה מדומה קצרה',
        'חזור על כל השאלות השגויות'
      ];
    }

    // יעדים שבועיים
    plan.weeklyGoals = [
      'השלם 50 שאלות',
      'עשה בחינה מדומה אחת',
      'שפר ב-10% בנושא חלש אחד'
    ];

    // אבני דרך
    plan.milestones = [
      { week: 1, goal: 'השלמת 100 שאלות', reward: '🎖️ תג מתחיל' },
      { week: 2, goal: '70% הצלחה בבחינה מדומה', reward: '⭐ תג התקדמות' },
      { week: 3, goal: 'רצף של 7 ימים', reward: '🔥 תג רצף' },
      { week: 4, goal: '90% בכל הנושאים', reward: '🏆 מוכן לבחינה!' }
    ];

    return plan;
  }, []);

  // קבלת עצה חדשה
  const getAdvice = useCallback(() => {
    const analysis = analyzeUserStatus();
    const advice = generatePersonalAdvice(analysis);
    
    setTeacherState(prev => ({
      ...prev,
      currentAdvice: advice,
      insights: [advice, ...prev.insights].slice(0, 10)
    }));
    
    setTeacherStats(prev => ({
      ...prev,
      adviceGiven: prev.adviceGiven + 1,
      totalInteractions: prev.totalInteractions + 1
    }));
    
    return advice;
  }, [analyzeUserStatus, generatePersonalAdvice]);

  // יצירת תוכנית למידה חדשה
  const createPlan = useCallback(() => {
    const analysis = analyzeUserStatus();
    const plan = createLearningPlan(analysis);
    
    setTeacherState(prev => ({
      ...prev,
      learningPlan: plan
    }));
    
    setTeacherStats(prev => ({
      ...prev,
      plansCreated: prev.plansCreated + 1,
      totalInteractions: prev.totalInteractions + 1
    }));
    
    return plan;
  }, [analyzeUserStatus, createLearningPlan]);

  // שינוי אישיות המורה
  const changePersonality = useCallback((personality) => {
    setTeacherState(prev => ({
      ...prev,
      personality
    }));
  }, []);

  // הוספת שיחה
  const addConversation = useCallback((userMessage, teacherResponse) => {
    setTeacherState(prev => ({
      ...prev,
      conversationHistory: [
        {
          userMessage,
          teacherResponse,
          timestamp: new Date().toISOString()
        },
        ...prev.conversationHistory
      ].slice(0, 50)
    }));
  }, []);

  const value = {
    teacherState,
    teacherStats,
    analyzeUserStatus,
    getAdvice,
    createPlan,
    changePersonality,
    addConversation
  };

  return (
    <VirtualTeacherContext.Provider value={value}>
      {children}
    </VirtualTeacherContext.Provider>
  );
};

export const useVirtualTeacher = () => {
  const context = useContext(VirtualTeacherContext);
  if (!context) {
    throw new Error('useVirtualTeacher must be used within a VirtualTeacherProvider');
  }
  return context;
};

export default VirtualTeacherContext;

