/**
 * utils/format.js — Pure helper functions used across the app.
 */

/**
 * Format a number as USD currency.
 * @param {number} amount
 * @returns {string}  e.g. "$289.00"
 */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

/**
 * Clamp a number between min and max.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Truncate a string to maxLength with ellipsis.
 */
export const truncate = (str, maxLength = 80) =>
  str.length > maxLength ? `${str.slice(0, maxLength).trimEnd()}…` : str;

/**
 * Generate an array of filled/empty star booleans for a rating.
 * @param {number} rating  e.g. 4.6
 * @param {number} max
 * @returns {Array<{ filled: boolean }>}
 */
export const buildStars = (rating, max = 5) =>
  Array.from({ length: max }, (_, i) => ({ filled: i < Math.round(rating) }));
