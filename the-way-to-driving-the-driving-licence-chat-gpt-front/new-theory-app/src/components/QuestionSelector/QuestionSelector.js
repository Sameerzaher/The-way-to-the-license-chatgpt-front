import React, { useState, useEffect } from "react";
import TheoryQuiz from "../TheoryQuiz/TheoryQuiz";
import "./QuestionSelector.css";

export default function QuestionSelector() {
  const [inputId, setInputId] = useState("");
  const [chosenId, setChosenId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [lang, setLang] = useState("he");

  // 🧠 נוסיף את התחום מה־localStorage
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

  if (chosenId) {
    return (
      <div>
        <button className="back-button" onClick={handleBack}>
          {lang === "ar" ? "חזרה" : "חזרה"}
        </button>
        <TheoryQuiz
          forcedId={chosenId}
          lang={lang}
          field={field} // 🧠 שליחה של התחום לשימוש עתידי
          onAnswered={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="selector-page-wrapper">
      <div className="selector-container" data-lang={lang}>
        <div className="field-indicator">
          {field === "psychology" ? "פסיכולוגיה" : "תיאוריה"}
        </div>
        
        <h2 className="selector-title">
          {field === "psychology"
            ? "בחר שאלה מתוך מאגר פסיכולוגיה"
            : "בחר שאלה מתוך מאגר תיאוריה"}
        </h2>

        <form className="selector-form" onSubmit={handleShow}>
          <label htmlFor="question-id" className="selector-label">
            {lang === "ar" ? "מזהה שאלה:" : "מזהה שאלה:"}
          </label>
          
          <div className="input-wrapper">
            <input
              id="question-id"
              type="text"
              className="selector-input"
              placeholder={lang === "ar" ? "לדוגמה: 0001" : "לדוגמה: 0001"}
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
            />
          </div>

          <div className="button-group">
            <button type="submit" className="selector-button">
              {lang === "ar" ? "הצג שאלה" : "הצג שאלה"}
            </button>

            <button
              type="button"
              className="selector-lang-toggle"
              onClick={() => setLang((l) => (l === "he" ? "ar" : "he"))}
            >
              {lang === "ar" ? "עברית" : "Arabic"}
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
