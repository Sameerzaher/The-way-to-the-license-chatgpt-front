import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CategoryPage.css';
import {
  // fetchUserProgress, // Removed as not used
  fetchTopicProgress,
  // processProgressData, // Removed as not used
  calculateProgress
  // calculateAverageProgress // Removed as not used
} from '../../services/userService';

// Debounce mechanism to prevent rapid API calls
let lastFetchTime = 0;
const DEBOUNCE_DELAY = 2000; // 2 seconds

const CategoryPage = ({ user, lang }) => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wrongQuestionsCount, setWrongQuestionsCount] = useState(0);
  const [correctQuestionsCount, setCorrectQuestionsCount] = useState(0);

  const labels = {
    back: lang === 'ar' ? 'رجوع' : 'חזור',
    categoryTitle: lang === 'ar' ? 'تفاصيل الموضوع' : 'פרטי הנושא',
    progress: lang === 'ar' ? 'التقدم' : 'התקדמות',
    questions: lang === 'ar' ? 'الأسئلة' : 'שאלות',
    completed: lang === 'ar' ? 'مكتمل' : 'הושלם',
    remaining: lang === 'ar' ? 'متبقي' : 'נותר',
    wrong: lang === 'ar' ? 'خاطئ' : 'שגויות',
    correct: lang === 'ar' ? 'صحيح' : 'נכונות',
    percentage: lang === 'ar' ? 'النسبة المئوية' : 'אחוז',
    startQuestions: lang === 'ar' ? 'ابدأ الأسئلة المتبقية' : 'התחל שאלות שנותרו',
    reviewCompleted: lang === 'ar' ? 'مراجعة الأسئلة المكتملة' : 'סקור שאלות שהושלמו',
    reviewWrong: lang === 'ar' ? 'مراجعة الأسئلة الخاطئة' : 'סקור שאלות שגויות',
    reviewCorrect: lang === 'ar' ? 'مراجعة الأسئلة الصحيحة' : 'סקור שאלות נכונות',
    chatWithGpt: lang === 'ar' ? 'دردشة مع GPT' : "צ'אט עם GPT",
    loading: lang === 'ar' ? 'جاري التحميل...' : 'טוען נתונים...',
    error: lang === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'שגיאה בטעינת הנתונים',
    "חוקי התנועה": lang === 'ar' ? 'قوانين المرور' : 'חוקי התנועה',
    "תמרורים": lang === 'ar' ? 'إشارات المرور' : 'תמרורים',
    "בטיחות": lang === 'ar' ? 'السلامة' : 'בטיחות',
    "הכרת הרכב": lang === 'ar' ? 'معرفة المركبة' : 'הכרת הרכב',
    "ניהול לחץ": lang === 'ar' ? 'إدارة الضغط' : 'ניהול לחץ',
    "קבלת החלטות": lang === 'ar' ? 'اتخاذ القرار' : 'קבלת החלטות',
    "הערכת סיכונים": lang === 'ar' ? 'تقييم المخاطر' : 'הערכת סיכונים',
    "שליטה רגשית": lang === 'ar' ? 'التحكم العاطفي' : 'שליטה רגשית'
  };


  useEffect(() => {
    // פונקציה לספירת שאלות שגויות - נשתמש בנתונים מה-progress
    const calculateWrongQuestionsCount = async (userProgress, category) => {
      try {
        console.log('🔍 DEBUG - Calculating wrong questions for category:', category);
        
        if (!user || !user.id) {
          return 0;
        }
        
        // שלוף שאלות שגויות מהשרת עם סינון לפי נושא
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/progress/${user.id}/wrong?subject=${encodeURIComponent(category)}&lang=${lang}`);
        
        if (response.ok) {
          const wrongQuestions = await response.json();
          console.log('🔍 DEBUG - Wrong questions from server:', wrongQuestions.length);
          return wrongQuestions.length;
        } else {
          console.log('🔍 DEBUG - Fallback to local calculation for wrong questions');
          // Fallback to local calculation if server request fails
          const allQuestions = userProgress?.completedQuestions || userProgress?.questions || [];
          let wrongCount = 0;
          
          for (const question of allQuestions) {
            if (question.isCorrect === false) {
              wrongCount++;
            }
          }
          
          return wrongCount;
        }
        
      } catch (error) {
        console.error('Error calculating wrong questions count:', error);
        return 0;
      }
    };

    // פונקציה לספירת שאלות נכונות - נשתמש בנתונים מה-progress
    const calculateCorrectQuestionsCount = async (userProgress, category) => {
      try {
        console.log('🔍 DEBUG - Calculating correct questions for category:', category);
        
        if (!user || !user.id) {
          return 0;
        }
        
        // שלוף שאלות נכונות מהשרת עם סינון לפי נושא
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/progress/${user.id}/completed?subject=${encodeURIComponent(category)}&lang=${lang}`);
        
        if (response.ok) {
          const correctQuestions = await response.json();
          console.log('🔍 DEBUG - Correct questions from server:', correctQuestions.length);
          return correctQuestions.length;
        } else {
          console.log('🔍 DEBUG - Fallback to local calculation for correct questions');
          // Fallback to local calculation if server request fails
          const allQuestions = userProgress?.completedQuestions || userProgress?.questions || [];
          let correctCount = 0;
          
          for (const question of allQuestions) {
            if (question.isCorrect === true) {
              correctCount++;
            }
          }
          
          return correctCount;
        }
        
      } catch (error) {
        console.error('Error calculating correct questions count:', error);
        return 0;
      }
    };

    const fetchCategoryData = async () => {
      if (!user || !user.id || !category) {
        setError('נתונים חסרים');
        setIsLoading(false);
        return;
      }

      // Debounce mechanism - prevent rapid successive calls
      const now = Date.now();
      if (now - lastFetchTime < DEBOUNCE_DELAY) {
        console.log('CategoryPage: Debouncing API call, too soon since last call');
        setIsLoading(false);
        return;
      }
      lastFetchTime = now;

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchTopicProgress(user.id, lang);
        console.log('CategoryPage fetchTopicProgress response:', data);
        console.log('CategoryPage raw data structure:', JSON.stringify(data, null, 2));
        
        let userProgress = data;
        if (data && typeof data === 'object' && data[user.id]) {
          userProgress = data[user.id];
          console.log('CategoryPage userProgress extracted:', userProgress);
        }

        const categoryProgress = userProgress.progressByCategory ? userProgress.progressByCategory : userProgress;
        console.log('CategoryPage categoryProgress:', categoryProgress);
        const progressData = calculateProgress(categoryProgress, category);
        console.log('CategoryPage progressData:', progressData);
        
        // חישוב מספר השאלות השגויות - נשתמש בנתוני המשתמש המלאים
        const wrongCount = await calculateWrongQuestionsCount(userProgress, category);
        console.log('CategoryPage calculated wrongCount:', wrongCount);
        setWrongQuestionsCount(wrongCount);
        
        // חישוב מספר השאלות הנכונות
        const correctCount = await calculateCorrectQuestionsCount(userProgress, category);
        console.log('CategoryPage calculated correctCount:', correctCount);
        setCorrectQuestionsCount(correctCount);
        
        setCategoryData({
          name: category,
          progress: progressData.percent || 0,
          total: progressData.total || 0,
          completed: progressData.completed || 0,
          remaining: (progressData.total || 0) - (progressData.completed || 0)
        });

      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('שגיאה בטעינת נתוני הקטגוריה');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [user?.id, category, lang]);

  const handleStartQuestions = () => {
    // ניתוב לשאלות עם פילטר לשאלות שנותרו לפתור
    const params = new URLSearchParams({
      category: category,
      filter: 'remaining', // פילטר לשאלות שנותרו
      lang: lang
    });
    navigate(`/theory/questions?${params.toString()}`);
  };

  // const handleReviewCompleted = () => {
  //   // ניתוב לשאלות שהושלמו
  //   const params = new URLSearchParams({
  //     category: category,
  //     filter: 'completed', // פילטר לשאלות שהושלמו
  //     lang: lang
  //   });
  //   navigate(`/theory/questions?${params.toString()}`);
  // };

  const handleReviewWrong = () => {
    // ניתוב לשאלות שגויות
    const params = new URLSearchParams({
      category: category,
      filter: 'wrong', // פילטר לשאלות שגויות
      lang: lang
    });
    navigate(`/theory/questions?${params.toString()}`);
  };

  const handleReviewCorrect = () => {
    // ניתוב לשאלות נכונות
    const params = new URLSearchParams({
      category: category,
      filter: 'completed', // פילטר לשאלות נכונות (completed = correct)
      lang: lang
    });
    navigate(`/theory/questions?${params.toString()}`);
  };

  // const handleChatWithGPT = () => {
  //   navigate(`/theory/chat?category=${encodeURIComponent(category)}`);
  // };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-button" onClick={handleBack}>
            ← {labels.back}
          </button>
          <h1>{labels.loading}</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !categoryData) {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-button" onClick={handleBack}>
            ← {labels.back}
          </button>
          <h1>{labels.error}</h1>
        </div>
        <div className="error-container">
          <p>{error || 'לא נמצאו נתונים לקטגוריה זו'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <button className="back-button" onClick={handleBack}>
          ← {labels.back}
        </button>
        <h1>{labels[category] || category}</h1>
      </div>

      <div className="category-content">
        <div className="category-info-card">
          <div className="category-title">
            <h2>{labels[category] || category}</h2>
            <p className="category-description">
              {labels.categoryTitle}
            </p>
          </div>

          <div className="progress-section">
            <h3>{labels.progress}</h3>
            <div className="progress-stats">
              <div className="stat-item">
                <span className="stat-label">{labels.remaining}</span>
                <span className="stat-value remaining">{categoryData.remaining}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{labels.correct}</span>
                <span className="stat-value correct">{correctQuestionsCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{labels.wrong}</span>
                <span className="stat-value wrong">{wrongQuestionsCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{labels.questions}</span>
                <span className="stat-value total">{categoryData.total}</span>
              </div>
            </div>

            <div className="progress-bar-large">
              <div className="progress-bar-container-large">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${categoryData.progress}%` }}
                ></div>
              </div>
              <span className="progress-percentage">{categoryData.progress}%</span>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="action-button primary"
              onClick={handleStartQuestions}
              title={`התחל לפתור את ${categoryData.remaining} השאלות שנותרו בנושא ${labels[category] || category}`}
            >
              {labels.startQuestions}
              <span className="button-subtitle">
                ({categoryData.remaining} שאלות שנותרו)
              </span>
            </button>
            {correctQuestionsCount > 0 && (
              <button 
                className="action-button tertiary"
                onClick={handleReviewCorrect}
                title={`סקור את ${correctQuestionsCount} השאלות שפתרת נכון בנושא ${labels[category] || category}`}
              >
                {labels.reviewCorrect}
                <span className="button-subtitle">
                  ({correctQuestionsCount} שאלות נכונות)
                </span>
              </button>
            )}
            <button 
              className="action-button wrong"
              onClick={handleReviewWrong}
              title={wrongQuestionsCount > 0 
                ? `סקור את ${wrongQuestionsCount} השאלות שטעית בהן בנושא ${labels[category] || category}`
                : `סקור שאלות שגויות בנושא ${labels[category] || category} (אין שאלות שגויות כרגע)`}
            >
              {labels.reviewWrong}
              <span className="button-subtitle">
                ({wrongQuestionsCount > 0 ? `${wrongQuestionsCount} שאלות שגויות` : 'אין שאלות שגויות'})
              </span>
            </button>
       
            
          </div>
        </div>

        <div className="category-details">
          <div className="detail-card">
            <h4>פרטים נוספים</h4>
            <div className="detail-item">
              <span>קטגוריה:</span>
              <span>{labels[category] || category}</span>
            </div>
            <div className="detail-item">
              <span>סטטוס:</span>
              <span className={categoryData.progress === 100 ? 'completed' : 'in-progress'}>
                {categoryData.progress === 100 ? 'הושלם' : 'בתהליך'}
              </span>
            </div>
            <div className="detail-item">
              <span>התקדמות:</span>
              <span>{categoryData.progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
