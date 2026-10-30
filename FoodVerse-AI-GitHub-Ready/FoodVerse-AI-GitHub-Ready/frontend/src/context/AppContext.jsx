import React, { createContext, useContext, useState, useEffect } from 'react';
import { foodApi } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [userProfile, setUserProfile] = useState({
    username: 'Culinary Explorer',
    age: 26,
    daily_calorie_target: 2100,
    dietary_preference: 'vegetarian',
    fitness_goal: 'general_wellness',
    allergies: ['peanuts'],
    meal_budget: 'medium',
    gemini_key_configured: false,
    usda_key_configured: false,
  });
  
  // Pending food data to inspect in Nutrition Analyzer
  const [pendingFoodToAnalyze, setPendingFoodToAnalyze] = useState(null);

  // Global toast system
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshProfile = async () => {
    try {
      const data = await foodApi.getSettings();
      setUserProfile(data);
    } catch (err) {
      console.warn('Failed to load user settings:', err);
    }
  };

  const checkHealth = async () => {
    try {
      const res = await foodApi.checkHealth();
      if (res.status === 'online') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (err) {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
    refreshProfile();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        backendStatus,
        checkHealth,
        userProfile,
        setUserProfile,
        refreshProfile,
        pendingFoodToAnalyze,
        setPendingFoodToAnalyze,
        addToast,
        toasts,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
