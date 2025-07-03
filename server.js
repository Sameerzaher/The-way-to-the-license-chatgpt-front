const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// נתונים לדוגמה - שאלות
const questions = [
  {
    id: "0001",
    question: "מהו המרחק המינימלי שצריך לשמור בין רכב לרכב אחר בכביש מהיר?",
    answers: ["50 מטר", "100 מטר", "150 מטר", "200 מטר"],
    correctAnswer: "100 מטר",
    subject: "חוקי תנועה",
    subSubject: "מרחקי בטיחות",
    licenseTypes: ["B", "C", "D"],
    lang: "he"
  },
  {
    id: "0002",
    question: "מה צריך לעשות כאשר מגיעים לצומת עם תמרור עצור?",
    answers: ["להאט ולבדוק אם יש תנועה", "לעצור לחלוטין", "להמשיך בזהירות", "לצפור ולעבור"],
    correctAnswer: "לעצור לחלוטין",
    subject: "חוקי תנועה",
    subSubject: "צמתים",
    licenseTypes: ["A", "B", "C1"],
    lang: "he"
  },
  {
    id: "0003",
    question: "מהו המהירות המקסימלית המותרת בישוב?",
    answers: ["30 קמ\"ש", "50 קמ\"ש", "70 קמ\"ש", "90 קמ\"ש"],
    correctAnswer: "50 קמ\"ש",
    subject: "חוקי תנועה",
    subSubject: "מהירויות",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0004",
    question: "מה צריך לעשות כאשר רואים רמזור אדום?",
    answers: ["להאט ולעבור", "לעצור לפני קו העצירה", "לצפור ולעבור", "להמשיך בזהירות"],
    correctAnswer: "לעצור לפני קו העצירה",
    subject: "חוקי תנועה",
    subSubject: "רמזורים",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0005",
    question: "מהו המרחק המינימלי שצריך לשמור בין רכב להולך רגל?",
    answers: ["1 מטר", "1.5 מטר", "2 מטר", "3 מטר"],
    correctAnswer: "1.5 מטר",
    subject: "חוקי תנועה",
    subSubject: "הולכי רגל",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0006",
    question: "מה צריך לעשות כאשר רואים תמרור 'נתיב להולכי רגל'?",
    answers: ["להאט ולעבור", "לעצור לחלוטין", "לאסור על הולכי רגל", "לאפשר להולכי רגל לעבור"],
    correctAnswer: "לאפשר להולכי רגל לעבור",
    subject: "חוקי תנועה",
    subSubject: "הולכי רגל",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0007",
    question: "מהו המהירות המקסימלית המותרת בכביש בין עירוני?",
    answers: ["70 קמ\"ש", "80 קמ\"ש", "90 קמ\"ש", "100 קמ\"ש"],
    correctAnswer: "90 קמ\"ש",
    subject: "חוקי תנועה",
    subSubject: "מהירויות",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0008",
    question: "מה צריך לעשות כאשר רואים תמרור 'עצור'?",
    answers: ["להאט ולבדוק", "לעצור לחלוטין", "להמשיך בזהירות", "לצפור ולעבור"],
    correctAnswer: "לעצור לחלוטין",
    subject: "חוקי תנועה",
    subSubject: "תמרורים",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0009",
    question: "מהו המרחק המינימלי שצריך לשמור בין רכב לאופנוע?",
    answers: ["1 מטר", "1.5 מטר", "2 מטר", "3 מטר"],
    correctAnswer: "1.5 מטר",
    subject: "חוקי תנועה",
    subSubject: "מרחקי בטיחות",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0010",
    question: "מה צריך לעשות כאשר רואים רמזור צהוב?",
    answers: ["להאיץ ולעבור", "לעצור אם אפשר", "להמשיך כרגיל", "לצפור ולעבור"],
    correctAnswer: "לעצור אם אפשר",
    subject: "חוקי תנועה",
    subSubject: "רמזורים",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0011",
    question: "מהו המרחק המינימלי שצריך לשמור בין רכב לרכב אחר בעת עצירה?",
    answers: ["1 מטר", "2 מטר", "3 מטר", "5 מטר"],
    correctAnswer: "2 מטר",
    subject: "חוקי תנועה",
    subSubject: "מרחקי בטיחות",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0012",
    question: "מה צריך לעשות כאשר רואים תמרור 'נתיב לרכב דו-גלגלי'?",
    answers: ["להאט ולעבור", "לאסור על רכב דו-גלגלי", "לאפשר לרכב דו-גלגלי לעבור", "לצפור ולעבור"],
    correctAnswer: "לאפשר לרכב דו-גלגלי לעבור",
    subject: "חוקי תנועה",
    subSubject: "תמרורים",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0013",
    question: "מהו המהירות המקסימלית המותרת בכביש מהיר?",
    answers: ["80 קמ\"ש", "100 קמ\"ש", "110 קמ\"ש", "120 קמ\"ש"],
    correctAnswer: "110 קמ\"ש",
    subject: "חוקי תנועה",
    subSubject: "מהירויות",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0014",
    question: "מה צריך לעשות כאשר רואים תמרור 'נתיב לרכב ציבורי'?",
    answers: ["להאט ולעבור", "לאסור על רכב ציבורי", "לאפשר לרכב ציבורי לעבור", "לצפור ולעבור"],
    correctAnswer: "לאסור על רכב ציבורי",
    subject: "חוקי תנועה",
    subSubject: "תמרורים",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0015",
    question: "מהו המרחק המינימלי שצריך לשמור בין רכב לרכב אחר בעת נסיעה?",
    answers: ["1 שנייה", "2 שניות", "3 שניות", "4 שניות"],
    correctAnswer: "2 שניות",
    subject: "חוקי תנועה",
    subSubject: "מרחקי בטיחות",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he"
  },
  {
    id: "0019",
    question: "מה המשמעות של התמרור הבא?",
    answers: ["אין כניסה", "פנייה שמאלה", "פנייה ימינה", "מעגל תנועה"],
    correctAnswer: "אין כניסה",
    subject: "תמרורים",
    subSubject: "תמרורים רגילים",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he",
    image: "/images/no-entry.png"
  },
  {
    id: "1802",
    question: "מה פירוש התמרור?",
    answers: [
      "עבור את המקום המסומן בתמרור מצד הימני בלבד.",
      "דרך מפוצלת לשני כיווני הנסיעה בצומת הקרוב.",
      "סע ימינה או שמאלה.",
      "פניית פרסה שמאלה אסורה."
    ],
    correctAnswer: "סע ימינה או שמאלה.",
    subject: "תמרורים",
    subSubject: "פירושי תמרורים",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "he",
    image: "/images/turn-left-or-right.png"
  }
];

// נתונים לדוגמה - שאלות בערבית
const arabicQuestions = [
  {
    id: "A001",
    question: "ما هي المسافة الدنيا التي يجب الحفاظ عليها بين سيارة وأخرى على الطريق السريع؟",
    answers: ["50 متر", "100 متر", "150 متر", "200 متر"],
    correctAnswer: "100 متر",
    subject: "قوانين المرور",
    subSubject: "مسافات الأمان",
    licenseTypes: ["B", "C", "D"],
    lang: "ar"
  },
  {
    id: "A002",
    question: "ماذا يجب فعله عند الوصول إلى تقاطع مع علامة توقف؟",
    answers: ["الإبطاء والتحقق من وجود حركة", "التوقف تماماً", "المتابعة بحذر", "الزمر والمرور"],
    correctAnswer: "التوقف تماماً",
    subject: "قوانين المرور",
    subSubject: "التقاطعات",
    licenseTypes: ["A", "B", "C1"],
    lang: "ar"
  },
  {
    id: "A003",
    question: "ما هي السرعة القصوى المسموح بها في المناطق السكنية؟",
    answers: ["30 كم/ساعة", "50 كم/ساعة", "70 كم/ساعة", "90 كم/ساعة"],
    correctAnswer: "50 كم/ساعة",
    subject: "قوانين المرور",
    subSubject: "السرعات",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "ar"
  },
  {
    id: "A004",
    question: "ماذا يجب فعله عند رؤية إشارة مرور حمراء؟",
    answers: ["الإبطاء والمرور", "التوقف قبل خط التوقف", "الزمر والمرور", "المتابعة بحذر"],
    correctAnswer: "التوقف قبل خط التوقف",
    subject: "قوانين المرور",
    subSubject: "إشارات المرور",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "ar"
  },
  {
    id: "A005",
    question: "ما هي المسافة الدنيا التي يجب الحفاظ عليها بين سيارة ومشاة؟",
    answers: ["1 متر", "1.5 متر", "2 متر", "3 متر"],
    correctAnswer: "1.5 متر",
    subject: "قوانين المرור",
    subSubject: "المشاة",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "ar"
  },
  {
    id: "A009",
    question: "ما معنى هذه الإشارة؟",
    answers: ["ممنوع الدخول", "اتجاه إجباري لليسار", "اتجاه إجباري لليمين", "دوران إلزامي"],
    correctAnswer: "ممنوع الدخول",
    subject: "إشارات المرور",
    subSubject: "إشارات عادية",
    licenseTypes: ["A", "B", "C1", "C", "D"],
    lang: "ar",
    image: "/images/no-entry.png"
  }
];

// פונקציה לסינון שאלות
function filterQuestions(questions, filters = {}) {
  let filtered = [...questions];
  
  // סינון לפי שפה
  if (filters.lang) {
    filtered = filtered.filter(q => q.lang === filters.lang);
  }
  
  // סינון לפי סוג רישיון
  if (filters.licenseType) {
    console.log('סינון לפי licenseType:', filters.licenseType);
    filtered = filtered.filter(q =>
      q.licenseTypes &&
      q.licenseTypes.some(type => type.toLowerCase() === filters.licenseType.toLowerCase())
    );
    console.log('נשארו שאלות:', filtered.length);
  }
  
  return filtered;
}

// נתיב לקבלת כל השאלות
app.get('/questions', (req, res) => {
  try {
    const { lang = 'he', licenseType } = req.query;
    
    // בחירת מערך השאלות לפי השפה
    let allQuestions = lang === 'ar' ? arabicQuestions : questions;
    
    // סינון השאלות
    const filteredQuestions = filterQuestions(allQuestions, { lang, licenseType });
    
    res.json(filteredQuestions);
  } catch (error) {
    console.error('שגיאה בשליפת שאלות:', error);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// נתיב לקבלת שאלה רנדומלית
app.get('/questions/random', (req, res) => {
  try {
    const { count = 1, lang = 'he', licenseType } = req.query;
    
    // בחירת מערך השאלות לפי השפה
    let allQuestions = lang === 'ar' ? arabicQuestions : questions;
    
    // סינון השאלות
    let filteredQuestions = filterQuestions(allQuestions, { lang, licenseType });
    
    // בחירת שאלות רנדומליות
    const randomQuestions = [];
    const numQuestions = Math.min(parseInt(count), filteredQuestions.length);
    
    for (let i = 0; i < numQuestions; i++) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      randomQuestions.push(filteredQuestions[randomIndex]);
      filteredQuestions.splice(randomIndex, 1);
    }
    
    res.json(randomQuestions);
  } catch (error) {
    console.error('שגיאה בשליפת שאלה רנדומלית:', error);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// נתיב לקבלת שאלה ספציפית לפי ID
app.get('/questions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'he' } = req.query;
    
    // בחירת מערך השאלות לפי השפה
    let allQuestions = lang === 'ar' ? arabicQuestions : questions;
    
    // חיפוש השאלה לפי ID
    const question = allQuestions.find(q => q.id === id);
    
    if (!question) {
      return res.status(404).json({ error: 'שאלה לא נמצאה' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('שגיאה בשליפת שאלה:', error);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// נתיב לבדיקת תשובה
app.post('/answers/check', (req, res) => {
  try {
    const { questionId, answer, lang = 'he' } = req.body;
    
    // בחירת מערך השאלות לפי השפה
    let allQuestions = lang === 'ar' ? arabicQuestions : questions;
    
    // חיפוש השאלה
    const question = allQuestions.find(q => q.id === questionId);
    
    if (!question) {
      return res.status(404).json({ error: 'שאלה לא נמצאה' });
    }
    
    // בדיקת התשובה
    const isCorrect = question.correctAnswer === answer;
    const feedback = isCorrect 
      ? (lang === 'ar' ? 'إجابة صحيحة!' : 'תשובה נכונה!')
      : (lang === 'ar' ? 'إجابة خاطئة. الإجابة الصحيحة هي: ' + question.correctAnswer : 'תשובה שגויה. התשובה הנכונה היא: ' + question.correctAnswer);
    
    res.json({
      isCorrect,
      feedback,
      correctAnswer: question.correctAnswer
    });
  } catch (error) {
    console.error('שגיאה בבדיקת תשובה:', error);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// נתיב לשמירת תשובה
app.post('/answers', (req, res) => {
  try {
    const answerData = req.body;
    console.log('תשובה נשמרה:', answerData);
    res.json({ success: true, message: 'תשובה נשמרה בהצלחה' });
  } catch (error) {
    console.error('שגיאה בשמירת תשובה:', error);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// נתיב להתקדמות המשתמש
app.get('/progress', (req, res) => {
  try {
    // כאן תהיה לוגיקה לקבלת התקדמות מהמסד נתונים
    // כרגע נחזיר נתונים לדוגמה
    res.json({
      totalQuestions: 100,
      answeredQuestions: 45,
      correctAnswers: 38,
      progress: 45
    });
  } catch (error) {
    console.error('שגיאה בשליפת התקדמות:', error);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Questions endpoint: http://localhost:${PORT}/questions`);
  console.log(`🎲 Random questions: http://localhost:${PORT}/questions/random`);
});

module.exports = app; 