import React, { useState, useEffect, useMemo } from 'react';
import './AdvancedDashboard.css';
import NotificationSystem from '../NotificationSystem/NotificationSystem';
import AILearningSystem from '../AILearningSystem/AILearningSystem';
import StudyPlans from '../StudyPlans/StudyPlans';

const AdvancedDashboard = ({ user, lang }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [goals] = useState({
    daily: 20,
    weekly: 100,
    monthly: 400
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  const labels = useMemo(() => ({
    dashboard: lang === 'ar' ? 'لوحة التحكم المتقدمة' : 'דשבורד מתקדם',
    progress: lang === 'ar' ? 'التقدم' : 'התקדמות',
    statistics: lang === 'ar' ? 'الإحصائيات' : 'סטטיסטיקות',
    notifications: lang === 'ar' ? 'الإشعارات' : 'התראות',
    aiLearning: lang === 'ar' ? 'التعلم الذكي' : 'למידה חכמה',
    studyPlans: lang === 'ar' ? 'خطط الدراسة' : 'תוכניות לימוד',
    goals: lang === 'ar' ? 'الأهداف' : 'מטרות',
    achievements: lang === 'ar' ? 'الإنجازات' : 'הישגים',
    weekly: lang === 'ar' ? 'أسبوعي' : 'שבועי',
    monthly: lang === 'ar' ? 'شهري' : 'חודשי',
    allTime: lang === 'ar' ? 'كل الوقت' : 'כל הזמן',
    totalQuestions: lang === 'ar' ? 'إجمالي الأسئلة' : 'סה"כ שאלות',
    correctAnswers: lang === 'ar' ? 'إجابات صحيحة' : 'תשובות נכונות',
    wrongAnswers: lang === 'ar' ? 'إجابات خاطئة' : 'תשובות שגויות',
    accuracy: lang === 'ar' ? 'دقة' : 'דיוק',
    averageTime: lang === 'ar' ? 'متوسط الوقت' : 'זמן ממוצע',
    streak: lang === 'ar' ? 'سلسلة' : 'רצף',
    dailyGoal: lang === 'ar' ? 'الهدف اليومي' : 'מטרה יומית',
    weeklyGoal: lang === 'ar' ? 'الهدف الأسبوعي' : 'מטרה שבועית',
    monthlyGoal: lang === 'ar' ? 'الهدف الشهري' : 'מטרה חודשית',
    progressByCategory: lang === 'ar' ? 'التقدم حسب الفئة' : 'התקדמות לפי קטגוריה',
    recentActivity: lang === 'ar' ? 'النشاط الأخير' : 'פעילות אחרונה',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'טוען נתונים...',
    error: lang === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'שגיאה בטעינת הנתונים',
    offlineMode: lang === 'ar' ? 'وضع عدم الاتصال - عرض بيانات تجريبية' : 'מצב לא מקוון - הצגת נתוני דמו',
    serverUnavailable: lang === 'ar' ? 'الخادم غير متاح - يتم عرض البيانات التجريبية' : 'השרת לא זמין - מוצגים נתוני דמו'
  }), [lang]);

  const fetchDashboardData = async () => {
      if (!user || !user.id) {
        setError('נתונים חסרים');
        setIsLoading(false);
        return;
      }

      // debouncing - מניעת קריאות מרובות
      const now = Date.now();
      const lastFetch = localStorage.getItem(`dashboard_last_fetch_${user.id}`);
      if (lastFetch && now - parseInt(lastFetch) < 30000) { // לא יותר מפעם ב-30 שניות
        // console.log('Dashboard: Debouncing - skipping fetch');
        setIsLoading(false);
        return;
      }
      localStorage.setItem(`dashboard_last_fetch_${user.id}`, now.toString());
      // console.log('Dashboard: Fetching data...');

      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        
        // שליפת נתוני דשבורד מלאים מהשרת החדש
        let dashboardApiData = null;
        try {
          const dashboardResponse = await fetch(`${apiUrl}/dashboard/${user.id}?period=${selectedPeriod}`);
          if (dashboardResponse.ok) {
            dashboardApiData = await dashboardResponse.json();
            console.log('Dashboard API data received:', dashboardApiData);
          }
        } catch (dashboardErr) {
          console.warn('Dashboard API not available, using fallback data');
          setIsOfflineMode(true);
        }

        // אם יש נתונים מהשרת, נשתמש בהם
        if (dashboardApiData) {
          setDashboardData({
            statistics: dashboardApiData.statistics,
            progressByCategory: dashboardApiData.statistics.progressByCategory,
            recentActivity: dashboardApiData.statistics.recentActivity,
            goals: dashboardApiData.statistics.goals,
            trends: dashboardApiData.trends,
            achievements: dashboardApiData.achievements,
            lastUpdated: dashboardApiData.lastUpdated
          });
        } else {
          // נתוני fallback אם השרת לא זמין
          const fallbackData = {
            statistics: {
              totalQuestions: 0,
              correctAnswers: 0,
              wrongAnswers: 0,
              accuracy: 0,
              averageTime: 0,
              streak: 0,
              progressByCategory: [
                { name: 'חוקי התנועה', total: 100, completed: 0, progress: 0 },
                { name: 'תמרורים', total: 50, completed: 0, progress: 0 },
                { name: 'בטיחות', total: 80, completed: 0, progress: 0 },
                { name: 'הכרת הרכב', total: 60, completed: 0, progress: 0 }
              ],
              recentActivity: [],
              goals: {
                daily: { target: 20, completed: 0, progress: 0 },
                weekly: { target: 100, completed: 0, progress: 0 },
                monthly: { target: 400, completed: 0, progress: 0 }
              }
            },
            trends: { last7Days: [], last30Days: [] },
            achievements: [],
            lastUpdated: new Date().toISOString()
          };
          
          setDashboardData(fallbackData);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        // נתוני fallback מלאים
        const fallbackData = {
          progress: {
            [user.id]: {
              completedQuestions: [],
              completedPractices: [],
              totalScore: 0,
              lastActivity: Date.now(),
              progressByCategory: {}
            }
          },
          questions: [
            { id: 1, subject: 'חוקי התנועה', question: 'שאלה לדוגמה' },
            { id: 2, subject: 'תמרורים', question: 'שאלה לדוגמה' },
            { id: 3, subject: 'בטיחות', question: 'שאלה לדוגמה' },
            { id: 4, subject: 'הכרת הרכב', question: 'שאלה לדוגמה' }
          ],
          statistics: {
            totalQuestions: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            accuracy: 0,
            averageTime: 0,
            streak: 0
          },
          goals: goals
        };
        
        setDashboardData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

  // ביטול מוחלט של קריאות API ב-Dashboard
  useEffect(() => {
    if (user?.id) {
      // נתונים סטטיים פשוטים
      const staticData = {
        statistics: {
          totalQuestions: 850,
          completedQuestions: 245,
          accuracy: 78,
          remainingQuestions: 605,
          progressByCategory: [
            { category: 'תמרורים', completed: 45, total: 80, accuracy: 85 },
            { category: 'חוקי תנועה', completed: 38, total: 60, accuracy: 78 },
            { category: 'בטיחות', completed: 42, total: 70, accuracy: 92 },
            { category: 'מכניקה', completed: 25, total: 50, accuracy: 68 }
          ]
        },
        recentActivity: [],
        achievements: [],
        studyStreak: 3,
        totalStudyTime: 125,
        weakAreas: ['מכניקה', 'חוקי חנייה'],
        strongAreas: ['בטיחות', 'תמרורים'],
        recommendations: []
      };
      
      setDashboardData(staticData);
      setIsLoading(false);
    }
  }, [user?.id]); // רק כש-user.id משתנה

  const calculateStatistics = (progressData, questionsData) => {
    const userProgress = progressData[user.id] || progressData;
    const completedQuestions = userProgress.completedQuestions || [];
    
    const totalQuestions = questionsData.length || 0;
    const completedCount = completedQuestions.length;
    const accuracy = completedCount > 0 ? 
      (userProgress.correctAnswers || 0) / completedCount * 100 : 0;
    
    return {
      totalQuestions,
      completedQuestions: completedCount,
      accuracy: Math.round(accuracy),
      remainingQuestions: totalQuestions - completedCount
    };
  };

  const getProgressByCategory = () => {
    if (!dashboardData || !dashboardData.statistics) return [];
    
    return dashboardData.statistics.progressByCategory || [];
  };

  const getRecentActivity = () => {
    if (!dashboardData || !dashboardData.statistics) return [];
    
    return dashboardData.statistics.recentActivity || [];
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading-message">{labels.loading}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="error-message">{labels.error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Offline Mode Notice */}
        {isOfflineMode && (
          <div className="offline-notice">
            <div className="offline-icon">📡</div>
            <div className="offline-message">{labels.serverUnavailable}</div>
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">{labels.dashboard}</h1>
          <div className="period-selector">
            <button 
              className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('week')}
            >
              {labels.weekly}
            </button>
            <button 
              className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              {labels.monthly}
            </button>
            <button 
              className={`period-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('all')}
            >
              {labels.allTime}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            {labels.dashboard}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            {labels.notifications}
          </button>
          <button
            className={`tab-btn ${activeTab === 'aiLearning' ? 'active' : ''}`}
            onClick={() => setActiveTab('aiLearning')}
          >
            {labels.aiLearning}
          </button>
          <button
            className={`tab-btn ${activeTab === 'studyPlans' ? 'active' : ''}`}
            onClick={() => setActiveTab('studyPlans')}
          >
            {labels.studyPlans}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Statistics Cards */}
            <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="url(#gradient-total-q)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 17l-5-5-3 3-5-5" stroke="url(#gradient-total-q)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="5" cy="10" r="1.5" fill="url(#gradient-total-q)"/>
                <circle cx="10" cy="15" r="1.5" fill="url(#gradient-total-q)"/>
                <circle cx="13" cy="12" r="1.5" fill="url(#gradient-total-q)"/>
                <circle cx="18" cy="7" r="1.5" fill="url(#gradient-total-q)"/>
                <defs>
                  <linearGradient id="gradient-total-q" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.statistics?.totalQuestions || 0}</div>
              <div className="stat-label">{labels.totalQuestions}</div>
            </div>
          </div>
          
          <div className="stat-card correct">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="url(#gradient-correct)" strokeWidth="2"/>
                <path d="M8 12l3 3 5-6" stroke="url(#gradient-correct)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient-correct" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.statistics?.correctAnswers || 0}</div>
              <div className="stat-label">{labels.correctAnswers}</div>
            </div>
          </div>
          
          <div className="stat-card wrong">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="url(#gradient-wrong)" strokeWidth="2"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="url(#gradient-wrong)" strokeWidth="2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient-wrong" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.statistics?.wrongAnswers || 0}</div>
              <div className="stat-label">{labels.wrongAnswers}</div>
            </div>
          </div>
          
          <div className="stat-card accuracy">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="url(#gradient-accuracy)" strokeWidth="2"/>
                <circle cx="12" cy="12" r="6" stroke="url(#gradient-accuracy)" strokeWidth="2"/>
                <circle cx="12" cy="12" r="2" fill="url(#gradient-accuracy)"/>
                <defs>
                  <linearGradient id="gradient-accuracy" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.statistics?.accuracy || 0}%</div>
              <div className="stat-label">{labels.accuracy}</div>
            </div>
          </div>
          
          <div className="stat-card time">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="url(#gradient-time)" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="url(#gradient-time)" strokeWidth="2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient-time" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.statistics?.averageTime || 0}s</div>
              <div className="stat-label">{labels.averageTime}</div>
            </div>
          </div>
          
          <div className="stat-card streak">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C12 2 7 7 7 12c0 2.8 2.2 5 5 5s5-2.2 5-5c0-5-5-10-5-10z" fill="url(#gradient-streak)" stroke="url(#gradient-streak)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17c-1.1 0-2-.9-2-2 0-1.7 2-3.5 2-3.5s2 1.8 2 3.5c0 1.1-.9 2-2 2z" fill="white" opacity="0.5"/>
                <defs>
                  <linearGradient id="gradient-streak" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.statistics?.streak || 0}</div>
              <div className="stat-label">{labels.streak}</div>
            </div>
          </div>
        </div>

        {/* Progress by Category */}
        <div className="dashboard-section">
          <h2 className="section-title">{labels.progressByCategory}</h2>
          <div className="category-progress">
            {getProgressByCategory().map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-info">
                  <span className="category-name">{category.name}</span>
                  <span className="category-stats">
                    {category.completed} / {category.total}
                  </span>
                </div>
                <div className="category-progress-bar">
                  <div 
                    className="category-progress-fill"
                    style={{ width: `${category.progress}%` }}
                  ></div>
                </div>
                <span className="category-percentage">{category.progress}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Section */}
        <div className="dashboard-section">
          <h2 className="section-title">{labels.goals}</h2>
          <div className="goals-grid">
            <div className="goal-card">
              <div className="goal-icon">📅</div>
              <div className="goal-content">
                <div className="goal-value">
                  {dashboardData?.statistics?.goals?.daily?.completed || 0} / {dashboardData?.statistics?.goals?.daily?.target || 20}
                </div>
                <div className="goal-label">{labels.dailyGoal}</div>
                <div className="goal-progress">
                  {dashboardData?.statistics?.goals?.daily?.progress || 0}%
                </div>
              </div>
            </div>
            <div className="goal-card">
              <div className="goal-icon">📊</div>
              <div className="goal-content">
                <div className="goal-value">
                  {dashboardData?.statistics?.goals?.weekly?.completed || 0} / {dashboardData?.statistics?.goals?.weekly?.target || 100}
                </div>
                <div className="goal-label">{labels.weeklyGoal}</div>
                <div className="goal-progress">
                  {dashboardData?.statistics?.goals?.weekly?.progress || 0}%
                </div>
              </div>
            </div>
            <div className="goal-card">
              <div className="goal-icon">📈</div>
              <div className="goal-content">
                <div className="goal-value">
                  {dashboardData?.statistics?.goals?.monthly?.completed || 0} / {dashboardData?.statistics?.goals?.monthly?.target || 400}
                </div>
                <div className="goal-label">{labels.monthlyGoal}</div>
                <div className="goal-progress">
                  {dashboardData?.statistics?.goals?.monthly?.progress || 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h2 className="section-title">{labels.recentActivity}</h2>
          <div className="activity-list">
            {getRecentActivity().map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.isCorrect ? 'correct' : 'wrong'}`}>
                  {activity.isCorrect ? '✅' : '❌'}
                </div>
                <div className="activity-content">
                  <div className="activity-question">
                    שאלה #{activity.questionId}
                  </div>
                  <div className="activity-time">
                    {new Date(activity.answeredAt).toLocaleString('he-IL')}
                  </div>
                </div>
                <div className="activity-time-taken">
                  {activity.responseTime || 0}s
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationSystem user={user} lang={lang} />
        )}

        {/* AI Learning Tab */}
        {activeTab === 'aiLearning' && (
          <AILearningSystem user={user} lang={lang} />
        )}

        {/* Study Plans Tab */}
        {activeTab === 'studyPlans' && (
          <StudyPlans user={user} lang={lang} />
        )}
      </div>
    </div>
  );
};

export default AdvancedDashboard;
