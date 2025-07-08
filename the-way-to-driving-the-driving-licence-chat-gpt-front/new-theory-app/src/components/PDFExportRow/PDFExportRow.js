import React from "react";
import "./PDFExportRow.css";

export default function PDFExportRow({
  selectedSubject,
  selectedSubSubject,
  lang,
  setFeedback
}) {
  // Export questions to PDF
  const exportQuestionsToPDF = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      let url = `${apiUrl}/questions?lang=${lang}`;
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
          <title>${lang === "ar" ? "أسئلة للرخصة" : "שאלות לרישיון"}
          ${selectedSubject ? ` - ${selectedSubject}` : ''}
          ${selectedSubSubject ? ` - ${selectedSubSubject}` : ''}
          </title>
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
          <h1>${lang === "ar" ? "أسئلة للرخصة" : "שאלות לרישיון"}
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
    <div className="pdf-export-row" style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '18px 0 10px 0', justifyContent: 'flex-end' }}>
      <button
        type="button"
        className="action-button btn-success"
        onClick={exportQuestionsToPDF}
        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700 }}
        // אפשר תמיד לייצא
        disabled={false}
      >
        <span role="img" aria-label="pdf">📄</span>
        ייצא שאלות מסוננות ל־PDF
      </button>
      <span className="pdf-hint" style={{ fontSize: 13, color: '#636e72' }}>
        ייצא את כל השאלות של הנושא/תת-נושא שבחרת, או את כל השאלות אם לא נבחר סינון.
      </span>
    </div>
  );
} 