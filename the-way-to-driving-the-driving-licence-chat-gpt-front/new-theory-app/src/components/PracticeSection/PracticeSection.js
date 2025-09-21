import React, { useEffect } from "react";
import "./PracticeSection.css";

export default function PracticeSection({
  loadingPractice,
  setLoadingPractice,
  lang,
  labels,
  selectedLicense,
  selectedSubject,
  selectedSubSubject,
  onStartPractice,
  setFeedback,
  urlCategory,
  urlFilter,
  autoStart,
  user
  }) {
  // התחלה אוטומטית כאשר מגיעים עם פרמטרים מ-URL
  useEffect(() => {
    if (autoStart && urlCategory && urlFilter) {
      startPractice();
    }
  }, [autoStart, urlCategory, urlFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start practice mode
  const startPractice = async () => {
    setLoadingPractice(true);
    setFeedback("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      let url = `${apiUrl}/questions?lang=${lang}`;
      
      // הוספת פרמטרים מ-URL
      const subject = urlCategory || selectedSubject;
      const filter = urlFilter;
      
      if (selectedLicense) url += `&licenseType=${encodeURIComponent(selectedLicense)}`;
      if (subject) url += `&subject=${encodeURIComponent(subject)}`;
      if (selectedSubSubject) url += `&subSubject=${encodeURIComponent(selectedSubSubject)}`;
      
      // הוספת פילטר לשאלות שנותרו, שהושלמו או שגויות
      if (filter === 'remaining') {
        url += `&filter=remaining`;
        if (user && user.id) url += `&userId=${user.id}`;
      } else if (filter === 'completed') {
        url += `&filter=completed`;
        if (user && user.id) url += `&userId=${user.id}`;
      } else if (filter === 'wrong') {
        url += `&filter=wrong`;
        if (user && user.id) url += `&userId=${user.id}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`שגיאה בשליפת שאלות תאוריה: ${res.status} ${res.statusText}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const shuffledQuestions = data.sort(() => Math.random() - 0.5);
        // Call parent callback with the practice data
        onStartPractice({
          questions: shuffledQuestions,
          currentIndex: 0,
          score: 0,
          results: []
        });
      } else {
        const message = filter === 'remaining' 
          ? 'לא נמצאו שאלות שנותרו לפתור בנושא זה'
          : filter === 'completed'
          ? 'לא נמצאו שאלות שהושלמו בנושא זה'
          : filter === 'wrong'
          ? 'לא נמצאו שאלות שגויות בנושא זה'
          : 'לא נמצאו שאלות תאוריה במאגר';
        throw new Error(message);
      }
    } catch (err) {
      setFeedback(`שגיאה: ${err.message}`);
      setLoadingPractice(false);
    }
  };

  return (
    <div className="control-group">
      <div className="section-header">
        {labels.practiceMode}
      </div>
      <div className="control-row">
        <button
          type="button"
          className="action-button btn-warning"
          onClick={startPractice}
          disabled={loadingPractice}
        >
          {loadingPractice ? (lang === 'ar' ? 'جاري التحميل...' : 'טוען...') : labels.startPractice}
        </button>
      </div>
    </div>
  );
} 