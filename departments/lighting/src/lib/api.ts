import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Визначаємо департамент з URL
const getDeptId = () => {
  const path = window.location.pathname;
  if (path.includes('roads')) return 'lighting';
  if (path.includes('lighting')) return 'lighting';
  if (path.includes('waste')) return 'waste';
  if (path.includes('parks')) return 'parks';
  if (path.includes('water')) return 'water';
  if (path.includes('transport')) return 'transport';
  if (path.includes('ecology')) return 'ecology';
  if (path.includes('vandalism')) return 'vandalism';
  return 'lighting'; // default
};

// API methods для ДЕПАРТАМЕНТІВ
export const reportsAPI = {
  // Отримати звіти ТОЛЬКИ цього департаменту
  getDepartmentReports: (status?: string) => {
    const deptId = getDeptId();
    const url = status 
      ? `/reports/department/${deptId}?status=${status}`
      : `/reports/department/${deptId}`;
    return api.get(url);
  },
  
  // Отримати статистику департаменту
  getDepartmentStats: () => {
    const deptId = getDeptId();
    return api.get(`/reports/department/${deptId}/stats`);
  },
  
  // Старі методи (для сумісності)
  getAll: () => api.get('/reports'),
  getById: (id: string) => api.get(`/reports/${id}`),
  approve: (id: string) => api.post(`/reports/${id}/approve`),
  reject: (id: string, reason: string) => api.post(`/reports/${id}/reject`, { reason }),
  forward: (id: string, to: string) => api.post(`/reports/${id}/forward`, { to }),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  approve: (id: string) => api.post(`/users/${id}/approve`),
  reject: (id: string) => api.post(`/users/${id}/reject`),
};

export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getReports: (period: string) => api.get(`/stats/reports?period=${period}`),
};
