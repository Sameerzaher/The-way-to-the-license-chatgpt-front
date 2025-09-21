// מנגנון חירום למניעת ריפרשים אינסופיים
let refreshCount = 0;
let lastRefreshTime = 0;

export const checkRefreshLoop = () => {
  const now = Date.now();
  
  // אם עברו פחות מ-2 שניות מהרפרש הקודם
  if (now - lastRefreshTime < 2000) {
    refreshCount++;
  } else {
    refreshCount = 1;
  }
  
  lastRefreshTime = now;
  
  // אם יש יותר מ-5 ריפרשים ב-10 שניות - עצור הכל
  if (refreshCount > 5) {
    console.error('🚨 EMERGENCY: Too many refreshes detected! Stopping all intervals and timeouts.');
    
    // עצירת כל intervals ו-timeouts
    for (let i = 1; i < 99999; i++) {
      clearInterval(i);
      clearTimeout(i);
    }
    
    // ניקוי localStorage שעלול לגרום לבעיות
    localStorage.removeItem('sidebar_last_fetch');
    localStorage.removeItem('dashboard_last_fetch');
    
    // הצגת הודעה למשתמש
    alert('זוהה רפרש אינסופי - המערכת הופסקה. הדף יתרענן עכשיו.');
    
    // רפרש אחרון
    window.location.reload();
    
    return true;
  }
  
  return false;
};

// הפעלה אוטומטית
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', checkRefreshLoop);
}
