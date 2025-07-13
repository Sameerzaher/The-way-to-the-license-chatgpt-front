import React from "react";
import "./QuestionHeader.css";

export default function QuestionHeader({ questionText }) {
  return (
    <div className="quiz-card-header">
      <h2>{questionText}</h2>
    </div>
  );
} 