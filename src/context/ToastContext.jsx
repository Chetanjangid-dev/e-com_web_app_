import { createContext, useState, useCallback, useRef } from 'react';
import styles from './ToastContext.module.css';

export const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  }, []);

  /**
   * showToast(message, type, duration)
   * type: 'success' | 'error' | 'info'
   */
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={styles.toastContainer} aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]} ${toast.exiting ? styles.exiting : ''}`}
            role="status"
          >
            <span className={styles.toastIcon}>
              {toast.type === 'success' && '✓'}
              {toast.type === 'error'   && '✕'}
              {toast.type === 'info'    && 'ℹ'}
            </span>
            <span className={styles.toastMessage}>{toast.message}</span>
            <button
              className={styles.toastClose}
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
