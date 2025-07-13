import React from "react";
import "./QuestionImage.css";

export default function QuestionImage({ image, id, lang }) {
  if (!image) return null;
  return (
    <div className="quiz-image-container">
      <img
        src={image}
        alt={lang === "ar" ? `صورة السؤال ${id}` : `תמונה לשאלה ${id}`}
        className="quiz-image"
      />
    </div>
  );
} 