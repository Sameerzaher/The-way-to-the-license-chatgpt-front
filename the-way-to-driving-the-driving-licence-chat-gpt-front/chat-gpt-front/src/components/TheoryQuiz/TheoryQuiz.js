// src/components/TheoryQuiz.jsx
import { useEffect, useState } from "react";
import "./TheoryQuiz.css"; // מייבא את קובץ ה־CSS

// משתנה סביבה (CRA)
const API_BASE = process.env.REACT_APP_API_URL;

export default function TheoryQuiz({
  forcedId = null,          // מאפשרים לשלוח גם id מסוים במקום שאלה אקראית
  lang: initialLang = "he", // "he" או "ar"
  onAnswered = () => {},    // callback ל־Parent (לא חובה)
}) {
  // ------------------- state -------------------
  const [lang, setLang] = useState(initialLang); // שפה נוכחית
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Debug: בדיקה ש-API_BASE נטען
  console.log("DEBUG: API_BASE =", API_BASE);

  // ---------------- fetch question --------------
  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback("");
    setSelected("");
    setQuestion(null);
    try {
      // אם קיבלנו forcedId, נקרא ל־/questions/:id
      // אחרת נקבל שאלה אקראית
      const url = forcedId
        ? `${API_BASE}/questions/${forcedId}?lang=${lang}`
        : `${API_BASE}/questions/random?count=1&lang=${lang}`;

      const res = await fetch(url);
      const data = await res.json();

      // אם ה־API החזיר מערך ריק ([]), אין שאלות
      if (Array.isArray(data) && data.length === 0) {
        setQuestion(null);
        setFeedback(lang === "ar" ? "אין שאלות זמינות" : "אין שאלות זמינות");
      } else {
        const obj = forcedId ? data : data[0];
        setQuestion(obj);
      }
    } catch (err) {
      console.error("Error fetching question:", err);
      setQuestion(null);
      setFeedback(lang === "ar" ? "שגיאה בשליפת השאלה" : "שגיאה בשליפת השאלה");
    } finally {
      setLoading(false);
    }
  };

  // ------------- send answer to backend ---------
  const sendAnswer = async () => {
    if (!selected || !question) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/answers/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answer: selected,
          lang,
        }),
      });
      const data = await res.json();
      setFeedback(
        data.feedback ||
          (lang === "ar" ? "שגיאה בקבלת התשובה מ־GPT" : "שגיאה בקבלת התשובה מ־GPT")
      );
      onAnswered(
        data.feedback
          ?.toLowerCase()
          .includes(lang === "ar" ? "صحيح" : "נכונה")
      );
    } catch (err) {
      console.error("Error sending answer:", err);
      setFeedback(lang === "ar" ? "שגיאה בשליחת התשובה" : "שגיאה בשליחת התשובה");
    } finally {
      setSending(false);
    }
  };

  // ------------- effect: fetch on mount/changes -------------
  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedId, lang]);

  // לוג לשדה ה־image
  useEffect(() => {
    console.log("DEBUG: question =", question);
    console.log("DEBUG: image field =", question?.image);
  }, [question]);

  const lettersHe = ["א", "ב", "ג", "ד"];
  const lettersAr = ["أ", "ب", "ج", "د"];
  const letters = lang === "ar" ? lettersAr : lettersHe;
  const dir = "rtl"; // עברית וערבית הן RTL

  return (
    <div dir={dir} className="quiz-container">
      {/* כפתור למעבר בין עברית ↔︎ ערבית */}
      <div className="quiz-lang-toggle">
        <button onClick={() => setLang((l) => (l === "he" ? "ar" : "he"))}>
          {lang === "ar" ? "עברית" : "Arabic"}
        </button>
      </div>

      {/* Loader מרכזי */}
      {loading && (
        <div className="quiz-loader">
          <div className="loader-spinner"></div>
        </div>
      )}

      {/* אם אין loading, ואין שאלה, אבל יש feedback */}
      {!loading && !question && feedback && (
        <div className="quiz-feedback error">{feedback}</div>
      )}

      {/* אם אין loading, ואין שאלה וגם אין feedback */}
      {!loading && !question && !feedback && (
        <div className="quiz-feedback neutral">
          {lang === "ar" ? "גארי הטעינה…" : "טוען…"}
        </div>
      )}

      {/* אם יש שאלה */}
      {!loading && question && (
        <div className="quiz-card">
          {/* מספר השאלה (ID) */}
          <div className="quiz-question-id">
            {lang === "ar"
              ? `מספר השאלה: ${question.id}`
              : `מספר השאלה: ${question.id}`}
          </div>

          {/* נושא בשורה נפרדת */}
          <div className="quiz-subject-row">
            <strong>{lang === "ar" ? "נושא:" : "נושא:"}</strong> {question.subject}
          </div>

          {/* תת־נושא בשורה נפרדת (אם קיים) */}
          {question.subSubject && (
            <div className="quiz-subsubject-row">
              <strong>{lang === "ar" ? "תת־נושא:" : "תת־נושא:"}</strong> {question.subSubject}
            </div>
          )}

          {/* אם יש שדה image, מציגים תמונה */}
          {question.image && (
            <div className="quiz-image-container">
              <img
                src={question.image}
                alt={
                  lang === "ar"
                    ? `תמונה לשאלה ${question.id}`
                    : `Image for question ${question.id}`
                }
                className="quiz-image"
              />
            </div>
          )}

          {/* כותרת השאלה */}
          <div className="quiz-card-header">
            <h2>{question.question}</h2>
          </div>

          {/* גוף הכרטיס: תשובות וכפתור שליחה */}
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
              {sending
                ? lang === "ar"
                  ? "جارٍ الإرسال…"
                  : "שולח…"
                : lang === "ar"
                ? "إرسال תשובה"
                : "שלח תשובה"}
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
