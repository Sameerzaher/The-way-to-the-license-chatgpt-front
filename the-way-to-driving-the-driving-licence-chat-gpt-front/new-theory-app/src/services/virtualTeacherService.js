const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

/**
 * שירות המורה הוירטואלי
 * מספק פונקציות לאינטראקציה עם AI המורה
 */

// קבלת עצה אישית מה-AI
export const getAIAdvice = async (userId, userAnalysis) => {
  try {
    const prompt = `
אתה מורה וירטואלי מנוסה לנהיגה תיאורטית. 
נתוני המשתמש:
- התקדמות כללית: ${userAnalysis.overallProgress.toFixed(1)}%
- נושאים חלשים: ${userAnalysis.weakAreas.map(a => a.category).join(', ') || 'אין'}
- נושאים חזקים: ${userAnalysis.strongAreas.map(a => a.category).join(', ') || 'אין'}
- רצף למידה: ${userAnalysis.motivationLevel}

תן עצה אישית, מעודדת ומעשית למשתמש. כלול:
1. הערכה של המצב הנוכחי
2. 3 עצות קונקרטיות
3. מילת עידוד

תשובה בעברית, עד 150 מילים.
    `.trim();

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        userId: userId || 'virtual-teacher'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI advice');
    }

    const data = await response.json();
    return {
      success: true,
      advice: data.response || 'לא התקבלה עצה מה-AI'
    };
  } catch (error) {
    console.error('Error getting AI advice:', error);
    return {
      success: false,
      error: error.message,
      advice: 'לא ניתן להתחבר למורה כרגע. נסה שוב מאוחר יותר.'
    };
  }
};

// קבלת תוכנית למידה מותאמת
export const getAILearningPlan = async (userId, userAnalysis) => {
  try {
    const prompt = `
אתה מורה וירטואלי מנוסה. צור תוכנית למידה ל-30 ימים.

נתוני המשתמש:
- התקדמות: ${userAnalysis.overallProgress.toFixed(1)}%
- נושאים לשיפור: ${userAnalysis.recommendedFocus.join(', ') || 'אין'}

צור תוכנית שכוללת:
1. יעדים יומיים ספציפיים
2. יעדים שבועיים
3. אבני דרך חשובות

תשובה בפורמט רשימה, בעברית.
    `.trim();

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        userId: userId || 'virtual-teacher'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get learning plan');
    }

    const data = await response.json();
    return {
      success: true,
      plan: data.response || 'לא התקבלה תוכנית מה-AI'
    };
  } catch (error) {
    console.error('Error getting learning plan:', error);
    return {
      success: false,
      error: error.message,
      plan: 'לא ניתן להתחבר למורה כרגע. נסה שוב מאוחר יותר.'
    };
  }
};

// צ'אט חופשי עם המורה
export const chatWithTeacher = async (userId, message, conversationHistory = []) => {
  try {
    // בניית ההיסטוריה לשליחה
    const context = conversationHistory.length > 0
      ? `
היסטוריית שיחה:
${conversationHistory.slice(0, 3).map(conv => 
  `משתמש: ${conv.userMessage}\nמורה: ${conv.teacherResponse}`
).join('\n\n')}

`
      : '';

    const fullPrompt = `${context}אתה מורה וירטואלי מנוסה לנהיגה תיאורטית. ענה על השאלה הבאה:
${message}

תשובה בעברית, מקצועית ומועילה.`;

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: fullPrompt,
        userId: userId || 'virtual-teacher'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to chat with teacher');
    }

    const data = await response.json();
    return {
      success: true,
      response: data.response || 'לא התקבלה תשובה מהמורה'
    };
  } catch (error) {
    console.error('Error chatting with teacher:', error);
    return {
      success: false,
      error: error.message,
      response: 'לא ניתן להתחבר למורה כרגע. נסה שוב מאוחר יותר.'
    };
  }
};

// ניתוח נקודות חולשה
export const analyzeWeaknesses = async (userId, weakAreas) => {
  try {
    const prompt = `
אתה מורה וירטואלי. נתח את נקודות החולשה הבאות:
${weakAreas.map(area => `- ${area.category}: ${area.percentage.toFixed(1)}%`).join('\n')}

תן:
1. הסבר למה הנושאים האלה קשים
2. טיפים ספציפיים לשיפור
3. סדר לימוד מומלץ

תשובה בעברית, מעשית ומועילה.
    `.trim();

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        userId: userId || 'virtual-teacher'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze weaknesses');
    }

    const data = await response.json();
    return {
      success: true,
      analysis: data.response || 'לא התקבל ניתוח מה-AI'
    };
  } catch (error) {
    console.error('Error analyzing weaknesses:', error);
    return {
      success: false,
      error: error.message,
      analysis: 'לא ניתן להתחבר למורה כרגע. נסה שוב מאוחר יותר.'
    };
  }
};

// חיזוי הצלחה בבחינה
export const predictExamSuccess = async (userId, userAnalysis) => {
  try {
    // חישוב פשוט של סיכויי הצלחה
    let successProbability = 0;
    
    // התקדמות כללית (50% מהציון)
    successProbability += (userAnalysis.overallProgress / 100) * 50;
    
    // רצף למידה (30% מהציון)
    if (userAnalysis.motivationLevel === 'high') {
      successProbability += 30;
    } else if (userAnalysis.motivationLevel === 'medium') {
      successProbability += 15;
    }
    
    // נושאים חזקים (20% מהציון)
    successProbability += (userAnalysis.strongAreas.length / 4) * 20;
    
    const prompt = `
על בסיס הנתונים הבאים:
- התקדמות: ${userAnalysis.overallProgress.toFixed(1)}%
- סיכויי הצלחה: ${successProbability.toFixed(1)}%

תן חיזוי מפורט:
1. האם המשתמש מוכן לבחינה?
2. מה עוד צריך לשפר?
3. מתי מומלץ לגשת לבחינה?

תשובה בעברית, ממוקדת ומועילה.
    `.trim();

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        userId: userId || 'virtual-teacher'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to predict exam success');
    }

    const data = await response.json();
    return {
      success: true,
      probability: successProbability,
      prediction: data.response || 'לא התקבל חיזוי מה-AI'
    };
  } catch (error) {
    console.error('Error predicting exam success:', error);
    return {
      success: false,
      error: error.message,
      probability: 0,
      prediction: 'לא ניתן להתחבר למורה כרגע. נסה שוב מאוחר יותר.'
    };
  }
};

export default {
  getAIAdvice,
  getAILearningPlan,
  chatWithTeacher,
  analyzeWeaknesses,
  predictExamSuccess
};

