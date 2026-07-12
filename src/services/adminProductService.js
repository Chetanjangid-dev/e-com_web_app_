/**
 * adminProductService.js — Admin-only Product CRUD API layer
 */

import api from './api';

export const createProduct = (data) => api.post('/products', data);

export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const bulkDeleteProducts = (ids) =>
  api.delete('/products/bulk', ids); // we need to pass body for delete

// Override: DELETE with body
export const bulkDelete = async (ids) => {
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/products/bulk`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'An error occurred.' }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
};
