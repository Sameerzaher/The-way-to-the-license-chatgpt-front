import React from "react";
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
  setFeedback
}) {
  // Start practice mode
  const startPractice = async () => {
    setLoadingPractice(true);
    setFeedback("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      let url = `${apiUrl}/questions?lang=${lang}`;
      if (selectedLicense) url += `&licenseType=${encodeURIComponent(selectedLicense)}`;
      if (selectedSubject) url += `&subject=${encodeURIComponent(selectedSubject)}`;
      if (selectedSubSubject) url += `&subSubject=${encodeURIComponent(selectedSubSubject)}`;
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
        throw new Error(lang === "ar" ? "לא נמצאו שאלות תאוריה במאגר" : "לא נמצאו שאלות תאוריה במאגר");
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