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
  const [attempts, setAttempts] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());
  const [userNote, setUserNote] = useState("");
  const [hintUsed, setHintUsed] = useState(false);

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
    buttonSubmit: lang === "ar" ? "إرسال إجابة" : "שלח תשובה",
    buttonSending: lang === "ar" ? "جارٍ الإرسال…" : "שולח…",
    loading: lang === "ar" ? "جاري التحميل…" : "טוען…",
    noQuestions: lang === "ar" ? "لا توجد أسئلة جاهزة في العربية" : "אין שאלות זמינות בעברית",
    fetchError: lang === "ar" ? "خطأ في جلب السؤال من العربية" : "שגיאה בשליפת השאלה בעברית",
    answerError: lang === "ar" ? "خطأ في إرسال الإجابة من العربية" : "שגיאה בשליחת התשובה בעברית",
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

    // Calculate response time
    const answeredAt = new Date().toISOString();
    const responseTime = Date.now() - startTime;

    try {
      // First, check if the answer is correct (as before)
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

      // Send the full answer object to the server
      const answerObj = {
        questionId: question.id,
        answer: selected,
        isCorrect,
        answeredAt,
        responseTime,
        attempts,
        userNote,
        hintUsed
      };
      await fetch(`${API_BASE}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(answerObj)
      });

      // --- Send progress update ---
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/progress/answer-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify({
          questionId: question.id,
          isCorrect,
          answeredAt
        })
      });

      // Fetch latest progress and dispatch it
      const progressRes = await fetch(`${API_BASE}/progress/categories`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json"
        }
      });
      const progressData = await progressRes.json();
      window.dispatchEvent(new CustomEvent('progress-updated', { detail: progressData }));
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
    setAttempts(1);
    setStartTime(Date.now());
    setUserNote("");
    setHintUsed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedId, lang]);

  // ------------------ ה־UI ------------------------
  return (
    <div dir={dir} className="quiz-container">
      {/* כפתור החלפת שפה */}
     

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
            <div style={{ margin: '10px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 14 }}>
                הערה לעצמי:
                <input
                  type="text"
                  value={userNote}
                  onChange={e => setUserNote(e.target.value)}
                  style={{ width: '100%', marginTop: 4, borderRadius: 6, border: '1px solid #ccc', padding: 6 }}
                  placeholder="הערה (לא חובה)"
                />
              </label>
              <label style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={hintUsed}
                  onChange={e => setHintUsed(e.target.checked)}
                />
                השתמשתי ברמז
              </label>
            </div>
            <button
              onClick={sendAnswer}
              disabled={!selected || sending}
              className={`quiz-submit-button ${selected && !sending ? "" : "disabled"}`}
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
