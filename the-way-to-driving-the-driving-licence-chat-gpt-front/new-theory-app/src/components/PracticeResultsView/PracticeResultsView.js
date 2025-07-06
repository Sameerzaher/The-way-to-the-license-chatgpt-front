import React from "react";
import "./PracticeResultsView.css";

export default function PracticeResultsView({
  practiceScore,
  practiceQuestions,
  practiceResults,
  restartPractice,
  handleBack,
  lang,
  labels
}) {
  const percentage = Math.round((practiceScore / practiceQuestions.length) * 100);

  return (
    <div className="practice-results-container">
      <button className="back-button" onClick={handleBack}>
        {labels.back}
      </button>
      <div className="practice-results">
        <h2>{labels.practiceResults}</h2>
        <div className="results-summary">
          <div className="score-display">
            <div 
              className="score-circle"
              style={{ '--percentage': percentage }}
            >
              <span className="score-number">{percentage}%</span>
              <span className="score-text">{practiceScore}/{practiceQuestions.length}</span>
            </div>
          </div>
          <div className="results-breakdown">
            <div className="correct-count">
              <span className="count-label">{labels.correctAnswers}:</span>
              <span className="count-value correct">{practiceScore}</span>
            </div>
            <div className="incorrect-count">
              <span className="count-label">{labels.wrongAnswers}:</span>
              <span className="count-value incorrect">{practiceQuestions.length - practiceScore}</span>
            </div>
          </div>
        </div>
        
        <div className="results-actions">
          <button className="practice-button restart" onClick={restartPractice}>
            {labels.restartPractice}
          </button>
        </div>
        
        <div className="detailed-results">
          <h3>{lang === 'ar' ? 'تفاصيل الإجابات' : 'פרטי התשובות'}</h3>
          {practiceResults.map((result, index) => (
            <div key={index} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="result-question">
                <span className="question-number">#{index + 1}</span>
                <span className="question-text">{result.question}</span>
              </div>
              <div className="result-answers">
                <div className="selected-answer">
                  <span className="answer-label">{lang === 'ar' ? 'إجابتك:' : 'תשובתך:'}</span>
                  <span className={`answer-value ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                    {result.selectedAnswer}
                  </span>
                </div>
                {!result.isCorrect && (
                  <div className="correct-answer">
                    <span className="answer-label">{lang === 'ar' ? 'الإجابة الصحيحة:' : 'התשובה הנכונה:'}</span>
                    <span className="answer-value correct">{result.correctAnswer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 