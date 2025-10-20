import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../Icons/Icon';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import StreakBadge from '../StreakBadge/StreakBadge';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import './Sidebar.css';
import {
  fetchTopicProgress,
  calculateProgress,
  calculateAverageProgress
} from '../../services/userService';
import { useLoading } from '../../contexts/LoadingContext';
import { useProgress } from '../../contexts/ProgressContext';
import { validateUser, safeValidate } from '../../utils/validation';
import { apiGet, withLoading } from '../../utils/apiHelpers';
import Tooltip from '../Tooltip/Tooltip';

// useUserProgress function removed as it's not being used

const Sidebar = ({ user, lang }) => {
  const location = useLocation();
  const { setLoading: setGlobalLoading } = useLoading();
  const { 
    theoryProgress, 
    theorySubProgress, 
    initializeProgress,
    syncWithServer 
  } = useProgress();

  const [psychologyProgress, setPsychologyProgress] = useState(0);
  const [psychologySubProgress, setPsychologySubProgress] = useState({});
  const [theoryTopics, setTheoryTopics] = useState([]);
  const [topicCounts, setTopicCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // פונקציות עזר לעיצוב דינמי
  const getProgressColor = (percent) => {
    if (percent >= 80) return '#27ae60'; // ירוק - מצוין
    if (percent >= 60) return '#2ecc71'; // ירוק בהיר - טוב
    if (percent >= 40) return '#f39c12'; // כתום - בינוני
    if (percent >= 20) return '#e67e22'; // כתום כהה - נמוך
    return '#e74c3c'; // אדום - התחלה
  };

  const getProgressIcon = (category, percent) => {
    const icons = {
      'חוקי התנועה': percent >= 50 ? '🚦' : '📋',
      'תמרורים': percent >= 50 ? '🛑' : '⚠️',
      'בטיחות': percent >= 50 ? '🛡️' : '⚡',
      'הכרת הרכב': percent >= 50 ? '🚗' : '🔧'
    };
    return icons[category] || '📚';
  };

  const getMotivationalMessage = (percent) => {
    if (percent >= 80) return 'כמעט סיימת! 🎉';
    if (percent >= 60) return 'בדרך הנכונה! 💪';
    if (percent >= 40) return 'ממשיך טוב! 👍';
    if (percent >= 20) return 'התחלה טובה! 🌟';
    return 'בואו נתחיל! 🚀';
  };

  // פונקציות לחישוב סטטיסטיקות מתקדמות
  const calculateDetailedStats = (category, completed, total) => {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // חישוב זמן משוער להשלמה (בהנחה של 2 דקות לשאלה)
    const remainingQuestions = total - completed;
    const estimatedTimeMinutes = remainingQuestions * 2;
    const estimatedHours = Math.floor(estimatedTimeMinutes / 60);
    const estimatedMins = estimatedTimeMinutes % 60;
    
    // חישוב מגמה (סימולציה - בפרויקט אמיתי זה יגיע מהשרת)
    const trend = percent >= 50 ? 'עולה' : percent >= 20 ? 'יציבה' : 'התחלה';
    const trendIcon = percent >= 50 ? '📈' : percent >= 20 ? '➡️' : '🚀';
    
    // דירוג ביצועים
    let performance = 'מתחיל';
    let performanceColor = '#e74c3c';
    if (percent >= 80) {
      performance = 'מומחה';
      performanceColor = '#27ae60';
    } else if (percent >= 60) {
      performance = 'מתקדם';
      performanceColor = '#2ecc71';
    } else if (percent >= 40) {
      performance = 'בינוני';
      performanceColor = '#f39c12';
    } else if (percent >= 20) {
      performance = 'מתחיל מתקדם';
      performanceColor = '#e67e22';
    }
    
    return {
      percent,
      completed,
      total,
      remaining: remainingQuestions,
      estimatedTime: estimatedHours > 0 ? `${estimatedHours}ש ${estimatedMins}ד` : `${estimatedMins} דקות`,
      trend,
      trendIcon,
      performance,
      performanceColor,
      accuracy: Math.min(100, Math.max(60, 85 + (percent * 0.15))), // סימולציה של דיוק
      averageTime: Math.max(30, 120 - (percent * 0.8)) // סימולציה של זמן תגובה ממוצע
    };
  };

  const generateTooltipContent = (category, stats) => {
    return (
      <div className="tooltip-content-wrapper">
        <div className="tooltip-header">
          <strong>{category}</strong>
        </div>
        <div className="tooltip-divider"></div>
        
        <div className="tooltip-stat-row">
          <span className="tooltip-stat-label">📊 התקדמות:</span>
          <span className="tooltip-stat-value">{stats.completed}/{stats.total} ({stats.percent}%)</span>
        </div>
        
        <div className="tooltip-stat-row">
          <span className="tooltip-stat-label">📝 נותרו:</span>
          <span className="tooltip-stat-value">{stats.remaining} שאלות</span>
        </div>
        
        <div className="tooltip-stat-row">
          <span className="tooltip-stat-label">⏱️ זמן משוער:</span>
          <span className="tooltip-stat-value">{stats.estimatedTime}</span>
        </div>
        
        <div className="tooltip-stat-row">
          <span className="tooltip-stat-label">🎯 דיוק ממוצע:</span>
          <span className="tooltip-stat-value">{Math.round(stats.accuracy)}%</span>
        </div>
        
        <div className="tooltip-stat-row">
          <span className="tooltip-stat-label">⚡ זמן תגובה:</span>
          <span className="tooltip-stat-value">{Math.round(stats.averageTime)}s</span>
        </div>
        
        <div className="tooltip-divider"></div>
        
        <div className="tooltip-stat-row">
          <span className="tooltip-stat-label">🏆 רמה:</span>
          <span className="tooltip-stat-value" style={{ color: stats.performanceColor }}>
            {stats.performance}
          </span>
        </div>
        
        <div className="tooltip-stat-row">
          <span className="tooltip-stat-label">📈 מגמה:</span>
          <span className={`tooltip-trend ${stats.percent >= 50 ? 'positive' : stats.percent >= 20 ? 'neutral' : 'negative'}`}>
            {stats.trendIcon} {stats.trend}
          </span>
        </div>
      </div>
    );
  };

  const labels = {
    menu: lang === 'ar' ? 'القائمة' : 'תפריט',
    theory: lang === 'ar' ? 'نظرية' : 'תיאוריה',
    psychology: lang === 'ar' ? 'علم النفس' : 'פסיכולוגיה',
    dashboard: lang === 'ar' ? 'لوحة التحكم' : 'דשבורד',
    achievements: lang === 'ar' ? 'الإنجازات' : 'הישגים',
    mockExam: lang === 'ar' ? 'امتحان محاكاة' : 'בחינה מדומה',
    examAchievements: lang === 'ar' ? 'إنجازات الامتحانات' : 'הישגי בחינות',
    selectQuestion: lang === 'ar' ? 'اختيار سؤال' : 'בחירת שאלה',
    chatWithGpt: lang === 'ar' ? 'دردشة مع GPT' : "צ'אט עם GPT",
    errorAnalysis: lang === 'ar' ? 'تحليل أنماط الأخطاء' : 'ניתוח דפוסי טעויות',
    chartsDashboard: lang === 'ar' ? 'لوحة الرسوم البيانية' : 'דשבורד גרפים',
    streakDashboard: lang === 'ar' ? 'لوحة الرصيد' : 'רצף למידה',
    virtualTeacher: lang === 'ar' ? 'المعلم الافتراضي' : 'המורה הוירטואלי',
    commonErrors: lang === 'ar' ? 'الأخطاء الشائعة' : 'טעויות נפוצות',
    studyCards: lang === 'ar' ? 'بطاقات الدراسة' : 'כרטיסיות לימוד',
    "חוקי התנועה": lang === 'ar' ? 'قوانين المرور' : 'חוקי התנועה',
    "תמרורים": lang === 'ar' ? 'إشارات المرور' : 'תמרורים',
    "בטיחות": lang === 'ar' ? 'السلامة' : 'בטיחות',
    "הכרת הרכב": lang === 'ar' ? 'معرفة المركبة' : 'הכרת הרכב',
    "ניהול לחץ": lang === 'ar' ? 'إدارة الضغط' : 'ניהול לחץ',
    "קבלת החלטות": lang === 'ar' ? 'اتخاذ القرار' : 'קבלת החלטות',
    "הערכת סיכונים": lang === 'ar' ? 'تقييم المخاطر' : 'הערכת סיכונים',
    "שליטה רגשית": lang === 'ar' ? 'التحكم العاطفي' : 'שליטה רגשית'
  };

  // מחק/השבת את כל הקריאות ל-useUserProgress וה-useEffect שתלוי בו
  // השאר רק את ה-useEffect שמבצע fetchAndSetProgress עם fetchTopicProgress

  // טעינה דינמית של נתוני התקדמות מהשרת
  useEffect(() => {
    if (!user || !validateUser(user)) {
      setIsLoading(false);
      setError('משתמש לא תקין');
      return;
    }
    
    fetchUserProgressData();
  }, [user?.id]); // רק כש-user.id משתנה

  const fetchUserProgressData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // טעינת נתוני התקדמות מהשרת
      const progressData = await withLoading(
        setGlobalLoading,
        () => fetchTopicProgress(user.id, lang),
        'טוען נתוני התקדמות...'
      );
      
      console.log('📊 Sidebar: Progress data received:', progressData);
      
      // עיבוד הנתונים
      if (progressData && typeof progressData === 'object') {
        let userProgress = progressData;
        
        // אם הנתונים מגיעים בפורמט מקונן
        if (progressData[user.id]) {
          userProgress = progressData[user.id];
        }
        
        // הנתונים מגיעים ישירות מה-API בפורמט: {category: {solved: X, total: Y}}
        console.log('📊 Sidebar: Raw API data:', progressData);
        
        // חישוב נתוני תיאוריה
        const theorySubProgressData = {};
        let totalCompleted = 0;
        let totalQuestions = 0;
        
        // נושאי תיאוריה עיקריים
        const theoryCategories = ['חוקי התנועה', 'תמרורים', 'בטיחות', 'הכרת הרכב'];
        
        theoryCategories.forEach(category => {
          const categoryData = progressData[category] || { solved: 0, total: 0 };
          const percent = categoryData.total > 0 ? Math.round((categoryData.solved / categoryData.total) * 100) : 0;
          
          theorySubProgressData[category] = {
            percent: percent,
            total: categoryData.total,
            completed: categoryData.solved // ה-API מחזיר 'solved' לא 'completed'
          };
          
          totalCompleted += categoryData.solved;
          totalQuestions += categoryData.total;
        });
        
        // חישוב התקדמות כללית
        const overallProgress = totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;
        
        // עדכון ה-state וה-Context
        initializeProgress({
          theoryProgress: overallProgress,
          theorySubProgress: theorySubProgressData
        });
        
        // נתוני פסיכולוגיה (זמניים)
        setPsychologyProgress(60);
        setPsychologySubProgress({
          'קבלת החלטות': { percent: 70, total: 100, completed: 70 },
          'תפיסה וקשב': { percent: 55, total: 100, completed: 55 }
        });
        
        console.log('📊 Sidebar: Updated progress - Overall:', overallProgress, '%, Categories:', theorySubProgressData);
        
      } else {
        throw new Error('Invalid progress data format');
      }
      
    } catch (err) {
      console.error('❌ Sidebar: Error fetching progress:', err);
      setError('שגיאה בטעינת נתוני התקדמות');
      
      // נתוני fallback במקרה של שגיאה (מבוססים על הנתונים האמיתיים מה-API)
      const fallbackData = {
        'חוקי התנועה': { percent: 5, total: 950, completed: 49 },
        'תמרורים': { percent: 4, total: 382, completed: 17 },
        'בטיחות': { percent: 2, total: 370, completed: 8 },
        'הכרת הרכב': { percent: 16, total: 100, completed: 16 }
      };
      
      initializeProgress({
        theoryProgress: 5,
        theorySubProgress: fallbackData
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  // ביטול מוחלט של event listeners כדי למנוע ריפרשים
  // useEffect(() => {
  //   // מבוטל לחלוטין
  // }, []);

  // ביטול קריאות topics כדי למנוע ריפרשים
  useEffect(() => {
    // נתונים סטטיים במקום קריאת שרת - מתבסס על הנתונים האמיתיים מהמאגר
    setTheoryTopics(['חוקי התנועה', 'תמרורים', 'בטיחות', 'הכרת הרכב']);
  }, []); // רק פעם אחת

  useEffect(() => {
    // נתונים אמיתיים מהמאגר - מתאים לנתוני userProgress.json
    setTopicCounts({
      'חוקי התנועה': 950,
      'תמרורים': 382,
      'בטיחות': 370,
      'הכרת הרכב': 100
    });
  }, []); // רק פעם אחת

  const isActive = (path) => location.pathname === path;

  const ProgressBar = ({ progress, color, questionsCount, topicKey, completedCount = 0, labels, isMain = false, isClickable = false }) => {
    const safeProgress = isNaN(progress) ? 0 : Math.round(progress);
    const safeCompleted = isNaN(completedCount) ? 0 : completedCount;
    const safeTotal = isNaN(questionsCount) ? 0 : questionsCount;
    
    // שימוש בפונקציות העיצוב החדשות
    const dynamicColor = getProgressColor(safeProgress);
    const icon = getProgressIcon(topicKey, safeProgress);
    const motivationalMsg = getMotivationalMessage(safeProgress);
    
    // חישוב סטטיסטיקות מפורטות
    const detailedStats = calculateDetailedStats(topicKey, safeCompleted, safeTotal);
    const tooltipContent = generateTooltipContent(topicKey, detailedStats);
    
    const handleClick = () => {
      if (isClickable && !isMain) {
        // יצירת נתיב לדף הקטגוריה החדש
        const categoryPath = `/category/${encodeURIComponent(topicKey)}`;
        window.location.href = categoryPath;
      }
    };
    
    const progressRowContent = (
      <div 
        className={`progress-row enhanced ${isMain ? 'main-progress' : ''} ${isClickable ? 'clickable-progress' : ''}`}
        onClick={handleClick}
        style={{ 
          cursor: isClickable && !isMain ? 'pointer' : 'default',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <div className="progress-header">
          <div className="topic-info">
            <span className="progress-icon">{icon}</span>
            <span className="topic-name">{labels[topicKey] || topicKey}</span>
          </div>
          <span className="progress-percent" style={{ color: dynamicColor, fontWeight: 'bold' }}>
            {safeProgress}%
          </span>
        </div>
        
        <div className="progress-details">
          <span className="questions-count">
            {safeTotal > 0 ? `${safeCompleted} מתוך ${safeTotal} שאלות` : ''}
          </span>
          {!isMain && (
            <span className="motivational-text" style={{ color: dynamicColor, fontSize: '12px' }}>
              {motivationalMsg}
            </span>
          )}
        </div>
        
        <div className="progress-bar-container enhanced">
          <div 
            className="progress-bar animated" 
            style={{ 
              width: `${safeProgress}%`, 
              backgroundColor: dynamicColor,
              background: `linear-gradient(90deg, ${dynamicColor}, ${dynamicColor}cc)`,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `0 2px 8px ${dynamicColor}40`,
              position: 'relative',
              overflow: 'hidden'
            }} 
          >
            <div 
              className="progress-shine"
              style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: safeProgress > 0 ? 'shine 2s infinite' : 'none'
              }}
            />
          </div>
        </div>
        
      </div>
    );
    
    // עטיפה ב-Tooltip - גם לפס הראשי עם סטטיסטיקות כלליות
    if (isMain) {
      const overallStats = {
        totalQuestions: Object.values(theorySubProgress).reduce((sum, item) => sum + (item.total || 0), 0),
        totalCompleted: Object.values(theorySubProgress).reduce((sum, item) => sum + (item.completed || 0), 0),
        categories: Object.keys(theorySubProgress).length,
        averageProgress: Math.round(Object.values(theorySubProgress).reduce((sum, item) => sum + (item.percent || 0), 0) / Math.max(1, Object.keys(theorySubProgress).length))
      };
      
      const overallTooltipContent = (
        <div className="tooltip-content-wrapper">
          <div className="tooltip-header">
            <strong>📊 סיכום כללי</strong>
          </div>
          <div className="tooltip-divider"></div>
          
          <div className="tooltip-stat-row">
            <span className="tooltip-stat-label">📝 סה"כ שאלות:</span>
            <span className="tooltip-stat-value">{overallStats.totalQuestions}</span>
          </div>
          
          <div className="tooltip-stat-row">
            <span className="tooltip-stat-label">✅ נענו:</span>
            <span className="tooltip-stat-value">{overallStats.totalCompleted}</span>
          </div>
          
          <div className="tooltip-stat-row">
            <span className="tooltip-stat-label">📂 נושאים:</span>
            <span className="tooltip-stat-value">{overallStats.categories}</span>
          </div>
          
          <div className="tooltip-stat-row">
            <span className="tooltip-stat-label">📈 ממוצע:</span>
            <span className="tooltip-stat-value">{overallStats.averageProgress}%</span>
          </div>
          
          <div className="tooltip-divider"></div>
          
          <div className="tooltip-stat-row">
            <span className="tooltip-stat-label">🎯 יעד:</span>
            <span className="tooltip-stat-value" style={{ color: '#27ae60' }}>100%</span>
          </div>
          
          <div className="tooltip-stat-row">
            <span className="tooltip-stat-label">🚀 נותרו:</span>
            <span className="tooltip-stat-value">{overallStats.totalQuestions - overallStats.totalCompleted} שאלות</span>
          </div>
        </div>
      );
      
      return (
        <Tooltip content={overallTooltipContent} position="left" delay={200}>
          {progressRowContent}
        </Tooltip>
      );
    }
    
    return (
      <Tooltip content={tooltipContent} position="left" delay={200}>
        {progressRowContent}
      </Tooltip>
    );
  };

  if (isLoading) {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>{labels.menu}</h2>
        </div>
        <div className="sidebar-content">
          <div className="loading-message">טוען נתונים...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>{labels.menu}</h2>
        </div>
        <div className="sidebar-content">
          <div className="error-message" style={{ 
            color: '#e74c3c', 
            padding: '10px', 
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {error}
            <button 
              onClick={fetchUserProgressData}
              style={{
                display: 'block',
                margin: '10px auto',
                padding: '5px 10px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h2>{labels.menu}</h2>
          <NotificationCenter />
        </div>
      </div>

      <div className="sidebar-content">
        {/* רצף למידה */}
        <div className="sidebar-section streak-section">
          <StreakBadge />
        </div>
        <div className="sidebar-section">
          <h3>{labels.theory}</h3>
          <ProgressBar 
            progress={theoryProgress} 
            color="#3498db" 
            topicKey={labels.theory} 
            labels={labels}
            questionsCount={Object.values(theorySubProgress).reduce((sum, data) => sum + (data.total || 0), 0)}
            completedCount={Object.values(theorySubProgress).reduce((sum, data) => sum + (data.completed || 0), 0)}
            isMain={true}
          />
          <div className="sub-subjects">
            {Object.entries(theorySubProgress).map(([category, data]) => (
              <ProgressBar
                key={category}
                progress={data.percent || 0}
                color="#2980b9"
                questionsCount={data.total || 0}
                completedCount={data.completed || 0}
                topicKey={category}
                labels={labels}
                isClickable={true}
              />
            ))}
          </div>
          <Link to="/theory/dashboard" className={`sidebar-link ${isActive('/theory/dashboard') ? 'active' : ''}`}>
            <Icon name="dashboard" />
            {labels.dashboard}
          </Link>
          <Link to="/achievements" className={`sidebar-link ${isActive('/achievements') ? 'active' : ''}`}>
            <Icon name="achievements" />
            {labels.achievements}
          </Link>
          <Link to="/mock-exam" className={`sidebar-link ${isActive('/mock-exam') ? 'active' : ''}`}>
            <Icon name="exam" />
            {labels.mockExam}
          </Link>
          <Link to="/exam-achievements" className={`sidebar-link ${isActive('/exam-achievements') ? 'active' : ''}`}>
            <Icon name="achievements" />
            {labels.examAchievements}
          </Link>
          <Link to="/theory/questions" className={`sidebar-link ${isActive('/theory/questions') ? 'active' : ''}`}>
            <Icon name="question" />
            {labels.selectQuestion}
          </Link>
          <Link to="/theory/chat" className={`sidebar-link ${isActive('/theory/chat') ? 'active' : ''}`}>
            <Icon name="chat" />
            {labels.chatWithGpt}
          </Link>
          <Link to="/common-errors" className={`sidebar-link ${isActive('/common-errors') ? 'active' : ''}`}>
            <Icon name="errors" />
            {labels.commonErrors}
          </Link>
          <Link to="/study-cards" className={`sidebar-link ${isActive('/study-cards') ? 'active' : ''}`}>
            <Icon name="cards" />
            {labels.studyCards}
          </Link>
          <Link to="/error-analysis" className={`sidebar-link ${isActive('/error-analysis') ? 'active' : ''}`}>
            <Icon name="analytics" />
            {labels.errorAnalysis}
          </Link>
          <Link to="/charts-dashboard" className={`sidebar-link ${isActive('/charts-dashboard') ? 'active' : ''}`}>
            <Icon name="dashboard" />
            {labels.chartsDashboard}
          </Link>
          <Link to="/streak-dashboard" className={`sidebar-link ${isActive('/streak-dashboard') ? 'active' : ''}`}>
            <Icon name="fire" />
            {labels.streakDashboard}
          </Link>
          <Link to="/virtual-teacher" className={`sidebar-link ${isActive('/virtual-teacher') ? 'active' : ''}`}>
            <Icon name="teacher" />
            {labels.virtualTeacher}
          </Link>
        </div>

        <div className="sidebar-section">
          <h3>{labels.psychology}</h3>
          <ProgressBar 
            progress={psychologyProgress} 
            color="#e74c3c" 
            topicKey={labels.psychology} 
            labels={labels}
            questionsCount={Object.values(psychologySubProgress).reduce((sum, data) => sum + (data.total || 0), 0)}
            completedCount={Object.values(psychologySubProgress).reduce((sum, data) => sum + (data.completed || 0), 0)}
            isMain={true}
          />
          <div className="sub-subjects">
            {Object.entries(psychologySubProgress).map(([key, data]) => (
              <ProgressBar
                key={key}
                progress={data.percent || 0}
                color="#c0392b"
                questionsCount={data.total || 0}
                completedCount={data.completed || 0}
                topicKey={key}
                labels={labels}
                isClickable={true}
              />
            ))}
          </div>
          <Link to="/psychology/questions" className={`sidebar-link ${isActive('/psychology/questions') ? 'active' : ''}`}>{labels.selectQuestion}</Link>
          <Link to="/psychology/chat" className={`sidebar-link ${isActive('/psychology/chat') ? 'active' : ''}`}>{labels.chatWithGpt}</Link>
        </div>
        
        {/* Theme Toggle */}
        <div className="sidebar-theme-section">
          <div className="theme-toggle-wrapper">
            <ThemeToggle size="medium" showLabel={true} showAutoMode={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
