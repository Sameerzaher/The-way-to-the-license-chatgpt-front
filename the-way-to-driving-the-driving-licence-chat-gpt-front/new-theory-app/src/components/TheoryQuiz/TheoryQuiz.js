import React, { useEffect, useState } from "react";
import "./TheoryQuiz.css";
import MetaRow from "./MetaRow/MetaRow";
import QuestionImage from "./QuestionImage/QuestionImage";
import QuestionHeader from "./QuestionHeader/QuestionHeader";
import { fetchTopicProgress } from "../../services/userService";
import { useLoading } from "../../contexts/LoadingContext";
import { validateQuestion, validateApiResponse } from "../../utils/validation";
import { apiGet, withLoading } from "../../utils/apiHelpers";
import { useProgressUpdater } from "../../hooks/useProgressUpdater";

// וודאו שב־.env יש REACT_APP_API_URL=http://localhost:3000
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

// פונקציה שמנקה תווים מיוחדים מהערך
function cleanLicenseType(type) {
  // מסיר תווים שאינם אותיות/מספרים
  return typeof type === 'string' ? type.replace(/[^\w]/g, '') : type;
}

export default function TheoryQuiz({
  forcedId = null,          // מזהה שאלה ספציפי (לדוגמה "0002"), אם נשלח
  lang: initialLang = "he", // "he" או "ar"
  onAnswered = () => {},    // callback מאפיפן האם נכונה
}) {
  // ------------------- State -------------------
  const lang = initialLang; // Use prop directly instead of state
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Global loading context
  const { setLoading: setGlobalLoading } = useLoading();
  const { handleQuestionAnswered } = useProgressUpdater();
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
    licenseTypes: lang === "ar" ? "أنواع الرخص:" : "סוגי רישיונות:",
    buttonSubmit: lang === "ar" ? "إرسال إجابة" : "שלח תשובה",
    buttonSending: lang === "ar" ? "جارٍ الإرسال…" : "שולח…",
    loading: lang === "ar" ? "جاري التحميل…" : "טוען…",
    noQuestions: lang === "ar" ? "لا توجد أسئلة جاهزة في العربية" : "אין שאלות זמינות בעברית",
    fetchError: lang === "ar" ? "خطأ في جلب السؤال من العربية" : "שגיאה בשליפת השאלה בעברית",
    answerError: lang === "ar" ? "خطأ في إرسال الإجابة من العربية" : "שגיאה בשליחת התשובה בעברית",
  };

  // סוגי רישיונות אפשריים - removed unused variables

  // ---------------- fetchQuestion ----------------
  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback("");
    setSelected("");
    setQuestion(null);

    // אם סופק forcedId → GET /questions/:id?lang=…
    // אחרת → GET /questions/random?count=1&lang=…
    let url;
    if (forcedId) {
      url = `${API_BASE}/questions/${forcedId}?lang=${lang}`;
    } else {
      url = `${API_BASE}/questions/random?count=1&lang=${lang}`;
    }

    try {
      const data = await withLoading(
        setGlobalLoading,
        () => apiGet(url, ['id', 'question', 'answers']),
        'fetchQuestion'
      );

      // אם קיבלנו מערך ריק, אין שאלות זמינות
      if (Array.isArray(data) && data.length === 0) {
        setQuestion(null);
        setFeedback(labels.noQuestions);
      } else {
        // אם יוזמן ID ספציפי, נקבל אובייקט יחיד, אך אם rand, נקבל מערך
        const questionObj = forcedId ? data : data[0];
        
        // בדיקת תקינות השאלה
        if (validateQuestion(questionObj)) {
          setQuestion(questionObj);
        } else {
          throw new Error('Invalid question data received');
        }
      }
    } catch (err) {
      console.error("Error fetching question:", err);
      setQuestion(null);
      setFeedback(err.message || labels.fetchError);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- sendAnswer ----------------
  const sendAnswer = async () => {
    if (!selected || !question) return;
    setSending(true);

    // ניקוי licenseTypes לפני שליחה
    const cleanedLicenseTypes = Array.isArray(question.licenseTypes)
      ? question.licenseTypes.map(cleanLicenseType)
      : [];

    // שליפת userId מ־localStorage
    let userId = null;
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) userId = user.id;
    } catch (e) {
      userId = null;
    }
    // נסה לשלוף userId מה-token אם עדיין אין
    if (!userId) {
      // const token = localStorage.getItem('token'); // Removed as not used
      // כאן אפשר להוסיף לוגיקה לפענוח JWT אם צריך
      // לדוג' אם ה-token הוא JWT, אפשר לפענח אותו ולהוציא ממנו userId
      // כרגע רק לוג הודעה
      console.warn('User ID not found in localStorage. Please login again.');
    }
    // אם עדיין אין userId, הצג הודעה למשתמש ואל תשלח תשובה
    if (!userId) {
      setFeedback('לא ניתן לשלוח תשובה - יש להתחבר מחדש');
      setSending(false);
      return;
    }

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

      // 🔄 עדכון התקדמות בזמן אמת
      if (isCorrect) {
        handleQuestionAnswered({
          questionId: question.id,
          isCorrect: true,
          category: question.subject || question.topic || 'כללי',
          responseTime: responseTime,
          attempts: attempts
        });
      }

      // Send the full answer object to the server (כולל userId)
      const answerObj = {
        userId, // מזהה המשתמש
        questionId: question.id,
        answer: selected,
        isCorrect,
        answeredAt,
        responseTime,
        attempts,
        userNote,
        hintUsed,
        licenseTypes: cleanedLicenseTypes // שלח את הערך הנקי
      };
      console.log('POST /answers payload:', answerObj); // הדפסה לבדיקה
      await fetch(`${API_BASE}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(answerObj)
      });

      // --- לא שולחים יותר ל־/progress/answer-question ---

      // Fetch latest progress and dispatch it
      const token = localStorage.getItem("token");
      const progressRes = await fetch(`${API_BASE}/progress/categories`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json"
        }
      });
      const progressData = await progressRes.json();
      window.dispatchEvent(new CustomEvent('progress-updated', { detail: progressData }));

      // גם נעדכן את התקדמות הנושאים
      if (userId) {
        const topicProgressData = await fetchTopicProgress(userId, lang);
        window.dispatchEvent(new CustomEvent('topic-progress-updated', { detail: topicProgressData }));
      }
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
  // console.log("QUESTION DATA:", question);
  // console.log("SUBJECT:", question?.topic || question?.subject);
  // console.log("SUB SUBJECT:", question?.subSubject);
  // console.log("LICENSE TYPES:", question?.licenseTypes);
  return (
    <div dir={dir} className="quiz-container">
    

     

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

          {/* נושא, תת-נושא, סוגי רישיונות */}
          <MetaRow
            subject={question.topic || question.subject}
            subSubject={question.subSubject}
            licenseTypes={question.licenseTypes}
            labels={labels}
            lang={lang}
          />

          {/* תמונה (אם קיים) */}
          <QuestionImage image={question.image} id={question.id} lang={lang} />

          {/* כותרת השאלה */}
          <QuestionHeader questionText={question.question} />

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
