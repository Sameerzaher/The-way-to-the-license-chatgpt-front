import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './AILearningSystem.css';

const AILearningSystem = ({ user, lang = 'he' }) => {
  const [aiData, setAiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedWeakness, setSelectedWeakness] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const navigate = useNavigate();

  const labels = {
    he: {
      title: 'מערכת למידה מותאמת אישית',
      subtitle: 'AI חכם שמתאים את הלמידה שלך',
      analysis: 'ניתוח חולשות',
      recommendations: 'המלצות שאלות',
      learningPath: 'מסלול למידה',
      weaknesses: 'חולשות שזוהו',
      noWeaknesses: 'אין חולשות משמעותיות!',
      accuracy: 'דיוק',
      completion: 'השלמה',
      priority: 'עדיפות',
      high: 'גבוהה',
      medium: 'בינונית',
      low: 'נמוכה',
      recommendedQuestions: 'שאלות מומלצות',
      startLearning: 'התחל למידה',
      learningStages: 'שלבי למידה',
      foundations: 'יסודות',
      practice: 'תרגול',
      improvement: 'שיפור',
      estimatedTime: 'זמן משוער',
      progress: 'התקדמות',
      nextStep: 'הצעד הבא',
      overallAnalysis: 'ניתוח כללי',
      learningLevel: 'רמת למידה',
      totalQuestions: 'סה"כ שאלות',
      completedQuestions: 'שאלות שהושלמו',
      averageAccuracy: 'דיוק ממוצע',
      nextSteps: 'צעדים מומלצים',
      focusOn: 'התמקד ב',
      continue: 'המשך',
      loading: 'טוען ניתוח AI...',
      error: 'שגיאה בטעינת ניתוח AI',
      retry: 'נסה שוב',
      refresh: 'רענן ניתוח',
      lastUpdated: 'עודכן לאחרונה'
    },
    ar: {
      title: 'نظام التعلم المخصص',
      subtitle: 'ذكاء اصطناعي ذكي يلائم تعلمك',
      analysis: 'تحليل نقاط الضعف',
      recommendations: 'توصيات الأسئلة',
      learningPath: 'مسار التعلم',
      weaknesses: 'نقاط الضعف المكتشفة',
      noWeaknesses: 'لا توجد نقاط ضعف مهمة!',
      accuracy: 'الدقة',
      completion: 'الإكمال',
      priority: 'الأولوية',
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة',
      recommendedQuestions: 'أسئلة موصى بها',
      startLearning: 'ابدأ التعلم',
      learningStages: 'مراحل التعلم',
      foundations: 'الأساسيات',
      practice: 'الممارسة',
      improvement: 'التحسين',
      estimatedTime: 'الوقت المقدر',
      progress: 'التقدم',
      nextStep: 'الخطوة التالية',
      overallAnalysis: 'التحليل العام',
      learningLevel: 'مستوى التعلم',
      totalQuestions: 'إجمالي الأسئلة',
      completedQuestions: 'الأسئلة المكتملة',
      averageAccuracy: 'متوسط الدقة',
      nextSteps: 'خطوات موصى بها',
      focusOn: 'ركز على',
      continue: 'متابعة',
      loading: 'جاري تحميل تحليل AI...',
      error: 'خطأ في تحميل تحليل AI',
      retry: 'حاول مرة أخرى',
      refresh: 'تحديث التحليل',
      lastUpdated: 'آخر تحديث'
    }
  };

  const currentLabels = useMemo(() => labels[lang] || labels.he, [lang]);

  // ביטול מוחלט של קריאות AI
  useEffect(() => {
    if (user && user.id) {
      // נתונים סטטיים במקום קריאות AI
      setAiData({
        weaknesses: [
          { category: 'מכניקה', accuracy: 65, completion: 40, priority: 'high' },
          { category: 'חוקי חנייה', accuracy: 70, completion: 60, priority: 'medium' }
        ],
        recommendations: [
          { category: 'מכניקה', questions: [], reasoning: 'צריך שיפור בתחום זה' }
        ],
        learningPath: [
          { stage: 'foundations', category: 'מכניקה', estimatedTime: 30, progress: 0 }
        ],
        overallAnalysis: {
          learningLevel: 'intermediate',
          totalQuestions: 245,
          completedQuestions: 180,
          averageAccuracy: 76,
          nextSteps: ['התמקד במכניקה', 'תרגל חוקי חנייה']
        }
      });
      setIsLoading(false);
    }
  }, [user?.id]); // רק כש-user.id משתנה

  // הסרת רענון אוטומטי - יגרום לרפרשים מיותרים
  // useEffect(() => {
  //   if (!user || !user.id) return;

  //   const interval = setInterval(() => {
  //     console.log('🔄 Auto-refreshing AI analysis...');
  //     fetchAIAnalysis();
  //   }, 300000); // 5 דקות במקום 30 שניות

  //   return () => clearInterval(interval);
  // }, [user?.id, lang]); // dependencies ספציפיות יותר

  const fetchAIAnalysis = async () => {
    try {
      // debouncing - מניעת קריאות מרובות
      const now = Date.now();
      if (now - lastFetchTime < 10000) { // לא יותר מפעם ב-10 שניות
        return;
      }
      setLastFetchTime(now);
      
      setIsLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/ai-learning/${user.id}/analysis?lang=${lang}`);
      
      if (response.ok) {
        const responseText = await response.text();
        try {
          const data = JSON.parse(responseText);
          setAiData(data);
          setLastUpdated(new Date());
          console.log('AI Analysis data received:', data);
        } catch (jsonError) {
          console.error('Invalid JSON response from AI analysis:', responseText);
          setError('Invalid response format');
        }
      } else {
        console.error(`AI Analysis API error: ${response.status}`);
        setError('Failed to fetch AI analysis');
      }
    } catch (err) {
      console.error('Error fetching AI analysis:', err);
      setError('Error fetching AI analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLearning = (recommendation) => {
    console.log('Starting learning for:', recommendation);
    
    // הצגת הודעת הצלחה עם פרטי הנושא
    setSuccessMessage(`פותח שאלות בנושא: ${recommendation.category}`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    // בניית פרמטרים לניווט - פתיחת שאלות ספציפיות בנושא
    const params = new URLSearchParams();
    params.append('category', recommendation.category); // נושא ספציפי (category במקום subject)
    params.append('lang', lang); // שפה
    params.append('filter', 'remaining'); // פילטר לשאלות שנותרו
    params.append('count', Math.min(10, recommendation.questions.length)); // מקסימום 10 שאלות
    
    // ניווט לעמוד השאלות עם הפרמטרים
    setTimeout(() => {
      navigate(`/theory/questions?${params.toString()}`);
    }, 1000);
  };

  const handleContinuePath = (path) => {
    console.log('Continuing learning path for:', path);
    
    // הצגת הודעת הצלחה עם פרטי הנושא
    setSuccessMessage(`ממשיך מסלול למידה: ${path.category}`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    // בניית פרמטרים לניווט - פתיחת שאלות ספציפיות בנושא
    const params = new URLSearchParams();
    params.append('category', path.category); // נושא ספציפי (category במקום subject)
    params.append('lang', lang); // שפה
    params.append('filter', 'remaining'); // פילטר לשאלות שנותרו
    params.append('count', 10); // 10 שאלות למסלול למידה
    
    // ניווט לעמוד השאלות עם הפרמטרים
    setTimeout(() => {
      navigate(`/theory/questions?${params.toString()}`);
    }, 1000);
  };

  const handleFocusOnWeakness = (weakness) => {
    console.log('Focusing on weakness:', weakness);
    
    // הצגת הודעת הצלחה עם פרטי הנושא
    setSuccessMessage(`מתמקד בחולשה: ${weakness.category}`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    // בניית פרמטרים לניווט - פתיחת שאלות ספציפיות בנושא החולשה
    const params = new URLSearchParams();
    params.append('category', weakness.category); // נושא ספציפי (category במקום subject)
    params.append('lang', lang); // שפה
    params.append('filter', 'wrong'); // פילטר לשאלות שגויות (חולשה)
    params.append('count', 15); // יותר שאלות לחולשה
    
    // ניווט לעמוד השאלות עם הפרמטרים
    setTimeout(() => {
      navigate(`/theory/questions?${params.toString()}`);
    }, 1000);
  };

  const handleNextStep = (step) => {
    console.log('Handling next step:', step);
    
    // הצגת הודעת הצלחה עם פרטי הנושא
    setSuccessMessage(`מבצע צעד: ${step.category}`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    // בניית פרמטרים לניווט - פתיחת שאלות ספציפיות בנושא
    const params = new URLSearchParams();
    params.append('category', step.category); // נושא ספציפי (category במקום subject)
    params.append('lang', lang); // שפה
    
    if (step.action === 'focus_on_weakness') {
      params.append('filter', 'wrong'); // פילטר לשאלות שגויות (חולשה)
      params.append('count', 15); // יותר שאלות לחולשה
    } else if (step.action === 'continue_path') {
      params.append('filter', 'remaining'); // פילטר לשאלות שנותרו
      params.append('count', 10); // 10 שאלות למסלול למידה
    }
    
    // ניווט לעמוד השאלות עם הפרמטרים
    setTimeout(() => {
      navigate(`/theory/questions?${params.toString()}`);
    }, 1000);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#f1c40f';
      default: return '#95a5a6';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getPriorityText = (priority) => {
    if (priority >= 60) return currentLabels.high;
    if (priority >= 40) return currentLabels.medium;
    return currentLabels.low;
  };

  const getLearningLevelColor = (level) => {
    switch (level) {
      case 'מומחה': return '#2ecc71';
      case 'מנוסה': return '#3498db';
      case 'מתקדם': return '#f39c12';
      case 'מתחיל': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (isLoading) {
    return (
      <div className="ai-learning-system">
        <div className="ai-container">
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
      <div className="ai-learning-system">
        <div className="ai-container">
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>{currentLabels.error}</p>
            <button onClick={fetchAIAnalysis} className="retry-button">
              {currentLabels.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-learning-system">
      <div className="ai-container">
        <div className="ai-header">
          <h1 className="ai-title">{currentLabels.title}</h1>
          <p className="ai-subtitle">{currentLabels.subtitle}</p>
          
          {/* Refresh Button and Last Updated */}
          <div className="ai-controls">
            <button 
              className="refresh-btn"
              onClick={fetchAIAnalysis}
              disabled={isLoading}
            >
              🔄 {currentLabels.refresh}
            </button>
            {lastUpdated && (
              <div className="last-updated">
                {currentLabels.lastUpdated}: {lastUpdated.toLocaleTimeString('he-IL')}
              </div>
            )}
          </div>
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
            className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            {currentLabels.analysis}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            {currentLabels.recommendations}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'learningPath' ? 'active' : ''}`}
            onClick={() => setActiveTab('learningPath')}
          >
            {currentLabels.learningPath}
          </button>
        </div>

        {/* Analysis Tab */}
        {activeTab === 'analysis' && aiData && (
          <div className="analysis-content">
            {/* Overall Analysis */}
            <div className="overall-analysis">
              <h2 className="section-title">{currentLabels.overallAnalysis}</h2>
              <div className="analysis-grid">
                <div className="analysis-card">
                  <div className="analysis-icon">📊</div>
                  <div className="analysis-content">
                    <div className="analysis-value">{aiData.overallAnalysis.totalQuestions}</div>
                    <div className="analysis-label">{currentLabels.totalQuestions}</div>
                  </div>
                </div>
                <div className="analysis-card">
                  <div className="analysis-icon">✅</div>
                  <div className="analysis-content">
                    <div className="analysis-value">{aiData.overallAnalysis.completedQuestions}</div>
                    <div className="analysis-label">{currentLabels.completedQuestions}</div>
                  </div>
                </div>
                <div className="analysis-card">
                  <div className="analysis-icon">🎯</div>
                  <div className="analysis-content">
                    <div className="analysis-value">{aiData.overallAnalysis.averageAccuracy}%</div>
                    <div className="analysis-label">{currentLabels.averageAccuracy}</div>
                  </div>
                </div>
                <div className="analysis-card">
                  <div className="analysis-icon">🏆</div>
                  <div className="analysis-content">
                    <div 
                      className="analysis-value"
                      style={{ color: getLearningLevelColor(aiData.overallAnalysis.learningLevel) }}
                    >
                      {aiData.overallAnalysis.learningLevel}
                    </div>
                    <div className="analysis-label">{currentLabels.learningLevel}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weaknesses */}
            <div className="weaknesses-section">
              <h2 className="section-title">{currentLabels.weaknesses}</h2>
              {aiData.weaknessAnalysis.weaknesses.length > 0 ? (
                <div className="weaknesses-grid">
                  {aiData.weaknessAnalysis.weaknesses.map((weakness, index) => (
                    <div 
                      key={index} 
                      className={`weakness-card ${selectedWeakness === index ? 'selected' : ''}`}
                      onClick={() => setSelectedWeakness(selectedWeakness === index ? null : index)}
                    >
                      <div className="weakness-header">
                        <div className="weakness-icon">
                          {getSeverityIcon(weakness.severity)}
                        </div>
                        <div className="weakness-title">{weakness.category}</div>
                        <div 
                          className="weakness-priority"
                          style={{ color: getSeverityColor(weakness.severity) }}
                        >
                          {getPriorityText(weakness.priority)}
                        </div>
                      </div>
                      <div className="weakness-stats">
                        <div className="weakness-stat">
                          <span className="stat-label">{currentLabels.accuracy}:</span>
                          <span className="stat-value">{weakness.accuracy}%</span>
                        </div>
                        <div className="weakness-stat">
                          <span className="stat-label">{currentLabels.completion}:</span>
                          <span className="stat-value">{weakness.completionRate}%</span>
                        </div>
                      </div>
                      <button 
                        className="focus-weakness-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFocusOnWeakness(weakness);
                        }}
                      >
                        התמקד בנושא
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-weaknesses">
                  <div className="no-weaknesses-icon">🎉</div>
                  <p>{currentLabels.noWeaknesses}</p>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="next-steps-section">
              <h2 className="section-title">{currentLabels.nextSteps}</h2>
              <div className="next-steps-list">
                {aiData.overallAnalysis.nextSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className="next-step-item clickable"
                    onClick={() => handleNextStep(step)}
                  >
                    <div className="step-icon">
                      {step.priority === 'high' ? '🔴' : step.priority === 'medium' ? '🟡' : '🟢'}
                    </div>
                    <div className="step-content">
                      <div className="step-title">{step.description}</div>
                      <div className="step-category">{step.category}</div>
                    </div>
                    <div className="step-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && aiData && (
          <div className="recommendations-content">
            <h2 className="section-title">{currentLabels.recommendedQuestions}</h2>
            <div className="recommendations-grid">
              {aiData.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-header">
                    <div className="recommendation-category">{rec.category}</div>
                    <div className="recommendation-priority">
                      {getPriorityText(rec.priority)}
                    </div>
                  </div>
                  <div className="recommendation-reason">{rec.reason}</div>
                  <div className="recommendation-questions">
                    <div className="questions-count">
                      {rec.questions.length} שאלות מומלצות
                    </div>
                    <button 
                      className="start-learning-btn"
                      onClick={() => handleStartLearning(rec)}
                    >
                      {currentLabels.startLearning}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Path Tab */}
        {activeTab === 'learningPath' && aiData && (
          <div className="learning-path-content">
            <h2 className="section-title">{currentLabels.learningPath}</h2>
            <div className="learning-paths">
              {aiData.learningPath.map((path, index) => (
                <div key={index} className="learning-path-card">
                  <div className="path-header">
                    <div className="path-category">{path.category}</div>
                    <div className="path-progress">
                      {aiData.progress[index]?.progress || 0}%
                    </div>
                  </div>
                  <div className="path-stages">
                    {path.stages.map((stage, stageIndex) => (
                      <div key={stageIndex} className="path-stage">
                        <div className="stage-name">{stage.name}</div>
                        <div className="stage-description">{stage.description}</div>
                        <div className="stage-questions">
                          {stage.questions.length} שאלות
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="path-footer">
                    <div className="path-time">{path.estimatedTime}</div>
                    <button 
                      className="continue-path-btn"
                      onClick={() => handleContinuePath(path)}
                    >
                      {currentLabels.continue}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AILearningSystem;
