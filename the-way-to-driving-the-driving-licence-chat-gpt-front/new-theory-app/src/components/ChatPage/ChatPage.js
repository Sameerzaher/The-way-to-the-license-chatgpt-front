import React, { useState, useEffect, useRef } from "react";
import "./ChatPage.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function ChatPage({ user, course, lang }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState("");
  const chatWindowRef = useRef(null);

  const labels = {
    chatTitle: lang === 'ar' ? 'دردشة مع ChatGPT حول الأسئلة' : 'צʼאט עם ChatGPT לגבי השאלות',
    empty: lang === 'ar' ? 'لا توجد رسائل بعد.' : 'אין הודעות עדיין.',
    placeholder: lang === 'ar' ? 'اكتب سؤالك أو ملاحظتك هنا...' : 'כתוב פה את השאלה או ההערה שלך...',
    send: lang === 'ar' ? 'إرسال' : 'שלח',
    sending: lang === 'ar' ? 'جارٍ الإرسال…' : 'שולח…',
    error: lang === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى.' : 'שגיאה בשליחת ההודעה. נסה שוב.',
  };

  useEffect(() => {
    // const storedId = localStorage.getItem("userId");
    const storedId = JSON.parse(localStorage.getItem("user")).id;
    if (storedId) {
      setUserId(storedId);
      console.log("✅ userId loaded:", storedId);
    } else {
      console.error("❌ לא נמצא userId ב-localStorage");
    }
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]); // Only scroll when messages change, not on every input keystroke

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending || !userId) return;

    console.log("📤 שולח לשרת:", { message: trimmed, userId });

    const newUserMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Server error:", res.status, data);
        throw new Error(data.error || "שגיאה בשרת");
      }

      const botMsg = {
        role: "assistant",
        content: data.response,
        image: data.image || null,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error fetching chat:", err);
      const sysMsg = {
        role: "system",
        content: labels.error,
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
    <div className="chat-outer-container">
      <div className="centered-chat">
        <h2>{labels.chatTitle}</h2>

        <div className="chat-window" ref={chatWindowRef}>
          {messages.length === 0 && (
            <div className="chat-empty">{labels.empty}</div>
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
              dir={msg.role !== "system" ? (lang === 'ar' ? 'rtl' : 'rtl') : 'ltr'}
            >
              <span
                style={{
                  whiteSpace: "pre-line",
                  textAlign: "right",
                  display: "block"
                }}
              >
                {msg.content}
              </span>

              {msg.image && (
                <img
                  src={msg.image}
                  alt={labels.chatTitle}
                  style={{
                    maxWidth: "100%",
                    marginTop: 10,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    display: "block",
                    marginRight: "auto",
                    marginLeft: "auto"
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="chat-input-container">
          <textarea
            className="chat-input"
            placeholder={labels.placeholder}
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
            {sending ? labels.sending : labels.send}
          </button>
        </div>
      </div>
    </div>
  );
}
