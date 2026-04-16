/**
 * api.js — Base API client
 *
 * Centralises all HTTP config so swapping the base URL or adding
 * auth headers only needs to happen in one place.
 *
 * Usage:
 *   import api from '@/services/api';
 *   const data = await api.get('/products');
 *   const result = await api.post('/auth/login', { email, password });
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** Reads the JWT from localStorage (set by authService after login). */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Core fetch wrapper — throws on non-2xx responses. */
const request = async (method, endpoint, body = null) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred.' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // 204 No Content has no body
  if (response.status === 204) return null;

  return response.json();
};

const api = {
  get:    (endpoint)           => request('GET',    endpoint),
  post:   (endpoint, body)     => request('POST',   endpoint, body),
  put:    (endpoint, body)     => request('PUT',    endpoint, body),
  patch:  (endpoint, body)     => request('PATCH',  endpoint, body),
  delete: (endpoint)           => request('DELETE', endpoint),
};

export default api;
