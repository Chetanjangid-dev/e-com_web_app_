import { memo } from 'react';
import { Link } from 'react-router-dom';
import useCart from '@/hooks/useCart';
import { formatCurrency } from '@/utils/format';
import styles from './CartItem.module.css';

/**
 * CartItem — A single row in the cart page.
 *
 * Props:
 *   item  { id, name, category, price, qty, image }
 */
function CartItem({ item }) {
  const { removeFromCart, updateQty } = useCart();

  const lineTotal = item.price * item.qty;

  return (
    <div className={styles.item}>
      {/* Thumbnail */}
      <Link to={`/product/${item.id}`} className={styles.imageLink} tabIndex={-1}>
        <img src={item.image} alt={item.name} className={styles.image} loading="lazy" />
      </Link>

      {/* Details */}
      <div className={styles.details}>
        <span className={styles.category}>{item.category}</span>
        <Link to={`/product/${item.id}`} className={styles.name}>
          {item.name}
        </Link>
        <span className={styles.unitPrice}>{formatCurrency(item.price)} each</span>

        {/* Qty control */}
        <div className={styles.qtyControl} role="group" aria-label="Quantity">
          <button
            className={styles.qtyBtn}
            onClick={() => updateQty(item.id, item.qty - 1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className={styles.qtyValue} aria-live="polite">
            {item.qty}
          </span>
          <button
            className={styles.qtyBtn}
            onClick={() => updateQty(item.id, item.qty + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Right column */}
      <div className={styles.right}>
        <span className={styles.lineTotal}>{formatCurrency(lineTotal)}</span>
        <button
          className={styles.removeBtn}
          onClick={() => removeFromCart(item.id)}
          aria-label={`Remove ${item.name} from cart`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default memo(CartItem);
