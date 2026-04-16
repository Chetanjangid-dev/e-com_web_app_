import { useState, useEffect, useCallback } from 'react';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getAllProducts, getCategories } from '@/services/productService';
import styles from './Home.module.css';

export default function Home() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [filter,     setFilter]     = useState('All');
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  /** Fetch categories once on mount */
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  /** Re-fetch products when filter or search changes */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProducts({ category: filter, search });
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    // Debounce search input slightly
    const id = setTimeout(fetchProducts, 250);
    return () => clearTimeout(id);
  }, [fetchProducts]);

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="Collection hero">
        <div className={styles.heroGlow} aria-hidden="true" />
        <p className={styles.heroTag}>Spring Collection · 2024</p>
        <h1 className={styles.heroH1}>
          Crafted for the{' '}
          <em className={styles.heroEm}>discerning</em>
        </h1>
        <p className={styles.heroSub}>
          Timeless pieces, exceptional quality. Each item selected for those
          who believe in buying less — but better.
        </p>
        <button
          className={styles.heroBtn}
          onClick={() =>
            document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          Explore Collection
        </button>
      </section>

      {/* ── Product grid ───────────────────────────────────────── */}
      <section
        id="product-grid"
        className={styles.section}
        aria-label="Product listing"
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Our <em className={styles.heroEm}>Collection</em>
          </h2>
          <span className={styles.sectionCount}>
            {loading ? '—' : `${products.length} pieces`}
          </span>
        </div>

        {/* Filters + search */}
        <div className={styles.filtersRow} role="toolbar" aria-label="Product filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${filter === cat ? styles.filterActive : ''}`}
              onClick={() => setFilter(cat)}
              aria-pressed={filter === cat}
            >
              {cat}
            </button>
          ))}
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>

        {/* States */}
        {error && <p className={styles.errorMsg}>Error: {error}</p>}

        {loading ? (
          <div className={styles.skeletonGrid} aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className={styles.emptyMsg}>No products found. Try adjusting your search.</p>
        ) : (
          <div className={styles.grid}>
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
