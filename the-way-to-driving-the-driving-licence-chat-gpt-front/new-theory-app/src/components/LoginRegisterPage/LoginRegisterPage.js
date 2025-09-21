import React, { useState } from "react";
import "./LoginRegisterPage.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function LoginRegisterPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // "register" or "login"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("theory"); // "theory" or "psychology"
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setCourse("theory");
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    // Validation for dates
    if (mode === "register" && startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      setError("תאריך הסיום חייב להיות אחרי תאריך ההתחלה");
      setLoading(false);
      return;
    }

    const endpoint = mode === "register" ? "/user/register" : "/user/login";
    const body =
      mode === "register" 
        ? { 
            name: name.trim(), 
            email, 
            course,
            courseDates: {
              startDate: startDate || new Date().toISOString().split('T')[0],
              endDate: endDate || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          } 
        : { email };

    // Debug: בדיקה שהתאריכים נכונים
    console.log("🐛 DEBUG - Final body before sending:", JSON.stringify(body, null, 2));
    if (mode === "register") {
      console.log("🐛 DEBUG - CourseDates in body:", body.courseDates);
      console.log("🐛 DEBUG - StartDate value:", body.courseDates.startDate);
      console.log("🐛 DEBUG - EndDate value:", body.courseDates.endDate);
    }

    // Debug logging
    console.log("🐛 DEBUG - Sending to server:");
    console.log("  Mode:", mode);
    console.log("  Endpoint:", endpoint);
    console.log("  Body being sent:", JSON.stringify(body, null, 2));
    console.log("🐛 DEBUG - StartDate:", startDate);
    console.log("🐛 DEBUG - EndDate:", endDate);

    try {
      const res = await fetch(API_BASE + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get("Content-Type");

      // אם התגובה לא JSON – הצג את הטקסט
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.log("🐛 DEBUG - Server response (non-JSON):", text);
        throw new Error("השרת לא החזיר JSON: " + text);
      }

      const data = await res.json();
      console.log("🐛 DEBUG - Server response (JSON):", JSON.stringify(data, null, 2));
      console.log("🐛 DEBUG - Response status:", res.status);
      console.log("🐛 DEBUG - Response headers:", res.headers);
      
      if (!res.ok) throw new Error(data.error || "שגיאה");

      const user = data.user;
      if (!user || !user.id) throw new Error("משתמש לא תקין מהשרת");

      // --- Save token to localStorage ---
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      console.log("🐛 DEBUG - User object received from server:", JSON.stringify(user, null, 2));
      console.log("🐛 DEBUG - Course from server:", user.course);
      console.log("🐛 DEBUG - Course from local state:", course);
      console.log("🐛 DEBUG - CourseDates from server:", user.courseDates);
      console.log("🐛 DEBUG - Local courseDates:", { startDate, endDate });

      // שמור את כל אובייקט המשתמש תחת 'user' ב-localStorage
      const completeUser = {
        id: user.id,
        name: user.name || "",
        course: user.course || course || "theory",
        ...(user.email && { email: user.email }),
        // תמיד נשתמש ב-courseDates מהמשתמש או ברירת מחדל
        courseDates: user.courseDates || {
          startDate: startDate || new Date().toISOString().split('T')[0],
          endDate: endDate || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      };
      localStorage.setItem("user", JSON.stringify(completeUser));
      console.log("🐛 DEBUG - Saved to localStorage as 'user':", localStorage.getItem("user"));
      console.log("🐛 DEBUG - Complete user object:", JSON.stringify(completeUser, null, 2));
      console.log("🐛 DEBUG - Has courseDates:", !!completeUser.courseDates);
      onLogin(completeUser); // מעבר לצ'אט
    } catch (err) {
      console.error("שגיאה בהרשמה:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <h2>{mode === "register" ? "רישום משתמש חדש" : "התחברות למערכת"}</h2>

        {mode === "register" && (
          <div className="input-group">
            <input
              type="text"
              placeholder="שם פרטי"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <div className="input-group">
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {mode === "register" && (
          <div className="input-group">
            <label htmlFor="course-select" className="course-label">
              בחר קורס:
            </label>
            <select
              id="course-select"
              className="course-select"
              value={course}
              onChange={(e) => {
                console.log("🐛 DEBUG - Course selection changed to:", e.target.value);
                setCourse(e.target.value);
              }}
              disabled={loading}
            >
              <option value="theory">תיאוריה</option>
              <option value="psychology">פסיכולוגיה</option>
            </select>
          </div>
        )}

        {mode === "register" && (
          <div className="dates-container">
            <div className="dates-info" style={{ 
              textAlign: 'center', 
              marginBottom: '15px', 
              fontSize: '0.9rem', 
              color: '#666',
              fontStyle: 'italic'
            }}>
              תאריכי הקורס (ניתן לשנות)
            </div>
            <div className="input-group">
              <label htmlFor="start-date" className="date-label">
                תאריך התחלה:
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label htmlFor="end-date" className="date-label">
                תאריך סיום:
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <button className="primary-button" onClick={handleSubmit} disabled={loading}>
          {loading && <span className="loading-spinner"></span>}
          {loading
            ? "שולח..."
            : mode === "register"
            ? "הרשמה"
            : "התחברות"}
        </button>

        {error && <div className="error-message">{error}</div>}

        <div className="toggle-mode">
          {mode === "register" ? "כבר רשום?" : "אין חשבון עדיין?"}{" "}
          <button 
            className="toggle-button"
            onClick={() => {
              setMode(mode === "register" ? "login" : "register");
              resetForm();
            }}
          >
            {mode === "register" ? "התחברות" : "הרשמה"}
          </button>
        </div>
      </div>
    </div>
  );
}
