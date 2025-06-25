import React, { useState, useEffect } from "react";
import TheoryQuiz from "../TheoryQuiz/TheoryQuiz";
import "./QuestionSelector.css";

export default function QuestionSelector({ user, course, lang, onChangeLang }) {
  const [inputId, setInputId] = useState("");
  const [chosenId, setChosenId] = useState(null);
  const [feedback, setFeedback] = useState("");

  // �� נוסיף את התחום מה־localStorage
  const [field, setField] = useState("theory");

  useEffect(() => {
    const selectedField = localStorage.getItem("learningField") || "theory";
    setField(selectedField);
  }, []);

  const handleShow = (e) => {
    e.preventDefault();
    if (inputId.trim() === "") {
      setFeedback(lang === "ar" ? "אנא הכנס מזהה חוקי" : "אנא הכנס מזהה חוקי");
      return;
    }
    setChosenId(inputId.trim());
    setFeedback("");
  };

  const handleBack = () => {
    setChosenId(null);
    setInputId("");
    setFeedback("");
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

  return (
    <div className="selector-page-wrapper">
      <div className="selector-container" data-lang={lang}>
        <div className="field-indicator">
          {labels.field}
        </div>
        
        <h2 className="selector-title">
          {labels.selectFrom} {labels.field}
        </h2>

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
