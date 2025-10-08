import React from 'react';
import { useLoading } from '../../contexts/LoadingContext';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  show = null, // אם null, יציג לפי LoadingContext
  message = 'טוען...', 
  overlay = true,
  size = 'medium' // small, medium, large
}) => {
  const { isAnyLoading, getLoadingKeys } = useLoading();
  
  // קביעה אם להציג את הספינר
  const shouldShow = show !== null ? show : isAnyLoading();
  
  if (!shouldShow) return null;

  const loadingKeys = getLoadingKeys();
  const displayMessage = loadingKeys.length > 0 
    ? `טוען ${loadingKeys.join(', ')}...` 
    : message;

  return (
    <div className={`loading-spinner-container ${overlay ? 'overlay' : ''}`}>
      <div className="loading-spinner-content">
        <div className={`loading-spinner ${size}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-message">{displayMessage}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
