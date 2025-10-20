import React, { useState, useEffect, useCallback } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { useNavigate } from 'react-router-dom';
import './CommonErrors.css';

const CommonErrors = ({ userId, lang = 'he' }) => {
  const { theoryProgress, theorySubProgress } = useProgress();
  const navigate = useNavigate();
  const [questionNumbers, setQuestionNumbers] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questionsData, setQuestionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [savedLists, setSavedLists] = useState([]);
  const [currentListName, setCurrentListName] = useState('');

  const labels = {
    he: {
      title: 'טעויות נפוצות',
      subtitle: 'נהל ונתח את השאלות הקשות ביותר',
      inputLabel: 'הכנס מספרי שאלות',
      inputPlaceholder: 'לדוגמה: 11, 12, 534, 756, 1152 (מספרי שאלות ממאגר משרד התחבורה)',
      addButton: 'הוסף שאלות',
      generateReport: 'צור דוח',
      clearAll: 'נקה הכל',
      saveList: 'שמור רשימה',
      loadList: 'טען רשימה',
      listName: 'שם הרשימה',
      savedLists: 'רשימות שמורות',
      questionsAdded: 'שאלות נוספו',
      questionsInList: 'שאלות ברשימה',
      reportTitle: 'דוח טעויות נפוצות',
      questionDetails: 'פרטי השאלה',
      questionText: 'נוסח השאלה',
      correctAnswer: 'תשובה נכונה',
      subject: 'נושא',
      difficulty: 'רמת קושי',
      statistics: 'סטטיסטיקות',
      totalQuestions: 'סה"כ שאלות',
      bySubject: 'לפי נושא',
      byDifficulty: 'לפי רמת קושי',
      recommendations: 'המלצות לשיפור',
      studyTips: 'טיפים ללמידה',
      exportPDF: 'ייצא ל-PDF',
      exportText: 'ייצא לטקסט',
      studyCards: 'למד עם כרטיסיות',
      loading: 'טוען נתונים...',
      error: 'שגיאה בטעינת הנתונים',
      noQuestions: 'לא נמצאו שאלות',
      invalidNumbers: 'מספרי שאלות לא תקינים',
      questionNotFound: 'שאלה לא נמצאה',
      listSaved: 'הרשימה נשמרה בהצלחה',
      listLoaded: 'הרשימה נטענה בהצלחה'
    },
    ar: {
      title: 'الأخطاء الشائعة',
      subtitle: 'إدارة وتحليل الأسئلة الأكثر صعوبة',
      inputLabel: 'أدخل أرقام الأسئلة',
      inputPlaceholder: 'مثال: 1, 5, 12, 23, 45',
      addButton: 'إضافة أسئلة',
      generateReport: 'إنشاء تقرير',
      clearAll: 'مسح الكل',
      saveList: 'حفظ القائمة',
      loadList: 'تحميل القائمة',
      listName: 'اسم القائمة',
      savedLists: 'القوائم المحفوظة',
      questionsAdded: 'تم إضافة الأسئلة',
      questionsInList: 'الأسئلة في القائمة',
      reportTitle: 'تقرير الأخطاء الشائعة',
      questionDetails: 'تفاصيل السؤال',
      questionText: 'نص السؤال',
      correctAnswer: 'الإجابة الصحيحة',
      subject: 'الموضوع',
      difficulty: 'مستوى الصعوبة',
      statistics: 'الإحصائيات',
      totalQuestions: 'إجمالي الأسئلة',
      bySubject: 'حسب الموضوع',
      byDifficulty: 'حسب مستوى الصعوبة',
      recommendations: 'توصيات للتحسين',
      studyTips: 'نصائح للدراسة',
      exportPDF: 'تصدير إلى PDF',
      exportText: 'تصدير إلى نص',
      loading: 'جاري التحميل...',
      error: 'خطأ في تحميل البيانات',
      noQuestions: 'لم يتم العثور على أسئلة',
      invalidNumbers: 'أرقام الأسئلة غير صحيحة',
      questionNotFound: 'السؤال غير موجود',
      listSaved: 'تم حفظ القائمة بنجاح',
      listLoaded: 'تم تحميل القائمة بنجاح'
    }
  };

  const currentLabels = labels[lang] || labels.he;

  // טעינת רשימות שמורות מ-localStorage
  useEffect(() => {
    const saved = localStorage.getItem('commonErrorsLists');
    if (saved) {
      try {
        setSavedLists(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved lists:', error);
      }
    }
  }, []);

  // פונקציה לפרסור מספרי שאלות
  const parseQuestionNumbers = (input) => {
    const numbers = input
      .split(/[,\s]+/)
      .map(num => num.trim())
      .filter(num => num !== '')
      .map(num => parseInt(num, 10))
      .filter(num => !isNaN(num) && num > 0);
    
    return [...new Set(numbers)]; // הסרת כפילויות
  };

  // הוספת שאלות לרשימה
  const handleAddQuestions = () => {
    const numbers = parseQuestionNumbers(questionNumbers);
    
    if (numbers.length === 0) {
      setError(currentLabels.invalidNumbers);
      return;
    }

    setSelectedQuestions(prev => {
      const combined = [...prev, ...numbers];
      return [...new Set(combined)].sort((a, b) => a - b);
    });

    setQuestionNumbers('');
    setError(null);
  };

  // הסרת שאלה מהרשימה
  const removeQuestion = (questionId) => {
    setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    setQuestionsData(prev => prev.filter(q => q.id !== questionId));
  };

  // ניקוי כל השאלות
  const clearAllQuestions = () => {
    setSelectedQuestions([]);
    setQuestionsData([]);
    setReportGenerated(false);
    setError(null);
  };

  // שמירת רשימה
  const saveCurrentList = () => {
    if (!currentListName.trim()) {
      setError('יש להזין שם לרשימה');
      return;
    }

    const newList = {
      id: Date.now(),
      name: currentListName,
      questions: selectedQuestions,
      createdAt: new Date().toISOString(),
      questionsCount: selectedQuestions.length
    };

    const updatedLists = [...savedLists, newList];
    setSavedLists(updatedLists);
    localStorage.setItem('commonErrorsLists', JSON.stringify(updatedLists));
    
    setCurrentListName('');
    setError(null);
    
    // הצגת הודעת הצלחה
    setTimeout(() => {
      setError(currentLabels.listSaved);
      setTimeout(() => setError(null), 2000);
    }, 100);
  };

  // טעינת רשימה שמורה
  const loadSavedList = (list) => {
    setSelectedQuestions(list.questions);
    setQuestionsData([]);
    setReportGenerated(false);
    setError(null);
    
    // הצגת הודעת הצלחה
    setTimeout(() => {
      setError(currentLabels.listLoaded);
      setTimeout(() => setError(null), 2000);
    }, 100);
  };

  // מחיקת רשימה שמורה
  const deleteSavedList = (listId) => {
    const updatedLists = savedLists.filter(list => list.id !== listId);
    setSavedLists(updatedLists);
    localStorage.setItem('commonErrorsLists', JSON.stringify(updatedLists));
  };

  // שליפת נתוני שאלות מהשרת - מאגר משרד התחבורה
  const fetchQuestionsData = useCallback(async () => {
    if (selectedQuestions.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      
      // שליפת השאלות ממאגר משרד התחבורה
      const questionsPromises = selectedQuestions.map(async (questionId) => {
        try {
          // המרת מספר השאלה לפורמט של משרד התחבורה (4 ספרות עם אפסים)
          const formattedId = questionId.toString().padStart(4, '0');
          
          const response = await fetch(`${apiUrl}/api/questions/government/${formattedId}`);
          if (response.ok) {
            const questionData = await response.json();
            
            // התאמה למבנה הנתונים של משרד התחבורה
            return {
              id: questionId,
              originalId: formattedId,
              question: questionData.question,
              answers: questionData.answers,
              correctAnswerIndex: questionData.correctAnswerIndex,
              correctAnswer: questionData.answers ? questionData.answers[questionData.correctAnswerIndex] : null,
              subject: questionData.topic || questionData.subject,
              subTopic: questionData.sub_topic,
              difficulty: questionData.difficulty || 'בינוני',
              image: questionData.image || questionData.image_local,
              page: questionData.page,
              licenseTypes: questionData.licenseTypes,
              lang: questionData.lang || 'he',
              found: true
            };
          } else if (response.status === 404) {
            return {
              id: questionId,
              originalId: formattedId,
              found: false,
              error: `שאלה מספר ${questionId} לא נמצאה במאגר משרד התחבורה`
            };
          } else {
            return {
              id: questionId,
              originalId: formattedId,
              found: false,
              error: `שגיאה בשליפת שאלה ${questionId}: ${response.status}`
            };
          }
        } catch (error) {
          console.error(`Error fetching question ${questionId}:`, error);
          return {
            id: questionId,
            originalId: questionId.toString().padStart(4, '0'),
            found: false,
            error: `שגיאת רשת: ${error.message}`
          };
        }
      });

      const results = await Promise.all(questionsPromises);
      setQuestionsData(results);
      setReportGenerated(true);

      // הצגת סיכום
      const foundCount = results.filter(q => q.found).length;
      const notFoundCount = results.length - foundCount;
      
      if (foundCount > 0) {
        console.log(`✅ נמצאו ${foundCount} שאלות מתוך ${results.length}`);
      }
      if (notFoundCount > 0) {
        console.warn(`⚠️ ${notFoundCount} שאלות לא נמצאו`);
      }

    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(`שגיאה בשליפת השאלות: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedQuestions]);

  // יצירת דוח
  const generateReport = () => {
    fetchQuestionsData();
  };

  // חישוב סטטיסטיקות
  const calculateStatistics = () => {
    const validQuestions = questionsData.filter(q => q.found);
    
    const bySubject = {};
    const byDifficulty = {};
    
    validQuestions.forEach(question => {
      const subject = question.subject || 'לא מוגדר';
      const difficulty = question.difficulty || 'בינוני';
      
      bySubject[subject] = (bySubject[subject] || 0) + 1;
      byDifficulty[difficulty] = (byDifficulty[difficulty] || 0) + 1;
    });

    return {
      total: validQuestions.length,
      notFound: questionsData.filter(q => !q.found).length,
      bySubject,
      byDifficulty
    };
  };

  // מעבר לכרטיסיות לימוד
  const goToStudyCards = () => {
    if (selectedQuestions.length === 0) {
      setError('יש להוסיף שאלות לפני המעבר לכרטיסיות לימוד');
      return;
    }

    navigate('/study-cards', {
      state: {
        questionNumbers: selectedQuestions,
        autoStart: true
      }
    });
  };

  // ייצוא לטקסט
  const exportToText = () => {
    const stats = calculateStatistics();
    const validQuestions = questionsData.filter(q => q.found);
    
    let text = `${currentLabels.reportTitle}\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `${currentLabels.totalQuestions}: ${stats.total}\n`;
    text += `תאריך: ${new Date().toLocaleDateString('he-IL')}\n\n`;
    
    text += `${currentLabels.statistics}:\n`;
    text += `${'-'.repeat(30)}\n`;
    text += `${currentLabels.bySubject}:\n`;
    Object.entries(stats.bySubject).forEach(([subject, count]) => {
      text += `  ${subject}: ${count}\n`;
    });
    
    text += `\n${currentLabels.byDifficulty}:\n`;
    Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
      text += `  ${difficulty}: ${count}\n`;
    });
    
    text += `\n${currentLabels.questionDetails}:\n`;
    text += `${'='.repeat(50)}\n`;
    
    validQuestions.forEach((question, index) => {
      text += `\n${index + 1}. שאלה מספר ${question.id}\n`;
      text += `${currentLabels.subject}: ${question.subject || 'לא מוגדר'}\n`;
      text += `${currentLabels.difficulty}: ${question.difficulty || 'בינוני'}\n`;
      text += `${currentLabels.questionText}: ${question.question || 'לא זמין'}\n`;
      if (question.answers && question.correctAnswerIndex !== undefined) {
        text += `${currentLabels.correctAnswer}: ${question.answers[question.correctAnswerIndex] || 'לא זמין'}\n`;
      }
      text += `${'-'.repeat(30)}\n`;
    });
    
    // הורדת הקובץ
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `common_errors_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="common-errors-container">
      <div className="common-errors-header">
        <h1>📝 {currentLabels.title}</h1>
        <p>{currentLabels.subtitle}</p>
        <div className="database-info">
          <div className="info-badge">
            🏛️ מאגר שאלות רשמי של משרד התחבורה
          </div>
          <div className="info-details">
            <span>✅ שאלות מעודכנות</span>
            <span>✅ תמונות מקוריות</span>
            <span>✅ תשובות מאומתות</span>
          </div>
        </div>
      </div>

      {/* טופס הוספת שאלות */}
      <div className="questions-input-section">
        <div className="input-group">
          <label htmlFor="questionNumbers">{currentLabels.inputLabel}:</label>
          <div className="input-row">
            <input
              type="text"
              id="questionNumbers"
              value={questionNumbers}
              onChange={(e) => setQuestionNumbers(e.target.value)}
              placeholder={currentLabels.inputPlaceholder}
              className="questions-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddQuestions()}
            />
            <button 
              onClick={handleAddQuestions}
              className="add-btn"
              disabled={!questionNumbers.trim()}
            >
              ➕ {currentLabels.addButton}
            </button>
          </div>
        </div>

        {/* שמירה וטעינה של רשימות */}
        <div className="list-management">
          <div className="save-list-section">
            <input
              type="text"
              value={currentListName}
              onChange={(e) => setCurrentListName(e.target.value)}
              placeholder={currentLabels.listName}
              className="list-name-input"
            />
            <button 
              onClick={saveCurrentList}
              className="save-list-btn"
              disabled={!currentListName.trim() || selectedQuestions.length === 0}
            >
              💾 {currentLabels.saveList}
            </button>
          </div>

          {savedLists.length > 0 && (
            <div className="saved-lists-section">
              <h3>{currentLabels.savedLists}:</h3>
              <div className="saved-lists-grid">
                {savedLists.map(list => (
                  <div key={list.id} className="saved-list-item">
                    <div className="list-info">
                      <span className="list-name">{list.name}</span>
                      <span className="list-count">{list.questionsCount} שאלות</span>
                      <span className="list-date">
                        {new Date(list.createdAt).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                    <div className="list-actions">
                      <button 
                        onClick={() => loadSavedList(list)}
                        className="load-btn"
                        title="טען רשימה"
                      >
                        📂
                      </button>
                      <button 
                        onClick={() => deleteSavedList(list.id)}
                        className="delete-btn"
                        title="מחק רשימה"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* הצגת שאלות נבחרות */}
      {selectedQuestions.length > 0 && (
        <div className="selected-questions-section">
          <div className="section-header">
            <h2>📋 {currentLabels.questionsInList} ({selectedQuestions.length})</h2>
            <div className="section-actions">
              <button 
                onClick={generateReport}
                className="generate-report-btn"
                disabled={isLoading}
              >
                {isLoading ? '⏳' : '📊'} {currentLabels.generateReport}
              </button>
              <button 
                onClick={goToStudyCards}
                className="study-cards-btn"
                disabled={selectedQuestions.length === 0}
              >
                🃏 {currentLabels.studyCards}
              </button>
              <button 
                onClick={clearAllQuestions}
                className="clear-all-btn"
              >
                🗑️ {currentLabels.clearAll}
              </button>
            </div>
          </div>

          <div className="questions-list">
            {selectedQuestions.map(questionId => (
              <div key={questionId} className="question-item">
                <span className="question-number">#{questionId}</span>
                <button 
                  onClick={() => removeQuestion(questionId)}
                  className="remove-question-btn"
                  title="הסר שאלה"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* הודעות שגיאה והצלחה */}
      {error && (
        <div className={`message ${error.includes('הצלחה') || error.includes('נשמרה') || error.includes('נטענה') ? 'success' : 'error'}`}>
          {error}
        </div>
      )}

      {/* דוח מפורט */}
      {reportGenerated && questionsData.length > 0 && (
        <div className="report-section">
          <div className="report-header">
            <h2>📊 {currentLabels.reportTitle}</h2>
            <div className="export-buttons">
              <button 
                onClick={exportToText}
                className="export-btn"
              >
                📄 {currentLabels.exportText}
              </button>
            </div>
          </div>

          {/* סטטיסטיקות */}
          <div className="statistics-section">
            <h3>📈 {currentLabels.statistics}</h3>
            <div className="stats-grid">
              {(() => {
                const stats = calculateStatistics();
                return (
                  <>
                    <div className="stat-card">
                      <div className="stat-value">{stats.total}</div>
                      <div className="stat-label">{currentLabels.totalQuestions}</div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-value">{stats.notFound}</div>
                      <div className="stat-label">שאלות לא נמצאו</div>
                    </div>

                    <div className="stat-card subjects">
                      <div className="stat-label">{currentLabels.bySubject}:</div>
                      <div className="stat-breakdown">
                        {Object.entries(stats.bySubject).map(([subject, count]) => (
                          <div key={subject} className="breakdown-item">
                            <span className="breakdown-label">{subject}</span>
                            <span className="breakdown-value">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="stat-card difficulties">
                      <div className="stat-label">{currentLabels.byDifficulty}:</div>
                      <div className="stat-breakdown">
                        {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
                          <div key={difficulty} className="breakdown-item">
                            <span className="breakdown-label">{difficulty}</span>
                            <span className="breakdown-value">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* פרטי שאלות */}
          <div className="questions-details-section">
            <h3>📝 {currentLabels.questionDetails}</h3>
            <div className="questions-details-grid">
              {questionsData.map((question, index) => (
                <div key={question.id} className={`question-detail-card ${!question.found ? 'not-found' : ''}`}>
                  <div className="question-header">
                    <span className="question-number">#{question.id}</span>
                    {!question.found && <span className="not-found-badge">לא נמצא</span>}
                  </div>
                  
                  {question.found ? (
                    <div className="question-content">
                      <div className="question-meta">
                        <span className="question-subject">
                          📚 {question.subject || 'לא מוגדר'}
                        </span>
                        {question.subTopic && (
                          <span className="question-sub-topic">
                            🏷️ {question.subTopic}
                          </span>
                        )}
                        <span className="question-difficulty">
                          ⭐ {question.difficulty || 'בינוני'}
                        </span>
                        {question.page && (
                          <span className="question-page">
                            📄 עמוד {question.page}
                          </span>
                        )}
                      </div>
                      
                      <div className="question-text">
                        <strong>{currentLabels.questionText}:</strong>
                        <p>{question.question || 'טקסט השאלה לא זמין'}</p>
                      </div>
                      
                      {question.answers && question.answers.length > 0 && (
                        <div className="question-answers">
                          <strong>אפשרויות תשובה:</strong>
                          <div className="answers-list">
                            {question.answers.map((answer, index) => (
                              <div 
                                key={index} 
                                className={`answer-option ${index === question.correctAnswerIndex ? 'correct' : ''}`}
                              >
                                <span className="answer-letter">
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                <span className="answer-text">{answer}</span>
                                {index === question.correctAnswerIndex && (
                                  <span className="correct-indicator">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {question.correctAnswer && (
                        <div className="correct-answer-summary">
                          <strong>{currentLabels.correctAnswer}:</strong>
                          <p>{question.correctAnswer}</p>
                        </div>
                      )}
                      
                      {question.licenseTypes && question.licenseTypes.length > 0 && (
                        <div className="license-types">
                          <strong>סוגי רישיון:</strong>
                          <div className="license-badges">
                            {question.licenseTypes.map((license, index) => (
                              <span key={index} className="license-badge">
                                {license.replace(/[«»]/g, '')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {question.image && (
                        <div className="question-image">
                          <strong>תמונת השאלה:</strong>
                          <img 
                            src={question.image} 
                            alt={`תמונת שאלה ${question.id}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              console.warn(`Failed to load image for question ${question.id}`);
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="question-source">
                        <small>
                          🏛️ מקור: מאגר שאלות משרד התחבורה | מספר מקורי: {question.originalId}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className="question-error">
                      <p>❌ {question.error || currentLabels.questionNotFound}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* המלצות לשיפור */}
          <div className="recommendations-section">
            <h3>💡 {currentLabels.recommendations}</h3>
            <div className="recommendations-grid">
              <div className="recommendation-card">
                <h4>📖 {currentLabels.studyTips}</h4>
                <ul>
                  <li>חזור על השאלות הקשות מספר פעמים</li>
                  <li>זהה דפוסים משותפים בטעויות</li>
                  <li>התמקד בנושאים עם הכי הרבה טעויות</li>
                  <li>השתמש בכרטיסיות זיכרון לחזרה</li>
                </ul>
              </div>
              
              <div className="recommendation-card">
                <h4>🎯 אסטרטגיות למידה</h4>
                <ul>
                  <li>לימוד בקבוצות קטנות</li>
                  <li>הסבר השאלות לאחרים</li>
                  <li>יצירת מפות חשיבה</li>
                  <li>תרגול בתנאי בחינה</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonErrors;
