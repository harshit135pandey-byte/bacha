import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://bacha-1-padn.onrender.com/api/v1' : '/api/v1');

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch {
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
