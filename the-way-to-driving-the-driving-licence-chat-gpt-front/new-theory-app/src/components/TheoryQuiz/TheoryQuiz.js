import React, { useEffect, useState } from "react";
import "./TheoryQuiz.css";

// וודאו שב־.env יש REACT_APP_API_URL=http://localhost:3000
const API_BASE = process.env.REACT_APP_API_URL;

export default function TheoryQuiz({
  forcedId = null,          // מזהה שאלה ספציפי (לדוגמה "0002"), אם נשלח
  lang: initialLang = "he", // "he" או "ar"
  onAnswered = () => {},    // callback מאפיפן האם נכונה
}) {
  // ------------------- State -------------------
  const [lang, setLang] = useState(initialLang);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // אותיות אפשריות לפי שפה
  const lettersHe = ["א", "ב", "ג", "ד"];
  const lettersAr = ["أ", "ب", "ج", "د"];
  const letters = lang === "ar" ? lettersAr : lettersHe;
  const dir = "rtl"; // עברית וערבית → RTL

  // תוויות (labels) לכל מחרוזת קבועה
  const labels = {
    questionNumber: lang === "ar" ? "رقم السؤال:" : "מספר השאלה:",
    subject: lang === "ar" ? "الموضوع:" : "נושא:",
    subSubject: lang === "ar" ? "الموضوع الفرعي:" : "תת־נושא:",
    buttonSubmit: lang === "ar" ? "إرسال תשובה" : "שלח תשובה",
    buttonSending: lang === "ar" ? "جارٍ الإرسال…" : "שולח…",
    loading: lang === "ar" ? "جاري הטעינה…" : "טוען…",
    noQuestions: lang === "ar" ? "אין שאלות זמינות בערבית" : "אין שאלות זמינות בעברית",
    fetchError: lang === "ar" ? "שגיאה בשליפת השאלה בערבית" : "שגיאה בשליפת השאלה בעברית",
    answerError: lang === "ar" ? "שגיאה בשליחת התשובה בערבית" : "שגיאה בשליחת התשובה בעברית",
  };

  // ---------------- fetchQuestion ----------------
  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback("");
    setSelected("");
    setQuestion(null);

    // אם סופק forcedId → GET /questions/:id?lang=…
    // אחרת → GET /questions/random?count=1&lang=…
    const url = forcedId
      ? `${API_BASE}/questions/${forcedId}?lang=${lang}`
      : `${API_BASE}/questions/random?count=1&lang=${lang}`;

    console.log("DEBUG: Fetching from URL →", url);

    try {
      const res = await fetch(url);

      if (!res.ok) {
        // קריאה שנכשלה (404 / 500 וכו' → קרא את הטקסט מהשרת וזרוק שגיאה)
        const text = await res.text();
        console.error("DEBUG: Server returned status", res.status, text);
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      // אם קיבלנו מערך ריק, אין שאלות זמינות
      if (Array.isArray(data) && data.length === 0) {
        setQuestion(null);
        setFeedback(labels.noQuestions);
      } else {
        // אם יוזמן ID ספציפי, נקבל אובייקט יחיד, אך אם rand, נקבל מערך
        const obj = forcedId ? data : data[0];
        setQuestion(obj);
      }
    } catch (err) {
      console.error("Error fetching question:", err);
      setQuestion(null);
      setFeedback(labels.fetchError);
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
          answer: selected,
          lang,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("DEBUG: Server returned status", res.status, text);
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setFeedback(data.feedback || labels.answerError);

      // האם הפידבק מכיל "נכונה" או "صحيح"
      const isCorrect = data.feedback
        ?.toLowerCase()
        .includes(lang === "ar" ? "صحيح" : "נכונה");
      onAnswered(isCorrect);
    } catch (err) {
      console.error("Error sending answer:", err);
      setFeedback(labels.answerError);
    } finally {
      setSending(false);
    }
  };

  // בכל שינוי של forcedId או lang נטען שאלה חדשה
  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedId, lang]);

  // ------------------ ה־UI ------------------------
  return (
    <div dir={dir} className="quiz-container">
      {/* כפתור החלפת שפה */}
      <div className="quiz-lang-toggle">
        <button onClick={() => setLang((l) => (l === "he" ? "ar" : "he"))}>
          {lang === "ar" ? "עברית" : "Arabic"}
        </button>
      </div>

      {/* Loader */}
      {loading && (
        <div className="quiz-loader">
          <div className="loader-spinner"></div>
        </div>
      )}

      {/* אין שאלה & יש feedback */}
      {!loading && !question && feedback && (
        <div className="quiz-feedback error">{feedback}</div>
      )}

      {/* אין שאלה & אין feedback (רק לרגע הקצר) */}
      {!loading && !question && !feedback && (
        <div className="quiz-feedback neutral">{labels.loading}</div>
      )}

      {/* אם יש שאלה – מציגים כאן */}
      {!loading && question && (
        <div className="quiz-card">
          {/* מספר השאלה */}
          <div className="quiz-question-id">
            {labels.questionNumber} {question.id}
          </div>

          {/* נושא */}
          <div className="quiz-subject-row">
            <strong>{labels.subject}</strong> {question.subject}
          </div>

          {/* תת־נושא (אם קיים) */}
          {question.subSubject && (
            <div className="quiz-subsubject-row">
              <strong>{labels.subSubject}</strong> {question.subSubject}
            </div>
          )}

          {/* תמונה (אם קיים) */}
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

          {/* תשובות וכפתור שליחה */}
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

            {/* פידבק אחרי שליחה */}
            {feedback && question && (
              <p className="quiz-feedback text">{feedback}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
