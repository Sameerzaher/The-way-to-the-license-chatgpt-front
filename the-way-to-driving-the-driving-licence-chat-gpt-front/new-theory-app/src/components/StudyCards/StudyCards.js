import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './StudyCards.css';

const StudyCards = ({ userId, lang = 'he' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [currentStep, setCurrentStep] = useState('input'); // 'input' או 'study'
  const [questionNumbers, setQuestionNumbers] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questionsData, setQuestionsData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studyMode, setStudyMode] = useState('flashcard'); // 'flashcard' או 'quiz'

  const labels = {
    he: {
      title: 'כרטיסיות לימוד',
      subtitle: 'למד שאלות ספציפיות בצורה אינטראקטיבית',
      inputTitle: 'הכנס מספרי שאלות ללימוד',
      inputLabel: 'מספרי שאלות',
      inputPlaceholder: 'לדוגמה: 11, 12, 534, 756, 1152',
      startStudy: 'התחל ללמוד',
      backToInput: 'חזור להכנסת שאלות',
      studyModeFlashcard: 'כרטיסיות',
      studyModeQuiz: 'חידון',
      showAnswer: 'הצג תשובה',
      hideAnswer: 'הסתר תשובה',
      nextQuestion: 'שאלה הבאה',
      prevQuestion: 'שאלה קודמת',
      submitAnswer: 'שלח תשובה',
      correctAnswer: 'תשובה נכונה',
      wrongAnswer: 'תשובה שגויה',
      questionProgress: 'שאלה {current} מתוך {total}',
      completedStudy: 'סיימת את הלימוד!',
      yourScore: 'הציון שלך',
      reviewAnswers: 'סקור תשובות',
      startOver: 'התחל מחדש',
      loading: 'טוען שאלות...',
      error: 'שגיאה בטעינת השאלות',
      noQuestions: 'לא נמצאו שאלות',
      invalidNumbers: 'מספרי שאלות לא תקינים'
    },
    ar: {
      title: 'بطاقات الدراسة',
      subtitle: 'تعلم أسئلة محددة بطريقة تفاعلية',
      inputTitle: 'أدخل أرقام الأسئلة للدراسة',
      inputLabel: 'أرقام الأسئلة',
      inputPlaceholder: 'مثال: 11, 12, 534, 756, 1152',
      startStudy: 'ابدأ الدراسة',
      backToInput: 'العودة لإدخال الأسئلة',
      studyModeFlashcard: 'بطاقات',
      studyModeQuiz: 'اختبار',
      showAnswer: 'إظهار الإجابة',
      hideAnswer: 'إخفاء الإجابة',
      nextQuestion: 'السؤال التالي',
      prevQuestion: 'السؤال السابق',
      submitAnswer: 'إرسال الإجابة',
      correctAnswer: 'إجابة صحيحة',
      wrongAnswer: 'إجابة خاطئة',
      questionProgress: 'السؤال {current} من {total}',
      completedStudy: 'انتهيت من الدراسة!',
      yourScore: 'نتيجتك',
      reviewAnswers: 'مراجعة الإجابات',
      startOver: 'ابدأ من جديد',
      loading: 'جاري تحميل الأسئلة...',
      error: 'خطأ في تحميل الأسئلة',
      noQuestions: 'لم يتم العثور على أسئلة',
      invalidNumbers: 'أرقام الأسئلة غير صحيحة'
    }
  };

  const currentLabels = labels[lang] || labels.he;

  // קבלת נתונים מהניווט (אם הגיעו מדף אחר)
  useEffect(() => {
    if (location.state?.questionNumbers) {
      setQuestionNumbers(location.state.questionNumbers.join(', '));
      setSelectedQuestions(location.state.questionNumbers);
      if (location.state.autoStart) {
        handleStartStudy();
      }
    }
  }, [location.state]);

  // פרסור מספרי שאלות
  const parseQuestionNumbers = (input) => {
    const numbers = input
      .split(/[,\s]+/)
      .map(num => num.trim())
      .filter(num => num !== '')
      .map(num => parseInt(num, 10))
      .filter(num => !isNaN(num) && num > 0);
    
    return [...new Set(numbers)]; // הסרת כפילויות
  };

  // שליפת נתוני שאלות מהשרת
  const fetchQuestionsData = useCallback(async (questionIds) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      
      const questionsPromises = questionIds.map(async (questionId) => {
        try {
          const formattedId = questionId.toString().padStart(4, '0');
          const response = await fetch(`${apiUrl}/api/questions/government/${formattedId}`);
          
          if (response.ok) {
            const questionData = await response.json();
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
          } else {
            return {
              id: questionId,
              originalId: formattedId,
              found: false,
              error: `שאלה ${questionId} לא נמצאה`
            };
          }
        } catch (error) {
          return {
            id: questionId,
            found: false,
            error: `שגיאה בשליפת שאלה ${questionId}`
          };
        }
      });

      const results = await Promise.all(questionsPromises);
      const validQuestions = results.filter(q => q.found);
      
      if (validQuestions.length === 0) {
        setError(currentLabels.noQuestions);
        return;
      }

      setQuestionsData(validQuestions);
      setCurrentStep('study');
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
      setUserAnswers({});
      setSelectedAnswer(null);

    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(currentLabels.error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLabels]);

  // התחלת לימוד
  const handleStartStudy = () => {
    const numbers = parseQuestionNumbers(questionNumbers);
    
    if (numbers.length === 0) {
      setError(currentLabels.invalidNumbers);
      return;
    }

    setSelectedQuestions(numbers);
    fetchQuestionsData(numbers);
  };

  // חזרה למסך הכנסת שאלות
  const handleBackToInput = () => {
    setCurrentStep('input');
    setQuestionsData([]);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setUserAnswers({});
    setSelectedAnswer(null);
    setError(null);
  };

  // מעבר לשאלה הבאה
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionsData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  // מעבר לשאלה הקודמת
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  // בחירת תשובה
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  // שליחת תשובה
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questionsData[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswerIndex;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        selectedAnswer,
        isCorrect,
        question: currentQuestion
      }
    }));

    setShowAnswer(true);
  };

  // חישוב ציון
  const calculateScore = () => {
    const totalAnswered = Object.keys(userAnswers).length;
    const correctAnswers = Object.values(userAnswers).filter(answer => answer.isCorrect).length;
    return totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
  };

  // רינדור מסך הכנסת שאלות
  const renderInputScreen = () => (
    <div className="study-cards-container">
      <div className="study-cards-header">
        <h1>📚 {currentLabels.title}</h1>
        <p>{currentLabels.subtitle}</p>
      </div>

      <div className="input-section">
        <div className="input-card">
          <h2>{currentLabels.inputTitle}</h2>
          
          <div className="input-group">
            <label htmlFor="questionNumbers">{currentLabels.inputLabel}:</label>
            <textarea
              id="questionNumbers"
              value={questionNumbers}
              onChange={(e) => setQuestionNumbers(e.target.value)}
              placeholder={currentLabels.inputPlaceholder}
              className="questions-textarea"
              rows="4"
            />
          </div>

          <div className="study-mode-selector">
            <label>מצב לימוד:</label>
            <div className="mode-buttons">
              <button
                className={`mode-btn ${studyMode === 'flashcard' ? 'active' : ''}`}
                onClick={() => setStudyMode('flashcard')}
              >
                📚 {currentLabels.studyModeFlashcard}
              </button>
              <button
                className={`mode-btn ${studyMode === 'quiz' ? 'active' : ''}`}
                onClick={() => setStudyMode('quiz')}
              >
                🎯 {currentLabels.studyModeQuiz}
              </button>
            </div>
          </div>

          <button
            onClick={handleStartStudy}
            className="start-study-btn"
            disabled={!questionNumbers.trim() || isLoading}
          >
            {isLoading ? '⏳' : '🚀'} {currentLabels.startStudy}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // רינדור מסך הלימוד
  const renderStudyScreen = () => {
    if (questionsData.length === 0) return null;

    const currentQuestion = questionsData[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questionsData.length - 1;
    const userAnswer = userAnswers[currentQuestion.id];

    return (
      <div className="study-cards-container study-mode">
        <div className="study-header">
          <button onClick={handleBackToInput} className="back-btn">
            ← {currentLabels.backToInput}
          </button>
          
          <div className="progress-info">
            <span className="progress-text">
              {currentLabels.questionProgress
                .replace('{current}', currentQuestionIndex + 1)
                .replace('{total}', questionsData.length)}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentQuestionIndex + 1) / questionsData.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="score-display">
            📊 {calculateScore()}%
          </div>
        </div>

        <div className="question-card">
          <div className="question-header">
            <div className="question-meta">
              <span className="question-id">#{currentQuestion.id}</span>
              <span className="question-subject">{currentQuestion.subject}</span>
              {currentQuestion.subTopic && (
                <span className="question-subtopic">{currentQuestion.subTopic}</span>
              )}
            </div>
          </div>

          <div className="question-content">
            <div className="question-text">
              <h2>{currentQuestion.question}</h2>
            </div>

            {currentQuestion.image && (
              <div className="question-image">
                <img 
                  src={currentQuestion.image} 
                  alt={`שאלה ${currentQuestion.id}`}
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}

            {studyMode === 'flashcard' ? (
              // מצב כרטיסיות
              <div className="flashcard-mode">
                {!showAnswer ? (
                  <button 
                    onClick={() => setShowAnswer(true)}
                    className="show-answer-btn"
                  >
                    👁️ {currentLabels.showAnswer}
                  </button>
                ) : (
                  <div className="answer-reveal">
                    <div className="correct-answer">
                      <h3>✅ {currentLabels.correctAnswer}:</h3>
                      <p>{currentQuestion.correctAnswer}</p>
                    </div>
                    
                    <div className="all-answers">
                      <h4>כל האפשרויות:</h4>
                      {currentQuestion.answers.map((answer, index) => (
                        <div 
                          key={index}
                          className={`answer-option ${index === currentQuestion.correctAnswerIndex ? 'correct' : ''}`}
                        >
                          <span className="answer-letter">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="answer-text">{answer}</span>
                          {index === currentQuestion.correctAnswerIndex && (
                            <span className="correct-indicator">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // מצב חידון
              <div className="quiz-mode">
                <div className="answers-grid">
                  {currentQuestion.answers.map((answer, index) => (
                    <button
                      key={index}
                      className={`answer-btn ${selectedAnswer === index ? 'selected' : ''} ${
                        showAnswer ? (index === currentQuestion.correctAnswerIndex ? 'correct' : 
                        selectedAnswer === index ? 'wrong' : '') : ''
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showAnswer}
                    >
                      <span className="answer-letter">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="answer-text">{answer}</span>
                      {showAnswer && index === currentQuestion.correctAnswerIndex && (
                        <span className="correct-indicator">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {!showAnswer && selectedAnswer !== null && (
                  <button 
                    onClick={handleSubmitAnswer}
                    className="submit-answer-btn"
                  >
                    📤 {currentLabels.submitAnswer}
                  </button>
                )}

                {showAnswer && userAnswer && (
                  <div className={`answer-feedback ${userAnswer.isCorrect ? 'correct' : 'wrong'}`}>
                    {userAnswer.isCorrect ? (
                      <span>✅ {currentLabels.correctAnswer}</span>
                    ) : (
                      <span>❌ {currentLabels.wrongAnswer}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="navigation-controls">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="nav-btn prev-btn"
            >
              ← {currentLabels.prevQuestion}
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={isLastQuestion}
              className="nav-btn next-btn"
            >
              {currentLabels.nextQuestion} →
            </button>
          </div>

          {isLastQuestion && showAnswer && (
            <div className="completion-section">
              <div className="final-score">
                <h3>🎉 {currentLabels.completedStudy}</h3>
                <div className="score-display-large">
                  {currentLabels.yourScore}: {calculateScore()}%
                </div>
                <div className="completion-actions">
                  <button 
                    onClick={handleBackToInput}
                    className="start-over-btn"
                  >
                    🔄 {currentLabels.startOver}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return currentStep === 'input' ? renderInputScreen() : renderStudyScreen();
};

export default StudyCards;
