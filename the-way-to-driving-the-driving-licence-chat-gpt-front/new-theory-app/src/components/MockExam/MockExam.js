import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icons/Icon';
import { ensureUser } from '../../utils/demoUser';
import { useStreakTracker } from '../../hooks/useStreakTracker';
import './MockExam.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function MockExam() {
  const navigate = useNavigate();
  const [examType, setExamType] = useState('theory');
  const [difficulty, setDifficulty] = useState('all');
  const [exam, setExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const user = ensureUser();
  const { trackQuestion } = useStreakTracker();

  // טיימר
  useEffect(() => {
    if (!exam || exam.status === 'completed') return;

    const timer = setInterval(() => {
      const startTime = new Date(exam.startTime);
      const now = new Date();
      const elapsed = now - startTime;
      const remaining = Math.max(0, exam.duration - elapsed);

      setTimeRemaining(remaining);

      // אם הזמן נגמר, סיים את הבחינה אוטומטית
      if (remaining === 0) {
        handleCompleteExam();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [exam]);

  // פורמט זמן
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // התחלת בחינה
  const handleStartExam = async () => {
    if (!user.id) {
      alert('יש להתחבר כדי להתחיל בחינה');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Starting exam with:', { userId: user.id, examType, lang: 'he', difficulty });
      
      const response = await fetch(`${API_URL}/exams/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          examType,
          lang: 'he',
          difficulty
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers.get('content-type'));

      if (!response.ok) {
        let errorMessage = 'Failed to create exam';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('❌ Server error:', errorData);
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
          const errorText = await response.text();
          console.error('❌ Raw error response:', errorText);
          errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('❌ Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response');
      }

      const examData = await response.json();
      console.log('✅ Exam data received:', examData);
      
      if (!examData || !examData.examId) {
        throw new Error('Invalid exam data received');
      }

      setExam(examData);
      setTimeRemaining(examData.duration);
      console.log('✅ Exam started successfully:', examData.examId);

    } catch (error) {
      console.error('❌ Error starting exam:', error);
      alert('שגיאה ביצירת הבחינה: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // שמירת תשובה
  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    try {
      const currentQuestion = exam.questions[currentQuestionIndex];
      
      const response = await fetch(`${API_URL}/exams/${exam.examId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.questionId,
          answerIndex: selectedAnswer,
          timeSpent: 0 // ניתן לעקוב אחר זמן לכל שאלה
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      // בדיקה אם התשובה נכונה
      const isCorrect = selectedAnswer === currentQuestion.correctAnswerIndex;
      
      // עדכון רצף למידה
      console.log('🔥 About to call trackQuestion with:', isCorrect);
      trackQuestion(isCorrect);
      console.log('🔥 Streak updated:', isCorrect ? 'Correct answer' : 'Wrong answer');

      // סימון שהשאלה נענתה
      setAnsweredQuestions(new Set([...answeredQuestions, currentQuestionIndex]));
      
      // מעבר לשאלה הבאה
      if (currentQuestionIndex < exam.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('שגיאה בשמירת התשובה');
    }
  };

  // סיום בחינה
  const handleCompleteExam = async () => {
    if (!exam) {
      console.error('❌ No exam to complete');
      alert('שגיאה: אין בחינה לסיום');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Completing exam:', exam.examId);
      
      const response = await fetch(`${API_URL}/exams/${exam.examId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('📡 Complete exam response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to complete exam';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('❌ Server error:', errorData);
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
          const errorText = await response.text();
          console.error('❌ Raw error response:', errorText);
          errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('❌ Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response');
      }

      const results = await response.json();
      console.log('✅ Exam completed successfully:', results);
      
      // מעבר לעמוד תוצאות
      navigate(`/exam-results/${exam.examId}`, { state: { results } });

    } catch (error) {
      console.error('❌ Error completing exam:', error);
      alert(`שגיאה בסיום הבחינה: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // מעבר לשאלה ספציפית
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setSelectedAnswer(null);
  };

  // יציאה מהבחינה
  const handleExitExam = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate('/');
  };

  // אם טרם התחילה בחינה - מסך בחירה
  if (!exam) {
    return (
      <div className="mock-exam-container">
        <div className="exam-setup">
          <h1>🎓 בחינה מדומה</h1>
          <p className="exam-description">
            בחינה מלאה בתנאים דומים לבחינת התיאוריה האמיתית
          </p>

          <div className="exam-options">
            <div className="option-group">
              <label>סוג בחינה:</label>
              <select 
                value={examType} 
                onChange={(e) => setExamType(e.target.value)}
                className="exam-select"
              >
                <option value="theory">בחינת תיאוריה מלאה (30 שאלות, 40 דקות)</option>
                <option value="quick">בחינה מהירה (15 שאלות, 20 דקות)</option>
                <option value="practice">תרגול (10 שאלות, 15 דקות)</option>
              </select>
            </div>

            <div className="option-group">
              <label>רמת קושי:</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="exam-select"
              >
                <option value="all">כל הרמות</option>
                <option value="easy">קל</option>
                <option value="medium">בינוני</option>
                <option value="hard">קשה</option>
              </select>
            </div>
          </div>

          <div className="exam-info">
            <h3>📋 פרטי הבחינה:</h3>
            <ul>
              {examType === 'theory' && (
                <>
                  <li>✅ 30 שאלות מכל הנושאים</li>
                  <li>⏱️ 40 דקות</li>
                  <li>🎯 ציון עובר: 26/30 (86.7%)</li>
                </>
              )}
              {examType === 'quick' && (
                <>
                  <li>✅ 15 שאלות</li>
                  <li>⏱️ 20 דקות</li>
                  <li>🎯 ציון עובר: 13/15 (86.7%)</li>
                </>
              )}
              {examType === 'practice' && (
                <>
                  <li>✅ 10 שאלות</li>
                  <li>⏱️ 15 דקות</li>
                  <li>🎯 ציון עובר: 7/10 (70%)</li>
                </>
              )}
              <li>📱 לא ניתן לצאת מהבחינה לאחר ההתחלה</li>
            </ul>
          </div>

          <button 
            onClick={handleStartExam} 
            disabled={isLoading}
            className="start-exam-button"
          >
            {isLoading ? '⏳ טוען...' : '🚀 התחל בחינה'}
          </button>
        </div>
      </div>
    );
  }

  // מסך הבחינה
  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((answeredQuestions.size / exam.questions.length) * 100).toFixed(0);

  return (
    <div className="mock-exam-container in-progress">
      {/* כותרת עליונה */}
      <div className="exam-header">
        <div className="exam-title">
          <h2>🎓 {examType === 'theory' ? 'בחינת תיאוריה' : examType === 'quick' ? 'בחינה מהירה' : 'תרגול'}</h2>
        </div>
        
        <div className="exam-timer">
          <span className={`timer ${timeRemaining < 300000 ? 'warning' : ''}`}>
            ⏱️ {formatTime(timeRemaining)}
          </span>
        </div>

        <button onClick={handleExitExam} className="exit-button">
          ❌ יציאה
        </button>
      </div>

      {/* בר התקדמות */}
      <div className="exam-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        <span className="progress-text">{answeredQuestions.size}/{exam.questions.length}</span>
      </div>

      {/* תצוגת השאלה */}
      <div className="exam-question-container">
        <div className="question-header">
          <span className="question-number">שאלה {currentQuestionIndex + 1} מתוך {exam.questions.length}</span>
          {currentQuestion.subject && (
            <span className="question-subject">📚 {currentQuestion.subject}</span>
          )}
        </div>

        <div className="question-text">
          <h3>{currentQuestion.question}</h3>
        </div>

        {currentQuestion.image && (
          <div className="question-image">
            <img src={currentQuestion.image} alt="שאלה" />
          </div>
        )}

        <div className="answers-container">
          {currentQuestion.answers.map((answer, index) => (
            <div
              key={index}
              className={`answer-option ${selectedAnswer === index ? 'selected' : ''}`}
              onClick={() => setSelectedAnswer(index)}
            >
              <span className="answer-letter">{['א', 'ב', 'ג', 'ד'][index]}</span>
              <span className="answer-text">{answer}</span>
            </div>
          ))}
        </div>

        {/* כפתורי ניווט */}
        <div className="exam-navigation">
          <button
            onClick={() => goToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className="nav-button"
          >
            <Icon name="previous" /> הקודם
          </button>

          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="submit-answer-button"
          >
            {answeredQuestions.has(currentQuestionIndex) ? (
              <>
                <Icon name="update" /> עדכן תשובה
              </>
            ) : (
              <>
                <Icon name="save" /> שמור תשובה
              </>
            )}
          </button>

          <button
            onClick={() => goToQuestion(currentQuestionIndex + 1)}
            disabled={currentQuestionIndex === exam.questions.length - 1}
            className="nav-button"
          >
            הבא <Icon name="next" />
          </button>
        </div>
      </div>

      {/* מפת שאלות */}
      <div className="questions-map">
        <h4>מפת שאלות:</h4>
        <div className="questions-grid">
          {exam.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`question-map-item ${
                currentQuestionIndex === index ? 'current' : ''
              } ${answeredQuestions.has(index) ? 'answered' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* כפתור סיום */}
      <div className="exam-footer">
        <button
          onClick={handleCompleteExam}
          disabled={isLoading}
          className="complete-exam-button"
        >
          {isLoading ? (
            <>
              <Icon name="loading" /> מסיים...
            </>
          ) : (
            <>
              <Icon name="finish" /> סיים בחינה וקבל תוצאות
            </>
          )}
        </button>
        <p className="footer-note">
          ענית על {answeredQuestions.size} מתוך {exam.questions.length} שאלות
        </p>
      </div>

      {/* דיאלוג אישור יציאה */}
      {showExitConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ האם אתה בטוח?</h3>
            <p>יציאה מהבחינה תגרום לביטולה ולא תוכל לחזור אליה.</p>
            <div className="modal-buttons">
              <button onClick={confirmExit} className="confirm-button">
                כן, צא מהבחינה
              </button>
              <button onClick={() => setShowExitConfirm(false)} className="cancel-button">
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockExam;

