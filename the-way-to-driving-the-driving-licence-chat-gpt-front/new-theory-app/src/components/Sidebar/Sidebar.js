import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import {
  fetchUserProgress,
  fetchTopicProgress,
  processProgressData,
  calculateProgress,
  calculateAverageProgress
} from '../../services/userService';

function useUserProgress(user) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getProgress() {
      setError(null);
      if (!user || !user.id) return setProgress(null);
      try {
        const data = await fetchUserProgress();
        setProgress(data);
      } catch (err) {
        console.error("שגיאה בשליפת התקדמות:", err);
        setError("שגיאה בשליפת התקדמות");
        setProgress(null);
      }
    }
    getProgress();
  }, [user]);

  return { progress, error };
}

const Sidebar = ({ user, lang }) => {
  const location = useLocation();

  const [theoryProgress, setTheoryProgress] = useState(0);
  const [psychologyProgress, setPsychologyProgress] = useState(0);
  const [theorySubProgress, setTheorySubProgress] = useState({});
  const [psychologySubProgress, setPsychologySubProgress] = useState({});
  const [theoryTopics, setTheoryTopics] = useState([]);
  const [topicCounts, setTopicCounts] = useState({});
  const [topicProgress, setTopicProgress] = useState({});

  const labels = {
    menu: lang === 'ar' ? 'القائمة' : 'תפריט',
    theory: lang === 'ar' ? 'نظرية' : 'תיאוריה',
    psychology: lang === 'ar' ? 'علم النفس' : 'פסיכולוגיה',
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

  useEffect(() => {
    async function fetchAndSetProgress() {
      if (!user || !user.id) {
        console.log('No user or user.id:', user);
        return;
      }
      console.log('Sidebar user.id:', user.id);
      try {
        const data = await fetchTopicProgress(user.id, lang);
        console.log('Sidebar fetchTopicProgress response:', data);
        // If data has userId as a key, extract it
        let userProgress = data;
        if (data && typeof data === 'object' && data[user.id]) {
          userProgress = data[user.id];
        }
        console.log('Extracted userProgress:', userProgress);
        // תקן: תוציא את הקטגוריות נכון גם אם זה כבר האובייקט עצמו
        const categoryProgress = userProgress.progressByCategory ? userProgress.progressByCategory : userProgress;
        console.log('categoryProgress:', categoryProgress);

        const theoryCategories = ["חוקי התנועה", "תמרורים", "בטיחות", "הכרת הרכב"];
        const mapped = {};
        console.log('DEBUG: categoryProgress:', categoryProgress);
        theoryCategories.forEach(cat => {
          console.log('DEBUG: cat:', cat, 'data:', categoryProgress[cat]);
          mapped[cat] = calculateProgress(categoryProgress, cat);
          console.log(`DEBUG: Progress for ${cat}:`, mapped[cat]);
        });
        setTheorySubProgress(mapped);
        setTheoryProgress(calculateAverageProgress(categoryProgress, theoryCategories));

        const psychCats = ["ניהול לחץ", "קבלת החלטות", "הערכת סיכונים", "שליטה רגשית"];
        const psychProgress = {};
        psychCats.forEach(cat => {
          psychProgress[cat] = calculateProgress(categoryProgress, cat);
          console.log(`Progress for ${cat}:`, psychProgress[cat]);
        });
        setPsychologySubProgress(psychProgress);
        setPsychologyProgress(calculateAverageProgress(categoryProgress, psychCats));
      } catch (err) {
        console.error('Error fetching topic progress:', err);
      }
    }
    fetchAndSetProgress();
  }, [user, lang]);

  useEffect(() => {
    const fetchTopics = async () => {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      try {
        const res = await fetch(`${apiUrl}/questions/topics?lang=${lang}`);
        const data = await res.json();
        setTheoryTopics(Array.isArray(data) ? data : []);
      } catch {
        setTheoryTopics([]);
      }
    };
    fetchTopics();
  }, [lang]);

  useEffect(() => {
    const fetchCounts = async () => {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      try {
        const res = await fetch(`${apiUrl}/questions/counts?lang=${lang}`);
        const data = await res.json();
        setTopicCounts(data);
      } catch {
        setTopicCounts({});
      }
    };
    fetchCounts();
  }, [lang]);

  const isActive = (path) => location.pathname === path;

  const ProgressBar = ({ progress, color, questionsCount, topicKey, completedCount = 0, labels }) => (
    <div className="progress-row">
      <span className="topic-name">{labels[topicKey] || topicKey}</span>
      <span className="questions-count">
        {typeof questionsCount === 'number' && questionsCount > 0
          ? `${completedCount} מתוך ${questionsCount} שאלות`
          : ''}
      </span>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${isNaN(progress) ? 0 : progress}%`, background: color || '#3498db' }} />
      </div>
      <span className="progress-percent">{isNaN(progress) ? 0 : progress}%</span>
    </div>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>{labels.menu}</h2>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <h3>{labels.theory}</h3>
          <ProgressBar progress={isNaN(theoryProgress) ? 0 : theoryProgress} color="#3498db" topicKey={labels.theory} labels={labels} />
          <div className="sub-subjects">
            {Object.entries(theorySubProgress).map(([category, data]) => (
              <ProgressBar
                key={category}
                progress={isNaN(data.percent) ? 0 : data.percent}
                color="#2980b9"
                questionsCount={data.total}
                completedCount={data.completed}
                topicKey={category}
                labels={labels}
              />
            ))}
          </div>
          <Link to="/theory/questions" className={`sidebar-link ${isActive('/theory/questions') ? 'active' : ''}`}>{labels.selectQuestion}</Link>
          <Link to="/theory/chat" className={`sidebar-link ${isActive('/theory/chat') ? 'active' : ''}`}>{labels.chatWithGpt}</Link>
        </div>

        <div className="sidebar-section">
          <h3>{labels.psychology}</h3>
          <ProgressBar progress={isNaN(psychologyProgress) ? 0 : psychologyProgress} color="#e74c3c" topicKey={labels.psychology} labels={labels} />
          <div className="sub-subjects">
            {Object.entries(psychologySubProgress).map(([key, data]) => (
              <ProgressBar
                key={key}
                progress={isNaN(data.percent) ? 0 : data.percent}
                color="#e74c3c"
                questionsCount={data.total}
                completedCount={data.completed}
                topicKey={key}
                labels={labels}
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
