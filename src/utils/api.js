import axios from 'axios';

const PROD_API_URL = 'https://coachflow-backend.onrender.com/api';

const normalizeBaseURL = (url) => {
  if (!url) return '';
  const clean = String(url).trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

// Auto-detects API URL from browser hostname and falls back to Render in production.
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) return normalizeBaseURL(process.env.REACT_APP_API_URL);
  const { protocol, hostname } = window.location;
  if (hostname.endsWith('.vercel.app') || hostname.includes('coachflow-frontend')) {
    return PROD_API_URL;
  }
  return `${protocol}//${hostname}:5000/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cf_token') || localStorage.getItem('fitlead_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response handling
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const code   = error.response?.data?.code;
    const data   = error.response?.data;

    if (data && !data.message && data.error) {
      data.message = data.error;
    }

    // 401 from protected routes = token expired/invalid. Login failures stay on the form.
    const requestUrl = error.config?.url || '';
    const isLoginAttempt = requestUrl.includes('/auth/login');
    if (status === 401 && !isLoginAttempt) {
      localStorage.removeItem('cf_token');
      localStorage.removeItem('cf_user');
      localStorage.removeItem('fitlead_token');
      localStorage.removeItem('fitlead_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 402 = subscription required. The SubscriptionGate component handles this visually.
    if (status === 402) {
      console.warn(`[CoachFlow] Subscription required (${code})`);
    }

    return Promise.reject(error);
  }
);

export default API;
