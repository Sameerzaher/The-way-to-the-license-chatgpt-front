import React, { useState, useEffect } from 'react';
import Icon from '../Icons/Icon';
import './ExamAchievements.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function ExamAchievements({ user }) {
  const [achievements, setAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  useEffect(() => {
    if (user?.id) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      const response = await fetch(`${API_URL}/exams/user/${user.id}/achievements`);
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
        setAllAchievements(data.allAchievements || []);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAchievements = allAchievements.filter(achievement => {
    switch (filter) {
      case 'unlocked':
        return achievement.unlocked;
      case 'locked':
        return !achievement.unlocked;
      default:
        return true;
    }
  });

  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="exam-achievements-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>טוען הישגים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-achievements-container">
      <div className="achievements-header">
        <h1><Icon name="trophy" size="large" /> הישגי בחינות</h1>
        <p>אוסף כל ההישגים שלך במערכת הבחינות</p>
      </div>

      {/* סטטיסטיקות */}
      <div className="achievements-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#gradient-unlocked)" stroke="url(#gradient-unlocked)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient-unlocked" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-number">{unlockedCount}</div>
            <div className="stat-label">הישגים פתוחים</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="url(#gradient-completion)" stroke="url(#gradient-completion)" strokeWidth="2"/>
              <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient-completion" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-number">{completionPercentage}%</div>
            <div className="stat-label">השלמה</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 5.09L16 2.82L15.27 6.27L19 6.64L16.18 8.91L18.36 12L15.27 12.36L16 16L13.09 13.73L12 17L10.91 13.73L8 16L8.73 12.36L5.64 12L7.82 8.91L5 6.64L8.73 6.27L8 2.82L10.91 5.09L12 2Z" fill="url(#gradient-total)" stroke="url(#gradient-total)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient-total" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-number">{totalCount}</div>
            <div className="stat-label">סה"כ הישגים</div>
          </div>
        </div>
      </div>

      {/* בר התקדמות */}
      <div className="progress-section">
        <h3>התקדמות כללית</h3>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span className="progress-text">{unlockedCount}/{totalCount}</span>
        </div>
      </div>

      {/* מסננים */}
      <div className="achievements-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          הכל ({totalCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'unlocked' ? 'active' : ''}`}
          onClick={() => setFilter('unlocked')}
        >
          פתוחים ({unlockedCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'locked' ? 'active' : ''}`}
          onClick={() => setFilter('locked')}
        >
          נעולים ({totalCount - unlockedCount})
        </button>
      </div>

      {/* רשימת הישגים */}
      <div className="achievements-grid">
        {filteredAchievements.map((achievement, index) => (
          <div 
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">
              {achievement.unlocked ? (
                <Icon name={achievement.iconName || 'achievements'} size="large" />
              ) : (
                <Icon name="lock" size="large" />
              )}
            </div>
            
            <div className="achievement-info">
              <h4 className="achievement-name">{achievement.name}</h4>
              <p className="achievement-description">{achievement.description}</p>
              
              {achievement.unlocked && (
                <div className="achievement-unlocked">
                  <span className="unlocked-badge">
                    <Icon name="check" /> פתוח
                  </span>
                  <span className="unlocked-date">
                    {new Date(achievement.unlockedAt).toLocaleDateString('he-IL')}
                  </span>
                </div>
              )}
              
              {!achievement.unlocked && (
                <div className="achievement-locked">
                  <span className="locked-badge">
                    <Icon name="lock" /> נעול
                  </span>
                </div>
              )}
            </div>
            
            <div className="achievement-status">
              {achievement.unlocked ? (
                <div className="unlocked-status">
                  <Icon name="sparkles" />
                  <span className="status-text">הושג!</span>
                </div>
              ) : (
                <div className="locked-status">
                  <Icon name="waiting" />
                  <span className="status-text">בדרך...</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="no-achievements">
          <div className="no-achievements-icon">
            <Icon name="target" size="large" />
          </div>
          <h3>אין הישגים להצגה</h3>
          <p>בחר מסנן אחר כדי לראות הישגים</p>
        </div>
      )}

      {/* הישגים אחרונים */}
      {achievements.length > 0 && (
        <div className="recent-achievements">
          <h3><Icon name="trophy" /> הישגים אחרונים</h3>
          <div className="recent-list">
            {achievements.slice(0, 5).map((achievement, index) => (
              <div key={achievement.id} className="recent-item">
                <span className="recent-icon">
                  <Icon name={achievement.iconName || 'achievements'} />
                </span>
                <span className="recent-name">{achievement.name}</span>
                <span className="recent-date">
                  {new Date(achievement.unlockedAt).toLocaleDateString('he-IL')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamAchievements;
