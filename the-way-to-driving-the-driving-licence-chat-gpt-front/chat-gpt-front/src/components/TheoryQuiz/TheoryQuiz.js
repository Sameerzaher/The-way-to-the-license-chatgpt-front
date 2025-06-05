// src/components/TheoryQuiz.jsx
import { useEffect, useState } from "react";
import "./TheoryQuiz.css"; // מייבא את ה־CSS

// המשתנה חייב להתחיל ב־REACT_APP_ כדי ש־CRA יטעין אותו
const API_BASE = process.env.REACT_APP_API_URL;

export default function TheoryQuiz({
  forcedId = null,          // אם מעוניינים לטעון שאלה לפי ID ספציפי
  lang: initialLang = "he", // "he" או "ar"
  onAnswered = () => {},    // callback ל־parent, מאתחלת כו־אין
}) {
  // ------------------- State -------------------
  const [lang, setLang] = useState(initialLang); // השפה הנוכחית
  const [question, setQuestion] = useState(null); // האובייקט השאלה
  const [selected, setSelected] = useState("");   // התשובה שנבחרה (אות)
  const [feedback, setFeedback] = useState("");   // פידבק אחרי שליחה ("נכונה" או "לא נכונה")
  const [loading, setLoading] = useState(false);  // מצב הטעינה
  const [sending, setSending] = useState(false);  // מצב שליחת התשובה

  // Debug: לראות ב־console מה הערך של lang ו־question
  console.log("DEBUG: current lang =", lang);
  console.log("DEBUG: question object =", question);

  // ---------------- fetchQuestion ----------------
  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback("");
    setSelected("");
    setQuestion(null);

    // בונים את ה־URL בהתאם:
    // אם forcedId (לדוגמה "0002") קיים → GET /questions/0002?lang=he|ar
    // אחרת → GET /questions/random?count=1&lang=he|ar
    try {
      const url = forcedId
        ? `${API_BASE}/questions/${forcedId}?lang=${lang}`
        : `${API_BASE}/questions/random?count=1&lang=${lang}`;

      const res = await fetch(url);
      const data = await res.json();

      // אם זה מערך ריק → אין שאלות זמינות
      if (Array.isArray(data) && data.length === 0) {
        setQuestion(null);
        setFeedback(lang === "ar" ? "אין שאלות זמינות בערבית" : "אין שאלות זמינות בעברית");
      } else {
        // data הוא או מערך שאלות (random) או אובייקט (כשהשתמשו ב־forcedId)
        const obj = forcedId ? data : data[0];
        setQuestion(obj);
      }
    } catch (err) {
      console.error("Error fetching question:", err);
      setQuestion(null);
      setFeedback(lang === "ar" ? "שגיאה בשליפת השאלה בערבית" : "שגיאה בשליפת השאלה בעברית");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- sendAnswer ----------------
  const sendAnswer = async () => {
    if (!selected || !question) return;
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/answers/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answer: selected, // לדוגמה: "א" או "ב" או "ج"
          lang,             // שולחים את השפה כדי שה־backend ישלח פידבק בשפה הנכונה
        }),
      });
      const data = await res.json();

      // data.feedback אמור לחזור כטקסט בשפה הנכונה
      setFeedback(data.feedback || (lang === "ar" ? "Error ממשוב" : "שגיאה בקבלת פידבק"));
      onAnswered(
        data.feedback?.toLowerCase().includes(lang === "ar" ? "صحيح" : "נכונה")
      );
    } catch (err) {
      console.error("Error sending answer:", err);
      setFeedback(lang === "ar" ? "שגיאה בשליחת התשובה בערבית" : "שגיאה בשליחת התשובה בעברית");
    } finally {
      setSending(false);
    }
  };

  // בכל פעם ש־forcedId או lang משתנים, נטען שאלה חדשה
  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line
  }, [forcedId, lang]);

  // במידה והכל תקין, question הוא כבר אובייקט עם השדות:
  // { id, question, answers, correctAnswerIndex, image, subject, subSubject }
  // כולם בשפה הנכונה (עברית או ערבית).

  // רמת תצוגת האותיות:
  const lettersHe = ["א", "ב", "ג", "ד"];
  const lettersAr = ["أ", "ب", "ج", "د"];
  const letters = lang === "ar" ? lettersAr : lettersHe;

  // כיוון הטקסט (עברית וערבית הן RTL)
  const dir = "rtl";

  // כל הטקסטים הקבועים ב־UI, בהתאם לשפה:
  const labels = {
    questionNumber: lang === "ar" ? "رقم السؤال:" : "מספר השאלה:",
    subject: lang === "ar" ? "الموضوع:" : "נושא:",
    subSubject: lang === "ar" ? "الموضوع الفرعي:" : "תת־נושא:",
    buttonSubmit: lang === "ar" ? "إرسال תשובה" : "שלח תשובה",
    buttonSending: lang === "ar" ? "جارٍ الإرسال…" : "שולח…",
    loading: lang === "ar" ? "جاري הטעינה…" : "טוען…",
  };

  return (
    <div dir={dir} className="quiz-container">
      {/* כפתור החלפת שפה */}
      <div className="quiz-lang-toggle">
        <button onClick={() => setLang((l) => (l === "he" ? "ar" : "he"))}>
          {lang === "ar" ? "עברית" : "Arabic"}
        </button>
      </div>

      {/* Loader כאשר השאלה בטעינה */}
      {loading && (
        <div className="quiz-loader">
          <div className="loader-spinner"></div>
        </div>
      )}

      {/* אם לא loading ואין שאלה ויש feedback (לדוגמה: "אין שאלות זמינות") */}
      {!loading && !question && feedback && (
        <div className="quiz-feedback error">{feedback}</div>
      )}

      {/* אם לא loading, אין שאלה וגם אין feedback (רגע קצר) */}
      {!loading && !question && !feedback && (
        <div className="quiz-feedback neutral">{labels.loading}</div>
      )}

      {/* אם יש שאלה (question) */}
      {!loading && question && (
        <div className="quiz-card">
          {/* מספר השאלה */}
          <div className="quiz-question-id">
            {labels.questionNumber} {question.id}
          </div>

          {/* נושא בשורה נפרדת */}
          <div className="quiz-subject-row">
            <strong>{labels.subject}</strong> {question.subject}
          </div>

          {/* תת־נושא בשורה נפרדת, אם קיים */}
          {question.subSubject && (
            <div className="quiz-subsubject-row">
              <strong>{labels.subSubject}</strong> {question.subSubject}
            </div>
          )}

          {/* אם יש תמונה, מציגים אותה משמאל */}
          {question.image && (
            <div className="quiz-image-container">
              <img
                src={question.image}
                alt={
                  lang === "ar"
                    ? `صورة السؤال ${question.id}`
                    : `תמונה לשאלה ${question.id}`
                }
                className="quiz-image"
              />
            </div>
          )}

          {/* כותרת השאלה */}
          <div className="quiz-card-header">
            <h2>{question.question}</h2>
          </div>

          {/* גוף הכרטיס: רשימת תשובות + כפתור שליחה */}
          <div className="quiz-card-body">
            <div className="quiz-options">
              {question.answers.map((ans, idx) => (
                <label key={idx} className="quiz-option">
                  <input
                    type="radio"
                    name={`answer-${question.id}`}
                    value={letters[idx]}
                    checked={selected === letters[idx]}
                    onChange={(e) => setSelected(e.target.value)}
                  />
                  <span className="quiz-option-text">
                    <strong>{letters[idx]}.</strong> {ans}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={sendAnswer}
              disabled={!selected || sending}
              className={`quiz-submit-button ${
                selected && !sending ? "" : "disabled"
              }`}
            >
              {sending ? labels.buttonSending : labels.buttonSubmit}
            </button>

            {feedback && question && (
              <p className="quiz-feedback text">{feedback}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
