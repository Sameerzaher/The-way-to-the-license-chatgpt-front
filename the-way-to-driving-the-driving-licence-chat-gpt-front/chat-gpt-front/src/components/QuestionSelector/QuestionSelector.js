// src/components/QuestionSelector.jsx
import { useState } from "react";
import TheoryQuiz from "../TheoryQuiz/TheoryQuiz";
import "./QuestionSelector.css";

export default function QuestionSelector() {
  // מצב לשמור את ה־ID שהמשתמש הכניס
  const [inputId, setInputId] = useState("");
  // מצב לשמור את ה־ID שנבחר לאמת ולשלוח ל־TheoryQuiz
  const [chosenId, setChosenId] = useState(null);
  // מצב לשמור באיזו שפה מציגים (he/ar)
  const [lang, setLang] = useState("he");

  const handleShow = (e) => {
    e.preventDefault();
    if (inputId.trim() === "") return;
    setChosenId(inputId.trim());
  };

  // כפתור חזרה: מאפס את chosenId ויוצא למסך הבחירה שוב
  const handleBack = () => {
    setChosenId(null);
    setFeedback("");
    setInputId("");
  };

  // בשלב הזה אין צורך ב־feedback (צרוב ב־TheoryQuiz), 
  // אבל אפשר להוסיף state אם רוצים הודעות ליד השדה.
  const [feedback, setFeedback] = useState("");

  // אם כבר יש chosenId, נציג את TheoryQuiz
  if (chosenId) {
    return (
      <div>
        <button className="back-button" onClick={handleBack}>
          ← חזרה למסך בחירת שאלה
        </button>

        {/* שולחים ל־TheoryQuiz את ה־forcedId וה־lang */}
        <TheoryQuiz forcedId={chosenId} lang={lang} onAnswered={() => {}} />
      </div>
    );
  }

  // אחרת, מציגים את מסך הבחירה
  return (
    <div className="selector-container">
      <h2 className="selector-title">בחר איזה שאלה להציג</h2>

      <form className="selector-form" onSubmit={handleShow}>
        <label htmlFor="question-id" className="selector-label">
          מזהה שאלה:
        </label>
        <input
          id="question-id"
          type="text"
          className="selector-input"
          placeholder="לדוגמה: 0001"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <button type="submit" className="selector-button">
          הצג שאלה
        </button>

        {/* כפתור להחלפת שפה */}
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
