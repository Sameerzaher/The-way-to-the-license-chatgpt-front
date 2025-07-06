import React from "react";
import "./LicenseTypeFilter.css";

export default function LicenseTypeFilter({
  selectedLicense,
  setSelectedLicense,
  licenseOptions,
  loadingRandom,
  setLoadingRandom,
  lang,
  labels,
  selectedSubject,
  selectedSubSubject,
  onRandomQuestion,
  onExportPDF,
  setFeedback
}) {
  // Fetch random question by license type
  const fetchRandomQuestion = async () => {
    setLoadingRandom(true);
    setFeedback("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      let url = `${apiUrl}/questions/random?count=1&lang=${lang}`;
      if (selectedLicense) url += `&licenseType=${encodeURIComponent(selectedLicense)}`;
      if (selectedSubject) url += `&subject=${encodeURIComponent(selectedSubject)}`;
      if (selectedSubSubject) url += `&subSubject=${encodeURIComponent(selectedSubSubject)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("שגיאה בשליפת שאלה רנדומלית");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Call parent callback with the question data
        onRandomQuestion(data[0]);
      } else {
        throw new Error(lang === "ar" ? "לא נמצאו שאלות לסוג רישיון זה" : "לא נמצאו שאלות לסוג רישיון זה");
      }
    } catch (err) {
      setFeedback(err.message || "שגיאה לא ידועה");
      setLoadingRandom(false);
    }
  };

  // Export questions to PDF
  const exportQuestionsToPDF = async () => {
    if (!selectedLicense) {
      setFeedback(lang === "ar" ? "בחר סוג רישיון לייצוא" : "בחר סוג רישיון לייצוא");
      return;
    }
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      let url = `${apiUrl}/questions?lang=${lang}&licenseType=${selectedLicense}`;
      if (selectedSubject) url += `&subject=${encodeURIComponent(selectedSubject)}`;
      if (selectedSubSubject) url += `&subSubject=${encodeURIComponent(selectedSubSubject)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("שגיאה בשליפת שאלות לייצוא");
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(lang === "ar" ? "לא נמצאו שאלות לסוג רישיון זה" : "לא נמצאו שאלות לסוג רישיון זה");
      }
      
      // יצירת דף HTML עם השאלות
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="${lang}">
        <head>
          <meta charset="UTF-8">
          <title>${lang === "ar" ? "أسئلة للرخصة" : "שאלות לרישיון"} ${selectedLicense}</title>
          <style>
            body { font-family: 'Noto Sans Hebrew', 'Noto Sans Arabic', Arial, sans-serif; margin: 20px; direction: rtl; }
            h1 { text-align: center; color: #333; }
            .print-button { 
              position: fixed; 
              top: 20px; 
              left: 20px; 
              padding: 10px 20px; 
              background: #007bff; 
              color: white; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer; 
              font-size: 16px;
            }
            .print-button:hover { background: #0056b3; }
            .question { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .question-text { font-weight: bold; margin-bottom: 10px; }
            .answers { margin-right: 20px; }
            .answer { margin-bottom: 5px; }
            @media print { 
              body { margin: 0; } 
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">${lang === "ar" ? "طباعة" : "הדפס"}</button>
          <h1>${lang === "ar" ? "أسئلة للرخصة" : "שאלות לרישיון"} ${selectedLicense}
          ${selectedSubject ? ` - ${selectedSubject}` : ''}
          ${selectedSubSubject ? ` - ${selectedSubSubject}` : ''}
          </h1>
        ${data.map((q, idx) => `
          <div class="question">
            <div class="question-text">${idx + 1}. ${q.question}</div>
            <div class="answers">
              ${Array.isArray(q.answers) ? q.answers.map((ans, i) => 
                `<div class="answer">${String.fromCharCode(65 + i)}. ${ans}</div>`
              ).join('') : ''}
            </div>
            ${q.image ? `<div class="question-image"><img src="${q.image}" style="max-width:180px;max-height:120px;display:block;margin:0 auto 10px;"/></div>` : ""}
          </div>
        `).join('')}
        </body>
        </html>
      `;
      
      // פתיחת הדף בחלון חדש
      const newWindow = window.open('', '_blank');
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      
    } catch (err) {
      setFeedback(err.message || "שגיאה לא ידועה");
    }
  };

  return (
    <div className="control-group">
      <div className="section-header">
        {lang === 'ar' ? 'סנן לפי סוג רישיון' : 'סנן לפי סוג רישיון'}
      </div>
      <div className="control-row">
        <label className="control-label">{labels.licenseType}</label>
        <select
          className="control-select"
          value={selectedLicense}
          onChange={e => setSelectedLicense(e.target.value)}
        >
          <option value="">{labels.allTypes}</option>
          {licenseOptions.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button
          type="button"
          className="action-button btn-info"
          onClick={fetchRandomQuestion}
          disabled={loadingRandom}
        >
          {loadingRandom ? (lang === 'ar' ? 'جاري التحميل...' : 'טוען...') : labels.random}
        </button>
        <button
          type="button"
          className="action-button btn-success"
          onClick={exportQuestionsToPDF}
        >
          {lang === 'ar' ? 'ייצא שאלות ל־PDF' : 'ייצא שאלות ל־PDF'}
        </button>
      </div>
    </div>
  );
} 