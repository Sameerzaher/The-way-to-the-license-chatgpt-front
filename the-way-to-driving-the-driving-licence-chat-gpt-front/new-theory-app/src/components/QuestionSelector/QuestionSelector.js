import React, { useState, useEffect } from "react";
import TheoryQuiz from "../TheoryQuiz/TheoryQuiz";
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
    const isCorrect = normalize(selectedAnswer) === normalize(currentQuestion.correctAnswer);
    
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



  // שליחת בקשה ל־GPT אחרי הצגת תשובה
  useEffect(() => {
    if (showAnswer && practiceMode && practiceQuestions.length > 0) {
      const currentQuestion = practiceQuestions[currentQuestionIndex];
      if (!currentQuestion) return;
      setGptFeedback("");
      setGptLoading(true);
      // ניסוח אוטומטי
      const isCorrect = normalize(selectedAnswer) === normalize(currentQuestion?.correctAnswer);
      const prompt = isCorrect
        ? `הסבר למה התשובה נכונה לשאלה: "${currentQuestion.question}". התשובה: "${selectedAnswer}".`
        : `הסבר למה התשובה שגויה לשאלה: "${currentQuestion.question}". התשובה שבחרתי: "${selectedAnswer}". התשובה הנכונה: "${currentQuestion.correctAnswer}".`;
      fetch((process.env.REACT_APP_API_URL || 'http://localhost:3000') + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, userId: "practice-gpt" })
      })
        .then(res => res.json())
        .then(data => {
          setGptFeedback(data.response || "לא התקבל הסבר מה־AI.");
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
