const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ErrorPatternService {
  /**
   * ניתוח דפוסי טעויות
   */
  async analyzeErrors(userId) {
    try {
      const response = await fetch(`${API_URL}/error-patterns/${userId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      throw error;
    }
  }

  /**
   * קבלת המלצות AI
   */
  async getRecommendations(userId) {
    try {
      const response = await fetch(`${API_URL}/error-patterns/${userId}/recommendations`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * קבלת דו"ח מקיף
   */
  async getReport(userId) {
    try {
      const response = await fetch(`${API_URL}/error-patterns/${userId}/report`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting report:', error);
      throw error;
    }
  }

  /**
   * קבלת תובנות מתקדמות
   */
  async getInsights(userId) {
    try {
      const response = await fetch(`${API_URL}/error-patterns/${userId}/insights`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting insights:', error);
      throw error;
    }
  }

  /**
   * השוואת התקדמות
   */
  async compareProgress(userId, days = 7) {
    try {
      const response = await fetch(
        `${API_URL}/error-patterns/${userId}/compare?days=${days}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error comparing progress:', error);
      throw error;
    }
  }

  /**
   * עדכון הערות ומטרות
   */
  async updatePattern(userId, notes, goals) {
    try {
      const response = await fetch(`${API_URL}/error-patterns/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manualNotes: notes,
          customGoals: goals,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating pattern:', error);
      throw error;
    }
  }
}

export default new ErrorPatternService();

