// src/App.js
import React from "react";
import QuestionSelector from "./components/QuestionSelector/QuestionSelector";
import "./App.css"; // אם יש קובץ CSS גלובלי

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>בחירת שאלה להצגה</h1>
      </header>
      <main className="app-main">
        <QuestionSelector />
      </main>
    </div>
  );
}

export default App;
