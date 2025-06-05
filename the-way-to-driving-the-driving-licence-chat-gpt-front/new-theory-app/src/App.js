
import { Routes, Route, Link } from "react-router-dom";
import QuestionSelector from "./components/QuestionSelector/QuestionSelector";
import ChatPage from "./components/ChatPage/ChatPage";
import "./App.css"; // אם תרצה, תוכל להוסיף עיצוב גלובלי.

export default function App() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <nav style={{ marginBottom: 24 }}>
        {/* ניווט גלובלי בין מסך הבחירה ובין מסך הצʼאט */}
        <Link to="/" style={{ marginRight: 16 }}>
          בחירת שאלה
        </Link>
        <Link to="/chat">צ’אט עם GPT</Link>
      </nav>

      <Routes>
        {/* ב־"/" נציג את מסך הבחירה של השאלה */}
        <Route path="/" element={<QuestionSelector />} />
        {/* ב־"/chat" נגיע למסך הצ'אט */}
        <Route path="/chat" element={<ChatPage />} />
        {/* כל נתיב אחר → נחזיר למסך הבחירה */}
        <Route path="*" element={<QuestionSelector />} />
      </Routes>
    </div>
  );
}
