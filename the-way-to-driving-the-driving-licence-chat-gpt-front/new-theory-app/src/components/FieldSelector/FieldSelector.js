import React from "react";
import { useNavigate } from "react-router-dom";
import "./FieldSelector.css"; // אם אתה רוצה CSS חיצוני

export default function EntrySelector() {
  const navigate = useNavigate();

  const handleSelect = (field) => {
    localStorage.setItem("learningField", field);
    if (field === "theory") {
      navigate("/theory-topic");
    } else {
      navigate("/psychology-topic");
    }
  };
  
    

  return (
    <div className="entry-selector" style={{ textAlign: "center", direction: "rtl", paddingTop: "2rem" }}>
      <h2 style={{ marginBottom: "2rem" }}>שלום! במה תרצה להתמקד?</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button onClick={() => handleSelect("psychology")} style={buttonStyle}>🧠 פסיכולוגיה</button>
        <button onClick={() => handleSelect("theory")} style={buttonStyle}>📘 תיאוריה</button>
      </div>
    </div>
  );
}

const buttonStyle = {
  fontSize: "1.2rem",
  padding: "1rem 2rem",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#007bff",
  color: "white",
  cursor: "pointer"
};
