import React from "react";
import "./PracticeModeView.css";

export default function PracticeModeView({
  currentQuestion,
  currentQuestionIndex,
  practiceQuestions,
  selectedAnswer,
  showAnswer,
  practiceScore,
  handleAnswerSelect,
  submitAnswer,
  nextQuestion,
  handleBack,
  gptFeedback,
  gptLoading,
  lang,
  labels
}) {
  const normalize = str => (str || "").trim();
  const isCorrect = normalize(selectedAnswer) === normalize(currentQuestion?.correctAnswer);

  return (
    <div className="practice-container">
      <button className="back-button" onClick={handleBack}>
        {labels.back}
      </button>
      <div className="practice-header">
        <h2>{labels.practiceMode}</h2>
        <div className="practice-progress">
          {labels.questionNumber} {currentQuestionIndex + 1} {labels.of} {practiceQuestions.length}
        </div>
        <div className="practice-score">
          {labels.score}: {practiceScore}/{currentQuestionIndex + 1}
        </div>
      </div>
      
      <div className="practice-question">
        <h3>{currentQuestion.question}</h3>
        {currentQuestion.image && (
          <div className="question-image">
            <img src={process.env.PUBLIC_URL + currentQuestion.image} alt="שאלת תמרור" />
          </div>
        )}
        <div className="practice-answers">
          {Array.isArray(currentQuestion.answers) && currentQuestion.answers.map((answer, i) => (
            <button
              key={i}
              className={`practice-answer ${selectedAnswer === answer ? 'selected' : ''} ${
                showAnswer ? (answer === currentQuestion.correctAnswer ? 'correct' : 
                  selectedAnswer === answer && answer !== currentQuestion.correctAnswer ? 'incorrect' : '') : ''
              }`}
              onClick={() => handleAnswerSelect(answer)}
              disabled={showAnswer}
            >
              <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
              <span className="answer-text">{answer}</span>
            </button>
          ))}
        </div>
        
        <div className="practice-actions">
          {!showAnswer ? (
            <button
              className="practice-button submit"
              onClick={submitAnswer}
              disabled={!selectedAnswer}
            >
              {labels.submitAnswer}
            </button>
          ) : (
            <button
              className="practice-button next"
              onClick={nextQuestion}
            >
              {currentQuestionIndex < practiceQuestions.length - 1 ? labels.nextQuestion : labels.practiceResults}
            </button>
          )}
        </div>
        
        {showAnswer && (
          <>
            <div className={`practice-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect
                ? (lang === 'ar' ? 'إجابة صحيحة!' : 'תשובה נכונה!')
                : (currentQuestion.correctAnswer
                    ? (lang === 'ar'
                        ? `إجابة خاطئة. الإجابة الصحيحة هي: ${currentQuestion.correctAnswer}`
                        : `תשובה שגויה. התשובה הנכונה היא: ${currentQuestion.correctAnswer}`)
                    : (lang === 'ar'
                        ? 'إجابة خاطئة. لا נמצאה תשובה נכונה لسؤال هذا.'
                        : 'תשובה שגויה. לא נמצאה תשובה נכונה לשאלה זו.')
                  )
              }
            </div>
            <div className="gpt-auto-feedback">
              {gptLoading ? <span className="gpt-spinner">טוען הסבר מה־AI...</span> : (
                gptFeedback && <><b>הסבר מה־AI:</b> {gptFeedback}</>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 