import React from "react";
import "./MultipleQuestionsSection.css";

export default function MultipleQuestionsSection({
  questionCount,
  setQuestionCount,
  loadingMultiple,
  setLoadingMultiple,
  lang,
  labels,
  selectedLicense,
  selectedSubject,
  selectedSubSubject,
  onMultipleQuestions,
  setFeedback
}) {
  // Fetch multiple random questions
  const fetchMultipleQuestions = async () => {
    setLoadingMultiple(true);
    setFeedback("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      let url = `${apiUrl}/questions/random?count=${questionCount}&lang=${lang}`;
      if (selectedLicense) url += `&licenseType=${encodeURIComponent(selectedLicense)}`;
      if (selectedSubject) url += `&subject=${encodeURIComponent(selectedSubject)}`;
      if (selectedSubSubject) url += `&subSubject=${encodeURIComponent(selectedSubSubject)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("שגיאה בשליפת שאלות רנדומליות");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Call parent callback with the questions data
        onMultipleQuestions(data);
      } else {
        throw new Error(lang === "ar" ? "לא נמצאו שאלות לסוג רישיון זה" : "לא נמצאו שאלות לסוג רישיון זה");
      }
    } catch (err) {
      setFeedback(err.message || "שגיאה לא ידועה");
      setLoadingMultiple(false);
    }
  };

  return (
    <div className="control-group">
      <div className="section-header">
        {labels.multipleQuestions}
      </div>
      <div className="control-row">
        <label className="control-label">{labels.questionCount}</label>
        <select
          className="control-select"
          value={questionCount}
          onChange={e => setQuestionCount(parseInt(e.target.value))}
        >
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
        <button
          type="button"
          className="action-button btn-danger"
          onClick={fetchMultipleQuestions}
          disabled={loadingMultiple}
        >
          {loadingMultiple ? (lang === 'ar' ? 'جاري التحميل...' : 'טוען...') : labels.fetchMultiple}
        </button>
      </div>
    </div>
  );
} 