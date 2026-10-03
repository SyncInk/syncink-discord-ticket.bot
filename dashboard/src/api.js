import axios from 'axios';

// Public API Base URL when deployed separately (e.g. Vercel -> Render backend)
// Defaults to Render backend for production Vercel frontend
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://syncink-ticket.onrender.com').replace(/\/+$/, '');

// Ensure axios sends cookies across domains with all requests
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Attach Bearer token from localStorage across all cross-domain requests
axios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('syncink_ticket_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-session-id'] = token;
      config.headers['x-token'] = token;
    }
  }
  return config;
});

/**
 * Returns a full URL for direct browser navigations (OAuth login, logout, etc.)
 * @param {string} path 
 * @param {string|null} returnPath
 * @returns {string}
 */
export function getApiUrl(path, returnPath = null) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
  if (typeof window !== 'undefined' && (path.includes('/api/auth/login') || path.includes('/api/auth/logout'))) {
    const separator = base.includes('?') ? '&' : '?';
    const redirectTarget = returnPath || window.location.origin;
    return `${base}${separator}redirect=${encodeURIComponent(redirectTarget)}`;
  }
  return base;
}

export default axios;
