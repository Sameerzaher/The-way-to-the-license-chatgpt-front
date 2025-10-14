import React, { useState, useEffect } from 'react';
import { useVirtualTeacher } from '../../contexts/VirtualTeacherContext';
import { getAIAdvice, getAILearningPlan, chatWithTeacher, analyzeWeaknesses, predictExamSuccess } from '../../services/virtualTeacherService';
import './VirtualTeacher.css';

const VirtualTeacher = ({ userId }) => {
  const {
    teacherState,
    teacherStats,
    analyzeUserStatus,
    getAdvice,
    createPlan,
    changePersonality,
    addConversation
  } = useVirtualTeacher();

  const [activeTab, setActiveTab] = useState('advice'); // advice, plan, chat, analysis
  const [isLoading, setIsLoading] = useState(false);
  const [aiAdvice, setAIAdvice] = useState(null);
  const [aiPlan, setAIPlan] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [weaknessAnalysis, setWeaknessAnalysis] = useState(null);
  const [examPrediction, setExamPrediction] = useState(null);

  // טעינת עצה ראשונית
  useEffect(() => {
    if (!teacherState.currentAdvice) {
      getAdvice();
    }
  }, []);

  // קבלת עצה מה-AI
  const handleGetAIAdvice = async () => {
    setIsLoading(true);
    const analysis = analyzeUserStatus();
    const result = await getAIAdvice(userId, analysis);
    
    if (result.success) {
      setAIAdvice(result.advice);
    }
    
    setIsLoading(false);
  };

  // קבלת תוכנית למידה מה-AI
  const handleGetAIPlan = async () => {
    setIsLoading(true);
    const analysis = analyzeUserStatus();
    const result = await getAILearningPlan(userId, analysis);
    
    if (result.success) {
      setAIPlan(result.plan);
    }
    
    setIsLoading(false);
  };

  // שליחת הודעה לצ'אט
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    setIsLoading(true);
    const userMsg = chatMessage;
    setChatMessage('');
    
    // הוספה להיסטוריה מקומית
    const newHistory = [
      ...chatHistory,
      { role: 'user', content: userMsg }
    ];
    setChatHistory(newHistory);
    
    // שליחה לשרת
    const result = await chatWithTeacher(userId, userMsg, teacherState.conversationHistory);
    
    if (result.success) {
      setChatHistory([
        ...newHistory,
        { role: 'teacher', content: result.response }
      ]);
      
      // שמירה ב-context
      addConversation(userMsg, result.response);
    }
    
    setIsLoading(false);
  };

  // ניתוח נקודות חולשה
  const handleAnalyzeWeaknesses = async () => {
    setIsLoading(true);
    const analysis = analyzeUserStatus();
    
    if (analysis.weakAreas.length > 0) {
      const result = await analyzeWeaknesses(userId, analysis.weakAreas);
      
      if (result.success) {
        setWeaknessAnalysis(result.analysis);
      }
    } else {
      setWeaknessAnalysis('מעולה! אין לך נקודות חולשה משמעותיות. המשך כך! 🎉');
    }
    
    setIsLoading(false);
  };

  // חיזוי הצלחה בבחינה
  const handlePredictSuccess = async () => {
    setIsLoading(true);
    const analysis = analyzeUserStatus();
    const result = await predictExamSuccess(userId, analysis);
    
    if (result.success) {
      setExamPrediction({
        probability: result.probability,
        prediction: result.prediction
      });
    }
    
    setIsLoading(false);
  };

  const userAnalysis = analyzeUserStatus();

  return (
    <div className="virtual-teacher">
      {/* כותרת */}
      <div className="teacher-header">
        <div className="teacher-avatar">🤖</div>
        <div className="teacher-info">
          <h1>המורה הוירטואלי שלך</h1>
          <p>כאן כדי לעזור לך להצליח בבחינה!</p>
        </div>
        <div className="teacher-stats-summary">
          <div className="stat">
            <span className="stat-value">{teacherStats.totalInteractions}</span>
            <span className="stat-label">אינטראקציות</span>
          </div>
          <div className="stat">
            <span className="stat-value">{teacherStats.adviceGiven}</span>
            <span className="stat-label">עצות</span>
          </div>
        </div>
      </div>

      {/* ניתוח מהיר */}
      <div className="quick-analysis">
        <h3>ניתוח מהיר</h3>
        <div className="analysis-cards">
          <div className="analysis-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <span className="card-label">התקדמות כללית</span>
              <span className="card-value">{userAnalysis.overallProgress.toFixed(1)}%</span>
            </div>
          </div>
          <div className="analysis-card">
            <div className="card-icon">💪</div>
            <div className="card-content">
              <span className="card-label">נושאים חזקים</span>
              <span className="card-value">{userAnalysis.strongAreas.length}</span>
            </div>
          </div>
          <div className="analysis-card">
            <div className="card-icon">⚠️</div>
            <div className="card-content">
              <span className="card-label">נושאים לשיפור</span>
              <span className="card-value">{userAnalysis.weakAreas.length}</span>
            </div>
          </div>
          <div className="analysis-card">
            <div className="card-icon">
              {userAnalysis.motivationLevel === 'high' ? '🔥' : 
               userAnalysis.motivationLevel === 'medium' ? '😊' : '😴'}
            </div>
            <div className="card-content">
              <span className="card-label">מוטיבציה</span>
              <span className="card-value">
                {userAnalysis.motivationLevel === 'high' ? 'גבוהה' : 
                 userAnalysis.motivationLevel === 'medium' ? 'בינונית' : 'נמוכה'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* טאבים */}
      <div className="teacher-tabs">
        <button 
          className={`tab ${activeTab === 'advice' ? 'active' : ''}`}
          onClick={() => setActiveTab('advice')}
        >
          💡 עצות
        </button>
        <button 
          className={`tab ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          📋 תוכנית למידה
        </button>
        <button 
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 צ'אט
        </button>
        <button 
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          📊 ניתוח
        </button>
      </div>

      {/* תוכן */}
      <div className="teacher-content">
        {/* טאב עצות */}
        {activeTab === 'advice' && (
          <div className="advice-tab">
            <div className="advice-section">
              <h3>עצה מקומית</h3>
              {teacherState.currentAdvice && (
                <div className="advice-card">
                  <div className="advice-header">
                    <span className="advice-type">{teacherState.currentAdvice.type}</span>
                    <span className={`advice-priority priority-${teacherState.currentAdvice.priority}`}>
                      {teacherState.currentAdvice.priority === 'high' ? '🔴 דחוף' : 
                       teacherState.currentAdvice.priority === 'medium' ? '🟡 בינוני' : '🟢 לא דחוף'}
                    </span>
                  </div>
                  <p className="advice-message">{teacherState.currentAdvice.message}</p>
                  <div className="action-items">
                    <h4>פעולות מומלצות:</h4>
                    <ul>
                      {teacherState.currentAdvice.actionItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <button 
                className="btn-primary"
                onClick={getAdvice}
                disabled={isLoading}
              >
                🔄 קבל עצה חדשה
              </button>
            </div>

            <div className="ai-advice-section">
              <h3>עצה מה-AI</h3>
              <button 
                className="btn-secondary"
                onClick={handleGetAIAdvice}
                disabled={isLoading}
              >
                {isLoading ? '⏳ טוען...' : '🤖 קבל עצה מה-AI'}
              </button>
              {aiAdvice && (
                <div className="ai-response">
                  <p>{aiAdvice}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* טאב תוכנית למידה */}
        {activeTab === 'plan' && (
          <div className="plan-tab">
            <div className="plan-section">
              <h3>תוכנית למידה מקומית</h3>
              {teacherState.learningPlan ? (
                <div className="learning-plan">
                  <div className="plan-header">
                    <span>📅 משך: {teacherState.learningPlan.duration}</span>
                  </div>
                  
                  <div className="plan-section">
                    <h4>🎯 יעדים יומיים</h4>
                    <ul>
                      {teacherState.learningPlan.dailyGoals.map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="plan-section">
                    <h4>📊 יעדים שבועיים</h4>
                    <ul>
                      {teacherState.learningPlan.weeklyGoals.map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="plan-section">
                    <h4>🏆 אבני דרך</h4>
                    {teacherState.learningPlan.milestones.map((milestone, index) => (
                      <div key={index} className="milestone">
                        <span className="milestone-week">שבוע {milestone.week}</span>
                        <span className="milestone-goal">{milestone.goal}</span>
                        <span className="milestone-reward">{milestone.reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>אין תוכנית למידה עדיין.</p>
              )}
              <button 
                className="btn-primary"
                onClick={createPlan}
                disabled={isLoading}
              >
                📋 צור תוכנית חדשה
              </button>
            </div>

            <div className="ai-plan-section">
              <h3>תוכנית מה-AI</h3>
              <button 
                className="btn-secondary"
                onClick={handleGetAIPlan}
                disabled={isLoading}
              >
                {isLoading ? '⏳ טוען...' : '🤖 קבל תוכנית מה-AI'}
              </button>
              {aiPlan && (
                <div className="ai-response">
                  <pre>{aiPlan}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* טאב צ'אט */}
        {activeTab === 'chat' && (
          <div className="chat-tab">
            <div className="chat-history">
              {chatHistory.length === 0 ? (
                <div className="empty-chat">
                  <p>👋 שלום! אני המורה הוירטואלי שלך.</p>
                  <p>שאל אותי כל שאלה על הבחינה או הלמידה!</p>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="כתוב הודעה למורה..."
                disabled={isLoading}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !chatMessage.trim()}
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
          </div>
        )}

        {/* טאב ניתוח */}
        {activeTab === 'analysis' && (
          <div className="analysis-tab">
            <div className="analysis-section">
              <h3>ניתוח נקודות חולשה</h3>
              <button 
                className="btn-secondary"
                onClick={handleAnalyzeWeaknesses}
                disabled={isLoading}
              >
                {isLoading ? '⏳ מנתח...' : '🔍 נתח נקודות חולשה'}
              </button>
              {weaknessAnalysis && (
                <div className="ai-response">
                  <p>{weaknessAnalysis}</p>
                </div>
              )}
            </div>

            <div className="prediction-section">
              <h3>חיזוי הצלחה בבחינה</h3>
              <button 
                className="btn-secondary"
                onClick={handlePredictSuccess}
                disabled={isLoading}
              >
                {isLoading ? '⏳ מחזה...' : '🔮 חזה הצלחה'}
              </button>
              {examPrediction && (
                <div className="prediction-result">
                  <div className="probability">
                    <span className="probability-label">סיכויי הצלחה:</span>
                    <span className="probability-value">{examPrediction.probability.toFixed(1)}%</span>
                  </div>
                  <div className="prediction-text">
                    <p>{examPrediction.prediction}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTeacher;

