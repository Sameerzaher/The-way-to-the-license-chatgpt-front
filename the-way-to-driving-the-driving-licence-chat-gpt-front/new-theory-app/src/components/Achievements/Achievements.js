import React, { useState, useEffect, useMemo } from 'react';
import './Achievements.css';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  RARITY_LEVELS,
  getUserAchievements,
  calculateTotalPoints,
  getUserLevel
} from '../../data/achievements';

const Achievements = ({ user, lang = 'he' }) => {
  const [userStats, setUserStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [sortBy, setSortBy] = useState('rarity'); // rarity, progress, points
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newAchievements, setNewAchievements] = useState([]);

  const labels = useMemo(() => ({
    title: lang === 'ar' ? 'الإنجازات' : 'הישגים',
    subtitle: lang === 'ar' ? 'تتبع تقدمك واكسب الشارات' : 'עקוב אחר ההתקדמות שלך וזכה בתגים',
    totalPoints: lang === 'ar' ? 'مجموع النقاط' : 'סה"כ נקודות',
    level: lang === 'ar' ? 'المستوى' : 'רמה',
    unlockedAchievements: lang === 'ar' ? 'الإنجازات المفتوحة' : 'הישגים שנפתחו',
    totalAchievements: lang === 'ar' ? 'مجموع الإنجازات' : 'סה"כ הישגים',
    progress: lang === 'ar' ? 'التقدم' : 'התקדמות',
    unlocked: lang === 'ar' ? 'مفتوح' : 'נפתח',
    locked: lang === 'ar' ? 'مقفل' : 'נעול',
    categories: {
      all: lang === 'ar' ? 'الكل' : 'הכל',
      questions: lang === 'ar' ? 'الأسئلة' : 'שאלות',
      accuracy: lang === 'ar' ? 'الدقة' : 'דיוק',
      streak: lang === 'ar' ? 'السلسلة' : 'רצף',
      subjects: lang === 'ar' ? 'المواضيع' : 'נושאים',
      speed: lang === 'ar' ? 'السرعة' : 'מהירות',
      special: lang === 'ar' ? 'خاص' : 'מיוחד'
    },
    rarities: {
      all: lang === 'ar' ? 'الكل' : 'הכל',
      common: lang === 'ar' ? 'عادي' : 'רגיל',
      uncommon: lang === 'ar' ? 'غير شائع' : 'לא שכיח',
      rare: lang === 'ar' ? 'نادر' : 'נדיר',
      epic: lang === 'ar' ? 'ملحمي' : 'אפי',
      legendary: lang === 'ar' ? 'أسطوري' : 'אגדי'
    },
    sortBy: {
      label: lang === 'ar' ? 'ترتيب حسب' : 'מיין לפי',
      rarity: lang === 'ar' ? 'الندرة' : 'נדירות',
      progress: lang === 'ar' ? 'التقدم' : 'התקדמות',
      points: lang === 'ar' ? 'النقاط' : 'נקודות'
    },
    showOnlyUnlocked: lang === 'ar' ? 'إظهار المفتوحة فقط' : 'הצג רק נפתחים',
    pointsAbbr: lang === 'ar' ? 'نقاط' : 'נק׳',
    nextLevel: lang === 'ar' ? 'المستوى التالي' : 'רמה הבאה',
    pointsToNextLevel: lang === 'ar' ? 'نقاط للمستوى التالي' : 'נקודות לרמה הבאה',
    recentlyUnlocked: lang === 'ar' ? 'تم فتحها مؤخرًا' : 'נפתחו לאחרונה',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'טוען...'
  }), [lang]);

  // טעינת נתוני משתמש
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/user/${user.id}/stats`);
        
        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
        } else {
          // נתוני fallback
          setUserStats({
            totalQuestions: 150,
            correctAnswers: 120,
            currentCorrectStreak: 5,
            currentDayStreak: 3,
            perfectScoreSessions: 0,
            fastAnswers: 10,
            sessionsToday: 1,
            daysSinceLastSession: 0,
            totalAvailableQuestions: 2000,
            subjectStats: {
              'תמרורים': { correct: 45, total: 60 },
              'חוקי תנועה': { correct: 38, total: 50 },
              'חנייה': { correct: 20, total: 25 }
            },
            achievements: {}
          });
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
        // נתוני fallback
        setUserStats({
          totalQuestions: 150,
          correctAnswers: 120,
          currentCorrectStreak: 5,
          currentDayStreak: 3,
          perfectScoreSessions: 0,
          fastAnswers: 10,
          sessionsToday: 1,
          daysSinceLastSession: 0,
          totalAvailableQuestions: 2000,
          subjectStats: {
            'תמרורים': { correct: 45, total: 60 },
            'חוקי תנועה': { correct: 38, total: 50 },
            'חנייה': { correct: 20, total: 25 }
          },
          achievements: {}
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  // חישוב הישגים
  const userAchievements = useMemo(() => {
    if (!userStats) return [];
    return getUserAchievements(userStats);
  }, [userStats]);

  // סינון והמיון
  const filteredAchievements = useMemo(() => {
    let filtered = [...userAchievements];

    // סינון לפי קטגוריה
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // סינון לפי נדירות
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(a => a.rarity === selectedRarity);
    }

    // סינון הישגים נפתחים בלבד
    if (showOnlyUnlocked) {
      filtered = filtered.filter(a => a.unlocked);
    }

    // מיון
    filtered.sort((a, b) => {
      if (sortBy === 'rarity') {
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
      } else if (sortBy === 'progress') {
        return b.progress.percentage - a.progress.percentage;
      } else if (sortBy === 'points') {
        return b.points - a.points;
      }
      return 0;
    });

    return filtered;
  }, [userAchievements, selectedCategory, selectedRarity, showOnlyUnlocked, sortBy]);

  // חישוב סטטיסטיקות
  const stats = useMemo(() => {
    if (!userStats) return null;

    const totalPoints = calculateTotalPoints(userAchievements);
    const userLevel = getUserLevel(totalPoints);
    const unlockedCount = userAchievements.filter(a => a.unlocked).length;

    return {
      totalPoints,
      userLevel,
      unlockedCount,
      totalCount: userAchievements.length,
      completionPercentage: Math.round((unlockedCount / userAchievements.length) * 100)
    };
  }, [userStats, userAchievements]);

  // זיהוי הישגים חדשים
  useEffect(() => {
    const checkNewAchievements = () => {
      const stored = localStorage.getItem('lastCheckedAchievements');
      const lastChecked = stored ? JSON.parse(stored) : {};

      const newUnlocked = userAchievements.filter(a => {
        return a.unlocked && !lastChecked[a.id];
      });

      if (newUnlocked.length > 0) {
        setNewAchievements(newUnlocked);
        
        // עדכון localStorage
        const updated = { ...lastChecked };
        newUnlocked.forEach(a => {
          updated[a.id] = true;
        });
        localStorage.setItem('lastCheckedAchievements', JSON.stringify(updated));

        // הסרת ההתראה אחרי 5 שניות
        setTimeout(() => {
          setNewAchievements([]);
        }, 5000);
      }
    };

    if (userAchievements.length > 0) {
      checkNewAchievements();
    }
  }, [userAchievements]);

  if (isLoading) {
    return (
      <div className="achievements">
        <div className="achievements-loading">
          <div className="loading-spinner"></div>
          <p>{labels.loading}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="achievements">
      {/* התראות הישגים חדשים */}
      {newAchievements.length > 0 && (
        <div className="new-achievements-notification">
          {newAchievements.map(achievement => (
            <div key={achievement.id} className="new-achievement-card">
              <div className="achievement-icon-large">{achievement.icon}</div>
              <div className="achievement-details">
                <h3>🎉 {labels.unlocked}!</h3>
                <h4>{achievement.name[lang]}</h4>
                <p>{achievement.description[lang]}</p>
                <div className="achievement-points">+{achievement.points} {labels.pointsAbbr}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="achievements-container">
        {/* כותרת */}
        <div className="achievements-header">
          <h1>{labels.title}</h1>
          <p>{labels.subtitle}</p>
        </div>

        {/* סטטיסטיקות כלליות */}
        <div className="achievements-stats">
          <div className="stat-card level-card">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#gradient1)" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFA500" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">{labels.level}</div>
              <div className="stat-value">{stats.userLevel.level}</div>
              <div className="stat-sublabel">{stats.userLevel.name[lang]}</div>
              {stats.userLevel.nextLevel && (
                <div className="next-level-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${((stats.totalPoints - stats.userLevel.minPoints) / 
                                (stats.userLevel.nextLevel.minPoints - stats.userLevel.minPoints)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {stats.userLevel.nextLevel.pointsNeeded} {labels.pointsToNextLevel}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="stat-card points-card">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#gradient2)" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">{labels.totalPoints}</div>
              <div className="stat-value">{stats.totalPoints}</div>
            </div>
          </div>

          <div className="stat-card unlocked-card">
            <div className="stat-icon-wrapper">
              <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 5.09L16 2.82L15.27 6.27L19 6.64L16.18 8.91L18.36 12L15.27 12.36L16 16L13.09 13.73L12 17L10.91 13.73L8 16L8.73 12.36L5.64 12L7.82 8.91L5 6.64L8.73 6.27L8 2.82L10.91 5.09L12 2Z" fill="url(#gradient3)" stroke="url(#gradient3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f093fb" />
                    <stop offset="100%" stopColor="#f5576c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">{labels.unlockedAchievements}</div>
              <div className="stat-value">
                {stats.unlockedCount} / {stats.totalCount}
              </div>
              <div className="stat-sublabel">{stats.completionPercentage}%</div>
            </div>
          </div>
        </div>

        {/* פילטרים */}
        <div className="achievements-filters">
          <div className="filter-group">
            <label>{labels.categories.all}</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{labels.categories.all}</option>
              <option value={ACHIEVEMENT_CATEGORIES.QUESTIONS}>{labels.categories.questions}</option>
              <option value={ACHIEVEMENT_CATEGORIES.ACCURACY}>{labels.categories.accuracy}</option>
              <option value={ACHIEVEMENT_CATEGORIES.STREAK}>{labels.categories.streak}</option>
              <option value={ACHIEVEMENT_CATEGORIES.SUBJECTS}>{labels.categories.subjects}</option>
              <option value={ACHIEVEMENT_CATEGORIES.SPEED}>{labels.categories.speed}</option>
              <option value={ACHIEVEMENT_CATEGORIES.SPECIAL}>{labels.categories.special}</option>
            </select>
          </div>

          <div className="filter-group">
            <label>{labels.rarities.all}</label>
            <select 
              value={selectedRarity} 
              onChange={(e) => setSelectedRarity(e.target.value)}
            >
              <option value="all">{labels.rarities.all}</option>
              <option value="common">{labels.rarities.common}</option>
              <option value="uncommon">{labels.rarities.uncommon}</option>
              <option value="rare">{labels.rarities.rare}</option>
              <option value="epic">{labels.rarities.epic}</option>
              <option value="legendary">{labels.rarities.legendary}</option>
            </select>
          </div>

          <div className="filter-group">
            <label>{labels.sortBy.label}</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rarity">{labels.sortBy.rarity}</option>
              <option value="progress">{labels.sortBy.progress}</option>
              <option value="points">{labels.sortBy.points}</option>
            </select>
          </div>

          <div className="filter-checkbox">
            <label>
              <input
                type="checkbox"
                checked={showOnlyUnlocked}
                onChange={(e) => setShowOnlyUnlocked(e.target.checked)}
              />
              {labels.showOnlyUnlocked}
            </label>
          </div>
        </div>

        {/* רשימת הישגים */}
        <div className="achievements-grid">
          {filteredAchievements.map(achievement => (
            <div 
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity}`}
            >
              <div className="achievement-rarity-badge" style={{ backgroundColor: RARITY_LEVELS[achievement.rarity].color }}>
                {RARITY_LEVELS[achievement.rarity].icon}
              </div>
              
              <div className="achievement-icon">
                {achievement.unlocked ? achievement.icon : '🔒'}
              </div>
              
              <div className="achievement-info">
                <h3 className="achievement-name">
                  {achievement.unlocked ? achievement.name[lang] : '???'}
                </h3>
                <p className="achievement-description">
                  {achievement.unlocked ? achievement.description[lang] : labels.locked}
                </p>
              </div>

              <div className="achievement-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${achievement.progress.percentage}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {achievement.progress.current} / {achievement.progress.required}
                </div>
              </div>

              <div className="achievement-footer">
                <div className="achievement-points">
                  {achievement.points} {labels.pointsAbbr}
                </div>
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="achievement-unlocked-date">
                    {new Date(achievement.unlockedAt).toLocaleDateString(lang === 'ar' ? 'ar' : 'he')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="no-achievements">
            <p>אין הישגים להצגה</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
