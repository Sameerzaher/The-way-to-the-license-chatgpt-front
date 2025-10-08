/**
 * כלי validation למידע משתמש ונתונים קריטיים
 */

// בדיקת תקינות משתמש
export const validateUser = (user) => {
  if (!user || typeof user !== 'object') {
    console.warn('❌ User validation failed: user is null or not an object');
    return false;
  }

  // בדיקת שדות חובה
  const requiredFields = ['id', 'name'];
  for (const field of requiredFields) {
    if (!user[field] || typeof user[field] !== 'string' || user[field].trim().length === 0) {
      console.warn(`❌ User validation failed: ${field} is missing or invalid`);
      return false;
    }
  }

  // בדיקת אורך מזהה
  if (user.id.length < 2) {
    console.warn('❌ User validation failed: id is too short');
    return false;
  }

  console.log('✅ User validation passed');
  return true;
};

// בדיקת תקינות נתוני שאלה
export const validateQuestion = (question) => {
  if (!question || typeof question !== 'object') {
    console.warn('❌ Question validation failed: question is null or not an object');
    return false;
  }

  const requiredFields = ['id', 'question', 'answers'];
  for (const field of requiredFields) {
    if (!question[field]) {
      console.warn(`❌ Question validation failed: ${field} is missing`);
      return false;
    }
  }

  // בדיקת מערך תשובות
  if (!Array.isArray(question.answers) || question.answers.length < 2) {
    console.warn('❌ Question validation failed: answers must be an array with at least 2 items');
    return false;
  }

  console.log('✅ Question validation passed');
  return true;
};

// בדיקת תקינות נתוני API response
export const validateApiResponse = (response, expectedFields = []) => {
  if (!response) {
    console.warn('❌ API response validation failed: response is null');
    return false;
  }

  // בדיקת שדות נדרשים
  for (const field of expectedFields) {
    if (!(field in response)) {
      console.warn(`❌ API response validation failed: ${field} is missing`);
      return false;
    }
  }

  console.log('✅ API response validation passed');
  return true;
};

// בדיקת תקינות נתוני התקדמות
export const validateProgress = (progress) => {
  if (!progress || typeof progress !== 'object') {
    console.warn('❌ Progress validation failed: progress is null or not an object');
    return false;
  }

  // בדיקת שדות מספריים
  const numericFields = ['completedDays', 'totalDays', 'completedQuestions'];
  for (const field of numericFields) {
    if (progress[field] !== undefined && (typeof progress[field] !== 'number' || progress[field] < 0)) {
      console.warn(`❌ Progress validation failed: ${field} must be a non-negative number`);
      return false;
    }
  }

  // בדיקת לוגיקה
  if (progress.completedDays > progress.totalDays) {
    console.warn('❌ Progress validation failed: completedDays cannot be greater than totalDays');
    return false;
  }

  console.log('✅ Progress validation passed');
  return true;
};

// בדיקת תקינות נתוני סטטיסטיקות
export const validateStats = (stats) => {
  if (!stats || typeof stats !== 'object') {
    console.warn('❌ Stats validation failed: stats is null or not an object');
    return false;
  }

  // בדיקת שדות מספריים
  const numericFields = ['totalQuestions', 'completedQuestions', 'averageAccuracy'];
  for (const field of numericFields) {
    if (stats[field] !== undefined && (typeof stats[field] !== 'number' || stats[field] < 0)) {
      console.warn(`❌ Stats validation failed: ${field} must be a non-negative number`);
      return false;
    }
  }

  // בדיקת אחוזי דיוק
  if (stats.averageAccuracy !== undefined && stats.averageAccuracy > 100) {
    console.warn('❌ Stats validation failed: averageAccuracy cannot be greater than 100');
    return false;
  }

  console.log('✅ Stats validation passed');
  return true;
};

// בדיקת תקינות URL parameters
export const validateUrlParams = (params) => {
  if (!params || typeof params !== 'object') {
    return {};
  }

  const validatedParams = {};
  
  // בדיקת lang
  if (params.lang && ['he', 'ar'].includes(params.lang)) {
    validatedParams.lang = params.lang;
  }

  // בדיקת category
  if (params.category && typeof params.category === 'string' && params.category.trim().length > 0) {
    validatedParams.category = params.category.trim();
  }

  // בדיקת filter
  if (params.filter && ['remaining', 'completed', 'wrong'].includes(params.filter)) {
    validatedParams.filter = params.filter;
  }

  // בדיקת count
  if (params.count && !isNaN(parseInt(params.count)) && parseInt(params.count) > 0) {
    validatedParams.count = Math.min(parseInt(params.count), 100); // מגבלה של 100
  }

  return validatedParams;
};

// פונקציה כללית לבדיקת תקינות עם fallback
export const safeValidate = (data, validator, fallback = null) => {
  try {
    if (validator(data)) {
      return data;
    }
    console.warn('🔄 Validation failed, using fallback data');
    return fallback;
  } catch (error) {
    console.error('❌ Validation error:', error);
    return fallback;
  }
};

// בדיקת תקינות localStorage data
export const validateLocalStorageData = (key, expectedType = 'object') => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    
    if (expectedType === 'object' && typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    
    if (expectedType === 'array' && Array.isArray(parsed)) {
      return parsed;
    }
    
    if (typeof parsed === expectedType) {
      return parsed;
    }

    console.warn(`❌ localStorage validation failed for ${key}: expected ${expectedType}, got ${typeof parsed}`);
    return null;
  } catch (error) {
    console.error(`❌ localStorage parsing error for ${key}:`, error);
    localStorage.removeItem(key); // ניקוי נתונים פגומים
    return null;
  }
};

// בדיקת תקינות חיבור רשת
export const validateNetworkResponse = async (response) => {
  if (!response) {
    throw new Error('No response received');
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response;
};

export default {
  validateUser,
  validateQuestion,
  validateApiResponse,
  validateProgress,
  validateStats,
  validateUrlParams,
  safeValidate,
  validateLocalStorageData,
  validateNetworkResponse
};
