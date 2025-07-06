import React from "react";
import "./MultipleQuestionsView.css";

export default function MultipleQuestionsView({
  multipleQuestions,
  handleBack,
  showSpecificResults,
  lang,
  labels
}) {
  return (
    <div className="selector-page-wrapper">
      <div className="selector-container" data-lang={lang}>
        <button className="back-button" onClick={handleBack}>
          {labels.back}
        </button>
        <div className="multiple-questions-container">
          <h2>{showSpecificResults ? `${labels.specificIds} (${multipleQuestions.length} שאלות)` : labels.multipleResults}</h2>
          <div className="questions-grid">
            {multipleQuestions.map((question, index) => (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <span className="question-number">#{index + 1}</span>
                  <span className="question-id">ID: {question.id}</span>
                </div>
                <div className="question-content">
                  <h3>{question.question}</h3>
                  {question.image && (
                    <div className="question-image">
                      <img src={process.env.PUBLIC_URL + question.image} alt="שאלת תמרור" />
                    </div>
                  )}
                  <div className="answers-list">
                    {Array.isArray(question.answers) && question.answers.map((answer, i) => (
                      <div key={i} className="answer-item">
                        <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
                        <span className="answer-text">{answer}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="question-footer">
                  <span className="subject">{question.subject}</span>
                  {question.subSubject && (
                    <span className="sub-subject">{question.subSubject}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 