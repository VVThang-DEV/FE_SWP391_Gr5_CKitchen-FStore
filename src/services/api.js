/**
 * API Service - Centralized API communication layer
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Generic fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Attach JWT token if available
  const token = localStorage.getItem('ckitchen_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, config);

  // Parse response
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || `HTTP Error ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Auth API
 */
export const authApi = {
  login: (username, password) =>
    request('api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  refreshToken: (refreshToken) =>
    request('api/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

export default { authApi };
