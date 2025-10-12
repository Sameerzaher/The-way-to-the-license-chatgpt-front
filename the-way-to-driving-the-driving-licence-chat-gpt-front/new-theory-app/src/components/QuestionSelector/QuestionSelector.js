import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TheoryQuiz from "../TheoryQuiz/TheoryQuiz";
import { useStreakTracker } from "../../hooks/useStreakTracker";
import "./QuestionSelector.css";

// Import new components
import LicenseTypeFilter from "../LicenseTypeFilter/LicenseTypeFilter";
import PracticeSection from "../PracticeSection/PracticeSection";
import MultipleQuestionsSection from "../MultipleQuestionsSection/MultipleQuestionsSection";
import SpecificIdsSection from "../SpecificIdsSection/SpecificIdsSection";
import SubjectFilter from "../SubjectFilter/SubjectFilter";
import PDFExportRow from "../PDFExportRow/PDFExportRow";
import PracticeModeView from "../PracticeModeView/PracticeModeView";
import PracticeResultsView from "../PracticeResultsView/PracticeResultsView";
import MultipleQuestionsView from "../MultipleQuestionsView/MultipleQuestionsView";
import SingleQuestionView from "../SingleQuestionView/SingleQuestionView";

export default function QuestionSelector({ user, course, lang, onChangeLang }) {
  const location = useLocation();
  const { trackQuestion } = useStreakTracker();
  const [inputId, setInputId] = useState("");
  const [chosenId, setChosenId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  //  נוסיף את התחום מה־localStorage
  const [field, setField] = useState("theory");
  const [selectedLicense, setSelectedLicense] = useState("");
  const licenseOptions = ["C1", "C", "D", "A", "1", "B"];
  
  // State לטיפול בפרמטרים מ-URL
  const [urlCategory, setUrlCategory] = useState("");
  const [urlFilter, setUrlFilter] = useState("");
  const [autoStart, setAutoStart] = useState(false);
  
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
  

  // State לפידבק מה־GPT
  const [gptFeedback, setGptFeedback] = useState("");
  const [gptLoading, setGptLoading] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSubSubject, setSelectedSubSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [subSubjects, setSubSubjects] = useState([]);

  const normalize = str => (str || "").trim();

  useEffect(() => {
    const selectedField = localStorage.getItem("learningField") || "theory";
    setField(selectedField);
  }, []);

  // טיפול בפרמטרים מ-URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    const filter = searchParams.get('filter');
    
    if (category) {
      setUrlCategory(category);
      setSelectedSubject(category);
    }
    
    if (filter) {
      setUrlFilter(filter);
      // אם יש פילטר, נתחיל אוטומטית את התרגול
      if (filter === 'remaining' || filter === 'completed' || filter === 'wrong') {
        setAutoStart(true);
      }
    }
  }, [location.search]);

  // Callback functions to handle results from child components
  const handleRandomQuestion = (question) => {
    setRandomQuestion(question);
    setLoadingRandom(false);
  };

  const handleStartPractice = (practiceData) => {
    setPracticeQuestions(practiceData.questions);
    setCurrentQuestionIndex(practiceData.currentIndex);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setPracticeScore(practiceData.score);
    setPracticeResults(practiceData.results);
    setPracticeCompleted(false);
    setPracticeMode(true);
    setFeedback("");
    setLoadingPractice(false);
  };

  const handleMultipleQuestions = (questions) => {
    setMultipleQuestions(questions);
    setShowMultipleResults(true);
    setLoadingMultiple(false);
  };

  const handleSpecificIds = (questions) => {
    setMultipleQuestions(questions);
    setShowSpecificResults(true);
    setLoadingSpecificIds(false);
  };



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
    setAutoStart(false);
    setUrlCategory("");
    setUrlFilter("");
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
    
    // בדיקה אם יש תשובה נכונה מוגדרת
    let isCorrect = false;
    let hasCorrectAnswer = false;
    
    if (currentQuestion.correctAnswer && currentQuestion.correctAnswer.trim()) {
      isCorrect = normalize(selectedAnswer) === normalize(currentQuestion.correctAnswer);
      hasCorrectAnswer = true;
      
      // עדכון רצף למידה
      console.log('🔥 About to call trackQuestion in QuestionSelector with:', isCorrect);
      trackQuestion(isCorrect);
      console.log('🔥 Streak updated in QuestionSelector:', isCorrect ? 'Correct answer' : 'Wrong answer');
    } else {
      // אם אין תשובה נכונה מוגדרת, נשתמש ב-AI לבדיקה
      isCorrect = false; // נגדיר כ-false עד שנקבל פידבק מה-AI
      hasCorrectAnswer = false;
    }
    
    // Update score - רק אם יש תשובה נכונה מוגדרת
    if (isCorrect && hasCorrectAnswer) {
      setPracticeScore(prev => prev + 1);
    }
    
    // Save result locally
    const result = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer || 'לא מוגדר',
      isCorrect,
      hasCorrectAnswer
    };
    setPracticeResults(prev => [...prev, result]);
    
    // Save answer to server to update progress
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const answerObj = {
        userId: user.id,
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        isCorrect,
        answeredAt: new Date().toISOString(),
        responseTime: 0, // We don't track response time in practice mode
        attempts: 1,
        userNote: "",
        hintUsed: false,
        licenseTypes: currentQuestion.licenseTypes || []
      };
      
      await fetch(`${apiUrl}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answerObj)
      });
      
      console.log('Answer saved to server for progress tracking');
      
      // Update progress immediately after each answer
      window.dispatchEvent(new CustomEvent('progressUpdated'));
    } catch (error) {
      console.error('Error saving answer to server:', error);
      // Don't show error to user, just log it
    }
    
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
      
      // Update progress in sidebar after completing practice
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('progressUpdated'));
      }, 1000);
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



  // שליחת בקשה ל־GPT אחרי הצגת תשובה
  useEffect(() => {
    if (showAnswer && practiceMode && practiceQuestions.length > 0) {
      const currentQuestion = practiceQuestions[currentQuestionIndex];
      if (!currentQuestion) return;
      setGptFeedback("");
      setGptLoading(true);
      // ניסוח אוטומטי
      const hasCorrectAnswer = currentQuestion?.correctAnswer && currentQuestion.correctAnswer.trim();
      const isCorrect = hasCorrectAnswer ? normalize(selectedAnswer) === normalize(currentQuestion.correctAnswer) : false;
      
      let prompt;
      if (hasCorrectAnswer) {
        prompt = isCorrect
          ? `הסבר למה התשובה נכונה לשאלה: "${currentQuestion.question}". התשובה: "${selectedAnswer}".`
          : `הסבר למה התשובה שגויה לשאלה: "${currentQuestion.question}". התשובה שבחרתי: "${selectedAnswer}". התשובה הנכונה: "${currentQuestion.correctAnswer}".`;
      } else {
        // אם אין תשובה נכונה מוגדרת, נבקש מה-AI לבדוק את התשובה
        prompt = `בדוק אם התשובה נכונה לשאלה: "${currentQuestion.question}". התשובה שבחרתי: "${selectedAnswer}". אפשרויות התשובה: ${currentQuestion.answers?.join(', ') || 'לא מוגדרות'}. הסבר אם התשובה נכונה או שגויה ולמה.`;
      }
      fetch((process.env.REACT_APP_API_URL || 'http://localhost:3000') + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, userId: "practice-gpt" })
      })
        .then(res => res.json())
        .then(data => {
          const feedback = data.response || "לא התקבל הסבר מה־AI.";
          setGptFeedback(feedback);
          
          // אם אין תשובה נכונה מוגדרת, ננסה לפרש את התגובה של ה-AI
          if (!hasCorrectAnswer) {
            const aiResponse = feedback.toLowerCase();
            console.log('AI Response for analysis:', aiResponse);
            
            // חיפוש מילות מפתח חיוביות
            const positiveKeywords = ['נכונה', 'נכון', 'תשובה נכונה', 'תשובה נכון', 'צודק', 'נכון לחלוטין', 'תשובה נכונה לחלוטין'];
            const negativeKeywords = ['שגויה', 'שגוי', 'לא נכונה', 'לא נכון', 'לא צודק', 'תשובה שגויה', 'תשובה לא נכונה'];
            
            const hasPositiveKeywords = positiveKeywords.some(keyword => aiResponse.includes(keyword));
            const hasNegativeKeywords = negativeKeywords.some(keyword => aiResponse.includes(keyword));
            
            console.log('hasPositiveKeywords:', hasPositiveKeywords);
            console.log('hasNegativeKeywords:', hasNegativeKeywords);
            
            // אם יש מילות מפתח חיוביות ולא שליליות
            if (hasPositiveKeywords && !hasNegativeKeywords) {
              console.log('AI determined answer is correct');
              // עדכון הציון אם ה-AI אומר שהתשובה נכונה
              setPracticeScore(prev => prev + 1);
              // עדכון התוצאה המקומית
              setPracticeResults(prev => {
                const updatedResults = [...prev];
                const lastResult = updatedResults[updatedResults.length - 1];
                if (lastResult) {
                  lastResult.isCorrect = true;
                  lastResult.aiCorrected = true;
                }
                return updatedResults;
              });
              
              // עדכון רצף למידה
              console.log('🔥 About to call trackQuestion from GPT analysis with:', true);
              trackQuestion(true);
              console.log('🔥 Streak updated from GPT analysis: Correct answer');
            } else if (hasNegativeKeywords) {
              console.log('AI determined answer is incorrect');
              
              // עדכון רצף למידה
              console.log('🔥 About to call trackQuestion from GPT analysis with:', false);
              trackQuestion(false);
              console.log('🔥 Streak updated from GPT analysis: Wrong answer');
            } else {
              console.log('AI response is ambiguous');
            }
          }
        })
        .catch(() => setGptFeedback("שגיאה בקבלת הסבר מה־AI."))
        .finally(() => setGptLoading(false));
    }
    // eslint-disable-next-line
  }, [showAnswer, currentQuestionIndex]);


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
    random: lang === 'ar' ? 'שאלה רנدומلית לפי ءוג ريشيون' : 'שאלה רנדומלית לפי סוג רישיון',
    allTypes: lang === 'ar' ? 'כل الأنواع' : 'כל הסוגים',
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
      <SingleQuestionView
        questionId={chosenId}
        handleBack={handleBack}
        lang={lang}
        course={course}
        labels={labels}
      />
    );
  }

  if (randomQuestion) {
    return (
      <SingleQuestionView
        questionId={randomQuestion.id}
        handleBack={handleBack}
        lang={lang}
        course={course}
        labels={labels}
      />
    );
  }

  if (showMultipleResults || showSpecificResults) {
    return (
      <MultipleQuestionsView
        multipleQuestions={multipleQuestions}
        handleBack={handleBack}
        showSpecificResults={showSpecificResults}
        lang={lang}
        labels={labels}
      />
    );
  }

  // Practice mode view
  if (practiceMode && !practiceCompleted) {
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    return (
      <PracticeModeView
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        practiceQuestions={practiceQuestions}
        selectedAnswer={selectedAnswer}
        showAnswer={showAnswer}
        practiceScore={practiceScore}
        handleAnswerSelect={handleAnswerSelect}
        submitAnswer={submitAnswer}
        nextQuestion={nextQuestion}
        handleBack={handleBack}
        gptFeedback={gptFeedback}
        gptLoading={gptLoading}
        lang={lang}
        labels={labels}
        practiceResults={practiceResults}
      />
    );
  }

  if (practiceCompleted) {
    return (
      <PracticeResultsView
        practiceScore={practiceScore}
        practiceQuestions={practiceQuestions}
        practiceResults={practiceResults}
        restartPractice={restartPractice}
        handleBack={handleBack}
        lang={lang}
        labels={labels}
      />
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

        {/* הודעה מיוחדת כאשר מגיעים עם פרמטרים מ-URL */}
        {urlCategory && urlFilter && (
          <div className="url-filter-notice">
            <div className="notice-content">
              <h3>
                {urlFilter === 'remaining' 
                  ? `שאלות שנותרו בנושא: ${urlCategory}`
                  : urlFilter === 'completed'
                  ? `שאלות שהושלמו בנושא: ${urlCategory}`
                  : `שאלות שגויות בנושא: ${urlCategory}`
                }
              </h3>
              <p>
                {urlFilter === 'remaining' 
                  ? 'לחץ על "התחל תרגול תאוריה" כדי להתחיל לפתור את השאלות שנותרו'
                  : urlFilter === 'completed'
                  ? 'לחץ על "התחל תרגול תאוריה" כדי לסקור את השאלות שכבר פתרת'
                  : 'לחץ על "התחל תרגול תאוריה" כדי לסקור את השאלות שטעית בהן'
                }
              </p>
            </div>
          </div>
        )}

        <LicenseTypeFilter
          selectedLicense={selectedLicense}
          setSelectedLicense={setSelectedLicense}
          licenseOptions={licenseOptions}
          loadingRandom={loadingRandom}
          setLoadingRandom={setLoadingRandom}
          lang={lang}
          labels={labels}
          selectedSubject={selectedSubject}
          selectedSubSubject={selectedSubSubject}
          onRandomQuestion={handleRandomQuestion}
          setFeedback={setFeedback}
        />

        <PracticeSection
          loadingPractice={loadingPractice}
          setLoadingPractice={setLoadingPractice}
          lang={lang}
          labels={labels}
          selectedLicense={selectedLicense}
          selectedSubject={selectedSubject}
          selectedSubSubject={selectedSubSubject}
          onStartPractice={handleStartPractice}
          setFeedback={setFeedback}
          urlCategory={urlCategory}
          urlFilter={urlFilter}
          autoStart={autoStart}
          user={user}
        />

        <MultipleQuestionsSection
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          loadingMultiple={loadingMultiple}
          setLoadingMultiple={setLoadingMultiple}
          lang={lang}
          labels={labels}
          selectedLicense={selectedLicense}
          selectedSubject={selectedSubject}
          selectedSubSubject={selectedSubSubject}
          onMultipleQuestions={handleMultipleQuestions}
          setFeedback={setFeedback}
        />

        <SpecificIdsSection
          idInput={idInput}
          setIdInput={setIdInput}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          loadingSpecificIds={loadingSpecificIds}
          setLoadingSpecificIds={setLoadingSpecificIds}
          lang={lang}
          labels={labels}
          onSpecificIds={handleSpecificIds}
          setFeedback={setFeedback}
        />

        <SubjectFilter
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedSubSubject={selectedSubSubject}
          setSelectedSubSubject={setSelectedSubSubject}
          subjects={subjects}
          setSubjects={setSubjects}
          subSubjects={subSubjects}
          setSubSubjects={setSubSubjects}
          lang={lang}
        />

        <PDFExportRow
          selectedSubject={selectedSubject}
          selectedSubSubject={selectedSubSubject}
          lang={lang}
          setFeedback={setFeedback}
        />

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
