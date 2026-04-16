/**
 * hooks/useToast.js
 * Convenience hook so components never need to import ToastContext directly.
 */

import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';

export default function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
