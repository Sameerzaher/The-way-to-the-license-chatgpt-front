import React, { createContext, useContext, useState } from 'react';

// יצירת Context
const LoadingContext = createContext();

// Hook לשימוש ב-Context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Provider Component
export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  // הפעלת loading למפתח ספציפי
  const setLoading = (key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  // בדיקה אם מפתח ספציפי בטעינה
  const isLoading = (key) => {
    return Boolean(loadingStates[key]);
  };

  // בדיקה אם יש טעינה כלשהי
  const isAnyLoading = () => {
    return Object.values(loadingStates).some(loading => loading);
  };

  // איפוס כל מצבי הטעינה
  const clearAllLoading = () => {
    setLoadingStates({});
  };

  // רשימת כל המפתחות שבטעינה
  const getLoadingKeys = () => {
    return Object.keys(loadingStates).filter(key => loadingStates[key]);
  };

  const value = {
    setLoading,
    isLoading,
    isAnyLoading,
    clearAllLoading,
    getLoadingKeys,
    loadingStates
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
