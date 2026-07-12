import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllProducts } from '../../services/productService';
import { createProduct, updateProduct, deleteProduct, bulkDelete } from '../../services/adminProductService';
import { useToast } from '../../hooks/useToast';
import styles from './AdminPanel.module.css';

// ── Admin Password Gate ───────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'chetanjangid';

function PasswordGate({ onAuth }) {
  const [pw, setPw] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('ml_admin', '1');
      onAuth();
    } else {
      setShake(true);
      setPw('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className={styles.gateOverlay}>
      <div className={`${styles.gateBox} ${shake ? styles.shake : ''}`}>
        <div className={styles.gateLogo}>ML</div>
        <h1 className={styles.gateTitle}>Admin Access</h1>
        <p className={styles.gateSub}>Maison Luxe Control Panel</p>
        <form onSubmit={handleSubmit} className={styles.gateForm}>
          <div className={styles.gateInputWrap}>
            <input
              type="password"
              className={styles.gateInput}
              placeholder="Enter admin password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className={styles.gateBtn}>
            Enter Panel
          </button>
        </form>
        <p className={styles.gateHint}>Hint: maisonluxe2024</p>
      </div>
    </div>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      <td><div className={styles.skeletonCheck} /></td>
      <td><div className={styles.skeletonImg} /></td>
      <td>
        <div className={styles.skeletonLine} style={{ width: '70%' }} />
        <div className={styles.skeletonLine} style={{ width: '40%', marginTop: '6px', height: '10px', opacity: 0.5 }} />
      </td>
      <td><div className={styles.skeletonLine} style={{ width: '60%' }} /></td>
      <td><div className={styles.skeletonLine} style={{ width: '55%' }} /></td>
      <td><div className={styles.skeletonLine} style={{ width: '50%' }} /></td>
      <td><div className={styles.skeletonLine} style={{ width: '80%' }} /></td>
    </tr>
  );
}

// ── Product Form Modal ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', category: '', price: '', rating: '', reviews: '',
  badge: '', stock: '', description: '', image: '',
};

function ProductModal({ product, onClose, onSave, loading }) {
  const [form, setForm] = useState(product ? {
    name: product.name || '',
    category: product.category || '',
    price: product.price || '',
    rating: product.rating || '',
    reviews: product.reviews || '',
    badge: product.badge || '',
    stock: product.stock || '',
    description: product.description || '',
    image: product.image || '',
  } : { ...EMPTY_FORM });
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'image') { setImgError(false); setImgLoaded(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const isEdit = !!product;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            {/* Left col */}
            <div className={styles.formCol}>
              <label className={styles.label}>Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                className={styles.input} required placeholder="e.g. Cashmere Turtleneck" />

              <label className={styles.label}>Category *</label>
              <input name="category" value={form.category} onChange={handleChange}
                className={styles.input} required placeholder="e.g. Knitwear" />

              <div className={styles.row2}>
                <div>
                  <label className={styles.label}>Price (£) *</label>
                  <input name="price" type="number" step="0.01" min="0"
                    value={form.price} onChange={handleChange}
                    className={styles.input} required placeholder="195.00" />
                </div>
                <div>
                  <label className={styles.label}>Stock *</label>
                  <input name="stock" type="number" min="0"
                    value={form.stock} onChange={handleChange}
                    className={styles.input} required placeholder="0" />
                </div>
              </div>

              <div className={styles.row2}>
                <div>
                  <label className={styles.label}>Rating (0–5)</label>
                  <input name="rating" type="number" step="0.1" min="0" max="5"
                    value={form.rating} onChange={handleChange}
                    className={styles.input} placeholder="4.7" />
                </div>
                <div>
                  <label className={styles.label}>Reviews</label>
                  <input name="reviews" type="number" min="0"
                    value={form.reviews} onChange={handleChange}
                    className={styles.input} placeholder="156" />
                </div>
              </div>

              <label className={styles.label}>Badge</label>
              <input name="badge" value={form.badge} onChange={handleChange}
                className={styles.input} placeholder="e.g. Bestseller, New (optional)" />

              <label className={styles.label}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className={`${styles.input} ${styles.textarea}`} required
                placeholder="Product description…" rows={4} />
            </div>

            {/* Right col — Image */}
            <div className={styles.formCol}>
              <label className={styles.label}>Image URL *</label>
              <input name="image" value={form.image} onChange={handleChange}
                className={styles.input} required placeholder="https://…" />

              {/* Live image preview */}
              <div className={styles.imagePreviewBox}>
                {form.image ? (
                  <>
                    {!imgLoaded && !imgError && (
                      <div className={styles.imgSkeleton}>
                        <span>Loading preview…</span>
                      </div>
                    )}
                    {!imgError && (
                      <img
                        src={form.image}
                        alt="Preview"
                        className={styles.imagePreview}
                        style={{ display: imgLoaded ? 'block' : 'none' }}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                      />
                    )}
                    {imgError && (
                      <div className={styles.imgError}>
                        <span>⚠</span>
                        <p>Invalid image URL</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.imgPlaceholder}>
                    <span>🖼</span>
                    <p>Image preview will appear here</p>
                  </div>
                )}
              </div>

              {/* Stock indicator */}
              {form.stock !== '' && (
                <div className={`${styles.stockIndicator} ${parseInt(form.stock) < 5 ? styles.stockLow : styles.stockOk}`}>
                  {parseInt(form.stock) === 0
                    ? '⛔ Out of Stock'
                    : parseInt(form.stock) < 5
                    ? `⚠ Low Stock — only ${form.stock} left`
                    : `✓ In Stock (${form.stock} units)`}
                </div>
              )}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confirmIcon}>⚠</div>
        <h3 className={styles.confirmTitle}>Confirm Deletion</h3>
        <p className={styles.confirmMsg}>{message}</p>
        <div className={styles.confirmBtns}>
          <button className={styles.btnSecondary} onClick={onCancel}>Cancel</button>
          <button className={styles.btnDanger} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('ml_admin') === '1');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [modal, setModal] = useState(null); // null | 'add' | product object
  const [confirmDelete, setConfirmDelete] = useState(null); // null | { type, ids }
  const [activeView, setActiveView] = useState('products'); // 'products' | 'analytics'
  const showToast = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      showToast(`Failed to load products: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (authed) fetchProducts();
  }, [authed, fetchProducts]);

  // ── Analytics ──
  const totalValue = products.reduce((sum, p) => sum + parseFloat(p.price) * parseInt(p.stock || 0), 0);
  const totalStock = products.reduce((sum, p) => sum + parseInt(p.stock || 0), 0);
  const lowStockItems = products.filter((p) => parseInt(p.stock) > 0 && parseInt(p.stock) < 5);
  const outOfStock = products.filter((p) => parseInt(p.stock) === 0);
  const avgPrice = products.length ? products.reduce((s, p) => s + parseFloat(p.price), 0) / products.length : 0;

  // ── Checkbox logic ──
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  };

  // ── CRUD handlers ──
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (modal && modal !== 'add') {
        await updateProduct(modal.id, formData);
        showToast('Product updated successfully', 'success');
      } else {
        await createProduct(formData);
        showToast('Product created successfully', 'success');
      }
      setModal(null);
      await fetchProducts();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product) => {
    setConfirmDelete({ type: 'single', ids: [product.id], label: `"${product.name}"` });
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    setConfirmDelete({ type: 'bulk', ids: [...selected], label: `${selected.size} selected product(s)` });
  };

  const executeDelete = async () => {
    const { type, ids } = confirmDelete;
    setConfirmDelete(null);
    setSaving(true);
    try {
      if (type === 'single') {
        await deleteProduct(ids[0]);
        showToast('Product deleted', 'success');
      } else {
        await bulkDelete(ids);
        showToast(`${ids.length} products deleted`, 'success');
        setSelected(new Set());
      }
      await fetchProducts();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoMark}>ML</span>
          <div>
            <div className={styles.logoName}>Maison Luxe</div>
            <div className={styles.logoSub}>Admin Panel</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.navItem} ${activeView === 'products' ? styles.navActive : ''}`}
            onClick={() => setActiveView('products')}
          >
            <span className={styles.navIcon}>◈</span> Products
          </button>
          <button
            className={`${styles.navItem} ${activeView === 'analytics' ? styles.navActive : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            <span className={styles.navIcon}>◉</span> Analytics
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarStat}>
            <span className={styles.statLabel}>Total Products</span>
            <span className={styles.statValue}>{products.length}</span>
          </div>
          <div className={styles.sidebarStat}>
            <span className={styles.statLabel}>Low Stock</span>
            <span className={`${styles.statValue} ${lowStockItems.length > 0 ? styles.statWarn : ''}`}>
              {lowStockItems.length}
            </span>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={() => { sessionStorage.removeItem('ml_admin'); setAuthed(false); }}
          >
            ← Exit Admin
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className={styles.main}>

        {/* ── Analytics View ──────────────────────────────────────── */}
        {activeView === 'analytics' && (
          <div className={styles.analyticsView}>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Analytics Overview</h1>
                <p className={styles.pageSub}>Inventory & revenue snapshot</p>
              </div>
            </div>

            <div className={styles.analyticsGrid}>
              <div className={`${styles.analyticsCard} ${styles.analyticsCardGold}`}>
                <div className={styles.analyticsLabel}>Total Inventory Value</div>
                <div className={styles.analyticsValue}>£{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
                <div className={styles.analyticsHint}>Price × Stock across all products</div>
              </div>

              <div className={styles.analyticsCard}>
                <div className={styles.analyticsLabel}>Total Stock Units</div>
                <div className={styles.analyticsValue}>{totalStock.toLocaleString()}</div>
                <div className={styles.analyticsHint}>Across {products.length} products</div>
              </div>

              <div className={styles.analyticsCard}>
                <div className={styles.analyticsLabel}>Average Price</div>
                <div className={styles.analyticsValue}>£{avgPrice.toFixed(2)}</div>
                <div className={styles.analyticsHint}>Mean across catalogue</div>
              </div>

              <div className={`${styles.analyticsCard} ${outOfStock.length > 0 ? styles.analyticsCardDanger : ''}`}>
                <div className={styles.analyticsLabel}>Out of Stock</div>
                <div className={styles.analyticsValue}>{outOfStock.length}</div>
                <div className={styles.analyticsHint}>Items with 0 inventory</div>
              </div>

              <div className={`${styles.analyticsCard} ${lowStockItems.length > 0 ? styles.analyticsCardWarn : ''}`}>
                <div className={styles.analyticsLabel}>Low Stock</div>
                <div className={styles.analyticsValue}>{lowStockItems.length}</div>
                <div className={styles.analyticsHint}>Items with &lt;5 units</div>
              </div>

              <div className={styles.analyticsCard}>
                <div className={styles.analyticsLabel}>Categories</div>
                <div className={styles.analyticsValue}>
                  {new Set(products.map((p) => p.category)).size}
                </div>
                <div className={styles.analyticsHint}>Distinct categories</div>
              </div>
            </div>

            {/* Stock breakdown table */}
            <div className={styles.stockTable}>
              <h3 className={styles.stockTableTitle}>Stock Breakdown by Category</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Products</th>
                    <th>Total Stock</th>
                    <th>Inventory Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...new Set(products.map((p) => p.category))].sort().map((cat) => {
                    const catProds = products.filter((p) => p.category === cat);
                    const catStock = catProds.reduce((s, p) => s + parseInt(p.stock || 0), 0);
                    const catValue = catProds.reduce((s, p) => s + parseFloat(p.price) * parseInt(p.stock || 0), 0);
                    const hasLow = catProds.some((p) => parseInt(p.stock) > 0 && parseInt(p.stock) < 5);
                    return (
                      <tr key={cat}>
                        <td><strong>{cat}</strong></td>
                        <td>{catProds.length}</td>
                        <td>{catStock}</td>
                        <td>£{catValue.toFixed(2)}</td>
                        <td>
                          {catStock === 0
                            ? <span className={styles.badgeDanger}>Out of Stock</span>
                            : hasLow
                            ? <span className={styles.badgeWarn}>Low Stock</span>
                            : <span className={styles.badgeOk}>Good</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Products View ────────────────────────────────────────── */}
        {activeView === 'products' && (
          <>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Product Management</h1>
                <p className={styles.pageSub}>
                  {products.length} products · {selected.size} selected
                </p>
              </div>
              <div className={styles.headerActions}>
                {selected.size > 0 && (
                  <button className={styles.btnDanger} onClick={handleBulkDelete} disabled={saving}>
                    Delete Selected ({selected.size})
                  </button>
                )}
                <button className={styles.btnPrimary} onClick={() => setModal('add')}>
                  + Add Product
                </button>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selected.size === products.length && products.length > 0}
                        onChange={toggleAll}
                      />
                    </th>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }, (_, i) => <SkeletonRow key={i} />)
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyCell}>No products found. Add your first product.</td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className={selected.has(p.id) ? styles.rowSelected : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={selected.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                          />
                        </td>
                        <td>
                          <img
                            src={p.image}
                            alt={p.name}
                            className={styles.productThumb}
                            onError={(e) => { e.target.style.opacity = '0.3'; }}
                          />
                        </td>
                        <td>
                          <div className={styles.productName}>{p.name}</div>
                          <div className={styles.productMeta}>
                            {p.badge && <span className={styles.badgeGold}>{p.badge}</span>}
                            ★ {p.rating} ({p.reviews})
                          </div>
                        </td>
                        <td><span className={styles.categoryTag}>{p.category}</span></td>
                        <td className={styles.priceCell}>£{parseFloat(p.price).toFixed(2)}</td>
                        <td>
                          <span className={
                            parseInt(p.stock) === 0 ? styles.badgeDanger :
                            parseInt(p.stock) < 5 ? styles.badgeWarn :
                            styles.badgeOk
                          }>
                            {parseInt(p.stock) === 0 ? 'Out of Stock' :
                             parseInt(p.stock) < 5 ? `⚠ Low (${p.stock})` :
                             p.stock}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button className={styles.btnEdit} onClick={() => setModal(p)}>Edit</button>
                            <button className={styles.btnDeleteSm} onClick={() => handleDelete(p)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          loading={saving}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Are you sure you want to permanently delete ${confirmDelete.label}? This action cannot be undone.`}
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}


