import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './ExamResults.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function ExamResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState(location.state?.results || null);
  const [isLoading, setIsLoading] = useState(!results);
  const [showReview, setShowReview] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    // אם אין נתונים מה-state, נטען מהשרת
    if (!results && examId) {
      loadExamResults();
    }
  }, [examId]);

  const loadExamResults = async () => {
    try {
      const response = await fetch(`${API_URL}/exams/${examId}`);
      if (!response.ok) {
        throw new Error('Failed to load exam results');
      }
      const data = await response.json();
      
      // חישוב התוצאות מהנתונים
      const calculatedResults = calculateResults(data);
      setResults(calculatedResults);
    } catch (error) {
      console.error('Error loading exam results:', error);
      alert('שגיאה בטעינת תוצאות הבחינה');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateResults = (examData) => {
    // לוגיקה לחישוב תוצאות אם לא הגיעו מהשרת
    let correctAnswers = 0;
    const questions = examData.questions.map(q => {
      const userAnswer = examData.answers.find(a => a.questionId === q.questionId);
      const isCorrect = userAnswer ? userAnswer.answerIndex === q.correctAnswerIndex : false;
      if (isCorrect) correctAnswers++;
      return {
        ...q,
        userAnswerIndex: userAnswer ? userAnswer.answerIndex : null,
        isCorrect,
        wasAnswered: !!userAnswer
      };
    });

    return {
      examId: examData.examId,
      examType: examData.examType,
      score: correctAnswers,
      totalQuestions: examData.questionCount,
      passed: correctAnswers >= examData.passingScore,
      passingScore: examData.passingScore,
      accuracy: Math.round((correctAnswers / examData.questionCount) * 100),
      questions
    };
  };

  const formatExamType = (type) => {
    const types = {
      theory: 'בחינת תיאוריה',
      quick: 'בחינה מהירה',
      practice: 'תרגול',
      psychology: 'בחינת פסיכולוגיה'
    };
    return types[type] || type;
  };

  const getGradeEmoji = (accuracy) => {
    if (accuracy >= 95) return '🏆';
    if (accuracy >= 90) return '⭐';
    if (accuracy >= 85) return '✨';
    if (accuracy >= 80) return '👍';
    return '💪';
  };

  const handleStartReview = () => {
    setShowReview(true);
    setCurrentReviewIndex(0);
  };

  const handleNextReview = () => {
    if (currentReviewIndex < results.questions.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    }
  };

  const handlePrevReview = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(currentReviewIndex - 1);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentReviewIndex(index);
  };

  if (isLoading) {
    return (
      <div className="exam-results-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>טוען תוצאות...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="exam-results-container">
        <div className="error">
          <h2>❌ שגיאה</h2>
          <p>לא נמצאו תוצאות לבחינה זו</p>
          <button onClick={() => navigate('/')}>חזרה לדף הבית</button>
        </div>
      </div>
    );
  }

  // מסך סקירת שאלות
  if (showReview) {
    const question = results.questions[currentReviewIndex];
    const wrongQuestions = results.questions.filter(q => !q.isCorrect);
    
    return (
      <div className="exam-results-container review-mode">
        <div className="review-header">
          <button onClick={() => setShowReview(false)} className="back-button">
            ⬅️ חזרה לתוצאות
          </button>
          <h2>סקירת שאלות</h2>
        </div>

        <div className="review-question-container">
          <div className="review-progress">
            שאלה {currentReviewIndex + 1} מתוך {results.questions.length}
          </div>

          <div className={`review-status ${question.isCorrect ? 'correct' : 'wrong'}`}>
            {question.isCorrect ? '✅ תשובה נכונה' : '❌ תשובה שגויה'}
          </div>

          <div className="question-text">
            <h3>{question.question}</h3>
          </div>

          {question.image && (
            <div className="question-image">
              <img src={question.image} alt="שאלה" />
            </div>
          )}

          <div className="answers-review">
            {question.answers.map((answer, index) => {
              const isUserAnswer = question.userAnswerIndex === index;
              const isCorrectAnswer = question.correctAnswerIndex === index;
              let className = 'answer-review';
              
              if (isCorrectAnswer) {
                className += ' correct-answer';
              }
              if (isUserAnswer && !isCorrectAnswer) {
                className += ' wrong-answer';
              }

              return (
                <div key={index} className={className}>
                  <span className="answer-letter">{['א', 'ב', 'ג', 'ד'][index]}</span>
                  <span className="answer-text">{answer}</span>
                  {isCorrectAnswer && <span className="badge">✓ נכון</span>}
                  {isUserAnswer && !isCorrectAnswer && <span className="badge wrong">בחרת</span>}
                </div>
              );
            })}
          </div>

          <div className="review-navigation">
            <button 
              onClick={handlePrevReview} 
              disabled={currentReviewIndex === 0}
              className="nav-btn"
            >
              ⬅️ הקודם
            </button>
            <span className="review-counter">
              {currentReviewIndex + 1}/{results.questions.length}
            </span>
            <button 
              onClick={handleNextReview} 
              disabled={currentReviewIndex === results.questions.length - 1}
              className="nav-btn"
            >
              הבא ➡️
            </button>
          </div>

          {/* מפת שאלות לסקירה */}
          <div className="review-map">
            <h4>קפיצה לשאלה:</h4>
            <div className="review-grid">
              {results.questions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => jumpToQuestion(index)}
                  className={`review-map-item ${
                    currentReviewIndex === index ? 'current' : ''
                  } ${q.isCorrect ? 'correct' : 'wrong'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // מסך תוצאות ראשי
  const wrongQuestions = results.questions.filter(q => !q.isCorrect);
  const correctQuestions = results.questions.filter(q => q.isCorrect);
  const unanswered = results.questions.filter(q => !q.wasAnswered);

  return (
    <div className="exam-results-container">
      <div className="results-card">
        {/* כותרת עם סטטוס */}
        <div className={`results-header ${results.passed ? 'passed' : 'failed'}`}>
          <div className="status-icon">
            {results.passed ? '🎉' : '😔'}
          </div>
          <h1>{results.passed ? 'עברת את הבחינה!' : 'לא עברת הפעם'}</h1>
          <p className="exam-type">{formatExamType(results.examType)}</p>
        </div>

        {/* ציון */}
        <div className="score-section">
          <div className="main-score">
            <div className="score-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={results.passed ? '#4CAF50' : '#ff4757'}
                  strokeWidth="10"
                  strokeDasharray={`${(results.score / results.totalQuestions) * 283} 283`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="score-text">
                <span className="score-number">{results.score}</span>
                <span className="score-total">/{results.totalQuestions}</span>
              </div>
            </div>
            <div className="accuracy">
              {getGradeEmoji(results.accuracy)} {results.accuracy}%
            </div>
          </div>

          <div className="passing-info">
            {results.passed ? (
              <p className="pass-message">
                ✅ עברת בהצלחה! נדרשים {results.passingScore} נכונות
              </p>
            ) : (
              <p className="fail-message">
                ❌ לא עברת. נדרשים {results.passingScore} נכונות, קיבלת {results.score}
              </p>
            )}
          </div>
        </div>

        {/* סטטיסטיקות */}
        <div className="stats-grid">
          <div className="stat-item correct">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{correctQuestions.length}</div>
            <div className="stat-label">נכונות</div>
          </div>
          
          <div className="stat-item wrong">
            <div className="stat-icon">❌</div>
            <div className="stat-number">{wrongQuestions.length}</div>
            <div className="stat-label">שגויות</div>
          </div>
          
          {unanswered.length > 0 && (
            <div className="stat-item unanswered">
              <div className="stat-icon">⏭️</div>
              <div className="stat-number">{unanswered.length}</div>
              <div className="stat-label">לא נענו</div>
            </div>
          )}
        </div>

        {/* התפלגות לפי נושאים */}
        {results.categoryBreakdown && (
          <div className="category-breakdown">
            <h3>📊 התפלגות לפי נושאים</h3>
            {Object.entries(results.categoryBreakdown).map(([category, data]) => (
              <div key={category} className="category-item">
                <div className="category-name">{category}</div>
                <div className="category-stats">
                  <span className="correct-count">✓ {data.correct}</span>
                  <span className="wrong-count">✗ {data.wrong}</span>
                  {data.unanswered > 0 && (
                    <span className="unanswered-count">⏭ {data.unanswered}</span>
                  )}
                  <span className="total-count">/ {data.total}</span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill" 
                    style={{ width: `${(data.correct / data.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* כפתורי פעולה */}
        <div className="action-buttons">
          <button onClick={handleStartReview} className="review-button">
            📝 סקור את השאלות
          </button>
          
          <button onClick={() => navigate('/mock-exam')} className="retry-button">
            🔄 נסה שוב
          </button>
          
          <button onClick={() => navigate('/')} className="home-button">
            🏠 חזרה לדף הבית
          </button>
        </div>

        {/* המלצות */}
        {!results.passed && (
          <div className="recommendations">
            <h3>💡 המלצות לשיפור</h3>
            <ul>
              <li>תרגל את הנושאים שבהם טעית</li>
              <li>קרא שוב את חומר הלימוד</li>
              <li>פתור בחינות נוספות</li>
              <li>התמקד בהבנת החומר ולא בשינון</li>
            </ul>
          </div>
        )}

        {results.passed && (
          <div className="congratulations">
            <h3>🎊 כל הכבוד!</h3>
            <p>המשך לתרגל כדי לשמור על הרמה</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExamResults;

