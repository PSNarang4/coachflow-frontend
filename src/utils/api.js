import axios from 'axios';

// Auto-detects API URL from browser hostname — works for localhost AND network IP
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:5000/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // 60s — photo uploads to Cloudinary can take time
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

    // 401 = token expired/invalid → force logout
    if (status === 401) {
      localStorage.removeItem('cf_token');
      localStorage.removeItem('cf_user');
      localStorage.removeItem('fitlead_token');
      localStorage.removeItem('fitlead_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 402 = subscription required
    // The SubscriptionGate component handles this visually.
    // We just let the error propagate — callers can handle if needed.
    if (status === 402) {
      console.warn(`[CoachFlow] Subscription required (${code})`);
    }

    return Promise.reject(error);
  }
);

export default API;