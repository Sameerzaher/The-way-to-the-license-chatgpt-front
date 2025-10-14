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
          <div className="stat-icon-wrapper">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 7 7 7 12c0 2.8 2.2 5 5 5s5-2.2 5-5c0-5-5-10-5-10z" fill="url(#gradient-current-streak)" stroke="url(#gradient-current-streak)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17c-1.1 0-2-.9-2-2 0-1.7 2-3.5 2-3.5s2 1.8 2 3.5c0 1.1-.9 2-2 2z" fill="white" opacity="0.5"/>
              <defs>
                <linearGradient id="gradient-current-streak" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="stat-value">{streakData.currentStreak}</div>
          <div className="stat-label">רצף נוכחי</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#gradient-longest)" stroke="url(#gradient-longest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient-longest" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="stat-value">{streakData.longestStreak}</div>
          <div className="stat-label">רצף הכי ארוך</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="url(#gradient-total-days)" strokeWidth="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="url(#gradient-total-days)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="8" cy="14" r="1" fill="url(#gradient-total-days)"/>
              <circle cx="12" cy="14" r="1" fill="url(#gradient-total-days)"/>
              <circle cx="16" cy="14" r="1" fill="url(#gradient-total-days)"/>
              <circle cx="8" cy="18" r="1" fill="url(#gradient-total-days)"/>
              <circle cx="12" cy="18" r="1" fill="url(#gradient-total-days)"/>
              <defs>
                <linearGradient id="gradient-total-days" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="stat-value">{streakData.totalDays}</div>
          <div className="stat-label">סה"כ ימי למידה</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="url(#gradient-daily-goal)" strokeWidth="2"/>
              <circle cx="12" cy="12" r="6" stroke="url(#gradient-daily-goal)" strokeWidth="2"/>
              <circle cx="12" cy="12" r="2" fill="url(#gradient-daily-goal)"/>
              <defs>
                <linearGradient id="gradient-daily-goal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>
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
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="url(#gradient-questions-answered)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2v6h6" stroke="url(#gradient-questions-answered)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 13h6M9 17h6" stroke="url(#gradient-questions-answered)" strokeWidth="2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient-questions-answered" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="today-stat-value">{streakData.todayActivity.questionsAnswered}</div>
            <div className="today-stat-label">שאלות נענו</div>
          </div>
          <div className="today-stat">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="url(#gradient-correct-today)" strokeWidth="2"/>
                <path d="M8 12l3 3 5-6" stroke="url(#gradient-correct-today)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient-correct-today" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="today-stat-value">{streakData.todayActivity.correctAnswers}</div>
            <div className="today-stat-label">תשובות נכונות</div>
          </div>
          <div className="today-stat">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="url(#gradient-success-rate)" strokeWidth="2"/>
                <circle cx="12" cy="12" r="6" stroke="url(#gradient-success-rate)" strokeWidth="2"/>
                <circle cx="12" cy="12" r="2" fill="url(#gradient-success-rate)"/>
                <defs>
                  <linearGradient id="gradient-success-rate" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="today-stat-value">
              {streakData.todayActivity.questionsAnswered > 0 
                ? Math.round((streakData.todayActivity.correctAnswers / streakData.todayActivity.questionsAnswered) * 100)
                : 0}%
            </div>
            <div className="today-stat-label">אחוז הצלחה</div>
          </div>
          <div className="today-stat">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="url(#gradient-time-spent)" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="url(#gradient-time-spent)" strokeWidth="2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient-time-spent" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
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

