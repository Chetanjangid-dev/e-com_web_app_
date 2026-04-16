import { useState } from 'react';
import api from '../services/api'

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV = [
  { label: 'Dashboard',   icon: '▦', active: false },
  { label: 'Products',    icon: '◈', active: true  },
  { label: 'Orders',      icon: '◉', active: false },
  { label: 'Customers',   icon: '◎', active: false },
  { label: 'Analytics',   icon: '◐', active: false },
  { label: 'Settings',    icon: '⊙', active: false },
];

const CATEGORIES = ['Outerwear', 'Tops', 'Bottoms', 'Knitwear', 'Footwear', 'Accessories'];
const BADGES     = ['', 'Bestseller', 'New', 'Sale', 'Limited'];

const EMPTY = {
  name: '', category: '', price: '', rating: '', reviews: '',
  badge: '', stock: '', description: '', image: '',
};

export default function AdminPanel() {
  const [form,    setForm]    = useState(EMPTY);
  const [alert,   setAlert]   = useState(null);   // { type: 'success'|'error', msg }
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'image') setPreview(value);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const payload = {
        ...form,
        price:   parseFloat(form.price)   || 0,
        rating:  parseFloat(form.rating)  || 0,
        reviews: parseInt(form.reviews)   || 0,
        stock:   parseInt(form.stock)     || 0,
        badge:   form.badge || null,
      };
      await api.post('/products/add', payload);
      setAlert({ type: 'success', msg: `"${form.name}" has been added to the catalogue.` });
      setForm(EMPTY);
      setPreview('');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Something went wrong. Please try again.';
      setAlert({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Google Fonts ── */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <div style={styles.shell}>
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside style={styles.sidebar}>
          <div style={styles.brand}>
            <span style={styles.brandMark}>ML</span>
            <span style={styles.brandName}>Maison Luxe</span>
          </div>

          <nav style={styles.nav}>
            {NAV.map(({ label, icon, active }) => (
              <button
                key={label}
                style={{ ...styles.navItem, ...(active ? styles.navActive : {}) }}
              >
                <span style={styles.navIcon}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div style={styles.sidebarFooter}>
            <div style={styles.avatar}>A</div>
            <div>
              <div style={styles.adminName}>Admin</div>
              <div style={styles.adminRole}>Store Manager</div>
            </div>
          </div>
        </aside>

        {/* ── Main ───────────────────────────────────────────────────────── */}
        <main style={styles.main}>
          {/* Header */}
          <header style={styles.header}>
            <div>
              <div style={styles.breadcrumb}>Admin / Products</div>
              <h1 style={styles.pageTitle}>Add New Product</h1>
            </div>
            <div style={styles.headerBadge}>Catalogue Manager</div>
          </header>

          {/* Alert */}
          {alert && (
            <div style={{ ...styles.alert, ...(alert.type === 'success' ? styles.alertSuccess : styles.alertError) }}>
              <span style={styles.alertIcon}>{alert.type === 'success' ? '✓' : '✕'}</span>
              <span>{alert.msg}</span>
              <button style={styles.alertClose} onClick={() => setAlert(null)}>×</button>
            </div>
          )}

          {/* Form card */}
          <div style={styles.card}>
            <form onSubmit={submit} style={styles.form}>

              {/* ── Section: Core Details ── */}
              <SectionLabel>Core Details</SectionLabel>
              <div style={styles.row2}>
                <Field label="Product Name *" hint="e.g. Merino Wool Overcoat">
                  <input name="name" value={form.name} onChange={handle} required style={styles.input} placeholder="Product name" />
                </Field>
                <Field label="Category *">
                  <select name="category" value={form.category} onChange={handle} required style={styles.input}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div style={styles.row3}>
                <Field label="Price (USD) *">
                  <div style={styles.inputPrefix}>
                    <span style={styles.prefix}>$</span>
                    <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handle} required style={{ ...styles.input, paddingLeft: '2rem' }} placeholder="0.00" />
                  </div>
                </Field>
                <Field label="Stock Qty *">
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handle} required style={styles.input} placeholder="0" />
                </Field>
                <Field label="Badge">
                  <select name="badge" value={form.badge} onChange={handle} style={styles.input}>
                    {BADGES.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                  </select>
                </Field>
              </div>

              {/* ── Section: Ratings ── */}
              <SectionLabel>Ratings & Reviews</SectionLabel>
              <div style={styles.row2}>
                <Field label="Initial Rating" hint="0.0 – 5.0">
                  <input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handle} style={styles.input} placeholder="0.0" />
                </Field>
                <Field label="Review Count">
                  <input name="reviews" type="number" min="0" value={form.reviews} onChange={handle} style={styles.input} placeholder="0" />
                </Field>
              </div>

              {/* ── Section: Description ── */}
              <SectionLabel>Description</SectionLabel>
              <Field label="Product Description *">
                <textarea name="description" value={form.description} onChange={handle} required style={{ ...styles.input, ...styles.textarea }} placeholder="Describe the product's materials, fit, and care instructions…" />
              </Field>

              {/* ── Section: Image ── */}
              <SectionLabel>Product Image</SectionLabel>
              <div style={styles.imageSection}>
                <div style={{ flex: 1 }}>
                  <Field label="Image URL *" hint="Direct link to product image">
                    <input name="image" value={form.image} onChange={handle} required style={styles.input} placeholder="https://…" />
                  </Field>
                </div>
                <div style={styles.imagePreview}>
                  {preview
                    ? <img src={preview} alt="preview" style={styles.previewImg} onError={() => setPreview('')} />
                    : <div style={styles.previewPlaceholder}><span style={{ fontSize: '2rem', opacity: 0.3 }}>◈</span><span style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: 4 }}>Image preview</span></div>
                  }
                </div>
              </div>

              {/* ── Submit ── */}
              <div style={styles.formFooter}>
                <button type="button" style={styles.btnSecondary} onClick={() => { setForm(EMPTY); setPreview(''); setAlert(null); }}>
                  Clear Form
                </button>
                <button type="submit" style={styles.btnPrimary} disabled={loading}>
                  {loading ? <><span style={styles.spinner} />Adding…</> : '+ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

/* ── Small helpers ──────────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={styles.sectionLabel}>
      <span>{children}</span>
      <div style={styles.sectionLine} />
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>
        {label}
        {hint && <span style={styles.hint}> — {hint}</span>}
      </span>
      {children}
    </label>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const C = {
  bg:        '#0e0e0f',
  sidebar:   '#141416',
  card:      '#1a1a1d',
  border:    '#2a2a2e',
  inputBg:   '#111113',
  gold:      '#c9a96e',
  goldLight: '#e8c990',
  text:      '#e8e6e1',
  muted:     '#6b6868',
  success:   '#2d6a4f',
  successFg: '#95d5b2',
  error:     '#6b2737',
  errorFg:   '#ffb3c1',
};

const styles = {
  shell:      { display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text },

  /* sidebar */
  sidebar:    { width: 220, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '0', flexShrink: 0 },
  brand:      { display: 'flex', alignItems: 'center', gap: 10, padding: '1.6rem 1.4rem 1.4rem', borderBottom: `1px solid ${C.border}` },
  brandMark:  { width: 32, height: 32, background: C.gold, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#0e0e0f', letterSpacing: 1 },
  brandName:  { fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em', color: C.gold },
  nav:        { flex: 1, padding: '1rem 0.6rem', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem:    { display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 0.8rem', borderRadius: 6, border: 'none', background: 'none', color: C.muted, fontSize: '0.82rem', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s' },
  navActive:  { background: 'rgba(201,169,110,0.1)', color: C.gold },
  navIcon:    { fontSize: '1rem', width: 18, textAlign: 'center' },
  sidebarFooter: { padding: '1rem 1.2rem', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 },
  avatar:     { width: 32, height: 32, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#0e0e0f' },
  adminName:  { fontSize: '0.8rem', fontWeight: 500 },
  adminRole:  { fontSize: '0.7rem', color: C.muted },

  /* main */
  main:       { flex: 1, padding: '2.5rem 2.8rem', overflowY: 'auto' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.8rem' },
  breadcrumb: { fontSize: '0.72rem', color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 },
  pageTitle:  { fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 500, letterSpacing: '0.02em', margin: 0 },
  headerBadge:{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, border: `1px solid ${C.gold}`, borderRadius: 4, padding: '4px 10px' },

  /* alert */
  alert:      { display: 'flex', alignItems: 'center', gap: 10, padding: '0.85rem 1.1rem', borderRadius: 8, marginBottom: '1.4rem', fontSize: '0.85rem' },
  alertSuccess:{ background: C.success, color: C.successFg, border: `1px solid ${C.successFg}33` },
  alertError: { background: C.error, color: C.errorFg, border: `1px solid ${C.errorFg}33` },
  alertIcon:  { fontSize: '1rem', fontWeight: 700 },
  alertClose: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1.1rem', lineHeight: 1, opacity: 0.7 },

  /* card + form */
  card:       { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '2rem 2.2rem' },
  form:       { display: 'flex', flexDirection: 'column', gap: '1.4rem' },
  row2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' },
  row3:       { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem' },
  field:      { display: 'flex', flexDirection: 'column', gap: 6 },
  label:      { fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted },
  hint:       { textTransform: 'none', letterSpacing: 0, fontStyle: 'italic' },
  input:      { background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 7, padding: '0.6rem 0.8rem', color: C.text, fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' },
  textarea:   { minHeight: 110, resize: 'vertical', lineHeight: 1.6 },
  inputPrefix:{ position: 'relative' },
  prefix:     { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' },

  /* section label */
  sectionLabel:{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.2rem' },
  sectionLine: { flex: 1, height: 1, background: C.border },

  /* image */
  imageSection:   { display: 'flex', gap: '1.2rem', alignItems: 'flex-start' },
  imagePreview:   { width: 110, height: 110, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', flexShrink: 0 },
  previewImg:     { width: '100%', height: '100%', objectFit: 'cover' },
  previewPlaceholder: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.inputBg },

  /* footer */
  formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', paddingTop: '0.6rem', borderTop: `1px solid ${C.border}`, marginTop: '0.4rem' },
  btnPrimary: { background: C.gold, color: '#0e0e0f', border: 'none', borderRadius: 7, padding: '0.65rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', letterSpacing: '0.03em', transition: 'opacity 0.2s' },
  btnSecondary:{ background: 'none', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '0.65rem 1.2rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s' },
  spinner:    { width: 12, height: 12, border: '2px solid #0e0e0f44', borderTop: '2px solid #0e0e0f', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
};
