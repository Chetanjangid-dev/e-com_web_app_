import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '@/hooks/useCart';
import useToast from '@/hooks/useToast';
import { formatCurrency } from '@/utils/format';
import styles from './ProductCard.module.css';

/**
 * ProductCard — Reusable grid card for the product listing.
 *
 * Props:
 *   product  {object}  The product object from productService
 *   index    {number}  Used for staggered entrance animation
 */
function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const showToast    = useToast();
  const navigate     = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation(); // prevent card click from navigating
    addToCart(product);
    showToast(`${product.name} added to bag ✓`);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`View ${product.name}`}
    >
      {/* Image */}
      <div className={styles.imageWrap}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        {product.badge && (
          <span className={styles.badge}>{product.badge}</span>
        )}
        {/* Quick-add overlay */}
        <div className={styles.overlay}>
          <button
            className={styles.quickAdd}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            + Add to Bag
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>

        <div className={styles.footer}>
          <span className={styles.price}>{formatCurrency(product.price)}</span>
          <div className={styles.ratingWrap}>
            <Stars rating={product.rating} />
            <span className={styles.reviewCount}>({product.reviews})</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Inline star renderer — no external dep needed. */
function Stars({ rating }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </span>
  );
}

export default memo(ProductCard);
