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
    const course = localStorage.getItem("userCourse");
    if (id) {
      setUser({ id, name, course });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  // Helper function to get course display name in Hebrew
  const getCourseDisplayName = (course) => {
    switch (course) {
      case 'psychology':
        return 'פסיכולוגיה';
      case 'theory':
      default:
        return 'תיאוריה';
    }
  };

  if (!user) {
    return <LoginRegisterPage onLogin={setUser} />;
  }

  return (
    <div className="app-container">
      <div className="app-content-wrapper">
        <nav className="app-navbar">
          {user?.name && (
            <div className="user-greeting">
              שלום, {user.name}
              {user.course && (
                <span className="user-course">
                  ({getCourseDisplayName(user.course)})
                </span>
              )}
            </div>
          )}
          
          <div className="nav-links">
            <Link to="/" className="nav-link">
              בחירת שאלה
            </Link>
            <Link to="/chat" className="nav-link">
              צ'אט עם GPT
            </Link>
            <button onClick={handleLogout} className="logout-button">
              התנתקות
            </button>
          </div>
        </nav>

        <main className="app-main-content">
          <Routes>
            <Route path="/" element={<QuestionSelector user={user} />} />
            <Route
              path="/chat"
              element={
                <div className="chat-outer-container">
                  <ChatPage user={user} />
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
