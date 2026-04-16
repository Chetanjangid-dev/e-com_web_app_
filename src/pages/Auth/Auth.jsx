import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import styles from './Auth.module.css';

const TABS = /** @type {const} */ (['login', 'register']);

export default function Auth() {
  const { login, register, loading, isAuthenticated } = useAuth();
  const showToast  = useToast();
  const navigate   = useNavigate();

  const [tab,   setTab]   = useState('login');
  const [alert, setAlert] = useState(null);
  const [form,  setForm]  = useState({ name: '', email: '', password: '', confirm: '' });

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setAlert(null);
  };

  const validate = () => {
    if (tab === 'register' && !form.name.trim()) {
      return 'Please enter your name.';
    }
    if (!form.email.includes('@')) {
      return 'Please enter a valid email address.';
    }
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (tab === 'register' && form.password !== form.confirm) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setAlert(err);

    const result =
      tab === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register({ name: form.name, email: form.email, password: form.password });

    if (result.ok) {
      showToast(tab === 'login' ? 'Welcome back! ✓' : 'Account created! Welcome ✓');
      navigate('/');
    } else {
      setAlert(result.error || 'Something went wrong. Please try again.');
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setAlert(null);
    setForm({ name: '', email: '', password: '', confirm: '' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand} aria-label="Maison Luxe">
          Maison<span className={styles.brandAccent}> · </span>Luxe
        </div>
        <p className={styles.tagline}>Your curated shopping experience</p>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => switchTab(t)}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Alert */}
        {alert && (
          <p className={styles.alert} role="alert">
            {alert}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {tab === 'register' && (
            <Field label="Full Name" htmlFor="name">
              <input
                id="name"
                type="text"
                className={styles.input}
                placeholder="Alexandra Chen"
                value={form.name}
                onChange={update('name')}
                autoComplete="name"
                required
              />
            </Field>
          )}

          <Field label="Email Address" htmlFor="email">
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="hello@example.com"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
              required
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </Field>

          {tab === 'register' && (
            <Field label="Confirm Password" htmlFor="confirm">
              <input
                id="confirm"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={form.confirm}
                onChange={update('confirm')}
                autoComplete="new-password"
                required
              />
            </Field>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle */}
        <p className={styles.toggleText}>
          {tab === 'login' ? 'New here? ' : 'Already have an account? '}
          <button
            type="button"
            className={styles.toggleLink}
            onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
          >
            {tab === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>

        <p className={styles.backLink}>
          <Link to="/">← Back to shop</Link>
        </p>
      </div>
    </div>
  );
}

/** Reusable field wrapper to keep form DRY */
function Field({ label, htmlFor, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'block',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
