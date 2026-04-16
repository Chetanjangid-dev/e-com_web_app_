/**
 * productService.js — Product API layer
 *
 * Talks to the Node.js backend via the shared api client.
 * Filtering (category / search) is handled server-side.
 */

import api from './api';

/**
 * Fetch all products, with optional server-side filtering.
 * @param {{ category?: string, search?: string }} filters
 */
export const getAllProducts = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.category && filters.category !== 'All') {
    params.set('category', filters.category);
  }
  if (filters.search && filters.search.trim()) {
    params.set('search', filters.search.trim());
  }

  const qs = params.toString();
  return api.get(`/products${qs ? `?${qs}` : ''}`);
};

/**
 * Fetch a single product by ID.
 * @param {number|string} id
 */
export const getProductById = async (id) => {
  return api.get(`/products/${id}`);
};

/**
 * Fetch available product categories (includes "All" as first entry).
 */
export const getCategories = async () => {
  return api.get('/products/categories');
};
