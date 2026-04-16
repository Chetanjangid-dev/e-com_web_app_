/**
 * authService.js — Authentication API layer
 *
 * Talks to the Node.js + JWT backend via the shared api client.
 */

import api from './api';

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} credentials
 * @returns {{ user: object, token: string }}
 */
export const login = async ({ email, password }) => {
  const data = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  return data;
};

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {{ user: object, token: string }}
 */
export const register = async ({ name, email, password }) => {
  const data = await api.post('/auth/register', { name, email, password });
  localStorage.setItem('token', data.token);
  return data;
};

/**
 * Log out the current user — removes the stored token.
 */
export const logout = () => {
  localStorage.removeItem('token');
};

/**
 * Validate the stored JWT and return the current user.
 * Called on app boot to restore sessions across page refreshes.
 * Returns null when no token is present so AuthContext stays clean.
 */
export const getMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const data = await api.get('/auth/me');
    return data.user ?? null;
  } catch {
    // Token is expired or invalid — clear it so the user isn't stuck
    localStorage.removeItem('token');
    return null;
  }
};
