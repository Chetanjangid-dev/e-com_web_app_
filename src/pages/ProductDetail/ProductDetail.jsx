import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useCart from '@/hooks/useCart';
import useToast from '@/hooks/useToast';
import { getProductById } from '@/services/productService';
import { formatCurrency, clamp } from '@/utils/format';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { addToCart } = useCart();
  const showToast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [qty,     setQty]     = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setQty(1);

    getProductById(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    showToast(`${qty}× ${product.name} added to bag ✓`);
    setQty(1);
  };

  const adjustQty = (delta) =>
    setQty((q) => clamp(q + delta, 1, product?.stock ?? 99));

  /* ── Loading skeleton ───────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.skeletonGrid}>
          <div className={`${styles.skeleton} ${styles.skeletonImg}`} />
          <div className={styles.skeletonBody}>
            {[80, 55, 100, 30, 70].map((w, i) => (
              <div key={i} className={styles.skeleton} style={{ width: `${w}%`, height: 18, marginBottom: 12 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <div className={styles.errorState}>
          <p className={styles.errorMsg}>{error}</p>
          <button className={styles.btnGold} onClick={() => navigate('/')}>
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/" className={styles.breadLink}>Shop</Link>
        <span aria-hidden="true">›</span>
        <span>{product.category}</span>
        <span aria-hidden="true">›</span>
        <span className={styles.breadCurrent}>{product.name}</span>
      </nav>

      <div className={styles.grid}>
        {/* Image */}
        <div className={styles.imageWrap}>
          <img src={product.image} alt={product.name} className={styles.image} />
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
        </div>

        {/* Info panel */}
        <div className={styles.panel}>
          <span className={styles.category}>{product.category}</span>
          <h1 className={styles.name}>{product.name}</h1>

          {/* Rating */}
          <div className={styles.ratingRow}>
            <Stars rating={product.rating} />
            <span className={styles.ratingText}>
              {product.rating} · {product.reviews} reviews
            </span>
          </div>

          <p className={styles.price}>{formatCurrency(product.price)}</p>

          <hr className={styles.divider} />

          <p className={styles.description}>
            {product.description} Premium craftsmanship — every piece is
            hand-inspected before shipment.
          </p>

          <p className={styles.inStock}>
            ● In stock ({product.stock} remaining) · Free shipping on orders
            over $150
          </p>

          {/* Qty */}
          <div
            className={styles.qtyControl}
            role="group"
            aria-label="Select quantity"
          >
            <button
              className={styles.qtyBtn}
              onClick={() => adjustQty(-1)}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className={styles.qtyVal} aria-live="polite">
              {qty}
            </span>
            <button
              className={styles.qtyBtn}
              onClick={() => adjustQty(1)}
              disabled={qty >= (product.stock ?? 99)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.btnDark} onClick={handleAddToCart}>
              Add to Bag · {formatCurrency(product.price * qty)}
            </button>
            <button
              className={styles.btnOutline}
              onClick={() => navigate('/')}
              aria-label="Continue shopping"
            >
              ← Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stars({ rating }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty}
        >
          ★
        </span>
      ))}
    </span>
  );
}
