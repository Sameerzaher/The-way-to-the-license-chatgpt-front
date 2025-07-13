// export async function fetchUserProgress() {
//   const token = localStorage.getItem("token");
//   // Get userId from localStorage
//   let userId = null;
//   try {
//     const user = JSON.parse(localStorage.getItem('user'));
//     if (user && user.id) userId = user.id;
//   } catch (e) {
//     userId = null;
//   }
//   if (!userId) throw new Error("No userId found in localStorage");

//   const res = await fetch(`${process.env.REACT_APP_API_URL}/progress/topic-progres?userId=${userId}`, {
//     headers: {
//       "Authorization": token ? `Bearer ${token}` : undefined,
//       "Content-Type": "application/json"
//     }
//   });
//   if (!res.ok) throw new Error("Failed to fetch progress");
//   const data = await res.json();
  
//   // בדיקה אם הנתונים הם בפורמט החדש (אובייקט עם userId כמפתח)
//   // או בפורמט הישן (אובייקט ישיר)
//   if (data && typeof data === 'object' && !Array.isArray(data)) {
//     // בדיקה אם יש מפתחות שמתחילים במספר (userId)
//     const userIdKeys = Object.keys(data).filter(key => /^\d+$/.test(key));
    
//     if (userIdKeys.length > 0) {
//       // זה הפורמט החדש - צריך למצוא את המשתמש הנוכחי
//       if (userId && data[userId]) {
//         return data[userId];
//       } else {
//         // אם לא נמצא המשתמש, החזר אובייקט ריק
//         return {};
//       }
//     }
//   }
//   return data;
// }

// פונקציה חדשה לטיפול בנתוני התקדמות נושאים



export async function fetchUserProgress() {
  const token = localStorage.getItem("token");
  let userId = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) userId = user.id;
  } catch (e) {
    userId = null;
  }
  if (!userId) throw new Error("No userId found in localStorage");

  const res = await fetch(`${process.env.REACT_APP_API_URL}/progress/topic-progress?userId=${userId}`, {
    headers: {
      "Authorization": token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error("Failed to fetch progress");
  let data = await res.json();
  // תמיד תחזיר אובייקט עם userId כמפתח
  if (!data || typeof data !== 'object' || Array.isArray(data) || !data[userId]) {
    data = { [userId]: { progressByCategory: {} } };
  }
  return data;
}

export async function fetchTopicProgress(userId, lang) {
  if (!userId) {
    console.log('No user ID available for topic progress');
    return {};
  }

  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/progress/topic-progress?userId=${userId}&lang=${lang}`);
    const data = await res.json();
    
    // בדיקה אם הנתונים הם בפורמט החדש
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const userIdKeys = Object.keys(data).filter(key => /^\d+$/.test(key));
      
      if (userIdKeys.length > 0 && data[userId]) {
        return data[userId];
      }
    }
    
    return data;
  } catch (err) {
    console.error('Failed to fetch topic progress:', err);
    return {};
  }
}

// פונקציה לטיפול ב-completedQuestions בפורמט החדש
export function processCompletedQuestions(completedQuestions, userId = null) {
  if (!completedQuestions) return [];
  
  // אם זה מערך של מחרוזות (פורמט ישן)
  if (Array.isArray(completedQuestions) && completedQuestions.length > 0) {
    if (typeof completedQuestions[0] === 'string') {
      // המר למערך של אובייקטים
      return completedQuestions.map(questionId => ({
        questionId,
        isCorrect: true, // ברירת מחדל
        answeredAt: new Date().toISOString(),
        answer: '', // לא ידוע בפורמט הישן
        responseTime: 0,
        attempts: 1,
        userNote: '',
        hintUsed: false
      }));
    }
  }
  
  // אם זה אובייקט עם userId כמפתח (פורמט חדש)
  if (typeof completedQuestions === 'object' && !Array.isArray(completedQuestions)) {
    const userIdKeys = Object.keys(completedQuestions).filter(key => /^\d+$/.test(key));
    
    if (userIdKeys.length > 0) {
      // אם יש userId ספציפי, החזר את הנתונים שלו
      if (userId && completedQuestions[userId]) {
        return Array.isArray(completedQuestions[userId]) ? completedQuestions[userId] : [];
      }
      // אחרת, החזר את כל הנתונים
      return Object.values(completedQuestions).flat();
    }
  }
  
  // אם זה מערך של אובייקטים (פורמט חדש)
  if (Array.isArray(completedQuestions)) {
    return completedQuestions;
  }
  
  return [];
}

// פונקציה לבדיקה אם שאלה הושלמה
export function isQuestionCompleted(completedQuestions, questionId, userId = null) {
  const processed = processCompletedQuestions(completedQuestions, userId);
  return processed.some(item => item.questionId === questionId);
}

// פונקציה לקבלת פרטי שאלה שהושלמה
export function getCompletedQuestionDetails(completedQuestions, questionId, userId = null) {
  const processed = processCompletedQuestions(completedQuestions, userId);
  return processed.find(item => item.questionId === questionId) || null;
}

// פונקציה לטיפול בנתוני התקדמות בפורמט החדש
export function processProgressData(data, userId = null) {
  if (!data) return {};

  if (typeof data === 'object' && !Array.isArray(data)) {
    const userIdKeys = Object.keys(data).filter(key => /^\d+$/.test(key));
    if (userIdKeys.length > 0) {
      if (userId && data[userId]) {
        return data[userId];
      }
      // If userId is missing or not found, return an empty object
      return {};
    }
  }
  return data;
}

// פונקציה לחישוב התקדמות מנתונים מעובדים
export function calculateProgress(progressData, category) {
  if (!progressData || !progressData[category]) {
    return { percent: 0, completed: 0, total: 0 };
  }
  const categoryData = progressData[category];
  // תמיכה גם ב-completed וגם ב-solved
  const completed = categoryData.completed ?? categoryData.solved ?? 0;
  const total = categoryData.total || 0;
  let percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  if (isNaN(percent)) percent = 0;
  return { percent, completed, total };
}

// פונקציה לחישוב התקדמות ממוצעת
export function calculateAverageProgress(progressData, categories) {
  if (!progressData || !Array.isArray(categories)) {
    return 0;
  }
  
  const values = categories.map(category => {
    const data = progressData[category];
    return data && data.total > 0 ? (data.completed / data.total) : 0;
  });
  
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(average * 100);
} 