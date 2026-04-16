# Maison Luxe — Full-Stack PERN-s App
# try it out here 🔗
https://e-com-web-app-six.vercel.app/
> React + Vite frontend · Node.js + Express backend · PostgreSQL database

---

## Project Structure

```
maison-luxe/
├── src/                        # React frontend (Vite)
│   ├── services/
│   │   ├── api.js              # Base fetch client (JWT headers, error handling)
│   │   ├── authService.js      # → /api/auth/*  (real API calls)
│   │   └── productService.js   # → /api/products/*  (real API calls)
│   ├── context/                # AuthContext, CartContext, ToastContext
│   ├── hooks/                  # useAuth, useCart, useToast
│   ├── pages/                  # Home, ProductDetail, Cart, Auth, NotFound
│   └── components/             # Navbar, ProductCard, CartItem
│
├── server/                     # Node.js + Express backend
│   ├── db/
│   │   ├── index.js            # pg Pool singleton
│   │   └── schema.sql          # DDL + seed data — run once
│   ├── middleware/
│   │   ├── auth.js             # requireAuth (JWT verify)
│   │   └── errorHandler.js     # Centralised error handler
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── products.controller.js
│   │   ├── cart.controller.js
│   │   └── orders.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── products.routes.js
│   │   ├── cart.routes.js
│   │   └── orders.routes.js
│   ├── index.js                # Express entry point
│  
│   └── package.json
│
├                      
└── package.json                # Frontend deps
```

---

## 1 · Database Setup

### Prerequisites
- PostgreSQL 14+ installed and running

### Create the database and run the schema

```bash
# Create the database (run once)
psql -U postgres -c "CREATE DATABASE maison_luxe;"

# Apply schema + seed products
psql -U postgres -d maison_luxe -f server/db/schema.sql
```

The script is **idempotent** — safe to re-run (uses IF NOT EXISTS and a guard on seed).

### Tables created

| Table         | Purpose                                        |
|---------------|------------------------------------------------|
| users         | Registered accounts (bcrypt hashed passwords)  |
| products      | Product catalogue (seeded from schema.sql)     |
| cart          | Per-user cart rows (user_id + product_id)      |
| orders        | Order headers (totals, status)                 |
| order_items   | Line items — price/name snapshot at purchase   |

---

## 2 · Backend Setup

```bash
cd server
npm install
```

Edit server/.env with your values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maison_luxe
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=some_long_random_string_here
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

Run the backend:

```bash
npm run dev     # development (nodemon)
npm start       # production
```

API available at http://localhost:5000

---

## 3 · Frontend Setup

```bash
# From project root
npm install
npm run dev
```

App available at http://localhost:5173

The root .env is already configured:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4 · API Reference

### Auth  /api/auth

| Method | Endpoint    | Auth? | Body                        | Returns           |
|--------|-------------|-------|-----------------------------|-------------------|
| POST   | /register   | No    | { name, email, password }   | { user, token }   |
| POST   | /login      | No    | { email, password }         | { user, token }   |
| GET    | /me         | Yes   | —                           | { user }          |

### Products  /api/products

| Method | Endpoint      | Auth? | Query               | Returns     |
|--------|---------------|-------|---------------------|-------------|
| GET    | /             | No    | ?category=&search=  | product[]   |
| GET    | /categories   | No    | —                   | string[]    |
| GET    | /:id          | No    | —                   | product     |

### Cart  /api/cart  (all require JWT)

| Method | Endpoint    | Body                    | Returns      |
|--------|-------------|-------------------------|--------------|
| GET    | /           | —                       | cartItem[]   |
| POST   | /add        | { productId, qty? }     | cart row     |
| PATCH  | /:id/qty    | { qty }                 | cart row     |
| DELETE | /:id        | —                       | 204          |
| DELETE | /           | —                       | 204 (clear)  |

### Orders  /api/orders  (all require JWT)

| Method | Endpoint | Body                                     | Returns      |
|--------|----------|------------------------------------------|--------------|
| POST   | /        | { items[], shipping, tax, discount }     | { order }    |
| GET    | /        | —                                        | order[]      |
| GET    | /:id     | —                                        | order+items  |

### Health check
```
GET /health  →  { status: "ok", ts: "..." }
```

---

## 5 · Authentication Flow

1. User registers or logs in → server returns { user, token }
2. Frontend stores JWT in localStorage via authService
3. api.js sends Authorization: Bearer <token> on every request
4. On page refresh, AuthContext calls GET /api/auth/me to restore session
5. Protected endpoints return 401 if token is missing or expired

---

## 6 · Checkout Flow

1. User clicks Proceed to Checkout in the Cart page
2. If not signed in → redirected to /auth
3. POST /api/orders with items + totals
4. Server validates, recalculates totals, writes order in a DB transaction, clears server cart
5. Frontend clears local cart state, shows success toast, navigates home

---

## 7 · Quick Start (Both Servers)

```bash
# Terminal 1 — Backend
cd server && npm install && npm run dev

# Terminal 2 — Frontend (project root)
npm install && npm run dev
```

Then open http://localhost:5173
