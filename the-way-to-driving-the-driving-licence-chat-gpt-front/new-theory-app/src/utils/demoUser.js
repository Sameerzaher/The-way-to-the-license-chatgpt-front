// יצירת משתמש דמו לבדיקות
export const createDemoUser = () => {
  const demoUser = {
    id: 'demo_user_test_123',
    name: 'משתמש דמו',
    email: 'demo@example.com',
    course: 'theory',
    lang: 'he',
    createdAt: new Date().toISOString(),
    isDemo: true
  };

  // שמירה ב-localStorage
  localStorage.setItem('user', JSON.stringify(demoUser));
  
  return demoUser;
};

// בדיקה אם המשתמש קיים
export const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// בדיקה אם המשתמש הוא דמו
export const isDemoUser = (user) => {
  return user && user.isDemo === true;
};

// יצירת משתמש אם לא קיים
export const ensureUser = () => {
  let user = getUser();
  
  if (!user || !user.id) {
    console.log('🔧 Creating demo user...');
    user = createDemoUser();
  }
  
  return user;
};
