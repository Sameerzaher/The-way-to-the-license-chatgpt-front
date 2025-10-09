import React, { useState, useEffect } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { useErrorPatterns } from '../../hooks/useErrorPatterns';
import './AdvancedChartsDashboard.css';

const AdvancedChartsDashboard = ({ userId }) => {
  const { theoryProgress, theorySubProgress } = useProgress();
  const { report } = useErrorPatterns(userId || 'demo_user_test_123');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [chartType, setChartType] = useState('progress');

  // נתוני דמו לגרפים
  const [chartData, setChartData] = useState({
    progress: {
      categories: ['חוקי התנועה', 'תמרורים', 'בטיחות', 'הכרת הרכב'],
      completed: [45, 28, 12, 16],
      total: [950, 382, 370, 100],
      colors: ['#3498db', '#e74c3c', '#f39c12', '#2ecc71']
    },
    timeline: {
      labels: ['שבוע 1', 'שבוע 2', 'שבוע 3', 'שבוע 4'],
      progress: [15, 28, 35, 42],
      errors: [12, 8, 6, 4],
      timeSpent: [120, 180, 220, 280]
    },
    patterns: {
      byTime: {
        morning: 25,
        afternoon: 45,
        evening: 30
      },
      byDay: {
        'יום א': 20,
        'יום ב': 35,
        'יום ג': 40,
        'יום ד': 30,
        'יום ה': 45,
        'יום ו': 15,
        'שבת': 10
      }
    }
  });

  // פונקציות עזר לגרפים
  const getProgressPercentage = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getCategoryStats = () => {
    return chartData.progress.categories.map((category, index) => ({
      name: category,
      completed: chartData.progress.completed[index],
      total: chartData.progress.total[index],
      percentage: getProgressPercentage(chartData.progress.completed[index], chartData.progress.total[index]),
      color: chartData.progress.colors[index]
    }));
  };

  // קומפוננטת גרף התקדמות
  const ProgressChart = () => {
    const stats = getCategoryStats();
    
    return (
      <div className="chart-container">
        <h3>📊 התקדמות לפי נושאים</h3>
        <div className="progress-chart">
          {stats.map((stat, index) => (
            <div key={index} className="progress-item">
              <div className="progress-header">
                <span className="category-name">{stat.name}</span>
                <span className="progress-percentage">{stat.percentage}%</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ 
                    width: `${stat.percentage}%`,
                    backgroundColor: stat.color
                  }}
                />
              </div>
              <div className="progress-details">
                <span>{stat.completed} מתוך {stat.total} שאלות</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // קומפוננטת גרף טיימליין
  const TimelineChart = () => {
    const { labels, progress, errors, timeSpent } = chartData.timeline;
    const maxProgress = Math.max(...progress);
    
    return (
      <div className="chart-container">
        <h3>📈 התקדמות לאורך זמן</h3>
        <div className="timeline-chart">
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color progress"></span>
              <span>התקדמות %</span>
            </div>
            <div className="legend-item">
              <span className="legend-color errors"></span>
              <span>טעויות</span>
            </div>
          </div>
          
          <div className="timeline-bars">
            {labels.map((label, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-label">{label}</div>
                <div className="timeline-bar-container">
                  <div 
                    className="timeline-bar progress"
                    style={{ height: `${(progress[index] / maxProgress) * 100}%` }}
                  />
                  <div 
                    className="timeline-bar errors"
                    style={{ height: `${(errors[index] / 15) * 100}%` }}
                  />
                </div>
                <div className="timeline-values">
                  <span>{progress[index]}%</span>
                  <span>{errors[index]} טעויות</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // קומפוננטת גרף דפוסי זמן
  const TimePatternsChart = () => {
    const { byTime, byDay } = chartData.patterns;
    
    return (
      <div className="chart-container">
        <h3>🕐 דפוסי למידה לפי זמן</h3>
        <div className="patterns-grid">
          <div className="pattern-chart">
            <h4>שעות היום</h4>
            <div className="pie-chart">
              <div className="pie-segment morning" style={{ 
                background: `conic-gradient(#3498db 0deg ${byTime.morning * 3.6}deg, transparent ${byTime.morning * 3.6}deg)` 
              }}>
                <div className="pie-center">
                  <span>{byTime.morning}%</span>
                  <small>בוקר</small>
                </div>
              </div>
            </div>
            <div className="pattern-labels">
              <div className="pattern-label">
                <span className="color-dot morning"></span>
                <span>בוקר: {byTime.morning}%</span>
              </div>
              <div className="pattern-label">
                <span className="color-dot afternoon"></span>
                <span>צהריים: {byTime.afternoon}%</span>
              </div>
              <div className="pattern-label">
                <span className="color-dot evening"></span>
                <span>ערב: {byTime.evening}%</span>
              </div>
            </div>
          </div>
          
          <div className="pattern-chart">
            <h4>ימי השבוע</h4>
            <div className="bar-chart">
              {Object.entries(byDay).map(([day, value]) => (
                <div key={day} className="bar-item">
                  <div className="bar-label">{day}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{ height: `${value}%` }}
                    />
                  </div>
                  <div className="bar-value">{value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // קומפוננטת סטטיסטיקות מהירות
  const QuickStats = () => {
    const totalQuestions = chartData.progress.total.reduce((sum, val) => sum + val, 0);
    const totalCompleted = chartData.progress.completed.reduce((sum, val) => sum + val, 0);
    const averageProgress = Math.round((totalCompleted / totalQuestions) * 100);
    const errorRate = report?.summary?.errorRate || '25';
    const readinessScore = report?.summary?.readinessScore || 65;

    return (
      <div className="quick-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{averageProgress}%</div>
            <div className="stat-label">התקדמות ממוצעת</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{totalCompleted}</div>
            <div className="stat-label">שאלות נענו</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{readinessScore}/100</div>
            <div className="stat-label">ציון מוכנות</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{errorRate}%</div>
            <div className="stat-label">אחוז טעויות</div>
          </div>
        </div>
      </div>
    );
  };

  // קומפוננטת בחירת סוג גרף
  const ChartControls = () => {
    return (
      <div className="chart-controls">
        <div className="control-group">
          <label>סוג גרף:</label>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
            className="chart-select"
          >
            <option value="progress">התקדמות לפי נושאים</option>
            <option value="timeline">התקדמות לאורך זמן</option>
            <option value="patterns">דפוסי למידה</option>
            <option value="all">הכל ביחד</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>תקופת זמן:</label>
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="week">שבוע אחרון</option>
            <option value="month">חודש אחרון</option>
            <option value="quarter">רבעון</option>
            <option value="all">כל הזמנים</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="advanced-charts-dashboard">
      <div className="dashboard-header">
        <h1>📊 דשבורד גרפים מתקדם</h1>
        <p>ניתוח ויזואלי מפורט של ההתקדמות והביצועים</p>
      </div>

      <ChartControls />
      
      <QuickStats />

      <div className="charts-grid">
        {chartType === 'progress' && <ProgressChart />}
        {chartType === 'timeline' && <TimelineChart />}
        {chartType === 'patterns' && <TimePatternsChart />}
        
        {chartType === 'all' && (
          <>
            <ProgressChart />
            <TimelineChart />
            <TimePatternsChart />
          </>
        )}
      </div>

      {/* מידע נוסף אם יש דו"ח ניתוח דפוסים */}
      {report && (
        <div className="analysis-insights">
          <h3>🔍 תובנות מניתוח דפוסי טעויות</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>🎓 סגנון למידה</h4>
              <p>{report.insights?.learningStyle?.type || 'מאוזן'}</p>
              <small>{report.insights?.learningStyle?.description || 'סגנון למידה יציב'}</small>
            </div>
            
            <div className="insight-card">
              <h4>💪 תחום חזק</h4>
              <p>{report.patterns?.strengths?.[0]?.subject || 'חניה ועצירה'}</p>
              <small>{report.patterns?.strengths?.[0]?.successRate || '90'}% הצלחה</small>
            </div>
            
            <div className="insight-card">
              <h4>⚠️ לשיפור</h4>
              <p>{report.patterns?.improvementAreas?.[0]?.subject || 'תמרורי אזהרה'}</p>
              <small>{report.patterns?.improvementAreas?.[0]?.errorRate || '25'}% טעויות</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedChartsDashboard;
