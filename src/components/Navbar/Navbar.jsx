import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import useCart from '@/hooks/useCart';
import useAuth from '@/hooks/useAuth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [prevCount, setPrevCount] = useState(cartCount);
  const [badgeKey, setBadgeKey]   = useState(0);
  const [menuOpen, setMenuOpen]   = useState(false);
  const menuRef = useRef(null);

  // Animate badge on count change
  useEffect(() => {
    if (cartCount !== prevCount) {
      setBadgeKey((k) => k + 1);
      setPrevCount(cartCount);
    }
  }, [cartCount, prevCount]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        {/* Brand */}
        <Link to="/" className={styles.brand} aria-label="Maison Luxe — Home">
          Maison<span className={styles.brandAccent}> · </span>Luxe
        </Link>

        {/* Desktop links */}
        <div className={styles.links}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.linkActive : ''}`
            }
          >
            Shop
          </NavLink>

          {user ? (
            <button className={styles.link} onClick={handleLogout}>
              Hi, {user.name} · Sign out
            </button>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ''}`
              }
            >
              Account
            </NavLink>
          )}

          {/* Cart button */}
          <Link to="/cart" className={styles.cartBtn} aria-label={`Cart — ${cartCount} items`}>
            <span>Bag</span>
            {cartCount > 0 && (
              <span className={styles.badge} key={badgeKey}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.burger}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerOpen : ''}`} />
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerOpen : ''}`} />
          <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerOpen : ''}`} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div ref={menuRef} className={styles.mobileMenu}>
          <Link to="/"     className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/cart" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Bag {cartCount > 0 && `(${cartCount})`}
          </Link>
          {user ? (
            <button className={styles.mobileLink} onClick={handleLogout}>Sign out</button>
          ) : (
            <Link to="/auth" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Account</Link>
          )}
        </div>
      )}
    </header>
  );
}
