import React from "react";
import TheoryQuiz from "../TheoryQuiz/TheoryQuiz";
import "./SingleQuestionView.css";

export default function SingleQuestionView({
  questionId,
  handleBack,
  lang,
  course,
  labels
}) {
  return (
    <div className="selector-page-wrapper">
      <div className="selector-container" data-lang={lang}>
        <button className="back-button" onClick={handleBack}>
          {labels.back}
        </button>
        <TheoryQuiz
          forcedId={questionId}
          lang={lang}
          field={course}
          onAnswered={() => {}}
        />
      </div>
    </div>
  );
} 