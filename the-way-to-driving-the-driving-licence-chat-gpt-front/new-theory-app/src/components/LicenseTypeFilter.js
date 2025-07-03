import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

const licenseOptions = ["C1", "C", "D", "A", "1", "B"];

export default function LicenseTypeFilter() {
  const [selectedLicense, setSelectedLicense] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchQuestionsByLicense = async (license) => {
    setLoading(true);
    setError("");
    setQuestions([]);
    try {
      const url = `${API_BASE}/questions?licenseType=${license}&lang=he`;
      console.log("שולח בקשה לשרת:", url); // לוג ל-URL
      const res = await fetch(url);
      console.log("סטטוס תשובה מהשרת:", res.status); // לוג לסטטוס
      if (!res.ok) throw new Error("שגיאה בשליפת שאלות");
      const data = await res.json();
      console.log("תשובה מהשרת:", data); // לוג לתשובה
      setQuestions(data);
    } catch (err) {
      setError(err.message || "שגיאה לא ידועה");
      console.error("שגיאה בבקשה לשרת:", err); // לוג לשגיאה
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #0001" }}>
      <h2 style={{ textAlign: "center" }}>חיפוש שאלות לפי סוג רישיון</h2>
      <div style={{ margin: "20px 0" }}>
        <label style={{ fontWeight: 600, marginLeft: 8 }}>בחר סוג רישיון:</label>
        <select
          value={selectedLicense}
          onChange={e => {
            setSelectedLicense(e.target.value);
            if (e.target.value) fetchQuestionsByLicense(e.target.value);
            else setQuestions([]);
          }}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", minWidth: 120 }}
        >
          <option value="">-- בחר --</option>
          {licenseOptions.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      {loading && <div>טוען שאלות...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {questions.length > 0 && (
        <div>
          <h3>שאלות עבור רישיון {selectedLicense}:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {questions.map(q => (
              <li key={q.id} style={{ marginBottom: 24, padding: 16, border: "1px solid #eee", borderRadius: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>#{q.id} {q.question}</div>
                <div style={{ fontSize: 14, color: "#555" }}>נושא: {q.subject} | תת־נושא: {q.subSubject || "---"}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>סוגי רישיונות: {q.licenseTypes?.join(", ") || "---"}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedLicense && !loading && questions.length === 0 && !error && (
        <div>לא נמצאו שאלות עבור סוג רישיון זה.</div>
      )}
    </div>
  );
} 