// מערכת הישגים ותגים לגיימיפיקציה

export const ACHIEVEMENT_CATEGORIES = {
  QUESTIONS: 'questions',
  ACCURACY: 'accuracy',
  STREAK: 'streak',
  SUBJECTS: 'subjects',
  SPEED: 'speed',
  SPECIAL: 'special'
};

export const ACHIEVEMENTS = [
  // הישגים לפי כמות שאלות
  {
    id: 'first_question',
    category: ACHIEVEMENT_CATEGORIES.QUESTIONS,
    name: {
      he: 'צעד ראשון',
      ar: 'الخطوة الأولى'
    },
    description: {
      he: 'ענית על השאלה הראשונה שלך',
      ar: 'أجبت على سؤالك الأول'
    },
    icon: '🎯',
    requirement: 1,
    points: 10,
    rarity: 'common'
  },
  {
    id: 'rookie',
    category: ACHIEVEMENT_CATEGORIES.QUESTIONS,
    name: {
      he: 'טירון',
      ar: 'مبتدئ'
    },
    description: {
      he: 'ענית על 10 שאלות',
      ar: 'أجبت على 10 أسئلة'
    },
    icon: '🌱',
    requirement: 10,
    points: 25,
    rarity: 'common'
  },
  {
    id: 'apprentice',
    category: ACHIEVEMENT_CATEGORIES.QUESTIONS,
    name: {
      he: 'חניך',
      ar: 'متدرب'
    },
    description: {
      he: 'ענית על 50 שאלות',
      ar: 'أجبت على 50 سؤالاً'
    },
    icon: '📚',
    requirement: 50,
    points: 50,
    rarity: 'common'
  },
  {
    id: 'student',
    category: ACHIEVEMENT_CATEGORIES.QUESTIONS,
    name: {
      he: 'תלמיד',
      ar: 'طالب'
    },
    description: {
      he: 'ענית על 100 שאלות',
      ar: 'أجبت على 100 سؤال'
    },
    icon: '🎓',
    requirement: 100,
    points: 100,
    rarity: 'uncommon'
  },
  {
    id: 'scholar',
    category: ACHIEVEMENT_CATEGORIES.QUESTIONS,
    name: {
      he: 'חוקר',
      ar: 'باحث'
    },
    description: {
      he: 'ענית על 250 שאלות',
      ar: 'أجبت على 250 سؤالاً'
    },
    icon: '📖',
    requirement: 250,
    points: 200,
    rarity: 'uncommon'
  },
  {
    id: 'expert',
    category: ACHIEVEMENT_CATEGORIES.QUESTIONS,
    name: {
      he: 'מומחה',
      ar: 'خبير'
    },
    description: {
      he: 'ענית על 500 שאלות',
      ar: 'أجبت على 500 سؤال'
    },
    icon: '⭐',
    requirement: 500,
    points: 500,
    rarity: 'rare'
  },
  {
    id: 'master',
    category: ACHIEVEMENT_CATEGORIES.QUESTIONS,
    name: {
      he: 'אמן',
      ar: 'معلم'
    },
    description: {
      he: 'ענית על 1000 שאלות',
      ar: 'أجبت على 1000 سؤال'
    },
    icon: '👑',
    requirement: 1000,
    points: 1000,
    rarity: 'epic'
  },
  {
    id: 'legend',
    category: ACHIEVEMENT_CATEGORIES.QUESTIONS,
    name: {
      he: 'אגדה',
      ar: 'أسطورة'
    },
    description: {
      he: 'ענית על 2000 שאלות',
      ar: 'أجبت على 2000 سؤال'
    },
    icon: '🏆',
    requirement: 2000,
    points: 2000,
    rarity: 'legendary'
  },

  // הישגים לפי דיוק
  {
    id: 'accurate_10',
    category: ACHIEVEMENT_CATEGORIES.ACCURACY,
    name: {
      he: 'מדויק',
      ar: 'دقيق'
    },
    description: {
      he: '10 תשובות נכונות ברצף',
      ar: '10 إجابات صحيحة متتالية'
    },
    icon: '🎯',
    requirement: 10,
    points: 50,
    rarity: 'common'
  },
  {
    id: 'accurate_25',
    category: ACHIEVEMENT_CATEGORIES.ACCURACY,
    name: {
      he: 'חד עין',
      ar: 'عين حادة'
    },
    description: {
      he: '25 תשובות נכונות ברצף',
      ar: '25 إجابة صحيحة متتالية'
    },
    icon: '👁️',
    requirement: 25,
    points: 150,
    rarity: 'uncommon'
  },
  {
    id: 'accurate_50',
    category: ACHIEVEMENT_CATEGORIES.ACCURACY,
    name: {
      he: 'צלף',
      ar: 'قناص'
    },
    description: {
      he: '50 תשובות נכונות ברצף',
      ar: '50 إجابة صحيحة متتالية'
    },
    icon: '🎖️',
    requirement: 50,
    points: 300,
    rarity: 'rare'
  },
  {
    id: 'perfect_score',
    category: ACHIEVEMENT_CATEGORIES.ACCURACY,
    name: {
      he: 'מושלם',
      ar: 'مثالي'
    },
    description: {
      he: '100% דיוק ב-30 שאלות',
      ar: '100٪ دقة في 30 سؤالاً'
    },
    icon: '💯',
    requirement: 30,
    points: 500,
    rarity: 'epic'
  },

  // הישגים לפי רצף ימים
  {
    id: 'streak_3',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    name: {
      he: 'מתמיד',
      ar: 'مثابر'
    },
    description: {
      he: 'תרגלת 3 ימים ברצף',
      ar: 'تدربت لمدة 3 أيام متتالية'
    },
    icon: '🔥',
    requirement: 3,
    points: 50,
    rarity: 'common'
  },
  {
    id: 'streak_7',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    name: {
      he: 'שבוע מלא',
      ar: 'أسبوع كامل'
    },
    description: {
      he: 'תרגלת שבוע שלם ברצף',
      ar: 'تدربت لمدة أسبوع كامل'
    },
    icon: '📅',
    requirement: 7,
    points: 150,
    rarity: 'uncommon'
  },
  {
    id: 'streak_14',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    name: {
      he: 'שבועיים ברצף',
      ar: 'أسبوعان متتاليان'
    },
    description: {
      he: 'תרגלת 14 ימים ברצף',
      ar: 'تدربت لمدة 14 يومًا متتاليًا'
    },
    icon: '🗓️',
    requirement: 14,
    points: 300,
    rarity: 'rare'
  },
  {
    id: 'streak_30',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    name: {
      he: 'חודש מלא',
      ar: 'شهر كامل'
    },
    description: {
      he: 'תרגלת חודש שלם ברצף',
      ar: 'تدربت لمدة شهر كامل'
    },
    icon: '📆',
    requirement: 30,
    points: 1000,
    rarity: 'epic'
  },

  // הישגים לפי נושאים
  {
    id: 'traffic_signs_master',
    category: ACHIEVEMENT_CATEGORIES.SUBJECTS,
    name: {
      he: 'מומחה תמרורים',
      ar: 'خبير إشارات المرور'
    },
    description: {
      he: 'ענית נכון על 50 שאלות תמרורים',
      ar: 'أجبت بشكل صحيح على 50 سؤال إشارات'
    },
    icon: '🚦',
    requirement: 50,
    subject: 'תמרורים',
    points: 200,
    rarity: 'uncommon'
  },
  {
    id: 'traffic_rules_master',
    category: ACHIEVEMENT_CATEGORIES.SUBJECTS,
    name: {
      he: 'מומחה חוקי תנועה',
      ar: 'خبير قوانين المرور'
    },
    description: {
      he: 'ענית נכון על 50 שאלות חוקי תנועה',
      ar: 'أجبت بشكل صحيح على 50 سؤال قوانين'
    },
    icon: '📜',
    requirement: 50,
    subject: 'חוקי תנועה',
    points: 200,
    rarity: 'uncommon'
  },
  {
    id: 'parking_master',
    category: ACHIEVEMENT_CATEGORIES.SUBJECTS,
    name: {
      he: 'מומחה חנייה',
      ar: 'خبير وقوف السيارات'
    },
    description: {
      he: 'ענית נכון על 30 שאלות חנייה',
      ar: 'أجبت بشكل صحيح على 30 سؤال وقوف'
    },
    icon: '🅿️',
    requirement: 30,
    subject: 'חנייה',
    points: 150,
    rarity: 'uncommon'
  },

  // הישגים לפי מהירות
  {
    id: 'speed_demon',
    category: ACHIEVEMENT_CATEGORIES.SPEED,
    name: {
      he: 'מהיר כברק',
      ar: 'سريع كالبرق'
    },
    description: {
      he: 'ענית על 10 שאלות בפחות מ-5 שניות כל אחת',
      ar: 'أجبت على 10 أسئلة في أقل من 5 ثوانٍ لكل منها'
    },
    icon: '⚡',
    requirement: 10,
    maxTime: 5,
    points: 200,
    rarity: 'rare'
  },
  {
    id: 'quick_thinker',
    category: ACHIEVEMENT_CATEGORIES.SPEED,
    name: {
      he: 'חושב מהיר',
      ar: 'مفكر سريع'
    },
    description: {
      he: 'ענית על 20 שאלות בפחות מ-10 שניות כל אחת',
      ar: 'أجبت على 20 سؤالاً في أقل من 10 ثوانٍ لكل منها'
    },
    icon: '💨',
    requirement: 20,
    maxTime: 10,
    points: 150,
    rarity: 'uncommon'
  },

  // הישגים מיוחדים
  {
    id: 'night_owl',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    name: {
      he: 'ינשוף לילה',
      ar: 'بومة الليل'
    },
    description: {
      he: 'תרגלת בין 00:00 ל-05:00',
      ar: 'تدربت بين 00:00 و 05:00'
    },
    icon: '🦉',
    requirement: 1,
    points: 100,
    rarity: 'uncommon'
  },
  {
    id: 'early_bird',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    name: {
      he: 'ציפור מוקדמת',
      ar: 'الطائر المبكر'
    },
    description: {
      he: 'תרגלת בין 05:00 ל-07:00',
      ar: 'تدربت بين 05:00 و 07:00'
    },
    icon: '🐦',
    requirement: 1,
    points: 100,
    rarity: 'uncommon'
  },
  {
    id: 'weekend_warrior',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    name: {
      he: 'לוחם סוף שבוע',
      ar: 'محارب عطلة نهاية الأسبوع'
    },
    description: {
      he: 'תרגלת בשבת או ביום ראשון',
      ar: 'تدربت يوم السبت أو الأحد'
    },
    icon: '🎮',
    requirement: 1,
    points: 50,
    rarity: 'common'
  },
  {
    id: 'comeback_kid',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    name: {
      he: 'חזרה מנצחת',
      ar: 'عودة منتصرة'
    },
    description: {
      he: 'חזרת לתרגל אחרי הפסקה של שבוע',
      ar: 'عدت للتدريب بعد استراحة أسبوع'
    },
    icon: '🔄',
    requirement: 1,
    points: 150,
    rarity: 'uncommon'
  },
  {
    id: 'completionist',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    name: {
      he: 'משלים',
      ar: 'مكمل'
    },
    description: {
      he: 'ענית על כל השאלות במאגר',
      ar: 'أجبت على جميع الأسئلة في البنك'
    },
    icon: '✅',
    requirement: 1,
    points: 5000,
    rarity: 'legendary'
  }
];

// רמות נדירות
export const RARITY_LEVELS = {
  common: {
    name: { he: 'רגיל', ar: 'عادي' },
    color: '#9E9E9E',
    icon: '⚪'
  },
  uncommon: {
    name: { he: 'לא שכיח', ar: 'غير شائع' },
    color: '#4CAF50',
    icon: '🟢'
  },
  rare: {
    name: { he: 'נדיר', ar: 'نادر' },
    color: '#2196F3',
    icon: '🔵'
  },
  epic: {
    name: { he: 'אפי', ar: 'ملحمي' },
    color: '#9C27B0',
    icon: '🟣'
  },
  legendary: {
    name: { he: 'אגדי', ar: 'أسطوري' },
    color: '#FF9800',
    icon: '🟠'
  }
};

// פונקציה לבדיקת השגת הישג
export const checkAchievement = (achievement, userStats) => {
  switch (achievement.category) {
    case ACHIEVEMENT_CATEGORIES.QUESTIONS:
      return userStats.totalQuestions >= achievement.requirement;
    
    case ACHIEVEMENT_CATEGORIES.ACCURACY:
      if (achievement.id === 'perfect_score') {
        return userStats.perfectScoreSessions >= 1;
      }
      return userStats.currentCorrectStreak >= achievement.requirement;
    
    case ACHIEVEMENT_CATEGORIES.STREAK:
      return userStats.currentDayStreak >= achievement.requirement;
    
    case ACHIEVEMENT_CATEGORIES.SUBJECTS:
      const subjectStats = userStats.subjectStats?.[achievement.subject];
      return subjectStats?.correct >= achievement.requirement;
    
    case ACHIEVEMENT_CATEGORIES.SPEED:
      return userStats.fastAnswers >= achievement.requirement;
    
    case ACHIEVEMENT_CATEGORIES.SPECIAL:
      return checkSpecialAchievement(achievement, userStats);
    
    default:
      return false;
  }
};

// בדיקת הישגים מיוחדים
const checkSpecialAchievement = (achievement, userStats) => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  switch (achievement.id) {
    case 'night_owl':
      return hour >= 0 && hour < 5 && userStats.sessionsToday > 0;
    
    case 'early_bird':
      return hour >= 5 && hour < 7 && userStats.sessionsToday > 0;
    
    case 'weekend_warrior':
      return (day === 0 || day === 6) && userStats.sessionsToday > 0;
    
    case 'comeback_kid':
      const daysSinceLastSession = userStats.daysSinceLastSession || 0;
      return daysSinceLastSession >= 7 && userStats.sessionsToday > 0;
    
    case 'completionist':
      return userStats.totalQuestions >= userStats.totalAvailableQuestions;
    
    default:
      return false;
  }
};

// פונקציה לחישוב התקדמות להישג
export const calculateAchievementProgress = (achievement, userStats) => {
  let current = 0;
  let required = achievement.requirement;

  switch (achievement.category) {
    case ACHIEVEMENT_CATEGORIES.QUESTIONS:
      current = userStats.totalQuestions || 0;
      break;
    
    case ACHIEVEMENT_CATEGORIES.ACCURACY:
      if (achievement.id === 'perfect_score') {
        current = userStats.perfectScoreSessions || 0;
        required = 1;
      } else {
        current = userStats.currentCorrectStreak || 0;
      }
      break;
    
    case ACHIEVEMENT_CATEGORIES.STREAK:
      current = userStats.currentDayStreak || 0;
      break;
    
    case ACHIEVEMENT_CATEGORIES.SUBJECTS:
      const subjectStats = userStats.subjectStats?.[achievement.subject];
      current = subjectStats?.correct || 0;
      break;
    
    case ACHIEVEMENT_CATEGORIES.SPEED:
      current = userStats.fastAnswers || 0;
      break;
    
    case ACHIEVEMENT_CATEGORIES.SPECIAL:
      current = checkSpecialAchievement(achievement, userStats) ? 1 : 0;
      required = 1;
      break;
    
    default:
      current = 0;
  }

  const percentage = Math.min((current / required) * 100, 100);
  return {
    current,
    required,
    percentage: Math.round(percentage),
    completed: current >= required
  };
};

// פונקציה לקבלת כל ההישגים של משתמש
export const getUserAchievements = (userStats) => {
  return ACHIEVEMENTS.map(achievement => {
    const progress = calculateAchievementProgress(achievement, userStats);
    const unlocked = checkAchievement(achievement, userStats);
    
    return {
      ...achievement,
      progress,
      unlocked,
      unlockedAt: unlocked ? (userStats.achievements?.[achievement.id]?.unlockedAt || new Date().toISOString()) : null
    };
  });
};

// פונקציה לחישוב סך הנקודות
export const calculateTotalPoints = (userAchievements) => {
  return userAchievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);
};

// פונקציה לקבלת רמת משתמש לפי נקודות
export const getUserLevel = (totalPoints) => {
  const levels = [
    { level: 1, minPoints: 0, name: { he: 'מתחיל', ar: 'مبتدئ' } },
    { level: 2, minPoints: 100, name: { he: 'טירון', ar: 'مبتدئ متقدم' } },
    { level: 3, minPoints: 300, name: { he: 'חניך', ar: 'متدرب' } },
    { level: 4, minPoints: 600, name: { he: 'תלמיד', ar: 'طالب' } },
    { level: 5, minPoints: 1000, name: { he: 'מתקדם', ar: 'متقدم' } },
    { level: 6, minPoints: 1500, name: { he: 'מומחה', ar: 'خبير' } },
    { level: 7, minPoints: 2500, name: { he: 'אמן', ar: 'معلم' } },
    { level: 8, minPoints: 4000, name: { he: 'מאסטר', ar: 'سيد' } },
    { level: 9, minPoints: 6000, name: { he: 'גראנד מאסטר', ar: 'سيد كبير' } },
    { level: 10, minPoints: 10000, name: { he: 'אגדה', ar: 'أسطورة' } }
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalPoints >= levels[i].minPoints) {
      const nextLevel = levels[i + 1];
      return {
        ...levels[i],
        nextLevel: nextLevel ? {
          level: nextLevel.level,
          minPoints: nextLevel.minPoints,
          pointsNeeded: nextLevel.minPoints - totalPoints
        } : null
      };
    }
  }

  return levels[0];
};
