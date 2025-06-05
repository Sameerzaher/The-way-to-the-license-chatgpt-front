import React, { useState } from "react";
import "./ChatPage.css"; // להלן הקובץ

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // הוספת הודעת משתמש
    const newUserMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");

    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Server error:", res.status, txt);
        throw new Error("Server returned error");
      }

      const data = await res.json();
      const botMsg = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error fetching chat:", err);
      const sysMsg = {
        role: "system",
        content: "שגיאה בשליחת ההודעה. נסה שוב.",
      };
      setMessages((prev) => [...prev, sysMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !sending) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <h2>צʼאט עם ChatGPT לגבי השאלות</h2>

      <div className="chat-window">
        {messages.length === 0 && (
          <div className="chat-empty">אין הודעות עדיין.</div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.role === "user"
                ? "chat-message user-message"
                : msg.role === "assistant"
                ? "chat-message bot-message"
                : "chat-message system-message"
            }
          >
            <span>{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          placeholder="כתוב פה את השאלה או ההערה שלך..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <button
          className="chat-send-button"
          onClick={handleSend}
          disabled={sending || !input.trim()}
        >
          {sending ? "שולח…" : "שלח"}
        </button>
      </div>
    </div>
  );
}
