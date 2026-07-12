/**
 * hooks/useToast.js
 * Convenience hook so components never need to import ToastContext directly.
 */

import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};
