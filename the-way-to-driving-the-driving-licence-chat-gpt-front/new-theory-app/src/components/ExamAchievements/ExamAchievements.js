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
          <div className="stat-icon">
            <Icon name="target" size="large" />
          </div>
          <div className="stat-info">
            <div className="stat-number">{unlockedCount}</div>
            <div className="stat-label">הישגים פתוחים</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="dashboard" size="large" />
          </div>
          <div className="stat-info">
            <div className="stat-number">{completionPercentage}%</div>
            <div className="stat-label">השלמה</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="achievements" size="large" />
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
