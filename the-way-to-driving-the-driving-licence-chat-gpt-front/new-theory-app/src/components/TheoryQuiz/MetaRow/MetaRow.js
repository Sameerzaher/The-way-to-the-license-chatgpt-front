import React from "react";
import "./MetaRow.css";

export default function MetaRow({ subject, subSubject, licenseTypes, labels, lang }) {
  return (
    <div className="quiz-meta-row">
      <span className="quiz-meta-subject"><strong>{labels.subject}</strong> {subject}</span>
      <span className="quiz-meta-subsubject"><strong>{labels.subSubject}</strong> {subSubject || "—"}</span>
      <span className="quiz-meta-licenses"><strong>{labels.licenseTypes}</strong> {Array.isArray(licenseTypes) && licenseTypes.length > 0 ? licenseTypes.join(", ") : (lang === "ar" ? "لا يوجد" : "אין")}</span>
    </div>
  );
} 