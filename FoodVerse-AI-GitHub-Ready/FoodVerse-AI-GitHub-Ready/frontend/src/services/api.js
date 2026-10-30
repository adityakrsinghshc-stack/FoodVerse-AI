import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Centralized response error interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred while communicating with the Food Verse AI backend.';
    return Promise.reject(new Error(message));
  }
);

export const foodApi = {
  checkHealth: () => api.get('/health'),
  
  // Food Recognition
  recognizeFood: (formData) =>
    api.post('/food/recognize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Nutrition
  analyzeNutrition: (payload) => api.post('/nutrition/analyze', payload),

  // Freshness
  analyzeFreshness: (formData) =>
    api.post('/freshness/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Hygiene
  analyzeHygiene: (formData, onUploadProgress) =>
    api.post('/hygiene/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),

  // Cooking Assistant
  chatCooking: (payload) => api.post('/cooking/chat', payload),

  // Meal Planner
  generateMealPlan: (payload) => api.post('/meal-plan/generate', payload),
  saveMealPlan: (payload) => api.post('/meal-plan/save', payload),

  // History
  getHistory: (type = null, limit = 50) =>
    api.get('/history', { params: { analysis_type: type, limit } }),
  getHistoryItem: (id) => api.get(`/history/${id}`),
  deleteHistoryItem: (id) => api.delete(`/history/${id}`),
  clearHistory: () => api.delete('/history'),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (payload) => api.post('/settings', payload),
};

export default api;
