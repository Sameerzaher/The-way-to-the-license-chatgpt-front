import React, { useState } from 'react';
import Icon from '../Icons/Icon';
import './PDFGenerator.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function PDFGenerator({ examId, userId, examData, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDownloadPDF = async (type = 'report') => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = type === 'certificate' ? 'certificate' : 'pdf';
      const response = await fetch(`${API_URL}/exams/${examId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${type}`);
      }

      // יצירת blob והורדה
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const filename = type === 'certificate' 
        ? `certificate-${examId}.pdf` 
        : `exam-report-${examId}.pdf`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(`${type === 'certificate' ? 'תעודה' : 'דוח'} הורד בהצלחה!`);
      
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      setError(`שגיאה ביצירת ${type === 'certificate' ? 'התעודה' : 'הדוח'}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToServer = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/exams/${examId}/save-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to save PDF');
      }

      const data = await response.json();
      setSuccess(`הדוח נשמר בהצלחה! קישור: ${data.downloadUrl}`);
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      setError(`שגיאה בשמירת הדוח: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const canGenerateCertificate = examData && examData.passed;

  return (
    <div className="pdf-generator-overlay">
      <div className="pdf-generator-modal">
        <div className="pdf-generator-header">
          <h2>
            <Icon name="dashboard" size="large" />
            יצירת דוחות PDF
          </h2>
          <button onClick={onClose} className="close-button">
            <Icon name="close" />
          </button>
        </div>

        <div className="pdf-generator-content">
          <p className="pdf-description">
            בחר את סוג הדוח שתרצה ליצור עבור הבחינה שלך
          </p>

          <div className="pdf-options">
            {/* דוח מפורט */}
            <div className="pdf-option">
              <div className="option-icon">
                <Icon name="dashboard" size="large" />
              </div>
              <div className="option-content">
                <h3>דוח מפורט</h3>
                <p>דוח מקיף עם כל הפרטים, התשובות, סטטיסטיקות והישגים</p>
                <button 
                  onClick={() => handleDownloadPDF('report')}
                  disabled={isLoading}
                  className="pdf-button primary"
                >
                  {isLoading ? (
                    <>
                      <Icon name="loading" /> יוצר דוח...
                    </>
                  ) : (
                    <>
                      <Icon name="save" /> הורד דוח מפורט
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* תעודת הצלחה */}
            {canGenerateCertificate && (
              <div className="pdf-option">
                <div className="option-icon">
                  <Icon name="achievements" size="large" />
                </div>
                <div className="option-content">
                  <h3>תעודת הצלחה</h3>
                  <p>תעודה יפה ומעוצבת לחגיגת ההצלחה שלך</p>
                  <button 
                    onClick={() => handleDownloadPDF('certificate')}
                    disabled={isLoading}
                    className="pdf-button success"
                  >
                    {isLoading ? (
                      <>
                        <Icon name="loading" /> יוצר תעודה...
                      </>
                    ) : (
                      <>
                        <Icon name="trophy" /> הורד תעודת הצלחה
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* שמירה לשרת */}
            <div className="pdf-option">
              <div className="option-icon">
                <Icon name="save" size="large" />
              </div>
              <div className="option-content">
                <h3>שמירה לשרת</h3>
                <p>שמור את הדוח בשרת וקבל קישור לחזרה אליו מאוחר יותר</p>
                <button 
                  onClick={handleSaveToServer}
                  disabled={isLoading}
                  className="pdf-button secondary"
                >
                  {isLoading ? (
                    <>
                      <Icon name="loading" /> שומר...
                    </>
                  ) : (
                    <>
                      <Icon name="save" /> שמור לשרת
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* הודעות */}
          {error && (
            <div className="message error">
              <Icon name="incorrect" />
              {error}
            </div>
          )}

          {success && (
            <div className="message success">
              <Icon name="check" />
              {success}
            </div>
          )}
        </div>

        <div className="pdf-generator-footer">
          <button onClick={onClose} className="cancel-button">
            <Icon name="close" /> סגור
          </button>
        </div>
      </div>
    </div>
  );
}

export default PDFGenerator;
