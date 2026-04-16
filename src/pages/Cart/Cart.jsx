import { useState } from 'react';
import { Link } from 'react-router-dom';
import CartItem from '@/components/CartItem/CartItem';
import useCart from '@/hooks/useCart';
import useToast from '@/hooks/useToast';
import { formatCurrency } from '@/utils/format';
import useAuth from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import styles from './Cart.module.css';

const SHIPPING_THRESHOLD = 150;
const SHIPPING_COST      = 12.99;
const TAX_RATE           = 0.08;
const VALID_COUPONS      = { SAVE20: 0.20, LUXE10: 0.10 };

export default function Cart() {
  const { items, cartTotal, clearCart } = useCart();
  const showToast = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [discount,    setDiscount]    = useState(0);
  const [couponMsg,   setCouponMsg]   = useState(null);

  const shipping   = cartTotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax        = cartTotal * TAX_RATE;
  const grandTotal = cartTotal + shipping + tax - discount;

  const applyCode = () => {
    const code = couponInput.trim().toUpperCase();
    const pct  = VALID_COUPONS[code];
    if (pct) {
      const saving = cartTotal * pct;
      setDiscount(saving);
      setCouponMsg({ ok: true, text: `${pct * 100}% discount applied!` });
      showToast(`Coupon applied — ${formatCurrency(saving)} off ✓`);
    } else {
      setCouponMsg({ ok: false, text: 'Invalid code. Try SAVE20 or LUXE10.' });
    }
  };

  /* ── Empty cart ─────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <div className={styles.emptyIcon} aria-hidden="true">🛍️</div>
        <h2 className={styles.emptyTitle}>Your bag is empty</h2>
        <p className={styles.emptySub}>
          Discover our collection and find something you love.
        </p>
        <Link to="/" className={styles.btnGold}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Your Bag</h1>
      <p className={styles.sub}>
        {items.length} item{items.length !== 1 ? 's' : ''} ·{' '}
        {cartTotal >= SHIPPING_THRESHOLD
          ? 'Free shipping included'
          : `Add ${formatCurrency(SHIPPING_THRESHOLD - cartTotal)} more for free shipping`}
      </p>

      <div className={styles.layout}>
        {/* ── Line items ──────────────────────────────────── */}
        <div className={styles.itemsList}>
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}

          <div className={styles.listActions}>
            <Link to="/" className={styles.btnOutline}>← Continue Shopping</Link>
            <button
              className={`${styles.btnOutline} ${styles.clearBtn}`}
              onClick={() => { clearCart(); showToast('Cart cleared.'); }}
            >
              Clear Bag
            </button>
          </div>
        </div>

        {/* ── Order summary ────────────────────────────────── */}
        <aside className={styles.summary} aria-label="Order summary">
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Tax (8%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          {discount > 0 && (
            <div className={`${styles.summaryRow} ${styles.discountRow}`}>
              <span>Discount</span>
              <span>− {formatCurrency(discount)}</span>
            </div>
          )}

          {/* Coupon */}
          <div className={styles.couponRow}>
            <input
              type="text"
              className={styles.couponInput}
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => { setCouponInput(e.target.value); setCouponMsg(null); }}
              onKeyDown={(e) => e.key === 'Enter' && applyCode()}
              aria-label="Coupon code"
            />
            <button className={styles.couponApply} onClick={applyCode}>
              Apply
            </button>
          </div>
          {couponMsg && (
            <p
              className={couponMsg.ok ? styles.couponOk : styles.couponErr}
              role="alert"
            >
              {couponMsg.text}
            </p>
          )}

          <div className={styles.totalRow}>
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>

          <button
            className={styles.checkoutBtn}
            disabled={checkingOut}
            onClick={async () => {
            if (!isAuthenticated) {
              showToast('Please sign in to place an order.');
              navigate('/auth');
              return;
            }
            setCheckingOut(true);
            try {
              await api.post('/orders', {
                items: items.map(({ id, qty, price }) => ({ id, qty, price })),
                shipping,
                tax,
                discount,
              });
              clearCart();
              showToast('Order placed! Thank you for shopping with us ✓');
              navigate('/');
            } catch (err) {
              showToast(err.message || 'Order failed. Please try again.');
            } finally {
              setCheckingOut(false);
            }
          }}
          >
            Proceed to Checkout →
          </button>

          <p className={styles.secure}>🔒 Secure · SSL encrypted checkout</p>
        </aside>
      </div>
    </div>
  );
}
