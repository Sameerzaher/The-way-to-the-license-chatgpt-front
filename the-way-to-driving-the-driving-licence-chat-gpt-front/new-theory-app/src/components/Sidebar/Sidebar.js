import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import {
  // fetchUserProgress, // Removed as not used
  fetchTopicProgress,
  // processProgressData, // Removed as not used
  calculateProgress,
  calculateAverageProgress
} from '../../services/userService';

// useUserProgress function removed as it's not being used

const Sidebar = ({ user, lang }) => {
  const location = useLocation();

  const [theoryProgress, setTheoryProgress] = useState(0);
  const [psychologyProgress, setPsychologyProgress] = useState(0);
  const [theorySubProgress, setTheorySubProgress] = useState({});
  const [psychologySubProgress, setPsychologySubProgress] = useState({});
  const [theoryTopics, setTheoryTopics] = useState([]); // Actually needed
  const [topicCounts, setTopicCounts] = useState({}); // Actually needed
  // const [topicProgress, setTopicProgress] = useState({}); // Removed as not used
  const [isLoading, setIsLoading] = useState(true);

  const labels = {
    menu: lang === 'ar' ? 'القائمة' : 'תפריט',
    theory: lang === 'ar' ? 'نظرية' : 'תיאוריה',
    psychology: lang === 'ar' ? 'علم النفس' : 'פסיכולוגיה',
    dashboard: lang === 'ar' ? 'لوحة التحكم' : 'דשבורד',
    selectQuestion: lang === 'ar' ? 'اختيار سؤال' : 'בחירת שאלה',
    chatWithGpt: lang === 'ar' ? 'دردشة مع GPT' : "צ'אט עם GPT",
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

  // ביטול מוחלט של כל קריאות API ב-Sidebar
  useEffect(() => {
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }
    
    // נתונים סטטיים פשוטים
    setTheoryProgress(75);
    setPsychologyProgress(60);
    setTheorySubProgress({
      'חוקי התנועה': { percent: 80, total: 100, completed: 80 },
      'תמרורים': { percent: 70, total: 100, completed: 70 },
      'בטיחות בדרכים': { percent: 85, total: 100, completed: 85 },
      'הכרת הרכב': { percent: 65, total: 100, completed: 65 }
    });
    setPsychologySubProgress({
      'קבלת החלטות': { percent: 70, total: 100, completed: 70 },
      'תפיסה וקשב': { percent: 55, total: 100, completed: 55 }
    });
    setIsLoading(false);
  }, [user?.id]); // רק כש-user.id משתנה

  // ביטול מוחלט של event listeners כדי למנוע ריפרשים
  // useEffect(() => {
  //   // מבוטל לחלוטין
  // }, []);

  // ביטול קריאות topics כדי למנוע ריפרשים
  useEffect(() => {
    // נתונים סטטיים במקום קריאת שרת
    setTheoryTopics(['חוקי התנועה', 'תמרורים', 'בטיחות בדרכים', 'הכרת הרכב']);
  }, []); // רק פעם אחת

  useEffect(() => {
    // נתונים סטטיים במקום קריאת שרת
    setTopicCounts({
      'חוקי התנועה': 150,
      'תמרורים': 120,
      'בטיחות בדרכים': 100,
      'הכרת הרכב': 80
    });
  }, []); // רק פעם אחת

  const isActive = (path) => location.pathname === path;

  const ProgressBar = ({ progress, color, questionsCount, topicKey, completedCount = 0, labels, isMain = false, isClickable = false }) => {
    const safeProgress = isNaN(progress) ? 0 : Math.round(progress);
    const safeCompleted = isNaN(completedCount) ? 0 : completedCount;
    const safeTotal = isNaN(questionsCount) ? 0 : questionsCount;
    
    const handleClick = () => {
      if (isClickable && !isMain) {
        // יצירת נתיב לדף הקטגוריה החדש
        const categoryPath = `/category/${encodeURIComponent(topicKey)}`;
        window.location.href = categoryPath;
      }
    };
    
    return (
      <div 
        className={`progress-row ${isMain ? 'main-progress' : ''} ${isClickable ? 'clickable-progress' : ''}`}
        onClick={handleClick}
        style={{ cursor: isClickable && !isMain ? 'pointer' : 'default' }}
      >
        <span className="topic-name">{labels[topicKey] || topicKey}</span>
        <span className="questions-count">
          {safeTotal > 0 ? `${safeCompleted} מתוך ${safeTotal} שאלות` : ''}
        </span>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${safeProgress}%`, 
              background: color || '#3498db',
              backgroundImage: `linear-gradient(90deg, ${color || '#3498db'}, ${color || '#3498db'}dd)`
            }} 
          />
        </div>
        <span className="progress-percent">{safeProgress}%</span>
      </div>
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

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>{labels.menu}</h2>
      </div>

      <div className="sidebar-content">
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
          <Link to="/theory/dashboard" className={`sidebar-link ${isActive('/theory/dashboard') ? 'active' : ''}`}>{labels.dashboard}</Link>
          <Link to="/theory/questions" className={`sidebar-link ${isActive('/theory/questions') ? 'active' : ''}`}>{labels.selectQuestion}</Link>
          <Link to="/theory/chat" className={`sidebar-link ${isActive('/theory/chat') ? 'active' : ''}`}>{labels.chatWithGpt}</Link>
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
      </div>
    </div>
  );
};

export default Sidebar;
