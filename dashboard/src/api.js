import axios from 'axios';

// Public API Base URL when deployed separately (e.g. Vercel -> Render backend)
// Defaults to Render backend for production Vercel frontend
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://syncink-ticket.onrender.com').replace(/\/+$/, '');

// Ensure axios sends cookies across domains with all requests
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

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
    const redirectTarget = returnPath || window.location.href;
    return `${base}${separator}redirect=${encodeURIComponent(redirectTarget)}`;
  }
  return base;
}

export default axios;
