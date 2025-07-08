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
          {/* PDF Export Button */}
          <button
            type="button"
            className="action-button btn-success"
            style={{ marginTop: 12, marginRight: 8 }}
            onClick={async () => {
              try {
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
                // שלוף את כל השאלות לפי מזהים
                const questions = [];
                for (const id of selectedIds) {
                  const url = `${apiUrl}/questions/${id}?lang=${lang}`;
                  const res = await fetch(url);
                  if (res.ok) {
                    const question = await res.json();
                    questions.push(question);
                  }
                }
                if (questions.length === 0) throw new Error('לא נמצאו שאלות למזהים שנבחרו');
                // צור HTML ל-PDF
                const htmlContent = `
                  <!DOCTYPE html>
                  <html dir="rtl" lang="${lang}">
                  <head>
                    <meta charset="UTF-8">
                    <title>ייצוא שאלות לפי מזהים</title>
                    <style>
                      body { font-family: 'Noto Sans Hebrew', 'Noto Sans Arabic', Arial, sans-serif; margin: 20px; direction: rtl; }
                      h1 { text-align: center; color: #333; }
                      .print-button { position: fixed; top: 20px; left: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
                      .print-button:hover { background: #0056b3; }
                      .question { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                      .question-text { font-weight: bold; margin-bottom: 10px; }
                      .answers { margin-right: 20px; }
                      .answer { margin-bottom: 5px; }
                      @media print { body { margin: 0; } .print-button { display: none; } }
                    </style>
                  </head>
                  <body>
                    <button class="print-button" onclick="window.print()">הדפס</button>
                    <h1>ייצוא שאלות לפי מזהים</h1>
                    ${questions.map((q, idx) => `
                      <div class="question">
                        <div class="question-text">${idx + 1}. ${q.question}</div>
                        <div class="answers">
                          ${Array.isArray(q.answers) ? q.answers.map((ans, i) => `<div class="answer">${String.fromCharCode(65 + i)}. ${ans}</div>`).join('') : ''}
                        </div>
                        ${q.image ? `<div class="question-image"><img src="${q.image}" style="max-width:180px;max-height:120px;display:block;margin:0 auto 10px;"/></div>` : ""}
                      </div>
                    `).join('')}
                  </body>
                  </html>
                `;
                const newWindow = window.open('', '_blank');
                newWindow.document.write(htmlContent);
                newWindow.document.close();
              } catch (err) {
                setFeedback(err.message || 'שגיאה לא ידועה');
              }
            }}
            disabled={selectedIds.length === 0}
          >
            <span role="img" aria-label="pdf">📄</span> ייצא שאלות נבחרות ל־PDF
          </button>
        </div>
      )}
    </div>
  );
} 