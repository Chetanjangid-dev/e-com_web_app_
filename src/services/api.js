/**
 * api.js — Base API client
 */

// Agar aap VITE use kar rahe hain, toh ye sabse best tarika hai URL manage karne ka
const BASE_URL = 'https://maison-luxe-api.onrender.com/api';

/** Reads the JWT from localStorage */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Core fetch wrapper */
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

  // Yahan hum upar wale BASE_URL ka use kar rahe hain
  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred.' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
};

const api = {
  get:    (endpoint)         => request('GET',    endpoint),
  post:   (endpoint, body)   => request('POST',   endpoint, body),
  put:    (endpoint, body)   => request('PUT',    endpoint, body),
  patch:  (endpoint, body)   => request('PATCH',  endpoint, body),
  delete: (endpoint)         => request('DELETE', endpoint),
};

export default api;
