-- =============================================================================
-- Maison Luxe — PostgreSQL Schema
-- Run once to create all tables and seed the product catalogue.
--
-- Usage:
--   psql -U postgres -d maison_luxe -f schema.sql
--   (create the database first: CREATE DATABASE maison_luxe;)
-- =============================================================================

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)        NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255)        NOT NULL,
  avatar        VARCHAR(500),
  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ── Products ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)      NOT NULL,
  category    VARCHAR(100)      NOT NULL,
  price       NUMERIC(10, 2)    NOT NULL,
  rating      NUMERIC(3, 1)     NOT NULL DEFAULT 0,
  reviews     INT               NOT NULL DEFAULT 0,
  badge       VARCHAR(50),
  stock       INT               NOT NULL DEFAULT 0,
  description TEXT              NOT NULL,
  image       VARCHAR(500)      NOT NULL,
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- ── Cart ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id         SERIAL PRIMARY KEY,
  user_id    INT            NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id INT            NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty        INT            NOT NULL DEFAULT 1 CHECK (qty > 0),
  added_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id           SERIAL PRIMARY KEY,
  user_id      INT            NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  status       VARCHAR(50)    NOT NULL DEFAULT 'pending',   -- pending | confirmed | shipped | delivered | cancelled
  subtotal     NUMERIC(10, 2) NOT NULL,
  shipping     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  grand_total  NUMERIC(10, 2) NOT NULL,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── Order Items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INT            NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id   INT            NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255)   NOT NULL,   -- snapshot at time of purchase
  price        NUMERIC(10, 2) NOT NULL,   -- price at time of purchase
  qty          INT            NOT NULL CHECK (qty > 0)
);

-- =============================================================================
-- Seed Products
-- (Only inserts if the table is empty so re-runs are safe.)
-- =============================================================================
INSERT INTO products (name, category, price, rating, reviews, badge, stock, description, image)
SELECT * FROM (VALUES
  ('Merino Wool Overcoat',    'Outerwear',   289.00, 4.8, 124, 'Bestseller', 12,
   'A structured overcoat in premium merino wool. Double-breasted silhouette with tortoiseshell buttons and a fully-lined interior. Dry-clean only.',
   'https://picsum.photos/seed/coat1/600/500'),

  ('Silk Charmeuse Blouse',   'Tops',        145.00, 4.6,  89, NULL,          8,
   'Fluid silk charmeuse with a relaxed, bias-cut drape. A wardrobe cornerstone that transitions effortlessly from day to evening.',
   'https://picsum.photos/seed/blouse2/600/500'),

  ('Leather Brogue Oxford',   'Footwear',    220.00, 4.9, 203, 'New',         6,
   'Hand-stitched full-grain leather with a commando sole. Built to last decades with regular conditioning and proper care.',
   'https://picsum.photos/seed/oxford3/600/500'),

  ('Cashmere Turtleneck',     'Knitwear',    195.00, 4.7, 156, NULL,         15,
   'Two-ply Mongolian cashmere in a relaxed rib-knit construction. The defining luxury essential for any considered wardrobe.',
   'https://picsum.photos/seed/cashmere4/600/500'),

  ('Tailored Wool Trousers',  'Bottoms',     175.00, 4.5,  78, NULL,         10,
   'Italian wool-blend with a mid-rise fit and subtle taper. Pressed seam, full lining, and side-adjusters for a polished finish.',
   'https://picsum.photos/seed/trousers5/600/500'),

  ('Veg-Tanned Leather Tote', 'Accessories', 289.00, 4.8, 201, 'Bestseller',  4,
   'Full-grain leather that develops a rich patina over time. Hand-stitched in our partner atelier with solid brass hardware.',
   'https://picsum.photos/seed/tote6/600/500'),

  ('Washed Linen Shirt',      'Tops',        125.00, 4.4, 112, NULL,         20,
   'Stone-washed Belgian linen with a relaxed, lived-in feel. Softens with every wash and is naturally temperature-regulating.',
   'https://picsum.photos/seed/linen7/600/500'),

  ('Suede Chelsea Boot',      'Footwear',    265.00, 4.7, 167, 'New',         7,
   'Pull-on suede with elastic side panels and a stacked leather heel. Resoleable and built for a lifetime of wear with minimal upkeep.',
   'https://picsum.photos/seed/chelsea8/600/500')
) AS t(name, category, price, rating, reviews, badge, stock, description, image)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
