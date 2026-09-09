import axios from 'axios';

// Public API Base URL when deployed separately (e.g. Vercel -> Termux tunnel)
// Defaults to empty string for same-origin local development
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

// Ensure axios sends cookies across domains with all requests
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

/**
 * Returns a full URL for direct browser navigations (OAuth login, logout, etc.)
 * @param {string} path 
 * @returns {string}
 */
export function getApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

export default axios;
