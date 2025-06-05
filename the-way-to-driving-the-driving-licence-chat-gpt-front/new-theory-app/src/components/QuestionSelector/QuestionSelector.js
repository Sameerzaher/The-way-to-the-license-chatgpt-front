import React, { useState } from "react";
import TheoryQuiz from "../TheoryQuiz/TheoryQuiz";
import "./QuestionSelector.css";

export default function QuestionSelector() {
  // אם המשתמש כתב במספר השאלה לשאול
  const [inputId, setInputId] = useState("");
  // השאלה שנבחרה להצגה (ברגע שנלחץ 'הצג שאלה')
  const [chosenId, setChosenId] = useState(null);
  // אפשר גם לשמור feedback (למשל "לא נמצא מזהה כזה")
  const [feedback, setFeedback] = useState("");
  // נשתמש באותו state של שפה כמו ב־TheoryQuiz
  const [lang, setLang] = useState("he");

  // כשיש פנייה לטופס, נאתר את ה־ID
  const handleShow = (e) => {
    e.preventDefault();
    if (inputId.trim() === "") {
      setFeedback(lang === "ar" ? "אנא הכנס מזהה חוקי" : "אנא הכנס מזהה חוקי");
      return;
    }
    setChosenId(inputId.trim());
    setFeedback("");
  };

  // כפתור חזרה למסך הקודם (מאפס את chosenId)
  const handleBack = () => {
    setChosenId(null);
    setInputId("");
    setFeedback("");
  };

  // אם כבר נבחר ID, נציג את TheoryQuiz
  if (chosenId) {
    return (
      <div>
        <button className="back-button" onClick={handleBack}>
          ← {lang === "ar" ? "חזרה" : "חזרה"}
        </button>
        <TheoryQuiz forcedId={chosenId} lang={lang} onAnswered={() => {}} />
      </div>
    );
  }

  // מסך הבחירה כשעדיין לא נבחר ID
  return (
    <div className="selector-container">
      <h2 className="selector-title">
        {lang === "ar" ? "בחר מספר שאלה להצגה" : "בחר מספר שאלה להצגה"}
      </h2>

      <form className="selector-form" onSubmit={handleShow}>
        <label htmlFor="question-id" className="selector-label">
          {lang === "ar" ? "מזהה שאלה:" : "מזהה שאלה:"}
        </label>
        <input
          id="question-id"
          type="text"
          className="selector-input"
          placeholder={lang === "ar" ? "לדוגמה: 0001" : "לדוגמה: 0001"}
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <button type="submit" className="selector-button">
          {lang === "ar" ? "הצג שאלה" : "הצג שאלה"}
        </button>

        {/* כפתור להחלפת שפה */}
        <button
          type="button"
          className="selector-lang-toggle"
          onClick={() => setLang((l) => (l === "he" ? "ar" : "he"))}
        >
          {lang === "ar" ? "עברית" : "Arabic"}
        </button>
      </form>

      {feedback && (
        <div className="selector-feedback">{feedback}</div>
      )}
    </div>
  );
}
