# 🏛️ Maison Luxe — Premium Full-Stack E-commerce

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=vercel)](https://e-com-web-app-six.vercel.app/)
[![Backend Status](https://img.shields.io/badge/backend-render-blue?style=for-the-badge&logo=render)](https://maison-luxe-api.onrender.com/health)

Maison Luxe ek premium e-commerce platform hai jo **PERN stack** par bana hai. Isme secure authentication se lekar real-time cart management tak ke saare features hain.

---

## 🛠️ Tech Stack

- **Frontend:** React.js + Vite, Tailwind CSS (Context API for State Management)
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (Hosted on **Neon.tech**)
- **Deployment:** - **Frontend:** Vercel
  - **Backend:** Render
  - **Database:** Neon Cloud

---

## ✨ Key Features

- **JWT Authentication:** Secure user registration and login with bcrypt password hashing.
- **Product Management:** Browse products with category filtering and dynamic search.
- **Shopping Cart:** Fully functional cart with database persistence (add, update, remove items).
- **Checkout System:** Transaction-based order processing with automatic cart clearing.
- **Responsive UI:** Fully optimized for mobile, tablet, and desktop views.

---

## 📂 Project Structure

```text
maison-luxe/
├── src/                # React frontend (Vite)
│   ├── services/       # API clients (axios/fetch configuration)
│   ├── context/        # Auth, Cart, and Toast State
│   ├── components/     # UI Parts (Navbar, ProductCard, etc.)
│   └── pages/          # Full views (Home, Cart, Product, Auth)
│
├── server/             # Node.js backend
│   ├── db/             # Database connection & Schema
│   ├── routes/         # API Endpoints
│   ├── controllers/    # Business Logic
│   └── middleware/     # Auth Guards & Error Handling
│
└── package.json        # Main dependencies
