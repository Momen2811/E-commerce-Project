# B2B — Fashion E-Commerce Storefront

A fully functional fashion e-commerce storefront built with **React 18 + Vite**. It covers the things a real store needs — a filterable catalog, cart, wishlist, multi-step checkout, search, product reviews, email authentication, an optional headless CMS, and a dark/light theme — with a bold, gallery-clean streetwear design.

Built as a freelance portfolio piece. JavaScript only (no TypeScript), plain CSS with a flexbox-only layout, and zero required backend — it runs entirely on seed data out of the box, and can be connected to a live Sanity CMS when you want one.

---

## Features

**Catalog**
- Home page with hero, featured products, and new arrivals
- Shop with **filters** (type, size, color, price, on-sale, in-stock) and **sorting** (featured, newest, price, top-rated) — filter state is synced to the URL (shareable, back-button friendly)
- Audience sections: Women / Men / Unisex
- Product detail pages with image gallery, color/size selectors, and related products
- **Search** results page, **quick-view modal** from any product card

**Cart, wishlist & checkout**
- Persistent **cart** with a slide-in drawer and a full cart page; quantity steppers; line items keyed by product + size + color
- **Wishlist** with heart toggles and a dedicated page
- **Multi-step simulated checkout** (shipping → delivery → payment → review) with live validation and card/expiry formatting — **no real payments**
- Order confirmation with a generated order number

**Accounts**
- Email **registration & login** with full validation (valid email, password ≥ 8 chars with a letter and a number, confirm-match, duplicate-email blocking)
- Passwords hashed client-side (Web Crypto SHA-256 + per-user salt) — never stored in plaintext
- Protected **account page** with per-user **order history**, show/hide password + strength meter, and a simulated password-reset flow
- Login is **optional** — guest checkout always works

**Reviews & ratings**
- Average rating, star distribution, and a review list on product pages; compact star ratings on cards

**Theming**
- **Dark / light mode** toggle in the header; follows the OS preference on first visit and remembers your choice; no flash of the wrong theme on load

**Headless CMS (optional)**
- Wired for **Sanity** — the app runs on local seed data by default and switches to live CMS data the moment you add a project ID (see [Sanity CMS](#sanity-cms-optional))

---

## Tech stack

- **React 18** + **Vite 5**
- **React Router v6** for routing
- **React Context + `useReducer`** for state (cart, wishlist, auth, UI, theme), persisted to `localStorage`
- Plain **CSS** with custom-property design tokens — **flexbox only, no CSS Grid**
- **Vitest** + **React Testing Library** for tests
- **Web Crypto API** for client-side password hashing
- **Sanity** (optional) for the headless CMS + Studio

---

## Getting started

**Prerequisites:** Node.js 18+ and npm.

```bash
git clone https://github.com/Momen2811/E-commerce-Project.git
cd E-commerce-Project
npm install
npm run dev
```

Open http://localhost:5173. The store works immediately on built-in seed data — no accounts, keys, or backend required.

### Scripts

```bash
npm run dev          # start the dev server (HMR) at http://localhost:5173
npm run build        # production build → dist/
npm run preview      # serve the production build locally
npm test             # run the full Vitest suite once
npm test -- cart     # run a single test file by name (e.g. cart, checkout, auth, theme)
npm run test:watch   # Vitest in watch mode
npm run studio       # run the Sanity Studio (requires `cd studio && npm install` first)
```

---

## Project structure

```
.
├─ index.html                 # entry HTML (+ inline no-flash theme script)
├─ vite.config.js             # Vite + Vitest config
├─ public/                    # logo artwork (logo.png, logo-footer.png, logo-mark.png)
├─ studio/                    # Sanity Studio workspace (schemas + config)
├─ docs/superpowers/          # design specs and implementation plans (per phase)
└─ src/
   ├─ main.jsx                # ReactDOM root + BrowserRouter
   ├─ App.jsx                 # providers, routes, global drawer/modal
   ├─ index.css               # all styles: tokens + components + dark theme
   ├─ icons.jsx               # all SVG icons (Icon.X)
   ├─ data/                   # seed products + reviews
   ├─ lib/                    # pure, tested logic (see Architecture)
   ├─ context/                # Theme, Auth, Cart, Wishlist, UI providers
   ├─ components/             # Header, Footer, ProductCard, CartDrawer, QuickViewModal, …
   └─ pages/                  # Home, Shop, Product, Cart, Wishlist, Search,
                              # Checkout, OrderConfirmation, Login, Register,
                              # ForgotPassword, Account, NotFound
```

---

## Architecture

**Single data seam.** `src/lib/cms.js` is the only module the UI imports for product/review data (`getProducts`, `getProductBySlug`, `getFeatured`, `getReviews`). It returns local seed data by default; when a Sanity project ID is configured it transparently queries Sanity instead. Both paths return the identical shape, so no UI code changes.

**Pure logic, thin contexts.** Reducers and helpers live in `src/lib/` and are unit-tested directly:

| Module | Responsibility |
|---|---|
| `cart.js` | cart reducer + selectors (`lineId`, totals) |
| `wishlist.js` | wishlist reducer |
| `checkout.js` | validation, card formatting, shipping/total math, `createOrder` |
| `filters.js` | product filtering, sorting, URL-param sync |
| `search.js` | text search over products |
| `reviews.js` | average rating + distribution |
| `auth.js` | email/password validation, strength, Web Crypto hashing |
| `userStore.js` | users + per-user orders in `localStorage` |
| `theme.js` | initial theme resolution |
| `format.js` | currency + discount formatting |

The `src/context/` providers wrap these and persist to `localStorage`. Provider order: `ThemeProvider → AuthProvider → CartProvider → WishlistProvider → UIProvider`.

**Styling.** One flat stylesheet with CSS custom-property tokens on `:root`, overridden under `[data-theme="dark"]`. **Flexbox only** — product grids use `flex-wrap` + `flex-basis` breakpoints (4-up desktop / 3-up tablet / 2-up phone). Fully responsive: hamburger nav, slide-in cart/filter drawers, and a modal that stacks on small screens.

**`localStorage` keys:** `b2b_cart`, `b2b_wishlist`, `b2b_last_order`, `b2b_users`, `b2b_session`, `b2b_orders`, `b2b_theme`.

---

## Authentication

Auth is **client-side** and persisted to `localStorage`. Passwords are hashed (SHA-256 + a random per-user salt) and never stored in plaintext.

> **Note:** because there is no server, this is a portfolio demo — not production-grade security. The auth layer sits behind a clean interface so a real provider (e.g. Supabase) can replace it later without touching the UI.

---

## Sanity CMS (optional)

The store runs on seed data by default. To drive it from a live CMS:

**App side**
1. Create a free project at [sanity.io](https://www.sanity.io/) and copy the **project ID**.
2. Copy `.env.example` to `.env` and set:
   ```
   VITE_SANITY_PROJECT_ID=your_project_id
   VITE_SANITY_DATASET=production
   ```
3. Restart `npm run dev`. `cms.js` now queries Sanity instead of seed data.

**Studio side**
```bash
cd studio
npm install
# set SANITY_STUDIO_PROJECT_ID (env) or edit studio/sanity.config.js
npm run dev        # Studio at http://localhost:3333  (or `npm run studio` from the root)
```
Schemas in `studio/schemas/` (`product`, `review`) mirror the seed-data shape.

---

## Testing

```bash
npm test
```

Vitest + React Testing Library cover the pure logic (cart, wishlist, checkout, filters, search, reviews, auth, user store, theme) and key components (ProductCard, QtyStepper).

---

## Deployment

The storefront is a static SPA — build it and deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages, etc.):

```bash
npm run build      # outputs to dist/
```

Set the `VITE_SANITY_*` environment variables on the host if using the live CMS. The Sanity Studio can be deployed separately with `npm run deploy` from `studio/`.

---

## Design & conventions

- **Brand:** B2B — off-white background, near-black ink, safety-orange accent, heavy display type (Anton) + Inter body.
- **No CSS Grid** anywhere — flexbox only (a deliberate constraint).
- **No TypeScript** — plain JS/JSX.
- Icons live only in `src/icons.jsx`; logo artwork is the real brand asset in `public/`.
- Each feature was shipped as a phase with a spec + plan under `docs/superpowers/`.

---

## License

Private portfolio project. Not licensed for redistribution.
