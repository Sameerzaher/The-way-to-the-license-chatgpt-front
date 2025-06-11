import React, { useState } from "react";

const API_BASE = "http://localhost:3000";

export default function LoginRegisterPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // "register" or "login"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setError("");
  setLoading(true);

  const endpoint = mode === "register" ? "/user/register" : "/user/login";
  const body =
    mode === "register" ? { name: name.trim(), email } : { email };

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
      throw new Error("השרת לא החזיר JSON: " + text);
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "שגיאה");

    const user = data.user;
    if (!user || !user.id) throw new Error("משתמש לא תקין מהשרת");

    localStorage.setItem("userId", user.id);
    localStorage.setItem("userName", user.name || "");
    onLogin(user); // מעבר לצ'אט
  } catch (err) {
    console.error("שגיאה בהרשמה:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-container">
      <h2>{mode === "register" ? "רישום משתמש חדש" : "התחברות למערכת"}</h2>

      {mode === "register" && (
        <input
          type="text"
          placeholder="שם פרטי"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      )}

      <input
        type="email"
        placeholder="אימייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading
          ? "שולח..."
          : mode === "register"
          ? "הרשמה"
          : "התחברות"}
      </button>

      <p style={{ marginTop: "1rem", color: "red" }}>{error}</p>

      <p>
        {mode === "register" ? "כבר רשום?" : "אין חשבון עדיין?"}{" "}
        <button onClick={() => setMode(mode === "register" ? "login" : "register")}>
          {mode === "register" ? "התחברות" : "הרשמה"}
        </button>
      </p>
    </div>
  );
}
