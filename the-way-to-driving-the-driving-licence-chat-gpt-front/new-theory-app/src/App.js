import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import QuestionSelector from "./components/QuestionSelector/QuestionSelector";
import ChatPage from "./components/ChatPage/ChatPage";
import LoginRegisterPage from "../src/components/LoginRegisterPage/LoginRegisterPage";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    const name = localStorage.getItem("userName");
    if (id) {
      setUser({ id, name });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) {
    return <LoginRegisterPage onLogin={setUser} />;
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <nav style={{ marginBottom: 24 }}>
        <Link to="/" style={{ marginRight: 16 }}>
          בחירת שאלה
        </Link>
        <Link to="/chat" style={{ marginRight: 16 }} element={<ChatPage user={user} />}>
          צ’אט עם GPT
        </Link>
        <button onClick={handleLogout}>התנתקות</button>
      </nav>

      <Routes>
        <Route path="/" element={<QuestionSelector user={user} />} />
        <Route path="/chat" element={<ChatPage user={user} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
