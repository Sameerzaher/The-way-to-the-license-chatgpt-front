import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import QuestionSelector from "./components/QuestionSelector/QuestionSelector";
import ChatPage from "./components/ChatPage/ChatPage";
import LoginRegisterPage from "./components/LoginRegisterPage/LoginRegisterPage";
import Sidebar from "./components/Sidebar/Sidebar";
import CategoryPage from "./components/CategoryPage/CategoryPage";
import AdvancedDashboard from "./components/AdvancedDashboard/AdvancedDashboard";
import { checkRefreshLoop } from "./utils/emergencyStop";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState("he"); // language state
  const [isLoading, setIsLoading] = useState(true);


  // פונקציה לעדכון פרטי משתמש מהשרת
  const fetchUserDetails = useCallback(async (userId, token) => {
    try {
      const endpoints = [
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/user/details/${userId}`,
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/user/${userId}`,
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/users/${userId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userDetails = await response.json();
            if (userDetails.courseDates || userDetails.email) {
              setUser(prevUser => {
                const updatedUser = { ...prevUser, ...userDetails };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                return updatedUser;
              });
              return;
            }
          }
        } catch (endpointError) {
          // Continue to next endpoint
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, []);

  useEffect(() => {
    // בדיקת לולאת ריפרש
    if (checkRefreshLoop()) {
      return; // עצירת הטעינה אם זוהה לולאה
    }
    
    // בדיקה מקיפה יותר של המשתמש ב-localStorage
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (storedUser && token) {
        const userData = JSON.parse(storedUser);
        if (userData && userData.id) {
          setUser(userData);
          // console.log("User restored from localStorage:", userData);
          // console.log("User has courseDates:", !!userData.courseDates);
          // if (userData.courseDates) {
          //   console.log("CourseDates:", userData.courseDates);
          // }
          
          // בדיקה אם חסרים נתוני courseDates - נסה לעדכן מהשרת
          if (!userData.courseDates && userData.id) {
            // console.log("Missing courseDates, attempting to fetch from server...");
            fetchUserDetails(userData.id, token);
          }
        } else {
          // console.log("Invalid user data in localStorage");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } else {
        // Fallback לנתונים הישנים
        const id = localStorage.getItem("userId");
        const name = localStorage.getItem("userName");
        const course = localStorage.getItem("userCourse");
        const email = localStorage.getItem("userEmail");
        const courseDates = localStorage.getItem("userCourseDates");
        
        if (id && name) {
          const userData = { 
            id, 
            name, 
            course,
            ...(email && { email }),
            ...(courseDates && { courseDates: JSON.parse(courseDates) })
          };
          setUser(userData);
          // שמירה בפורמט החדש
          localStorage.setItem("user", JSON.stringify(userData));
          // console.log("User restored from old format:", userData);
        }
      }
    } catch (error) {
      console.error("Error restoring user from localStorage:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserDetails]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userCourse");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userCourseDates");
    setUser(null);
  };

  // הצג loading בזמן בדיקת המשתמש
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      טוען...
    </div>;
  }

  if (!user) {
    return <LoginRegisterPage onLogin={setUser} />;
  }

  const handleEmergencyStop = () => {
    if (window.confirm('האם אתה בטוח שברצונך לעצור את המערכת ולרענן?')) {
      // עצירת כל intervals ו-timeouts
      for (let i = 1; i < 99999; i++) {
        clearInterval(i);
        clearTimeout(i);
      }
      
      // ניקוי localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('last_fetch') || key.includes('refresh')) {
          localStorage.removeItem(key);
        }
      });
      
      // רפרש הדף
      window.location.reload();
    }
  };

  return (
    <div>
      {/* Emergency Stop Button */}
      <button 
        onClick={handleEmergencyStop}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          background: 'red',
          color: 'white',
          border: 'none',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        🚨 עצור חירום
      </button>
      
      {/* Navigation Bar at the very top */}
      <nav className="app-navbar" style={{ direction: 'ltr', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <button
          onClick={() => setLang(lang === "he" ? "ar" : "he")}
          style={{ 
            marginRight: 16, 
            fontWeight: 600, 
            borderRadius: 20, 
            padding: "8px 18px", 
            border: "none", 
            background: "#3498db", 
            color: "white", 
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#2980b9";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#3498db";
            e.target.style.transform = "translateY(0)";
          }}
        >
          {lang === "he" ? "Arabic" : "עברית"}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: 30 }}>
          <div className="user-info-container" style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '12px'
          }}>
            <span className="user-name" style={{ 
              fontSize: '1.1em', 
              fontWeight: '600', 
              color: 'white' 
            }}>
              {user.name}
            </span>
            {user.course && (
              <span className="user-course" style={{ 
                fontSize: '0.85em', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                padding: '2px 8px', 
                borderRadius: '12px',
                color: 'white',
                fontWeight: '500'
              }}>
                {user.course === 'psychology' ? 'פסיכולוגיה' : 'תיאוריה'}
              </span>
            )}
            {user.courseDates && user.courseDates.startDate && user.courseDates.endDate && (
              <span className="user-course-dates" style={{ 
                fontSize: '0.75em', 
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '400',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.9em' }}>📅</span>
                {user.courseDates.startDate} - {user.courseDates.endDate}
              </span>
            )}
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-button"
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.9em',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#c0392b';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#e74c3c';
              e.target.style.transform = 'translateY(0)';
            }}
          >
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
              path="/theory/dashboard" 
              element={<AdvancedDashboard user={user} lang={lang} />} 
            />
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

            {/* Category Page Route */}
            <Route 
              path="/category/:category" 
              element={<CategoryPage user={user} lang={lang} />} 
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
