import React from "react";
import "./SpecificIdsSection.css";

export default function SpecificIdsSection({
  idInput,
  setIdInput,
  selectedIds,
  setSelectedIds,
  loadingSpecificIds,
  setLoadingSpecificIds,
  lang,
  labels,
  onSpecificIds,
  setFeedback
}) {
  // Add ID to selected list
  const addIdToList = () => {
    if (idInput.trim() === "") {
      setFeedback(lang === "ar" ? "אנא הכנס מזהה" : "אנא הכנס מזהה");
      return;
    }
    const newId = idInput.trim();
    if (selectedIds.includes(newId)) {
      setFeedback(lang === "ar" ? "המזהה כבר קיים ברשימה" : "המזהה כבר קיים ברשימה");
      return;
    }
    setSelectedIds([...selectedIds, newId]);
    setIdInput("");
    setFeedback("");
  };

  // Remove ID from list
  const removeIdFromList = (idToRemove) => {
    setSelectedIds(selectedIds.filter(id => id !== idToRemove));
  };

  // Fetch questions by specific IDs
  const fetchQuestionsByIds = async () => {
    if (selectedIds.length === 0) {
      setFeedback(lang === "ar" ? "אנא בחר לפחות מזהה אחד" : "אנא בחר לפחות מזהה אחד");
      return;
    }
    
    setLoadingSpecificIds(true);
    setFeedback("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const questions = [];
      for (const id of selectedIds) {
        const url = `${apiUrl}/questions/${id}?lang=${lang}`;
        const res = await fetch(url);
        if (res.ok) {
          const question = await res.json();
          questions.push(question);
        } else {
          console.warn(`שאלה עם מזהה ${id} לא נמצאה`);
        }
      }
      
      if (questions.length > 0) {
        // Call parent callback with the questions data
        onSpecificIds(questions);
      } else {
        throw new Error(lang === "ar" ? "לא נמצאו שאלות למזהים שנבחרו" : "לא נמצאו שאלות למזהים שנבחרו");
      }
    } catch (err) {
      setFeedback(err.message || "שגיאה לא ידועה");
      setLoadingSpecificIds(false);
    }
  };

  return (
    <div className="control-group">
      <div className="section-header">
        {labels.specificIds}
      </div>
      <div className="control-row">
        <input
          type="text"
          className="control-input"
          placeholder={labels.example}
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
        />
        <button
          type="button"
          className="action-button btn-purple"
          onClick={addIdToList}
        >
          {labels.addId}
        </button>
      </div>
      
      {selectedIds.length > 0 && (
        <div className="selected-ids-display">
          <div className="selected-ids-label">
            {labels.selectedIdsList}
          </div>
          <div className="selected-ids-list">
            {selectedIds.map((id, index) => (
              <div key={index} className="selected-id-tag">
                <button
                  type="button"
                  className="remove-id-btn"
                  onClick={() => removeIdFromList(id)}
                >
                  ×
                </button>
                <span>{id}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="action-button btn-pink"
            onClick={fetchQuestionsByIds}
            disabled={loadingSpecificIds}
            style={{ marginTop: 12 }}
          >
            {loadingSpecificIds ? (lang === 'ar' ? 'جاري التحميل...' : 'טוען...') : labels.fetchByIds}
          </button>
        </div>
      )}
    </div>
  );
} 