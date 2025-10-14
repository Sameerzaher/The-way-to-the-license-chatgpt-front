import React from 'react';
import { useErrorPatterns } from '../../hooks/useErrorPatterns';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './ErrorPatternDashboard.css';

const ErrorPatternDashboard = ({ userId }) => {
  const { report, loading, error, refresh } = useErrorPatterns(userId);

  if (loading) {
    return (
      <div className="error-dashboard-loading">
        <LoadingSpinner />
        <p>מנתח את דפוסי הטעויות שלך...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>שגיאה בטעינת הניתוח</h3>
        <p>{error}</p>
        <button onClick={refresh} className="retry-button">
          נסה שוב
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="error-dashboard-empty">
        <div className="empty-icon">📊</div>
        <h3>אין מספיק נתונים</h3>
        <p>ענה על לפחות 10 שאלות כדי לקבל ניתוח מפורט</p>
      </div>
    );
  }

  const { summary, patterns, insights, aiRecommendations, actionPlan } = report;

  return (
    <div className="error-pattern-dashboard">
      {/* כותרת עם ציון מוכנות */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>ניתוח דפוסי טעויות AI</h1>
          <p className="header-subtitle">
            ניתוח חכם של דפוסי הלמידה שלך עם המלצות מותאמות אישית
          </p>
        </div>
        <div className={`readiness-score level-${summary.readinessLevel}`}>
          <div className="score-circle">
            <div className="score-number">{summary.readinessScore}</div>
            <div className="score-total">/100</div>
          </div>
          <div className="score-label">ציון מוכנות</div>
          <div className="score-message">{insights.readinessScore.message}</div>
        </div>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="url(#gradient-questions)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2v6h6" stroke="url(#gradient-questions)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 13h6M9 17h6" stroke="url(#gradient-questions)" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="gradient-questions" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{summary.totalQuestions}</div>
            <div className="stat-label">שאלות</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="url(#gradient-errors)" strokeWidth="2"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="url(#gradient-errors)" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="gradient-errors" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{summary.totalErrors}</div>
            <div className="stat-label">טעויות</div>
          </div>
        </div>
        <div className="stat-card error-rate">
          <div className="stat-icon-wrapper">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3v18h18" stroke="url(#gradient-error-rate)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 17l-5-5-3 3-5-5" stroke="url(#gradient-error-rate)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="5" cy="10" r="1.5" fill="url(#gradient-error-rate)"/>
              <circle cx="10" cy="15" r="1.5" fill="url(#gradient-error-rate)"/>
              <circle cx="13" cy="12" r="1.5" fill="url(#gradient-error-rate)"/>
              <circle cx="18" cy="7" r="1.5" fill="url(#gradient-error-rate)"/>
              <defs>
                <linearGradient id="gradient-error-rate" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{summary.errorRate}%</div>
            <div className="stat-label">אחוז טעויות</div>
          </div>
        </div>
      </div>

      {/* סגנון למידה */}
      <div className="section learning-style-section">
        <h2>🎓 סגנון הלמידה שלך</h2>
        <div className={`learning-style-card ${insights.learningStyle.type}`}>
          <div className="style-type">{insights.learningStyle.type}</div>
          <p className="style-description">{insights.learningStyle.description}</p>
          <div className="style-recommendation">
            💡 <strong>המלצה:</strong> {insights.learningStyle.recommendation}
          </div>
        </div>
      </div>

      {/* תחומים לשיפור */}
      {patterns.improvementAreas && patterns.improvementAreas.length > 0 && (
        <div className="section improvement-areas-section">
          <h2>⚠️ תחומים לשיפור</h2>
          <div className="areas-list">
            {patterns.improvementAreas.slice(0, 5).map((area, index) => (
              <div key={index} className="area-card">
                <div className="area-header">
                  <span className="area-rank">#{index + 1}</span>
                  <span className="area-name">{area.subject}</span>
                  <span className="area-rate">{area.errorRate}%</span>
                </div>
                <div className="area-progress-container">
                  <div 
                    className="area-progress-bar"
                    style={{ width: `${area.errorRate}%` }}
                  >
                    <span className="progress-label">
                      {area.errorCount} טעויות
                    </span>
                  </div>
                </div>
                <div className="area-details">
                  {area.errorCount} טעויות מתוך {area.totalQuestions} שאלות
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* תחומי חוזק */}
      {patterns.strengths && patterns.strengths.length > 0 && (
        <div className="section strengths-section">
          <h2>💪 תחומי החוזק שלך</h2>
          <div className="strengths-grid">
            {patterns.strengths.map((strength, index) => (
              <div key={index} className="strength-card">
                <div className="strength-icon">🌟</div>
                <div className="strength-name">{strength.subject}</div>
                <div className="strength-rate">{strength.successRate}%</div>
                <div className="strength-label">הצלחה</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* תוכנית פעולה */}
      {actionPlan && actionPlan.length > 0 && (
        <div className="section action-plan-section">
          <h2>📋 תוכנית פעולה מומלצת</h2>
          <div className="plan-steps">
            {actionPlan.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-priority">
                  שלב {step.priority}
                </div>
                <div className="step-content">
                  <h3>{step.action}</h3>
                  <div className="step-meta">
                    <span className="step-duration">⏱️ {step.duration}</span>
                    <span className="step-goal">🎯 {step.goal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* המלצות AI */}
      {aiRecommendations && (
        <div className="section ai-recommendations-section">
          <h2>🤖 המלצות AI אישיות</h2>
          <div className="ai-badge">
            <span className="ai-icon">✨</span>
            <span>נוצר באמצעות GPT-4</span>
          </div>
          <div className="recommendations-content">
            {aiRecommendations.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* גורמי סיכון */}
      {insights.riskFactors && insights.riskFactors.length > 0 && (
        <div className="section risk-factors-section">
          <h2>⚠️ גורמי סיכון</h2>
          <div className="risk-factors-list">
            {insights.riskFactors.map((risk, index) => (
              <div key={index} className={`risk-card level-${risk.level}`}>
                <div className="risk-header">
                  <span className="risk-level-badge">{risk.level}</span>
                  <span className="risk-factor">{risk.factor}</span>
                </div>
                <div className="risk-action">
                  <strong>פעולה:</strong> {risk.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* כפתור רענון */}
      <div className="dashboard-footer">
        <button onClick={refresh} className="refresh-button" disabled={loading}>
          {loading ? '🔄 מנתח...' : '🔄 רענן ניתוח'}
        </button>
      </div>
    </div>
  );
};

export default ErrorPatternDashboard;

