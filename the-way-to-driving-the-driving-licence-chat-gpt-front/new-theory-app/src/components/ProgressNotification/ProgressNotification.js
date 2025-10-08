import React from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import './ProgressNotification.css';

const ProgressNotification = () => {
  const { recentUpdates } = useProgress();

  if (!recentUpdates || recentUpdates.length === 0) {
    return null;
  }

  return (
    <div className="progress-notifications">
      {recentUpdates.map((update) => (
        <div 
          key={update.id} 
          className={`progress-notification ${update.isCorrect ? 'success' : 'error'}`}
        >
          <div className="notification-icon">
            {update.isCorrect ? '✅' : '❌'}
          </div>
          <div className="notification-content">
            <div className="notification-title">
              {update.isCorrect ? 'תשובה נכונה!' : 'תשובה שגויה'}
            </div>
            <div className="notification-category">
              {update.category}
            </div>
          </div>
          <div className="notification-progress">
            +1
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressNotification;
