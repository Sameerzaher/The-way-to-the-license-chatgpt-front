import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { fetchUserProgress } from '../../services/userService';

const Sidebar = ({ user, onLogout, lang }) => {
  const location = useLocation();
  
  // Main section progress
  const [theoryProgress, setTheoryProgress] = useState(0);
  const [psychologyProgress, setPsychologyProgress] = useState(0);

  // Error state for progress fetch
  const [progressError, setProgressError] = useState(null);

  // Theory sub-subjects progress
  const [theorySubProgress, setTheorySubProgress] = useState({
    trafficSigns: { percent: 0, completed: 0, total: 0 },
    roadRules: { percent: 0, completed: 0, total: 0 },
    vehicleKnowledge: { percent: 0, completed: 0, total: 0 },
    safetyMeasures: { percent: 0, completed: 0, total: 0 }
  });

  // Psychology sub-subjects progress
  const [psychologySubProgress, setPsychologySubProgress] = useState({
    stressManagement: { percent: 0, completed: 0, total: 0 },
    decisionMaking: { percent: 0, completed: 0, total: 0 },
    riskAssessment: { percent: 0, completed: 0, total: 0 },
    emotionalControl: { percent: 0, completed: 0, total: 0 }
  });

  // Section titles and menu labels
  const labels = {
    menu: lang === 'ar' ? 'القائمة' : 'תפריט',
    theory: lang === 'ar' ? 'نظرية' : 'תיאוריה',
    psychology: lang === 'ar' ? 'علم النفس' : 'פסיכולוגיה',
    selectQuestion: lang === 'ar' ? 'اختيار سؤال' : 'בחירת שאלה',
    chatWithGpt: lang === 'ar' ? 'دردشة مع GPT' : "צ'אט עם GPT",
    trafficSigns: lang === 'ar' ? 'إشارات المرور' : 'תמרורים',
    roadRules: lang === 'ar' ? 'قوانين الطريق' : 'חוקי דרך',
    vehicleKnowledge: lang === 'ar' ? 'معرفة المركبة' : 'ידע רכב',
    safetyMeasures: lang === 'ar' ? 'إجراءات السلامة' : 'אמצעי בטיחות',
    stressManagement: lang === 'ar' ? 'إدارة الضغط' : 'ניהול לחץ',
    decisionMaking: lang === 'ar' ? 'اتخاذ القرار' : 'קבלת החלטות',
    riskAssessment: lang === 'ar' ? 'تقييم المخاطر' : 'הערכת סיכונים',
    emotionalControl: lang === 'ar' ? 'التحكم العاطفي' : 'שליטה רגשית',
  };

  // --- Progress fetch logic extracted for reuse ---
  const updateProgressState = (data) => {
    if (!data) return;
    // Theory sub-subjects
    setTheorySubProgress({
      trafficSigns: data["תמרורים"] ? {
        percent: Math.round((data["תמרורים"].completed / data["תמרורים"].total) * 100),
        completed: data["תמרורים"].completed,
        total: data["תמרורים"].total
      } : { percent: 0, completed: 0, total: 0 },
      roadRules: data["חוקי דרך"] ? {
        percent: Math.round((data["חוקי דרך"].completed / data["חוקי דרך"].total) * 100),
        completed: data["חוקי דרך"].completed,
        total: data["חוקי דרך"].total
      } : { percent: 0, completed: 0, total: 0 },
      vehicleKnowledge: data["ידע רכב"] ? {
        percent: Math.round((data["ידע רכב"].completed / data["ידע רכב"].total) * 100),
        completed: data["ידע רכב"].completed,
        total: data["ידע רכב"].total
      } : { percent: 0, completed: 0, total: 0 },
      safetyMeasures: data["אמצעי בטיחות"] ? {
        percent: Math.round((data["אמצעי בטיחות"].completed / data["אמצעי בטיחות"].total) * 100),
        completed: data["אמצעי בטיחות"].completed,
        total: data["אמצעי בטיחות"].total
      } : { percent: 0, completed: 0, total: 0 }
    });

    // Psychology sub-subjects
    setPsychologySubProgress({
      stressManagement: data["ניהול לחץ"] ? {
        percent: Math.round((data["ניהול לחץ"].completed / data["ניהול לחץ"].total) * 100),
        completed: data["ניהול לחץ"].completed,
        total: data["ניהול לחץ"].total
      } : { percent: 0, completed: 0, total: 0 },
      decisionMaking: data["קבלת החלטות"] ? {
        percent: Math.round((data["קבלת החלטות"].completed / data["קבלת החלטות"].total) * 100),
        completed: data["קבלת החלטות"].completed,
        total: data["קבלת החלטות"].total
      } : { percent: 0, completed: 0, total: 0 },
      riskAssessment: data["הערכת סיכונים"] ? {
        percent: Math.round((data["הערכת סיכונים"].completed / data["הערכת סיכונים"].total) * 100),
        completed: data["הערכת סיכונים"].completed,
        total: data["הערכת סיכונים"].total
      } : { percent: 0, completed: 0, total: 0 },
      emotionalControl: data["שליטה רגשית"] ? {
        percent: Math.round((data["שליטה רגשית"].completed / data["שליטה רגשית"].total) * 100),
        completed: data["שליטה רגשית"].completed,
        total: data["שליטה רגשית"].total
      } : { percent: 0, completed: 0, total: 0 }
    });

    // Calculate average for main progress bars
    const theoryVals = ["תמרורים", "חוקי דרך", "ידע רכב", "אמצעי בטיחות"].map(
      k => data[k] ? (data[k].completed / data[k].total) : 0
    );
    setTheoryProgress(Math.round((theoryVals.reduce((a, b) => a + b, 0) / theoryVals.length) * 100));

    const psychVals = ["ניהול לחץ", "קבלת החלטות", "הערכת סיכונים", "שליטה רגשית"].map(
      k => data[k] ? (data[k].completed / data[k].total) : 0
    );
    setPsychologyProgress(Math.round((psychVals.reduce((a, b) => a + b, 0) / psychVals.length) * 100));
    console.log('Sidebar progress state:', data);
  };

  const fetchProgress = async (progressDataFromEvent = null) => {
    console.log('Fetching progress...');
    try {
      let data;
      if (progressDataFromEvent) {
        data = progressDataFromEvent;
      } else {
        data = await fetchUserProgress();
      }
      if (data.message) {
        setProgressError(data.message);
        return;
      }
      setProgressError(null);
      updateProgressState(data);
    } catch (err) {
      setProgressError('Failed to fetch progress');
      console.error('Failed to fetch progress', err);
    }
  };

  // --- Fetch progress on mount and when progress-updated event fires ---
  useEffect(() => {
    fetchProgress();
    const handler = (e) => {
      console.log('progress-updated event received!');
      if (e && e.detail) {
        fetchProgress(e.detail);
      } else {
        fetchProgress();
      }
    };
    window.addEventListener('progress-updated', handler);
    return () => window.removeEventListener('progress-updated', handler);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const ProgressBar = ({ progress, color, label }) => (
    <div className="progress-bar-container">
      <div 
        className="progress-bar" 
        style={{ 
          width: `${progress}%`,
          background: color
        }}
      />
      <span className="progress-text">{progress}% {label && <span style={{fontWeight:400, fontSize:'0.85em'}}>({label})</span>}</span>
    </div>
  );

  const SubSubject = ({ title, progress, label, color }) => (
    <div className="sub-subject">
      <div className="sub-subject-header">
        <span className="sub-subject-title">{title}</span>
        <ProgressBar progress={progress} color={color} label={label} />
      </div>
    </div>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>{labels.menu}</h2>
      </div>
      {progressError && (
        <div style={{ color: 'red', marginBottom: 10, textAlign: 'center', fontWeight: 600 }}>
          {progressError === 'No token, authorization denied'
            ? 'יש להתחבר מחדש כדי לראות התקדמות'
            : progressError}
        </div>
      )}
      <div className="sidebar-content">
        <div className="sidebar-section">
          <h3>{labels.theory}</h3>
          <ProgressBar progress={theoryProgress} color="#3498db" />
          
          <div className="sub-subjects">
            <SubSubject title={labels.trafficSigns} progress={theorySubProgress.trafficSigns.percent} label={`${theorySubProgress.trafficSigns.completed}/${theorySubProgress.trafficSigns.total}`} color="#3498db" />
            <SubSubject title={labels.roadRules} progress={theorySubProgress.roadRules.percent} label={`${theorySubProgress.roadRules.completed}/${theorySubProgress.roadRules.total}`} color="#3498db" />
            <SubSubject title={labels.vehicleKnowledge} progress={theorySubProgress.vehicleKnowledge.percent} label={`${theorySubProgress.vehicleKnowledge.completed}/${theorySubProgress.vehicleKnowledge.total}`} color="#3498db" />
            <SubSubject title={labels.safetyMeasures} progress={theorySubProgress.safetyMeasures.percent} label={`${theorySubProgress.safetyMeasures.completed}/${theorySubProgress.safetyMeasures.total}`} color="#3498db" />
          </div>

          <Link 
            to="/theory/questions" 
            className={`sidebar-link ${isActive('/theory/questions') ? 'active' : ''}`}
          >
            {labels.selectQuestion}
          </Link>
          <Link 
            to="/theory/chat" 
            className={`sidebar-link ${isActive('/theory/chat') ? 'active' : ''}`}
          >
            {labels.chatWithGpt}
          </Link>
        </div>

        <div className="sidebar-section">
          <h3>{labels.psychology}</h3>
          <ProgressBar progress={psychologyProgress} color="#e74c3c" />
          
          <div className="sub-subjects">
            <SubSubject title={labels.stressManagement} progress={psychologySubProgress.stressManagement.percent} label={`${psychologySubProgress.stressManagement.completed}/${psychologySubProgress.stressManagement.total}`} color="#e74c3c" />
            <SubSubject title={labels.decisionMaking} progress={psychologySubProgress.decisionMaking.percent} label={`${psychologySubProgress.decisionMaking.completed}/${psychologySubProgress.decisionMaking.total}`} color="#e74c3c" />
            <SubSubject title={labels.riskAssessment} progress={psychologySubProgress.riskAssessment.percent} label={`${psychologySubProgress.riskAssessment.completed}/${psychologySubProgress.riskAssessment.total}`} color="#e74c3c" />
            <SubSubject title={labels.emotionalControl} progress={psychologySubProgress.emotionalControl.percent} label={`${psychologySubProgress.emotionalControl.completed}/${psychologySubProgress.emotionalControl.total}`} color="#e74c3c" />
          </div>

          <Link 
            to="/psychology/questions" 
            className={`sidebar-link ${isActive('/psychology/questions') ? 'active' : ''}`}
          >
            {labels.selectQuestion}
          </Link>
          <Link 
            to="/psychology/chat" 
            className={`sidebar-link ${isActive('/psychology/chat') ? 'active' : ''}`}
          >
            {labels.chatWithGpt}
          </Link>
        </div>
      </div>

      <div className="sidebar-footer">
        {/* User info and logout button moved to navbar */}
      </div>
    </div>
  );
};

export default Sidebar; 