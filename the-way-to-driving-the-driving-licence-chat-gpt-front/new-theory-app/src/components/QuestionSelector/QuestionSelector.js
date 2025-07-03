import React, { useState, useEffect } from "react";
import TheoryQuiz from "../TheoryQuiz/TheoryQuiz";
import "./QuestionSelector.css";

export default function QuestionSelector({ user, course, lang, onChangeLang }) {
  const [inputId, setInputId] = useState("");
  const [chosenId, setChosenId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  //  נוסיף את התחום מה־localStorage
  const [field, setField] = useState("theory");
  const [selectedLicense, setSelectedLicense] = useState("");
  const licenseOptions = ["C1", "C", "D", "A", "1", "B"];
  
  // State לחיפוש כמה שאלות
  const [multipleQuestions, setMultipleQuestions] = useState([]);
  const [questionCount, setQuestionCount] = useState(5);
  const [loadingMultiple, setLoadingMultiple] = useState(false);
  const [showMultipleResults, setShowMultipleResults] = useState(false);
  
  // State לבחירת מזהים ספציפיים
  const [selectedIds, setSelectedIds] = useState([]);
  const [idInput, setIdInput] = useState("");
  const [loadingSpecificIds, setLoadingSpecificIds] = useState(false);
  const [showSpecificResults, setShowSpecificResults] = useState(false);
  
  // State למצב תרגול
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceResults, setPracticeResults] = useState([]);
  const [loadingPractice, setLoadingPractice] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  useEffect(() => {
    const selectedField = localStorage.getItem("learningField") || "theory";
    setField(selectedField);
  }, []);

  useEffect(() => {
    if (selectedLicense) {
      fetchRandomQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLicense]);

  const handleShow = (e) => {
    e.preventDefault();
    if (inputId.trim() === "") {
      setFeedback(lang === "ar" ? "אנא הכנס מזהה חוקי" : "אנא הכנס מזהה חוקי");
      return;
    }
    setChosenId(inputId.trim());
    setFeedback("");
    setRandomQuestion(null);
  };

  const handleBack = () => {
    setChosenId(null);
    setInputId("");
    setFeedback("");
    setRandomQuestion(null);
    setShowMultipleResults(false);
    setMultipleQuestions([]);
    setShowSpecificResults(false);
    setSelectedIds([]);
    setPracticeMode(false);
    setPracticeQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setPracticeScore(0);
    setPracticeResults([]);
    setPracticeCompleted(false);
  };

  // Fetch random question by license type
  const fetchRandomQuestion = async () => {
    setLoadingRandom(true);
    setFeedback("");
    setChosenId(null);
    setRandomQuestion(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      let url = `${apiUrl}/questions/random?count=1&lang=${lang}`;
      if (selectedLicense) {
        url += `&licenseType=${selectedLicense}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("שגיאה בשליפת שאלה רנדומלית");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRandomQuestion(data[0]);
      } else {
        setFeedback(lang === "ar" ? "לא נמצאו שאלות לסוג רישיון זה" : "לא נמצאו שאלות לסוג רישיון זה");
      }
    } catch (err) {
      setFeedback(err.message || "שגיאה לא ידועה");
    } finally {
      setLoadingRandom(false);
    }
  };

  // Add ID to selected list
  const addIdToList = () => {
    if (idInput.trim() === "") {
      setFeedback(lang === "ar" ? "אנא הכנס מזהה" : "אנא הכנס מזהה");
      return;
    }
    const newId = idInput.trim();
    if (selectedIds.includes(newId)) {
      setFeedback(lang === "ar" ? "המזהה כבר קיים ברשימה" : "המזהה כבר קיים ברשימה");
      return;
    }
    setSelectedIds([...selectedIds, newId]);
    setIdInput("");
    setFeedback("");
  };

  // Remove ID from list
  const removeIdFromList = (idToRemove) => {
    setSelectedIds(selectedIds.filter(id => id !== idToRemove));
  };

  // Fetch questions by specific IDs
  const fetchQuestionsByIds = async () => {
    if (selectedIds.length === 0) {
      setFeedback(lang === "ar" ? "אנא בחר לפחות מזהה אחד" : "אנא בחר לפחות מזהה אחד");
      return;
    }
    
    setLoadingSpecificIds(true);
    setFeedback("");
    setChosenId(null);
    setRandomQuestion(null);
    setShowMultipleResults(false);
    setShowSpecificResults(false);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const questions = [];
      for (const id of selectedIds) {
        const url = `${apiUrl}/questions/${id}?lang=${lang}`;
        const res = await fetch(url);
        if (res.ok) {
          const question = await res.json();
          questions.push(question);
        } else {
          console.warn(`שאלה עם מזהה ${id} לא נמצאה`);
        }
      }
      
      if (questions.length > 0) {
        setMultipleQuestions(questions);
        setShowSpecificResults(true);
      } else {
        setFeedback(lang === "ar" ? "לא נמצאו שאלות למזהים שנבחרו" : "לא נמצאו שאלות למזהים שנבחרו");
      }
    } catch (err) {
      setFeedback(err.message || "שגיאה לא ידועה");
    } finally {
      setLoadingSpecificIds(false);
    }
  };

  // Start practice mode
  const startPractice = async () => {
    setLoadingPractice(true);
    setFeedback("");
    setChosenId(null);
    setRandomQuestion(null);
    setShowMultipleResults(false);
    setShowSpecificResults(false);
    setPracticeMode(false);
    
    try {
      // אם אין API URL מוגדר, נשתמש בשרת מקומי
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      
      // נטען את כל שאלות התאוריה מהמאגר
      let url = `${apiUrl}/questions?lang=${lang}`;
      if (selectedLicense) {
        url += `&licenseType=${selectedLicense}`;
      }
      
      console.log('מנסה לגשת ל:', url);
      
      const res = await fetch(url);
      console.log('תגובת השרת:', res.status, res.statusText);
      
      if (!res.ok) {
        console.error('שגיאה בשרת:', res.status, res.statusText);
        throw new Error(`שגיאה בשליפת שאלות תאוריה: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('נתונים שהתקבלו:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        // נסדר את השאלות בסדר רנדומלי
        const shuffledQuestions = data.sort(() => Math.random() - 0.5);
        
        setPracticeQuestions(shuffledQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setPracticeScore(0);
        setPracticeResults([]);
        setPracticeCompleted(false);
        setPracticeMode(true);
        setFeedback(""); // נקה הודעות שגיאה קודמות
      } else {
        setFeedback(lang === "ar" ? "לא נמצאו שאלות תאוריה במאגר" : "לא נמצאו שאלות תאוריה במאגר");
      }
    } catch (err) {
      console.error('שגיאה בפונקציית startPractice:', err);
      setFeedback(`שגיאה: ${err.message}`);
    } finally {
      setLoadingPractice(false);
    }
  };

  // Handle answer selection in practice mode
  const handleAnswerSelect = (answer) => {
    if (showAnswer) return; // Prevent changing answer after showing result
    setSelectedAnswer(answer);
  };

  // Submit answer in practice mode
  const submitAnswer = async () => {
    if (!selectedAnswer) {
      setFeedback(lang === "ar" ? "בחר תשובה" : "בחר תשובה");
      return;
    }
    
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Update score
    if (isCorrect) {
      setPracticeScore(prev => prev + 1);
    }
    
    // Save result
    const result = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    };
    setPracticeResults(prev => [...prev, result]);
    
    setShowAnswer(true);
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setPracticeCompleted(true);
    }
  };

  // Restart practice
  const restartPractice = () => {
    setPracticeMode(false);
    setPracticeQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setPracticeScore(0);
    setPracticeResults([]);
    setPracticeCompleted(false);
  };

  // Fetch multiple random questions
  const fetchMultipleQuestions = async () => {
    setLoadingMultiple(true);
    setFeedback("");
    setChosenId(null);
    setRandomQuestion(null);
    setShowMultipleResults(false);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      let url = `${apiUrl}/questions/random?count=${questionCount}&lang=${lang}`;
      if (selectedLicense) {
        url += `&licenseType=${selectedLicense}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("שגיאה בשליפת שאלות רנדומליות");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMultipleQuestions(data);
        setShowMultipleResults(true);
      } else {
        setFeedback(lang === "ar" ? "לא נמצאו שאלות לסוג רישיון זה" : "לא נמצאו שאלות לסוג רישיון זה");
      }
    } catch (err) {
      setFeedback(err.message || "שגיאה לא ידועה");
    } finally {
      setLoadingMultiple(false);
    }
  };

  // Export questions to PDF
  const exportQuestionsToPDF = async () => {
    if (!selectedLicense) {
      setFeedback(lang === "ar" ? "בחר סוג רישיון לייצוא" : "בחר סוג רישיון לייצוא");
      return;
    }
    setFeedback("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      let url = `${apiUrl}/questions?lang=${lang}&licenseType=${selectedLicense}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("שגיאה בשליפת שאלות לייצוא");
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setFeedback(lang === "ar" ? "לא נמצאו שאלות לסוג רישיון זה" : "לא נמצאו שאלות לסוג רישיון זה");
        return;
      }
      
      // יצירת דף HTML עם השאלות
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="${lang}">
        <head>
          <meta charset="UTF-8">
          <title>${lang === "ar" ? "أسئلة للرخصة" : "שאלות לרישיון"} ${selectedLicense}</title>
          <style>
            body { font-family: 'Noto Sans Hebrew', 'Noto Sans Arabic', Arial, sans-serif; margin: 20px; direction: rtl; }
            h1 { text-align: center; color: #333; }
            .print-button { 
              position: fixed; 
              top: 20px; 
              left: 20px; 
              padding: 10px 20px; 
              background: #007bff; 
              color: white; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer; 
              font-size: 16px;
            }
            .print-button:hover { background: #0056b3; }
            .question { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .question-text { font-weight: bold; margin-bottom: 10px; }
            .answers { margin-right: 20px; }
            .answer { margin-bottom: 5px; }
            @media print { 
              body { margin: 0; } 
              .print-button { display: none; }
            }
          </style>
                  </head>
          <body>
            <button class="print-button" onclick="window.print()">${lang === "ar" ? "طباعة" : "הדפס"}</button>
            <h1>${lang === "ar" ? "أسئلة للرخصة" : "שאלות לרישיון"} ${selectedLicense}</h1>
          ${data.map((q, idx) => `
            <div class="question">
              <div class="question-text">${idx + 1}. ${q.question}</div>
              <div class="answers">
                ${Array.isArray(q.answers) ? q.answers.map((ans, i) => 
                  `<div class="answer">${String.fromCharCode(65 + i)}. ${ans}</div>`
                ).join('') : ''}
              </div>
              ${q.image ? `<div class="question-image"><img src="${q.image}" style="max-width:180px;max-height:120px;display:block;margin:0 auto 10px;"/></div>` : ""}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      
      // פתיחת הדף בחלון חדש
      const newWindow = window.open('', '_blank');
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      
    } catch (err) {
      setFeedback(err.message || "שגיאה לא ידועה");
    }
  };

  // Labels for both languages
  const labels = {
    theory: lang === 'ar' ? 'نظرية' : 'תיאוריה',
    psychology: lang === 'ar' ? 'علم النفس' : 'פסיכולוגיה',
    selectFrom: lang === 'ar' ? 'اختر سؤالاً من بنك' : 'בחר שאלה מתוך מאגר',
    questionId: lang === 'ar' ? 'معرف السؤال:' : 'מזהה שאלה:',
    example: lang === 'ar' ? 'مثال: 0001' : 'לדוגמה: 0001',
    show: lang === 'ar' ? 'عرض السؤال' : 'הצג שאלה',
    back: lang === 'ar' ? 'عودة' : 'חזרה',
    field: course === 'psychology' ? (lang === 'ar' ? 'علم النفس' : 'פסיכולוגיה') : (lang === 'ar' ? 'نظرية' : 'תיאוריה'),
    hebrew: 'עברית',
    arabic: 'Arabic',
    licenseType: lang === 'ar' ? 'اختر نوع الرخصة:' : 'בחר סוג רישיון:',
    random: lang === 'ar' ? 'שאלה רנדומלית לפי סוג רישיון' : 'שאלה רנדומלית לפי סוג רישיון',
    allTypes: lang === 'ar' ? 'כל الأنواع' : 'כל הסוגים',
    multipleQuestions: lang === 'ar' ? 'عدة أسئلة عشوائية' : 'כמה שאלות רנדומליות',
    questionCount: lang === 'ar' ? 'عدد الأسئلة:' : 'מספר שאלות:',
    fetchMultiple: lang === 'ar' ? 'جلب أسئلة متعددة' : 'הבא שאלות מרובות',
    multipleResults: lang === 'ar' ? 'النتائج' : 'תוצאות',
    specificIds: lang === 'ar' ? 'اختيار معرفات محددة' : 'בחירת מזהים ספציפיים',
    addId: lang === 'ar' ? 'إضافة معرف' : 'הוסף מזהה',
    removeId: lang === 'ar' ? 'إزالة' : 'הסר',
    fetchByIds: lang === 'ar' ? 'جلب الأسئلة المحددة' : 'הבא שאלות נבחרות',
    selectedIdsList: lang === 'ar' ? 'المعرفات المحددة:' : 'מזהים נבחרים:',
    noIdsSelected: lang === 'ar' ? 'لم يتم تحديد معرفات' : 'לא נבחרו מזהים',
    practiceMode: lang === 'ar' ? 'تدريب النظرية' : 'תרגול תאוריה',
    startPractice: lang === 'ar' ? 'ابدأ تدريب النظرية' : 'התחל תרגול תאוריה',
    selectAnswer: lang === 'ar' ? 'اختر إجابة' : 'בחר תשובה',
    submitAnswer: lang === 'ar' ? 'إرسال الإجابة' : 'שלח תשובה',
    nextQuestion: lang === 'ar' ? 'السؤال التالي' : 'שאלה הבאה',
    practiceResults: lang === 'ar' ? 'نتائج التدريب' : 'תוצאות התרגול',
    correctAnswers: lang === 'ar' ? 'إجابات صحيحة' : 'תשובות נכונות',
    wrongAnswers: lang === 'ar' ? 'إجابات خاطئة' : 'תשובות שגויות',
    score: lang === 'ar' ? 'النتيجة' : 'ציון',
    restartPractice: lang === 'ar' ? 'إعادة التدريب' : 'התחל מחדש',
    questionNumber: lang === 'ar' ? 'السؤال' : 'שאלה',
    of: lang === 'ar' ? 'من' : 'מתוך',
  };

  if (chosenId) {
    return (
      <div>
        <button className="back-button" onClick={handleBack}>
          {labels.back}
        </button>
        <TheoryQuiz
          forcedId={chosenId}
          lang={lang}
          field={course}
          onAnswered={() => {}}
        />
      </div>
    );
  }

  if (randomQuestion) {
    return (
      <div>
        <button className="back-button" onClick={handleBack}>
          {labels.back}
        </button>
        <TheoryQuiz
          forcedId={randomQuestion.id}
          lang={lang}
          field={course}
          onAnswered={() => {}}
        />
      </div>
    );
  }

  if (showMultipleResults || showSpecificResults) {
    return (
      <div>
        <button className="back-button" onClick={handleBack}>
          {labels.back}
        </button>
        <div className="multiple-questions-container">
          <h2>{showSpecificResults ? `${labels.specificIds} (${multipleQuestions.length} שאלות)` : labels.multipleResults}</h2>
          <div className="questions-grid">
            {multipleQuestions.map((question, index) => (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <span className="question-number">#{index + 1}</span>
                  <span className="question-id">ID: {question.id}</span>
                </div>
                <div className="question-content">
                  <h3>{question.question}</h3>
                  <div className="answers-list">
                    {Array.isArray(question.answers) && question.answers.map((answer, i) => (
                      <div key={i} className="answer-item">
                        <span className="answer-letter">{String.fromCharCode(65 + i)}.</span>
                        <span className="answer-text">{answer}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="question-footer">
                  <span className="subject">{question.subject}</span>
                  {question.subSubject && (
                    <span className="sub-subject">{question.subSubject}</span>
                  )}
                </div>
                {question.image && (
                  <div className="question-image">
                    <img src={process.env.PUBLIC_URL + question.image} alt="שאלת תמרור" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Practice mode view
  if (practiceMode && !practiceCompleted) {
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    return (
      <div className="practice-container">
        <button className="back-button" onClick={handleBack}>
          {labels.back}
        </button>
        <div className="practice-header">
          <h2>{labels.practiceMode}</h2>
          <div className="practice-progress">
            {labels.questionNumber} {currentQuestionIndex + 1} {labels.of} {practiceQuestions.length}
          </div>
          <div className="practice-score">
            {labels.score}: {practiceScore}/{currentQuestionIndex + 1}
          </div>
        </div>
        
        <div className="practice-question">
          <h3>{currentQuestion.question}</h3>
          <div className="practice-answers">
            {Array.isArray(currentQuestion.answers) && currentQuestion.answers.map((answer, i) => (
              <button
                key={i}
                className={`practice-answer ${selectedAnswer === answer ? 'selected' : ''} ${
                  showAnswer ? (answer === currentQuestion.correctAnswer ? 'correct' : 
                    selectedAnswer === answer && answer !== currentQuestion.correctAnswer ? 'incorrect' : '') : ''
                }`}
                onClick={() => handleAnswerSelect(answer)}
                disabled={showAnswer}
              >
                <span className="answer-letter">{String.fromCharCode(65 + i)}.</span>
                <span className="answer-text">{answer}</span>
              </button>
            ))}
          </div>
          
          <div className="practice-actions">
            {!showAnswer ? (
              <button
                className="practice-button submit"
                onClick={submitAnswer}
                disabled={!selectedAnswer}
              >
                {labels.submitAnswer}
              </button>
            ) : (
              <button
                className="practice-button next"
                onClick={nextQuestion}
              >
                {currentQuestionIndex < practiceQuestions.length - 1 ? labels.nextQuestion : labels.practiceResults}
              </button>
            )}
          </div>
          
          {showAnswer && (
            <div className={`practice-feedback ${selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect'}`}>
              {selectedAnswer === currentQuestion.correctAnswer ? 
                (lang === 'ar' ? 'إجابة صحيحة!' : 'תשובה נכונה!') : 
                (lang === 'ar' ? `إجابة خاطئة. الإجابة الصحيحة هي: ${currentQuestion.correctAnswer}` : `תשובה שגויה. התשובה הנכונה היא: ${currentQuestion.correctAnswer}`)
              }
            </div>
          )}
          {currentQuestion.image && (
            <div className="question-image">
              <img src={process.env.PUBLIC_URL + currentQuestion.image} alt="שאלת תמרור" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Practice results view
  if (practiceCompleted) {
    const percentage = Math.round((practiceScore / practiceQuestions.length) * 100);
    return (
      <div className="practice-results-container">
        <button className="back-button" onClick={handleBack}>
          {labels.back}
        </button>
        <div className="practice-results">
          <h2>{labels.practiceResults}</h2>
          <div className="results-summary">
            <div className="score-display">
              <div className="score-circle">
                <span className="score-number">{percentage}%</span>
                <span className="score-text">{practiceScore}/{practiceQuestions.length}</span>
              </div>
            </div>
            <div className="results-breakdown">
              <div className="correct-count">
                <span className="count-label">{labels.correctAnswers}:</span>
                <span className="count-value correct">{practiceScore}</span>
              </div>
              <div className="incorrect-count">
                <span className="count-label">{labels.wrongAnswers}:</span>
                <span className="count-value incorrect">{practiceQuestions.length - practiceScore}</span>
              </div>
            </div>
          </div>
          
          <div className="results-actions">
            <button className="practice-button restart" onClick={restartPractice}>
              {labels.restartPractice}
            </button>
          </div>
          
          <div className="detailed-results">
            <h3>{lang === 'ar' ? 'تفاصيل الإجابات' : 'פרטי התשובות'}</h3>
            {practiceResults.map((result, index) => (
              <div key={index} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-question">
                  <span className="question-number">#{index + 1}</span>
                  <span className="question-text">{result.question}</span>
                </div>
                <div className="result-answers">
                  <div className="selected-answer">
                    <span className="answer-label">{lang === 'ar' ? 'إجابتك:' : 'תשובתך:'}</span>
                    <span className={`answer-value ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                      {result.selectedAnswer}
                    </span>
                  </div>
                  {!result.isCorrect && (
                    <div className="correct-answer">
                      <span className="answer-label">{lang === 'ar' ? 'الإجابة الصحيحة:' : 'התשובה הנכונה:'}</span>
                      <span className="answer-value correct">{result.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="selector-page-wrapper">
      <div className="selector-container" data-lang={lang}>
        <div className="field-indicator">
          {labels.field}
        </div>
        <h2 className="selector-title">
          {labels.selectFrom} {labels.field}
        </h2>

        {/* License type selector and random question button */}
        <div style={{ margin: "32px 0 24px 0" }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#3b3b3b' }}>
            {lang === 'ar' ? 'סנן לפי סוג רישיון' : 'סנן לפי סוג רישיון'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 600, marginLeft: 8, minWidth: 90 }}>{labels.licenseType}</label>
            <select
              value={selectedLicense}
              onChange={e => setSelectedLicense(e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", minWidth: 120, fontSize: 15 }}
            >
              <option value="">{labels.allTypes}</option>
              {licenseOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button
              type="button"
              className="selector-button"
              style={{ marginRight: 0, fontSize: 15, padding: '8px 18px', borderRadius: 6, background: '#74b9ff', color: '#fff', border: 'none', fontWeight: 600, boxShadow: '0 2px 8px #74b9ff33', transition: 'background 0.2s' }}
              onClick={fetchRandomQuestion}
              disabled={loadingRandom}
            >
              {labels.random}
            </button>
            <button
              type="button"
              className="selector-button"
              style={{ fontSize: 15, padding: '8px 18px', borderRadius: 6, background: '#00b894', color: '#fff', border: 'none', fontWeight: 600, boxShadow: '0 2px 8px #00b89433', transition: 'background 0.2s' }}
              onClick={exportQuestionsToPDF}
            >
              {lang === 'ar' ? 'ייצא שאלות ל־PDF' : 'ייצא שאלות ל־PDF'}
            </button>
          </div>
        </div>

        {/* Practice theory section */}
        <div style={{ margin: "32px 0 24px 0" }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#3b3b3b' }}>
            {labels.practiceMode}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="selector-button"
              style={{ fontSize: 15, padding: '8px 18px', borderRadius: 6, background: '#fdcb6e', color: '#fff', border: 'none', fontWeight: 600, boxShadow: '0 2px 8px #fdcb6e33', transition: 'background 0.2s' }}
              onClick={startPractice}
              disabled={loadingPractice}
            >
              {loadingPractice ? (lang === 'ar' ? 'جاري التحميل...' : 'טוען...') : labels.startPractice}
            </button>
          </div>
        </div>

        {/* Multiple questions section */}
        <div style={{ margin: "32px 0 24px 0" }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#3b3b3b' }}>
            {labels.multipleQuestions}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 600, marginLeft: 8, minWidth: 90 }}>{labels.questionCount}</label>
            <select
              value={questionCount}
              onChange={e => setQuestionCount(parseInt(e.target.value))}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", minWidth: 120, fontSize: 15 }}
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
            <button
              type="button"
              className="selector-button"
              style={{ fontSize: 15, padding: '8px 18px', borderRadius: 6, background: '#e17055', color: '#fff', border: 'none', fontWeight: 600, boxShadow: '0 2px 8px #e1705533', transition: 'background 0.2s' }}
              onClick={fetchMultipleQuestions}
              disabled={loadingMultiple}
            >
              {loadingMultiple ? (lang === 'ar' ? 'جاري التحميل...' : 'טוען...') : labels.fetchMultiple}
            </button>
          </div>
        </div>

        {/* Specific IDs selection section */}
        <div style={{ margin: "32px 0 24px 0" }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#3b3b3b' }}>
            {labels.specificIds}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <input
              type="text"
              placeholder={labels.example}
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", minWidth: 120, fontSize: 15 }}
            />
            <button
              type="button"
              className="selector-button"
              style={{ fontSize: 15, padding: '8px 18px', borderRadius: 6, background: '#6c5ce7', color: '#fff', border: 'none', fontWeight: 600, boxShadow: '0 2px 8px #6c5ce733', transition: 'background 0.2s' }}
              onClick={addIdToList}
            >
              {labels.addId}
            </button>
          </div>
          
          {selectedIds.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#3b3b3b' }}>
                {labels.selectedIdsList}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedIds.map((id, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 12px',
                      background: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: 20,
                      fontSize: 14
                    }}
                  >
                    <span>{id}</span>
                    <button
                      type="button"
                      onClick={() => removeIdFromList(id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="selector-button"
                style={{ 
                  fontSize: 15, 
                  padding: '8px 18px', 
                  borderRadius: 6, 
                  background: '#fd79a8', 
                  color: '#fff', 
                  border: 'none', 
                  fontWeight: 600, 
                  boxShadow: '0 2px 8px #fd79a833', 
                  transition: 'background 0.2s',
                  marginTop: 12
                }}
                onClick={fetchQuestionsByIds}
                disabled={loadingSpecificIds}
              >
                {loadingSpecificIds ? (lang === 'ar' ? 'جاري التحميل...' : 'טוען...') : labels.fetchByIds}
              </button>
            </div>
          )}
        </div>

        <form className="selector-form" onSubmit={handleShow}>
          <label htmlFor="question-id" className="selector-label">
            {labels.questionId}
          </label>
          <div className="input-wrapper">
            <input
              id="question-id"
              type="text"
              className="selector-input"
              placeholder={labels.example}
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
            />
          </div>
          <div className="button-group">
            <button type="submit" className="selector-button">
              {labels.show}
            </button>
          </div>
        </form>
        {feedback && (
          <div className="selector-feedback">{feedback}</div>
        )}
      </div>
    </div>
  );
}
