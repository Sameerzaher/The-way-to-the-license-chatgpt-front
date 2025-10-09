import { useState, useEffect, useCallback } from 'react';
import errorPatternService from '../services/errorPatternService';

/**
 * Custom Hook לניהול דפוסי טעויות
 */
export const useErrorPatterns = (userId) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // טעינת דו"ח מקיף
  const loadReport = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await errorPatternService.getReport(userId);
      if (data.success) {
        setReport(data.report);
      } else {
        setError(data.error || 'Failed to load report');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ניתוח מחדש
  const refresh = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // ניתוח מחדש
      await errorPatternService.analyzeErrors(userId);
      // טעינת דו"ח מעודכן
      await loadReport();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [userId, loadReport]);

  // טעינה ראשונית
  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return {
    report,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook פשוט יותר - רק תובנות
 */
export const useInsights = (userId) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await errorPatternService.getInsights(userId);
        if (data.success) {
          setInsights(data.insights);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userId]);

  return { insights, loading, error };
};

/**
 * Hook להשוואת התקדמות
 */
export const useProgressComparison = (userId, days = 7) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchComparison = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await errorPatternService.compareProgress(userId, days);
        if (data.success) {
          setComparison(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [userId, days]);

  return { comparison, loading, error };
};

