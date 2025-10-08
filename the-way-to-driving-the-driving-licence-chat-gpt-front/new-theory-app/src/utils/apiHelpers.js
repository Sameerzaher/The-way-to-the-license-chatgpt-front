/**
 * כלי עזר לקריאות API עם validation ו-error handling
 */

import { validateNetworkResponse, validateApiResponse } from './validation';

// פונקציה כללית לקריאות API עם error handling
export const apiRequest = async (url, options = {}, expectedFields = []) => {
  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    // בדיקת תקינות התגובה
    await validateNetworkResponse(response);

    // פרסור JSON
    const data = await response.json();
    
    // בדיקת שדות נדרשים
    if (expectedFields.length > 0) {
      validateApiResponse(data, expectedFields);
    }

    console.log(`✅ API Success: ${url}`, data);
    return data;

  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    
    // זריקת שגיאה מותאמת
    if (error.message.includes('HTTP 429')) {
      throw new Error('יותר מדי בקשות. אנא נסה שוב בעוד כמה שניות.');
    } else if (error.message.includes('HTTP 404')) {
      throw new Error('המידע המבוקש לא נמצא.');
    } else if (error.message.includes('HTTP 500')) {
      throw new Error('שגיאת שרת. אנא נסה שוב מאוחר יותר.');
    } else if (!navigator.onLine) {
      throw new Error('אין חיבור לאינטרנט. בדוק את החיבור שלך.');
    } else {
      throw new Error(error.message || 'שגיאה בלתי צפויה. אנא נסה שוב.');
    }
  }
};

// פונקציות מותאמות לסוגי בקשות שונים
export const apiGet = (url, expectedFields = []) => {
  return apiRequest(url, { method: 'GET' }, expectedFields);
};

export const apiPost = (url, data, expectedFields = []) => {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }, expectedFields);
};

export const apiPut = (url, data, expectedFields = []) => {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, expectedFields);
};

export const apiDelete = (url, expectedFields = []) => {
  return apiRequest(url, { method: 'DELETE' }, expectedFields);
};

// פונקציה עם retry logic
export const apiRequestWithRetry = async (url, options = {}, maxRetries = 3, expectedFields = []) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest(url, options, expectedFields);
    } catch (error) {
      lastError = error;
      
      // אל תנסה שוב על שגיאות 4xx (חוץ מ-429)
      if (error.message.includes('HTTP 4') && !error.message.includes('HTTP 429')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // exponential backoff
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// פונקציה לבדיקת מצב השרת
export const checkServerHealth = async () => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    await apiGet(`${apiUrl}/health`);
    return true;
  } catch (error) {
    console.warn('Server health check failed:', error);
    return false;
  }
};

// פונקציה לטיפול בקריאות API עם loading state
export const withLoading = async (loadingFn, apiCall, loadingKey = 'default') => {
  try {
    loadingFn(loadingKey, true);
    const result = await apiCall();
    return result;
  } finally {
    loadingFn(loadingKey, false);
  }
};

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiRequestWithRetry,
  checkServerHealth,
  withLoading
};
