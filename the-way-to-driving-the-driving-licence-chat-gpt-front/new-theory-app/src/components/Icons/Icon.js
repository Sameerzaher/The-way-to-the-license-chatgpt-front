import React from 'react';
import './Icons.css';

const Icon = ({ name, size = 'normal', className = '', ...props }) => {
  const sizeClass = size !== 'normal' ? `icon-${size}` : '';
  const iconClass = `icon icon-${name} ${sizeClass} ${className}`.trim();
  
  return (
    <span 
      className={iconClass}
      role="img"
      aria-label={getIconLabel(name)}
      {...props}
    />
  );
};

// Get accessibility label for icon
const getIconLabel = (name) => {
  const labels = {
    dashboard: 'דשבורד',
    achievements: 'הישגים',
    exam: 'בחינה',
    theory: 'תיאוריה',
    psychology: 'פסיכולוגיה',
    chat: 'צ\'אט',
    question: 'שאלה',
    menu: 'תפריט',
    analytics: 'ניתוח',
    close: 'סגור',
    check: 'סימון',
    star: 'כוכב',
    fire: 'אש',
    target: 'מטרה',
    trophy: 'גביע',
    crown: 'כתר',
    lock: 'נעול',
    unlock: 'פתוח',
    time: 'זמן',
    speed: 'מהירות',
    accuracy: 'דיוק',
    improvement: 'שיפור',
    traffic: 'תנועה',
    sign: 'תמרור',
    safety: 'בטיחות',
    weekend: 'סוף שבוע',
    night: 'לילה',
    morning: 'בוקר',
    perfect: 'מושלם',
    'high-score': 'ציון גבוה',
    consistent: 'עקבי',
    master: 'מומחה',
    veteran: 'מנוסה',
    first: 'ראשון',
    celebration: 'חגיגה',
    sad: 'עצוב',
    lightbulb: 'רעיון',
    party: 'מסיבה',
    sparkles: 'נצנוצים',
    waiting: 'ממתין',
    previous: 'הקודם',
    next: 'הבא',
    save: 'שמור',
    finish: 'סיים',
    loading: 'טוען',
    update: 'עדכן',
    passed: 'עבר',
    failed: 'נכשל',
    correct: 'נכון',
    incorrect: 'לא נכון',
    unanswered: 'לא נענה',
    'grade-a': 'ציון מעולה',
    'grade-b': 'ציון טוב',
    'grade-c': 'ציון בינוני',
    'grade-f': 'ציון נכשל'
  };
  
  return labels[name] || name;
};

export default Icon;
