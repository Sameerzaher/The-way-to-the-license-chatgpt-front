import React, { useState } from 'react';
import { useStreak } from '../../contexts/StreakContext';
import './StreakDashboard.css';

const StreakDashboard = () => {
  const { streakData, getMonthActivity, setDailyGoal } = useStreak();
  const [customGoal, setCustomGoal] = useState(streakData.todayActivity.goal);
  const monthActivity = getMonthActivity();

  const handleGoalChange = (e) => {
    const newGoal = parseInt(e.target.value) || 10;
    setCustomGoal(newGoal);
    setDailyGoal(newGoal);
  };

  const getActivityColor = (count) => {
    if (count === 0) return '#ebedf0';
    if (count < 5) return '#c6e48b';
    if (count < 10) return '#7bc96f';
    if (count < 15) return '#239a3b';
    return '#196127';
  };

  const getStreakStatus = () => {
    if (streakData.currentStreak === 0) {
      return {
        emoji: '💤',
        title: 'התחל רצף חדש!',
        message: 'ענה על 10 שאלות כדי להתחיל רצף למידה',
        color: '#95a5a6'
      };
    }
    if (streakData.currentStreak < 7) {
      return {
        emoji: '🌱',
        title: 'רצף מתחיל!',
        message: `המשך כך! אתה ב-${streakData.currentStreak} ימים`,
        color: '#2ecc71'
      };
    }
    if (streakData.currentStreak < 30) {
      return {
        emoji: '🔥',
        title: 'רצף חם!',
        message: `מדהים! ${streakData.currentStreak} ימים ברצף!`,
        color: '#ff6b6b'
      };
    }
    return {
      emoji: '🏆',
      title: 'רצף אגדי!',
      message: `בלתי ניתן לעצירה! ${streakData.currentStreak} ימים!`,
      color: '#f39c12'
    };
  };

  const status = getStreakStatus();

  const getDayOfWeek = (dateStr) => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  return (
    <div className="streak-dashboard">
      <div className="dashboard-header">
        <h1>🔥 רצף הלמידה שלי</h1>
        <p>עקוב אחר התקדמות הלמידה היומית שלך</p>
      </div>

      {/* סטטוס רצף */}
      <div className="streak-status-card" style={{ borderColor: status.color }}>
        <div className="status-icon" style={{ background: status.color }}>
          {status.emoji}
        </div>
        <div className="status-content">
          <h2>{status.title}</h2>
          <p>{status.message}</p>
        </div>
      </div>

      {/* סטטיסטיקות ראשיות */}
      <div className="main-stats">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{streakData.currentStreak}</div>
          <div className="stat-label">רצף נוכחי</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{streakData.longestStreak}</div>
          <div className="stat-label">רצף הכי ארוך</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{streakData.totalDays}</div>
          <div className="stat-label">סה"כ ימי למידה</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">
            {streakData.todayActivity.questionsAnswered}/{streakData.todayActivity.goal}
          </div>
          <div className="stat-label">יעד היום</div>
        </div>
      </div>

      {/* יעד יומי */}
      <div className="daily-goal-section">
        <h3>🎯 יעד יומי</h3>
        <div className="goal-content">
          <div className="goal-info">
            <div className="goal-progress">
              <div 
                className="goal-progress-fill"
                style={{ 
                  width: `${Math.min((streakData.todayActivity.questionsAnswered / streakData.todayActivity.goal) * 100, 100)}%` 
                }}
              />
            </div>
            <div className="goal-text">
              {streakData.todayActivity.completed ? (
                <span className="goal-completed">✓ יעד היום הושלם!</span>
              ) : (
                <span>
                  עוד {streakData.todayActivity.goal - streakData.todayActivity.questionsAnswered} שאלות ליעד
                </span>
              )}
            </div>
          </div>
          <div className="goal-settings">
            <label>קבע יעד יומי:</label>
            <select value={customGoal} onChange={handleGoalChange}>
              <option value="5">5 שאלות</option>
              <option value="10">10 שאלות</option>
              <option value="15">15 שאלות</option>
              <option value="20">20 שאלות</option>
              <option value="30">30 שאלות</option>
              <option value="50">50 שאלות</option>
            </select>
          </div>
        </div>
      </div>

      {/* פעילות חודשית */}
      <div className="month-activity-section">
        <h3>📊 פעילות חודשית (30 ימים אחרונים)</h3>
        <div className="activity-grid">
          {monthActivity.map((day, index) => (
            <div
              key={index}
              className="activity-day"
              style={{
                background: day.active ? '#2ecc71' : '#ebedf0'
              }}
              title={`${getDayOfWeek(day.date)}, ${day.date}${day.active ? ' - למדת היום!' : ''}`}
            />
          ))}
        </div>
        <div className="activity-legend">
          <span>פחות</span>
          <div className="legend-colors">
            <div className="legend-color" style={{ background: '#ebedf0' }} />
            <div className="legend-color" style={{ background: '#c6e48b' }} />
            <div className="legend-color" style={{ background: '#7bc96f' }} />
            <div className="legend-color" style={{ background: '#239a3b' }} />
            <div className="legend-color" style={{ background: '#196127' }} />
          </div>
          <span>יותר</span>
        </div>
      </div>

      {/* סטטיסטיקות היום */}
      <div className="today-stats-section">
        <h3>📈 סטטיסטיקות היום</h3>
        <div className="today-stats-grid">
          <div className="today-stat">
            <div className="today-stat-icon">📝</div>
            <div className="today-stat-value">{streakData.todayActivity.questionsAnswered}</div>
            <div className="today-stat-label">שאלות נענו</div>
          </div>
          <div className="today-stat">
            <div className="today-stat-icon">✅</div>
            <div className="today-stat-value">{streakData.todayActivity.correctAnswers}</div>
            <div className="today-stat-label">תשובות נכונות</div>
          </div>
          <div className="today-stat">
            <div className="today-stat-icon">🎯</div>
            <div className="today-stat-value">
              {streakData.todayActivity.questionsAnswered > 0 
                ? Math.round((streakData.todayActivity.correctAnswers / streakData.todayActivity.questionsAnswered) * 100)
                : 0}%
            </div>
            <div className="today-stat-label">אחוז הצלחה</div>
          </div>
          <div className="today-stat">
            <div className="today-stat-icon">⏱️</div>
            <div className="today-stat-value">{streakData.todayActivity.timeSpent}</div>
            <div className="today-stat-label">דקות למידה</div>
          </div>
        </div>
      </div>

      {/* הישגים */}
      <div className="achievements-section">
        <h3>🏆 הישגים</h3>
        <div className="achievements-grid">
          <div className={`achievement-badge ${streakData.currentStreak >= 3 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🌱</div>
            <div className="achievement-name">מתחיל</div>
            <div className="achievement-desc">3 ימים ברצף</div>
          </div>
          <div className={`achievement-badge ${streakData.currentStreak >= 7 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🔥</div>
            <div className="achievement-name">שבוע שלם</div>
            <div className="achievement-desc">7 ימים ברצף</div>
          </div>
          <div className={`achievement-badge ${streakData.currentStreak >= 14 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">⚡</div>
            <div className="achievement-name">שבועיים!</div>
            <div className="achievement-desc">14 ימים ברצף</div>
          </div>
          <div className={`achievement-badge ${streakData.currentStreak >= 30 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🏆</div>
            <div className="achievement-name">חודש מלא</div>
            <div className="achievement-desc">30 ימים ברצף</div>
          </div>
          <div className={`achievement-badge ${streakData.currentStreak >= 50 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">👑</div>
            <div className="achievement-name">אגדה</div>
            <div className="achievement-desc">50 ימים ברצף</div>
          </div>
          <div className={`achievement-badge ${streakData.currentStreak >= 100 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">💎</div>
            <div className="achievement-name">בלתי ניתן לעצירה</div>
            <div className="achievement-desc">100 ימים ברצף</div>
          </div>
        </div>
      </div>

      {/* טיפים ומוטיבציה */}
      <div className="motivation-section">
        <h3>💡 טיפ היום</h3>
        <div className="motivation-card">
          {streakData.currentStreak === 0 && (
            <p>🌟 התחל רצף חדש היום! למידה יומית עקבית היא המפתח להצלחה.</p>
          )}
          {streakData.currentStreak > 0 && streakData.currentStreak < 7 && (
            <p>🚀 אתה בדרך הנכונה! כל יום חדש מחזק את הרצף ואת הידע שלך.</p>
          )}
          {streakData.currentStreak >= 7 && streakData.currentStreak < 30 && (
            <p>💪 מדהים! רצף קבוע יוצר הרגל למידה שישאר איתך לכל החיים.</p>
          )}
          {streakData.currentStreak >= 30 && (
            <p>👑 אתה מופת! התמדה כזו מבטיחה הצלחה בבחינת התיאוריה.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreakDashboard;

