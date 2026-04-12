import axios from 'axios';

// ── Axios instance ──────────────────────────────────────────────────────────
// baseURL mirrors backend/server.js: app.use('/api', ...)
// JWT is automatically injected from localStorage for protected routes
const API = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002'}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach JWT if present ─────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ─────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rq_token');
    }
    return Promise.reject(error);
  }
);

export default API;
