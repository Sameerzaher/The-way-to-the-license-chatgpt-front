import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import QuestionSelector from "./components/QuestionSelector/QuestionSelector";
import ChatPage from "./components/ChatPage/ChatPage";
import LoginRegisterPage from "./components/LoginRegisterPage/LoginRegisterPage";
import Sidebar from "./components/Sidebar/Sidebar";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState("he"); // language state

  useEffect(() => {
    const id = localStorage.getItem("userId");
    const name = localStorage.getItem("userName");
    const course = localStorage.getItem("userCourse");
    if (id) {
      setUser({ id, name, course });
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
    <div>
      {/* Navigation Bar at the very top */}
      <nav className="app-navbar" style={{ direction: 'ltr', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <button
          onClick={() => setLang(lang === "he" ? "ar" : "he")}
          style={{ marginRight: 16, fontWeight: 600, borderRadius: 20, padding: "8px 18px", border: "none", background: "#3498db", color: "white", cursor: "pointer" }}
        >
          {lang === "he" ? "Arabic" : "עברית"}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: 30 }}>
          <span className="user-greeting">
            {user.name}
            {user.course && (
              <span className="user-course">
                ({user.course === 'psychology' ? 'פסיכולוגיה' : 'תיאוריה'})
              </span>
            )}
          </span>
          <button onClick={handleLogout} className="logout-button">
            התנתקות
          </button>
        </div>
      </nav>
      <div className="app-container" style={{ paddingTop: 80 }}>
        <Sidebar user={user} onLogout={handleLogout} lang={lang} />
        <main className="app-main-content">
          <Routes>
            {/* Theory Routes */}
            <Route 
              path="/theory/questions" 
              element={<QuestionSelector user={user} course="theory" lang={lang} onChangeLang={setLang} />} 
            />
            <Route
              path="/theory/chat"
              element={
                <div className="chat-outer-container">
                  <ChatPage user={user} course="theory" lang={lang} />
                </div>
              }
            />

            {/* Psychology Routes */}
            <Route 
              path="/psychology/questions" 
              element={<QuestionSelector user={user} course="psychology" lang={lang} onChangeLang={setLang} />} 
            />
            <Route
              path="/psychology/chat"
              element={
                <div className="chat-outer-container">
                  <ChatPage user={user} course="psychology" lang={lang} />
                </div>
              }
            />

            {/* Default redirect */}
            <Route 
              path="/" 
              element={<Navigate to={user.course === 'psychology' ? '/psychology/questions' : '/theory/questions'} />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
