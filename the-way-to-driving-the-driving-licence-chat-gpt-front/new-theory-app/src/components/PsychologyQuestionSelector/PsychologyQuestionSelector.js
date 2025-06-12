import React, { useState } from "react";
import TheoryQuiz from "../TheoryQuiz/TheoryQuiz";
import "./PsychologyQuestionSelector.css"; // אם תרצה עיצוב מותאם

export default function PsychologyQuestionSelector({ user }) {
  const [inputId, setInputId] = useState("");
  const [chosenId, setChosenId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [lang, setLang] = useState("he");

  const handleShow = (e) => {
    e.preventDefault();
    if (inputId.trim() === "") {
      setFeedback("אנא הכנס מזהה שאלה חוקי");
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
          ← חזרה
        </button>
        <TheoryQuiz
          forcedId={chosenId}
          lang={lang}
          field="psychology"
          onAnswered={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="selector-container">
      <h2 className="selector-title">בחר שאלה ממאגר הפסיכולוגיה</h2>

      <form className="selector-form" onSubmit={handleShow}>
        <label htmlFor="question-id" className="selector-label">
          מזהה שאלה:
        </label>
        <input
          id="question-id"
          type="text"
          className="selector-input"
          placeholder="לדוגמה: P001"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <button type="submit" className="selector-button">
          הצג שאלה
        </button>
        <button
          type="button"
          className="selector-lang-toggle"
          onClick={() => setLang((l) => (l === "he" ? "ar" : "he"))}
        >
          {lang === "he" ? "Arabic" : "עברית"}
        </button>
      </form>

      {feedback && <div className="selector-feedback">{feedback}</div>}
    </div>
  );
}
