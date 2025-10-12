import React, { useState, useEffect } from 'react';
import { useStreak } from '../../contexts/StreakContext';
import './StreakBadge.css';

const StreakBadge = () => {
  const { streakData, getWeekActivity } = useStreak();
  const [showDetails, setShowDetails] = useState(false);
  const weekActivity = getWeekActivity();
  
  console.log('🔥 StreakBadge rendering with data:', streakData);
  
  useEffect(() => {
    console.log('🔥 StreakBadge useEffect - data changed:', streakData);
  }, [streakData]);

  const getStreakEmoji = () => {
    if (streakData.currentStreak === 0) return '💤';
    if (streakData.currentStreak < 3) return '🌱';
    if (streakData.currentStreak < 7) return '🔥';
    if (streakData.currentStreak < 30) return '⚡';
    return '🏆';
  };

  const getStreakMessage = () => {
    if (streakData.currentStreak === 0) return 'התחל רצף חדש!';
    if (streakData.currentStreak === 1) return 'רצף חדש התחיל!';
    return `${streakData.currentStreak} ימים ברצף!`;
  };

  const getDayName = (index) => {
    const days = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
    const today = new Date().getDay();
    const dayIndex = (today - 6 + index + 7) % 7;
    return days[dayIndex];
  };

  const progressPercentage = (streakData.todayActivity.questionsAnswered / streakData.todayActivity.goal) * 100;

  return (
    <div className="streak-badge-container">
      {/* תג רצף ראשי */}
      <div 
        className={`streak-badge ${streakData.currentStreak > 0 ? 'active' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="streak-icon">
          <span className="streak-emoji">{getStreakEmoji()}</span>
          {streakData.currentStreak > 0 && (
            <div className="streak-count">{streakData.currentStreak}</div>
          )}
        </div>
        
        <div className="streak-info">
          <div className="streak-title">{getStreakMessage()}</div>
          <div className="streak-subtitle">
            {streakData.todayActivity.questionsAnswered}/{streakData.todayActivity.goal} שאלות היום
          </div>
        </div>

        {streakData.todayActivity.completed && (
          <div className="goal-completed-badge">✓</div>
        )}
      </div>

      {/* יעד יומי */}
      <div className="daily-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="progress-text">
          {streakData.todayActivity.completed 
            ? '🎉 יעד היום הושלם!' 
            : `עוד ${streakData.todayActivity.goal - streakData.todayActivity.questionsAnswered} שאלות`
          }
        </div>
      </div>

      {/* שבוע פעילות */}
      {showDetails && (
        <div className="streak-details">
          <div className="week-activity">
            <div className="week-title">השבוע</div>
            <div className="week-grid">
              {weekActivity.map((active, index) => (
                <div key={index} className="week-day">
                  <div className={`day-indicator ${active ? 'active' : ''}`}>
                    {active ? '✓' : ''}
                  </div>
                  <div className="day-name">{getDayName(index)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* סטטיסטיקות */}
          <div className="streak-stats">
            <div className="stat-item">
              <div className="stat-value">{streakData.longestStreak}</div>
              <div className="stat-label">רצף הכי ארוך</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{streakData.totalDays}</div>
              <div className="stat-label">ימי למידה</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {streakData.todayActivity.correctAnswers > 0 
                  ? Math.round((streakData.todayActivity.correctAnswers / streakData.todayActivity.questionsAnswered) * 100)
                  : 0}%
              </div>
              <div className="stat-label">דיוק היום</div>
            </div>
          </div>

          {/* טיפ מוטיבציה */}
          <div className="motivation-tip">
            {streakData.currentStreak === 0 && (
              <div className="tip">💡 ענה על 10 שאלות כדי להתחיל רצף חדש!</div>
            )}
            {streakData.currentStreak > 0 && streakData.currentStreak < 7 && (
              <div className="tip">🔥 כל יום חדש מחזק את הרצף שלך!</div>
            )}
            {streakData.currentStreak >= 7 && streakData.currentStreak < 30 && (
              <div className="tip">⚡ אתה במסלול מעולה! המשך כך!</div>
            )}
            {streakData.currentStreak >= 30 && (
              <div className="tip">🏆 מדהים! אתה מסור באמת!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakBadge;

