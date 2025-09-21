import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudyPlans.css';

const StudyPlans = ({ user, lang = 'he' }) => {
  const [availablePlans, setAvailablePlans] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [dailyTask, setDailyTask] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Actually needed
  const [activeTab, setActiveTab] = useState('plans');
  const [selectedPlan, setSelectedPlan] = useState(null); // Actually needed  
  const [showCreateModal, setShowCreateModal] = useState(false); // Actually needed
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Helper functions for generating dynamic daily tasks
  const getSubjectsForPlan = (planId) => {
    const planSubjects = {
      'intensive': ['חוקי תנועה', 'תמרורים', 'חנייה', 'אותות תנועה'],
      'standard': ['חוקי תנועה', 'תמרורים', 'חנייה'],
      'relaxed': ['חוקי תנועה', 'תמרורים'],
      'crash': ['חוקי תנועה', 'תמרורים', 'חנייה', 'אותות תנועה', 'כללי בטיחות']
    };
    return planSubjects[planId] || ['חוקי תנועה', 'תמרורים'];
  };

  const getTopicsForPlan = (planId, dailyGoal) => {
    const subjects = getSubjectsForPlan(planId);
    const questionsPerSubject = Math.ceil(dailyGoal / subjects.length);
    
    return subjects.map(subject => ({
      name: subject,
      count: questionsPerSubject,
      completed: 0
    }));
  };

  const getDifficultyForDay = (day, planId) => {
    if (planId === 'intensive' || planId === 'crash') {
      return day <= 7 ? 'low' : day <= 14 ? 'medium' : 'high';
    } else if (planId === 'standard') {
      return day <= 10 ? 'low' : day <= 20 ? 'medium' : 'high';
    } else {
      return day <= 14 ? 'low' : 'medium';
    }
  };

  const getTipsForDay = (day, planId) => {
    const baseTips = [ // Actually needed for future use
      'קרא בעיון את השאלות',
      'אל תמהר לענות',
      'השתמש בלוגיקה'
    ];

    if (day <= 7) {
      return [
        'התחל עם החוקים הבסיסיים',
        'התמקד בהבנת התמרורים הפשוטים',
        'אל תדאג מהזמן - למידה חשובה יותר'
      ];
    } else if (day <= 14) {
      return [
        'התמקד בהבנת החוקים הבסיסיים',
        'שימו לב להבדלים בין סוגי תמרורים',
        'תרגלו זיהוי מהיר של תמרורים'
      ];
    } else {
      return [
        'התמקד בשאלות הקשות יותר',
        'תרגל סימולציות מלאות',
        'הכן את עצמך למבחן האמיתי',
        ...baseTips // שימוש ב-baseTips
      ];
    }
  };

  const labels = {
    he: {
      title: 'תוכניות לימוד',
      subtitle: 'תוכניות מובנות להכנה למבחן התיאוריה',
      plans: 'תוכניות זמינות',
      myPlan: 'התוכנית שלי',
      dailyTask: 'משימה יומית',
      stats: 'סטטיסטיקות',
      quick: 'מהירה',
      standard: 'סטנדרטית',
      comprehensive: 'מקיפה',
      daily: 'יומית',
      custom: 'מותאמת אישית',
      duration: 'משך',
      days: 'ימים',
      dailyGoal: 'יעד יומי',
      questions: 'שאלות',
      difficulty: 'רמת קושי',
      high: 'גבוהה',
      medium: 'בינונית',
      low: 'נמוכה',
      startPlan: 'התחל תוכנית',
      updatePlan: 'עדכן תוכנית',
      createCustom: 'צור תוכנית מותאמת',
      currentDay: 'יום נוכחי',
      completedDays: 'ימים שהושלמו',
      remainingDays: 'ימים נותרים',
      completion: 'השלמה',
      streak: 'רצף ימים',
      todayTask: 'המשימה של היום',
      subjects: 'נושאים',
      focus: 'מיקוד',
      estimatedTime: 'זמן משוער',
      tips: 'טיפים',
      startTask: 'התחל משימה',
      totalQuestions: 'סה"כ שאלות',
      completedQuestions: 'שאלות שהושלמו',
      averageAccuracy: 'דיוק ממוצע',
      weeklyProgress: 'התקדמות שבועית',
      subjectProgress: 'התקדמות לפי נושא',
      loading: 'טוען תוכניות לימוד...',
      error: 'שגיאה בטעינת תוכניות הלימוד',
      retry: 'נסה שוב',
      createPlan: 'צור תוכנית',
      planName: 'שם התוכנית',
      examDate: 'תאריך מבחן',
      availableTime: 'זמן פנוי',
      much: 'הרבה',
      little: 'מעט',
      selectPlan: 'בחר תוכנית',
      cancel: 'ביטול',
      confirm: 'אישור',
      refresh: 'רענן התקדמות'
    },
    ar: {
      title: 'خطط الدراسة',
      subtitle: 'خطط منظمة للتحضير لامتحان النظرية',
      plans: 'الخطط المتاحة',
      myPlan: 'خطتي',
      dailyTask: 'المهمة اليومية',
      stats: 'الإحصائيات',
      quick: 'سريعة',
      standard: 'عادية',
      comprehensive: 'شاملة',
      daily: 'يومية',
      custom: 'مخصصة',
      duration: 'المدة',
      days: 'أيام',
      dailyGoal: 'الهدف اليومي',
      questions: 'أسئلة',
      difficulty: 'مستوى الصعوبة',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
      startPlan: 'ابدأ الخطة',
      updatePlan: 'تحديث الخطة',
      createCustom: 'إنشاء خطة مخصصة',
      currentDay: 'اليوم الحالي',
      completedDays: 'الأيام المكتملة',
      remainingDays: 'الأيام المتبقية',
      completion: 'الإكمال',
      streak: 'سلسلة الأيام',
      todayTask: 'مهمة اليوم',
      subjects: 'المواضيع',
      focus: 'التركيز',
      estimatedTime: 'الوقت المقدر',
      tips: 'نصائح',
      startTask: 'ابدأ المهمة',
      totalQuestions: 'إجمالي الأسئلة',
      completedQuestions: 'الأسئلة المكتملة',
      averageAccuracy: 'متوسط الدقة',
      weeklyProgress: 'التقدم الأسبوعي',
      subjectProgress: 'التقدم حسب الموضوع',
      loading: 'جاري تحميل خطط الدراسة...',
      error: 'خطأ في تحميل خطط الدراسة',
      retry: 'حاول مرة أخرى',
      createPlan: 'إنشاء خطة',
      planName: 'اسم الخطة',
      examDate: 'تاريخ الامتحان',
      availableTime: 'الوقت المتاح',
      much: 'كثير',
      little: 'قليل',
      selectPlan: 'اختر خطة',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      refresh: 'تحديث التقدم'
    }
  };

  const currentLabels = useMemo(() => labels[lang] || labels.he, [lang]);

  // ביטול קריאות API אוטומטיות כדי למנוע ריפרשים
  useEffect(() => {
    if (user && user.id) {
      // נתונים סטטיים במקום קריאות שרת
      setAvailablePlans([
        { id: 'intensive', name: 'תוכנית אינטנסיבית', duration: '2 שבועות', questionsPerDay: 50 },
        { id: 'standard', name: 'תוכנית רגילה', duration: '4 שבועות', questionsPerDay: 25 },
        { id: 'relaxed', name: 'תוכנית רגועה', duration: '8 שבועות', questionsPerDay: 15 }
      ]);
      
      setUserPlan({ planId: 'standard', name: 'תוכנית רגילה', startDate: new Date() });
      
      setDailyTask({
        questionsToSolve: 25,
        questionsSolved: 12,
        targetAccuracy: 80,
        currentAccuracy: 75,
        subjects: ['תמרורים', 'חוקי תנועה']
      });
      
      setStats({
        totalDays: 28,
        completedDays: 15,
        averageAccuracy: 76,
        totalQuestions: 375,
        completedQuestions: 180
      });
      
      setIsLoading(false);
      return; // עצירה כאן - ללא קריאות שרת
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ביטול עדכון אוטומטי כדי למנוע ריפרשים
  // useEffect(() => {
  //   if (userPlan && userPlan.planId) {
  //     console.log('📋 User plan changed, updating daily task and stats...', {
  //       planId: userPlan.planId
  //     });
  //     fetchDailyTask();
  //     fetchStats();
  //   }
  // }, [userPlan?.planId]); // eslint-disable-line react-hooks/exhaustive-deps

  // הסרת עדכון אוטומטי - יגרום לרפרשים מיותרים
  // useEffect(() => {
  //   if (!user || !user.id || !userPlan?.planId) return;

  //   const interval = setInterval(() => {
  //     console.log('🔄 Auto-updating study plan progress...');
  //     fetchUserPlan();
  //     fetchStats();
  //   }, 120000); // 2 דקות במקום 30 שניות

  //   return () => clearInterval(interval);
  // }, [user?.id, userPlan?.planId]); // dependencies ספציפיות יותר

  const fetchStudyPlans = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/study-plans/plans`);
      
      if (response.ok) {
        const data = await response.json();
        setAvailablePlans(data);
      } else {
        console.warn('Failed to fetch study plans, using fallback data');
        // Fallback data
        const fallbackPlans = [
          {
            id: 'quick',
            name: 'תוכנית מהירה',
            duration: 14,
            description: 'תוכנית אינטנסיבית למבחן תיאוריה תוך שבועיים',
            dailyGoal: 50,
            weeklyGoal: 350,
            totalQuestions: 700,
            difficulty: 'high'
          },
          {
            id: 'standard',
            name: 'תוכנית סטנדרטית',
            duration: 28,
            description: 'תוכנית מאוזנת למבחן תיאוריה תוך חודש',
            dailyGoal: 30,
            weeklyGoal: 210,
            totalQuestions: 840,
            difficulty: 'medium'
          },
          {
            id: 'comprehensive',
            name: 'תוכנית מקיפה',
            duration: 56,
            description: 'תוכנית מקיפה למבחן תיאוריה תוך חודשיים',
            dailyGoal: 20,
            weeklyGoal: 140,
            totalQuestions: 1120,
            difficulty: 'low'
          }
        ];
        setAvailablePlans(fallbackPlans);
      }
    } catch (err) {
      console.error('Error fetching study plans:', err);
      // Fallback data
      const fallbackPlans = [
        {
          id: 'quick',
          name: 'תוכנית מהירה',
          duration: 14,
          description: 'תוכנית אינטנסיבית למבחן תיאוריה תוך שבועיים',
          dailyGoal: 50,
          weeklyGoal: 350,
          totalQuestions: 700,
          difficulty: 'high'
        },
        {
          id: 'standard',
          name: 'תוכנית סטנדרטית',
          duration: 28,
          description: 'תוכנית מאוזנת למבחן תיאוריה תוך חודש',
          dailyGoal: 30,
          weeklyGoal: 210,
          totalQuestions: 840,
          difficulty: 'medium'
        }
      ];
      setAvailablePlans(fallbackPlans);
    }
  };

  const fetchUserPlan = async () => {
    try {
      console.log('📡 Fetching user plan...');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/study-plans/users/${user.id}/plan`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 User plan data received:', data);
        setUserPlan(data);
      } else {
        console.warn('Failed to fetch user plan, using fallback data');
        // Fallback data - דוגמה לתוכנית פעילה
        const fallbackUserPlan = {
          userId: user.id,
          planId: 'standard',
          planName: 'תוכנית סטנדרטית',
          startDate: new Date().toISOString(),
          examDate: null,
          currentDay: 1,
          totalDays: 28,
          dailyGoal: 30,
          weeklyGoal: 210,
          totalQuestions: 840,
          difficulty: 'medium',
          progress: {
            completedDays: 0,
            completedQuestions: 0,
            streak: 0,
            lastActivity: null
          },
          status: 'active',
          createdAt: new Date().toISOString()
        };
        setUserPlan(fallbackUserPlan);
      }
    } catch (err) {
      console.error('Error fetching user plan:', err);
      // Fallback data במקרה של שגיאה
      const fallbackUserPlan = {
        userId: user.id,
        planId: 'standard',
        planName: 'תוכנית סטנדרטית',
        startDate: new Date().toISOString(),
        examDate: null,
        currentDay: 1,
        totalDays: 28,
        dailyGoal: 30,
        weeklyGoal: 210,
        totalQuestions: 840,
        difficulty: 'medium',
        progress: {
          completedDays: 0,
          completedQuestions: 0,
          streak: 0,
          lastActivity: null
        },
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setUserPlan(fallbackUserPlan);
    }
  };

  const fetchDailyTask = async () => {
    try {
      if (!user || !user.id) return;
      
      console.log('📅 Fetching daily task...');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const currentDay = userPlan ? userPlan.progress.completedDays + 1 : 1;
      const response = await fetch(`${apiUrl}/study-plans/users/${user.id}/daily-task?day=${currentDay}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Daily task data received:', data);
        setDailyTask(data);
      } else {
        console.warn('Failed to fetch daily task, using fallback data');
        // Dynamic fallback data based on current plan
        const fallbackTask = {
          day: currentDay,
          subjects: userPlan ? getSubjectsForPlan(userPlan.planId) : ['חוקי תנועה', 'תמרורים'],
          questions: userPlan ? userPlan.dailyGoal : 30,
          focus: currentDay <= 7 ? 'foundations' : currentDay <= 14 ? 'mixed' : 'advanced',
          description: userPlan ? `יום ${currentDay} - ${userPlan.planName}` : 'תרגול יומי',
          estimatedTime: userPlan ? `${Math.ceil(userPlan.dailyGoal * 1.5)}-${Math.ceil(userPlan.dailyGoal * 2)} דקות` : '20-30 דקות',
          difficulty: userPlan ? getDifficultyForDay(currentDay, userPlan.planId) : 'medium',
          tips: getTipsForDay(currentDay, userPlan?.planId),
          topics: userPlan ? getTopicsForPlan(userPlan.planId, userPlan.dailyGoal) : [
            { name: 'חוקי תנועה', count: 15, completed: 0 },
            { name: 'תמרורים', count: 15, completed: 0 }
          ]
        };
        setDailyTask(fallbackTask);
      }
    } catch (err) {
      console.error('Error fetching daily task:', err);
      // Dynamic fallback data based on current plan
      const currentDay = userPlan ? userPlan.progress.completedDays + 1 : 1;
      const fallbackTask = {
        day: currentDay,
        subjects: userPlan ? getSubjectsForPlan(userPlan.planId) : ['חוקי תנועה', 'תמרורים'],
        questions: userPlan ? userPlan.dailyGoal : 30,
        focus: currentDay <= 7 ? 'foundations' : currentDay <= 14 ? 'mixed' : 'advanced',
        description: userPlan ? `יום ${currentDay} - ${userPlan.planName}` : 'תרגול יומי',
        estimatedTime: userPlan ? `${Math.ceil(userPlan.dailyGoal * 1.5)}-${Math.ceil(userPlan.dailyGoal * 2)} דקות` : '20-30 דקות',
        difficulty: userPlan ? getDifficultyForDay(currentDay, userPlan.planId) : 'medium',
        tips: getTipsForDay(currentDay, userPlan?.planId),
        topics: userPlan ? getTopicsForPlan(userPlan.planId, userPlan.dailyGoal) : [
          { name: 'חוקי תנועה', count: 15, completed: 0 },
          { name: 'תמרורים', count: 15, completed: 0 }
        ]
      };
      setDailyTask(fallbackTask);
    }
  };

  const fetchStats = async () => {
    try {
      if (!user || !user.id) return;
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/study-plans/users/${user.id}/stats`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.warn('Failed to fetch stats, using fallback data');
        // Fallback data
        const fallbackStats = {
          totalDays: 28,
          completedDays: 0,
          remainingDays: 28,
          completionPercentage: 0,
          totalQuestions: 840,
          completedQuestions: 0,
          remainingQuestions: 840,
          averageAccuracy: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyProgress: [
            { week: 1, completed: 0, goal: 210, percentage: 0 },
            { week: 2, completed: 0, goal: 210, percentage: 0 },
            { week: 3, completed: 0, goal: 210, percentage: 0 },
            { week: 4, completed: 0, goal: 210, percentage: 0 }
          ],
          subjectProgress: {
            'חוקי התנועה': { completed: 0, total: 200, percentage: 0 },
            'תמרורים': { completed: 0, total: 180, percentage: 0 },
            'בטיחות': { completed: 0, total: 160, percentage: 0 },
            'הכרת הרכב': { completed: 0, total: 140, percentage: 0 }
          }
        };
        setStats(fallbackStats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Fallback data
      const fallbackStats = {
        totalDays: 28,
        completedDays: 0,
        remainingDays: 28,
        completionPercentage: 0,
        totalQuestions: 840,
        completedQuestions: 0,
        remainingQuestions: 840,
        averageAccuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyProgress: [
          { week: 1, completed: 0, goal: 210, percentage: 0 },
          { week: 2, completed: 0, goal: 210, percentage: 0 },
          { week: 3, completed: 0, goal: 210, percentage: 0 },
          { week: 4, completed: 0, goal: 210, percentage: 0 }
        ],
        subjectProgress: {
          'חוקי התנועה': { completed: 0, total: 200, percentage: 0 },
          'תמרורים': { completed: 0, total: 180, percentage: 0 },
          'בטיחות': { completed: 0, total: 160, percentage: 0 },
          'הכרת הרכב': { completed: 0, total: 140, percentage: 0 }
        }
      };
      setStats(fallbackStats);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPlan = async (plan) => {
    try {
      console.log('Starting/Updating plan:', plan);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      
      // אם יש תוכנית קיימת, נעדכן אותה. אחרת, ניצור חדשה
      const method = userPlan ? 'PUT' : 'POST';
      const endpoint = userPlan 
        ? `${apiUrl}/study-plans/users/${user.id}/plan`
        : `${apiUrl}/study-plans/users/${user.id}/plans`;
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          startDate: userPlan?.startDate || new Date().toISOString(),
          examDate: userPlan?.examDate || null,
          currentDay: userPlan?.currentDay || 1,
          progress: userPlan?.progress || {
            completedDays: 0,
            completedQuestions: 0,
            streak: 0,
            lastActivity: null
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Plan updated successfully:', data);
        
        // עדכון מיידי של ה-state
        setUserPlan(data);
        setActiveTab('myPlan');
        
        // הצגת הודעת הצלחה
        const message = userPlan 
          ? `תוכנית "${plan.name}" עודכנה בהצלחה!`
          : `תוכנית "${plan.name}" התחילה בהצלחה!`;
        setSuccessMessage(message);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        
        // רענון הנתונים הנוספים - ביטול timeout
        setIsRefreshing(true);
        try {
          // עדכון מיידי של המשימה היומית עם הנתונים החדשים
          await fetchDailyTask();
          await fetchStats();
        } catch (err) {
          console.error('Error refreshing additional data:', err);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        console.error('Failed to update plan:', response.status, response.statusText);
        setSuccessMessage('שגיאה בעדכון התוכנית. נסה שוב.');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (err) {
      console.error('Error updating plan:', err);
      setSuccessMessage('שגיאה בעדכון התוכנית. נסה שוב.');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleStartTask = () => {
    if (dailyTask && dailyTask.subjects && dailyTask.questions) {
      console.log('Starting daily task:', dailyTask);
      
      // בניית פרמטרים לניווט
      const params = new URLSearchParams();
      params.append('category', dailyTask.subjects.join(','));
      params.append('lang', lang);
      params.append('count', dailyTask.questions);
      params.append('filter', 'remaining');
      params.append('studyPlan', 'true');
      
      console.log('Navigating to:', `/theory/questions?${params.toString()}`);
      navigate(`/theory/questions?${params.toString()}`);
    } else {
      console.error('Daily task data is incomplete:', dailyTask);
    }
  };

  const handleCompleteTask = async (questionsCompleted, accuracy, timeSpent) => {
    try {
      if (!user || !user.id || !dailyTask) {
        console.error('Missing user or daily task data');
        return;
      }

      console.log('Completing daily task:', { questionsCompleted, accuracy, timeSpent });
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/study-plans/users/${user.id}/daily-task`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day: dailyTask.day,
          questionsCompleted,
          accuracy,
          timeSpent,
          topicsCompleted: dailyTask.subjects
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Daily task completed successfully:', data);
        
        // עדכון ההתקדמות בתוכנית
        await updateStudyPlanProgress(questionsCompleted, accuracy, timeSpent);
        
        // רענון הנתונים
        await fetchUserPlan();
        await fetchDailyTask();
        await fetchStats();
        
        setSuccessMessage(`משימה יומית הושלמה בהצלחה! ${questionsCompleted} שאלות, ${accuracy}% דיוק`);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        console.error('Failed to complete daily task:', response.status, response.statusText);
        setSuccessMessage('שגיאה בהשלמת המשימה היומית. נסה שוב.');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (err) {
      console.error('Error completing daily task:', err);
      setSuccessMessage('שגיאה בהשלמת המשימה היומית. נסה שוב.');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const updateStudyPlanProgress = async (questionsCompleted, accuracy, timeSpent) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/study-plans/users/${user.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionsCompleted,
          accuracy,
          timeSpent,
          dayCompleted: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Study plan progress updated:', data);
      } else {
        console.error('Failed to update study plan progress:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error updating study plan progress:', err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'high': return currentLabels.high;
      case 'medium': return currentLabels.medium;
      case 'low': return currentLabels.low;
      default: return difficulty;
    }
  };

  if (isLoading) {
    return (
      <div className="study-plans">
        <div className="study-plans-container">
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
      <div className="study-plans">
        <div className="study-plans-container">
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>{currentLabels.error}</p>
            <button onClick={fetchStudyPlans} className="retry-button">
              {currentLabels.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="study-plans">
      <div className="study-plans-container">
        <div className="study-plans-header">
          <h1 className="study-plans-title">{currentLabels.title}</h1>
          <p className="study-plans-subtitle">{currentLabels.subtitle}</p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="success-message">
            <div className="success-icon">🎉</div>
            <div className="success-text">{successMessage}</div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            {currentLabels.plans}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'myPlan' ? 'active' : ''}`}
            onClick={() => setActiveTab('myPlan')}
          >
            {currentLabels.myPlan}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'dailyTask' ? 'active' : ''}`}
            onClick={() => setActiveTab('dailyTask')}
          >
            {currentLabels.dailyTask}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            {currentLabels.stats}
          </button>
        </div>

        {/* Available Plans Tab */}
        {activeTab === 'plans' && (
          <div className="plans-content">
            <div className="plans-grid">
              {availablePlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`plan-card ${userPlan && userPlan.planId === plan.id ? 'current-plan' : ''}`}
                >
                  <div className="plan-header">
                    <h3 className="plan-name">
                      {plan.name}
                      {userPlan && userPlan.planId === plan.id && (
                        <span className="current-badge">נוכחית</span>
                      )}
                    </h3>
                    <div 
                      className="plan-difficulty"
                      style={{ color: getDifficultyColor(plan.difficulty) }}
                    >
                      {getDifficultyText(plan.difficulty)}
                    </div>
                  </div>
                  <div className="plan-description">{plan.description}</div>
                  <div className="plan-details">
                    <div className="plan-detail">
                      <span className="detail-label">{currentLabels.duration}:</span>
                      <span className="detail-value">{plan.duration} {currentLabels.days}</span>
                    </div>
                    <div className="plan-detail">
                      <span className="detail-label">{currentLabels.dailyGoal}:</span>
                      <span className="detail-value">{plan.dailyGoal} {currentLabels.questions}</span>
                    </div>
                    <div className="plan-detail">
                      <span className="detail-label">{currentLabels.totalQuestions}:</span>
                      <span className="detail-value">{plan.totalQuestions}</span>
                    </div>
                  </div>
                  <button 
                    className="start-plan-btn"
                    onClick={() => handleStartPlan(plan)}
                  >
                    {userPlan ? currentLabels.updatePlan : currentLabels.startPlan}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="custom-plan-section">
              <button 
                className="create-custom-btn"
                onClick={() => setShowCreateModal(true)}
              >
                {currentLabels.createCustom}
              </button>
            </div>
          </div>
        )}

        {/* My Plan Tab */}
        {activeTab === 'myPlan' && userPlan && (
          <div className="my-plan-content">
            {isRefreshing && (
              <div className="refreshing-indicator">
                <div className="refreshing-spinner"></div>
                <span>מעדכן נתונים...</span>
              </div>
            )}
            <div className="plan-overview">
              <div className="plan-header-with-refresh">
                <h2 className="plan-title">{userPlan.planName}</h2>
                <button 
                  className="refresh-progress-btn"
                  onClick={async () => {
                    console.log('🔄 Manually refreshing progress and daily task...');
                    await fetchUserPlan();
                    await fetchDailyTask(); // עדכון המשימה היומית
                    await fetchStats();
                    setSuccessMessage('התקדמות ומשימה יומית עודכנו!');
                    setShowSuccessMessage(true);
                    setTimeout(() => setShowSuccessMessage(false), 2000);
                  }}
                >
                  🔄 {currentLabels.refresh}
                </button>
              </div>
              <div className="plan-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(userPlan.progress.completedDays / userPlan.totalDays) * 100}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {userPlan.progress.completedDays} / {userPlan.totalDays} {currentLabels.days}
                  <span className="progress-percentage">
                    ({Math.round((userPlan.progress.completedDays / userPlan.totalDays) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="plan-stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <div className="stat-value">{userPlan.progress.completedDays + 1}</div>
                  <div className="stat-label">{currentLabels.currentDay}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-value">{userPlan.progress.completedDays}</div>
                  <div className="stat-label">{currentLabels.completedDays}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <div className="stat-value">{userPlan.totalDays - userPlan.progress.completedDays}</div>
                  <div className="stat-label">{currentLabels.remainingDays}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <div className="stat-value">{userPlan.progress.streak}</div>
                  <div className="stat-label">{currentLabels.streak}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Task Tab */}
        {activeTab === 'dailyTask' && dailyTask && (
          <div className="daily-task-content">
            <h2 className="task-title">{currentLabels.todayTask}</h2>
            <div className="task-card">
              <div className="task-header">
                <div className="task-day">יום {dailyTask.day}</div>
                <div className="task-questions">{dailyTask.questions} {currentLabels.questions}</div>
              </div>
              <div className="task-details">
                <div className="task-detail">
                  <span className="detail-label">{currentLabels.subjects}:</span>
                  <span className="detail-value">{dailyTask.subjects.join(', ')}</span>
                </div>
                <div className="task-detail">
                  <span className="detail-label">{currentLabels.focus}:</span>
                  <span className="detail-value">{dailyTask.focus}</span>
                </div>
                <div className="task-detail">
                  <span className="detail-label">{currentLabels.estimatedTime}:</span>
                  <span className="detail-value">{dailyTask.estimatedTime}</span>
                </div>
              </div>
              <div className="task-description">{dailyTask.description}</div>
              {dailyTask.tips && dailyTask.tips.length > 0 && (
                <div className="task-tips">
                  <h4>טיפים:</h4>
                  <ul>
                    {dailyTask.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button 
                className="start-task-btn"
                onClick={handleStartTask}
              >
                {currentLabels.startTask}
              </button>
              <button 
                className="complete-task-btn"
                onClick={() => handleCompleteTask(30, 85, 25)}
              >
                ✅ השלם משימה (דמו)
              </button>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="stats-content">
            <h2 className="stats-title">{currentLabels.stats}</h2>
            
            <div className="stats-overview">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.completionPercentage}%</div>
                  <div className="stat-label">{currentLabels.completion}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❓</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.completedQuestions}</div>
                  <div className="stat-label">{currentLabels.completedQuestions}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.averageAccuracy}%</div>
                  <div className="stat-label">{currentLabels.averageAccuracy}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.currentStreak}</div>
                  <div className="stat-label">{currentLabels.streak}</div>
                </div>
              </div>
            </div>

            <div className="weekly-progress">
              <h3>{currentLabels.weeklyProgress}</h3>
              <div className="weekly-chart">
                {stats.weeklyProgress.map((week, index) => (
                  <div key={index} className="week-bar">
                    <div className="week-label">שבוע {index + 1}</div>
                    <div className="week-progress">
                      <div 
                        className="week-fill"
                        style={{ width: `${week.percentage}%` }}
                      ></div>
                    </div>
                    <div className="week-percentage">{week.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="subject-progress">
              <h3>{currentLabels.subjectProgress}</h3>
              <div className="subject-stats">
                {Object.entries(stats.subjectProgress).map(([subject, progress]) => (
                  <div key={subject} className="subject-stat">
                    <div className="subject-name">{subject}</div>
                    <div className="subject-progress-bar">
                      <div 
                        className="subject-fill"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="subject-percentage">{progress.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlans;
