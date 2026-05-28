# B2B Storefront — Phase 1: Foundation & Catalog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the B2B React storefront and deliver a fully browsable catalog: home page, shop page with working filters + sorting, and product detail pages — all running on local seed data.

**Architecture:** React 18 + Vite SPA. React Router v6 for pages. A `cms.js` data layer returns seed products today and will swap to Sanity in Phase 3 with no UI changes. Pure logic (price formatting, filtering, sorting, URL-param sync) lives in small testable modules under `src/lib/`. All styling is a single flat CSS file using **flexbox only — never CSS Grid**.

**Tech Stack:** React 18, Vite 5, React Router v6, Vitest + React Testing Library, plain CSS with custom properties. JavaScript (no TypeScript).

**Scope note:** This is Phase 1 of 3. Cart/Wishlist/Checkout (Phase 2) and Search/Quick-view/Reviews/Sanity (Phase 3) are deliberately out of scope here. The Header intentionally omits cart/wishlist icons until Phase 2 to avoid inert placeholders.

**Data shapes (used across all tasks):**

```js
// Product
{
  id: 'p-001',
  name: 'Boxy Logo Tee',
  slug: 'boxy-logo-tee',
  audience: 'unisex',        // 'women' | 'men' | 'unisex'
  type: 'tops',              // 'tops'|'bottoms'|'outerwear'|'dresses'|'shoes'|'accessories'
  price: 48,                 // number, USD
  compareAtPrice: null,      // number | null  (present & > price => on sale)
  description: 'string',
  material: 'string',
  images: ['url', 'url'],    // first is primary
  colors: [{ name: 'Black', hex: '#0a0a0a' }],
  sizes: ['XS','S','M','L','XL'],
  rating: 4.5,               // 0–5
  reviewCount: 24,
  isNew: true,
  isFeatured: true,
  inStock: true,
  createdAt: '2026-05-01',   // ISO date, used by "newest" sort
}

// Filters (in-memory shape produced by parseFilters)
{
  audience: null,            // string | null
  types: [], sizes: [], colors: [],   // string[]
  minPrice: null, maxPrice: null,      // number | null
  onSale: false, inStock: false,       // boolean
  sort: 'featured',          // 'featured'|'newest'|'price-asc'|'price-desc'|'rating'
}
```

---

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/test/setup.js`, `public/favicon.svg`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "b2b-storefront",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.2",
    "jsdom": "^25.0.1",
    "vite": "^5.4.8",
    "vitest": "^2.1.2"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`** (includes Vitest config)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 3: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>B2B — Fashion Store</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `public/favicon.svg`** (simple brand mark placeholder, refined in Task 7)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="#e8742f"/>
  <path d="M30 30 H70 L50 50 L70 70 H30 L50 50 Z" fill="none" stroke="#0a0a0a" stroke-width="5"/>
</svg>
```

- [ ] **Step 5: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Create `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

- [ ] **Step 7: Create a minimal `src/App.jsx`** (placeholder, replaced in Task 8)

```jsx
export default function App() {
  return <h1>B2B</h1>
}
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`
Expected: completes with no errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 9: Verify dev server boots**

Run: `npm run dev` (then stop it with Ctrl-C after confirming)
Expected: Vite prints `Local: http://localhost:5173/` and the page shows "B2B". Note: `src/index.css` does not exist yet, so temporarily it may warn — create an empty `src/index.css` if the import fails: `touch src/index.css`. (Task 2 fills it in.)

- [ ] **Step 10: Commit**

```bash
git add package.json vite.config.js index.html public/favicon.svg src/main.jsx src/App.jsx src/test/setup.js src/index.css package-lock.json
git commit -m "chore: scaffold B2B storefront (Vite + React + Router + Vitest)"
```

---

### Task 2: Design tokens and base stylesheet

**Files:**
- Overwrite: `src/index.css`

This is the single flat stylesheet for the whole app (matches the project's preferred style). **Flexbox only — no `display:grid` anywhere.** Later tasks reference these classes; do not rename them without updating consumers.

- [ ] **Step 1: Write the full `src/index.css`**

```css
:root {
  --bg: #f2f2ef;
  --ink: #0a0a0a;
  --accent: #e8742f;
  --muted: #777;
  --line: #ddddd8;
  --surface: #ffffff;
  --maxw: 1320px;
  --radius: 8px;
  --font-display: 'Anton', Impact, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}

* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }
button { font-family: inherit; cursor: pointer; }

.app { display: flex; flex-direction: column; min-height: 100%; }
.main { flex: 1; }
.container { width: 100%; max-width: var(--maxw); margin: 0 auto; padding: 0 20px; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 22px; border: 1px solid var(--ink); background: var(--surface);
  color: var(--ink); font-weight: 600; border-radius: var(--radius);
  text-transform: uppercase; letter-spacing: .04em; font-size: .85rem;
  transition: transform .12s ease, background .15s ease, color .15s ease;
}
.btn:hover { transform: translateY(-2px); }
.btn--primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.btn--block { width: 100%; }

/* Badges */
.badge {
  display: inline-block; padding: 4px 8px; font-size: .68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .05em; border-radius: 4px;
}
.badge--new { background: var(--ink); color: #fff; }
.badge--sale { background: var(--accent); color: #fff; }
.badge--out { background: #888; color: #fff; }

/* Header */
.header { position: sticky; top: 0; z-index: 30; background: var(--bg); border-bottom: 1px solid var(--line); }
.header__bar { display: flex; align-items: center; gap: 20px; max-width: var(--maxw); margin: 0 auto; padding: 14px 20px; }
.header__menu-btn { display: none; background: none; border: 0; padding: 6px; }
.header__logo { display: flex; align-items: center; }
.header__nav { display: flex; align-items: center; gap: 22px; }
.header__link { font-size: .8rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; padding: 6px 0; border-bottom: 2px solid transparent; }
.header__link:hover, .header__link.active { border-bottom-color: var(--accent); color: var(--accent); }
.header__search { display: flex; align-items: center; gap: 8px; margin-left: auto; background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; }
.header__search input { border: 0; outline: 0; background: transparent; font-size: .85rem; width: 160px; }

/* Logo */
.logo { display: inline-flex; align-items: center; gap: 10px; }
.logo__mark { width: 34px; height: 34px; }
.logo__circle { fill: var(--accent); }
.logo__mono { stroke: var(--ink); stroke-width: 5; fill: none; }
.logo__word { font-family: var(--font-display); font-size: 1.5rem; letter-spacing: .02em; }
.logo--invert .logo__circle { fill: #fff; }
.logo--invert .logo__mono { stroke: var(--accent); }
.logo--invert .logo__word { color: #fff; }

/* Hero */
.hero { display: flex; align-items: flex-end; min-height: 64vh; padding: 40px 20px; background: var(--ink); color: #fff; }
.hero__content { max-width: var(--maxw); margin: 0 auto; width: 100%; }
.hero__eyebrow { text-transform: uppercase; letter-spacing: .2em; font-size: .75rem; color: var(--accent); margin: 0 0 10px; }
.hero__title { font-family: var(--font-display); font-size: clamp(3rem, 12vw, 8rem); line-height: .85; margin: 0; text-transform: uppercase; }
.hero__sub { font-size: 1.05rem; color: #cfcfcf; margin: 16px 0 24px; }

/* Sections */
.section { max-width: var(--maxw); margin: 0 auto; padding: 48px 20px; }
.section__head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 24px; }
.section__title { font-family: var(--font-display); font-size: 2rem; text-transform: uppercase; margin: 0; }
.section__more { font-size: .8rem; font-weight: 600; text-transform: uppercase; border-bottom: 2px solid var(--accent); }

/* Product list — FLEXBOX, not grid */
.product-list { display: flex; flex-wrap: wrap; gap: 24px; }
.product-list > * { flex: 0 0 calc(25% - 18px); }      /* 4-up desktop */

/* Product card */
.card { background: transparent; }
.card__media { position: relative; overflow: hidden; border-radius: var(--radius); background: var(--surface); aspect-ratio: 4 / 5; }
.card__img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.card:hover .card__img { transform: scale(1.05); }
.card__badges { position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 6px; }
.card__info { display: flex; flex-direction: column; gap: 4px; padding: 12px 2px; }
.card__name { font-size: .95rem; font-weight: 600; margin: 0; }
.card__price { display: flex; align-items: center; gap: 8px; }
.price { font-weight: 600; }
.price--sale { color: var(--accent); }
.price--old { color: var(--muted); text-decoration: line-through; font-weight: 400; font-size: .9em; }

/* Skeleton + empty */
.skeleton { border-radius: var(--radius); background: linear-gradient(90deg, #e7e4dd 25%, #efece6 50%, #e7e4dd 75%); background-size: 200% 100%; animation: shimmer 1.3s infinite; aspect-ratio: 4 / 5; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; text-align: center; color: var(--muted); }

/* Shop layout */
.shop { max-width: var(--maxw); margin: 0 auto; padding: 28px 20px 60px; }
.shop__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.shop__title { font-family: var(--font-display); font-size: 2.2rem; text-transform: uppercase; margin: 0; }
.shop__controls { display: flex; align-items: center; gap: 12px; }
.shop__filter-btn { display: none; align-items: center; gap: 8px; padding: 9px 14px; border: 1px solid var(--ink); background: var(--surface); border-radius: var(--radius); font-weight: 600; }
.shop__body { display: flex; align-items: flex-start; gap: 32px; }
.shop__results { flex: 1; }
.shop__count { color: var(--muted); font-size: .85rem; margin: 0 0 16px; }

/* Filters */
.filters { flex: 0 0 240px; display: flex; flex-direction: column; gap: 22px; }
.filters__head { display: none; align-items: center; justify-content: space-between; }
.filters__close { background: none; border: 0; padding: 6px; }
.filter-overlay { display: none; }
.filter-group { display: flex; flex-direction: column; gap: 10px; border-bottom: 1px solid var(--line); padding-bottom: 18px; }
.filter-group__title { font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; margin: 0; }
.check { display: flex; align-items: center; gap: 8px; font-size: .9rem; text-transform: capitalize; }
.size-row, .swatch-row { display: flex; flex-wrap: wrap; gap: 8px; }
.size-chip { min-width: 40px; padding: 7px 10px; border: 1px solid var(--line); background: var(--surface); border-radius: 6px; font-size: .8rem; font-weight: 600; }
.size-chip.is-active { border-color: var(--ink); background: var(--ink); color: #fff; }
.swatch { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--line); padding: 0; }
.swatch.is-active { outline: 2px solid var(--accent); outline-offset: 2px; }
.price-inputs { display: flex; align-items: center; gap: 8px; }
.price-inputs input { width: 80px; padding: 8px; border: 1px solid var(--line); border-radius: 6px; }

/* Sort */
.sort { display: flex; align-items: center; gap: 8px; font-size: .8rem; }
.sort__label { text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
.sort__select { padding: 9px 12px; border: 1px solid var(--ink); background: var(--surface); border-radius: var(--radius); font-weight: 600; }

/* Product detail */
.pdp { padding-top: 28px; padding-bottom: 60px; }
.pdp__main { display: flex; gap: 48px; align-items: flex-start; flex-wrap: wrap; }
.pdp__gallery { flex: 1 1 440px; display: flex; flex-direction: column; gap: 12px; }
.pdp__image { border-radius: var(--radius); overflow: hidden; background: var(--surface); aspect-ratio: 4 / 5; }
.pdp__image img { width: 100%; height: 100%; object-fit: cover; }
.pdp__thumbs { display: flex; gap: 10px; flex-wrap: wrap; }
.pdp__thumb { width: 72px; height: 90px; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; padding: 0; background: none; }
.pdp__thumb.is-active { border-color: var(--ink); }
.pdp__thumb img { width: 100%; height: 100%; object-fit: cover; }
.pdp__info { flex: 1 1 360px; display: flex; flex-direction: column; gap: 18px; }
.pdp__eyebrow { text-transform: uppercase; letter-spacing: .1em; font-size: .75rem; color: var(--muted); margin: 0; }
.pdp__name { font-family: var(--font-display); font-size: 2.4rem; text-transform: uppercase; margin: 0; line-height: 1; }
.pdp__price { display: flex; align-items: center; gap: 12px; font-size: 1.3rem; }
.pdp__field { display: flex; flex-direction: column; gap: 10px; }
.pdp__label { font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
.pdp__desc { color: #333; }
.pdp__meta { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: .9rem; color: #444; }

/* Footer */
.footer { background: var(--ink); color: #fff; margin-top: 40px; }
.footer__inner { max-width: var(--maxw); margin: 0 auto; padding: 48px 20px; display: flex; flex-wrap: wrap; gap: 40px; justify-content: space-between; }
.footer__col { display: flex; flex-direction: column; gap: 10px; }
.footer__col h4 { text-transform: uppercase; font-size: .8rem; letter-spacing: .08em; margin: 0 0 6px; }
.footer__col a { color: #bbb; font-size: .85rem; }
.footer__col a:hover { color: #fff; }
.footer__bottom { border-top: 1px solid #2a2a2a; text-align: center; padding: 18px; font-size: .8rem; color: #888; }

/* 404 */
.notfound { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 100px 20px; text-align: center; }
.notfound h1 { font-family: var(--font-display); font-size: 5rem; margin: 0; }

/* ===== Responsive (flexbox basis changes only) ===== */
@media (max-width: 1024px) {
  .product-list > * { flex: 0 0 calc(33.333% - 16px); }  /* 3-up tablet */
}
@media (max-width: 768px) {
  .header__menu-btn { display: inline-flex; }
  .header__nav {
    position: fixed; inset: 56px 0 auto 0; flex-direction: column; align-items: flex-start;
    gap: 0; background: var(--bg); border-bottom: 1px solid var(--line); padding: 8px 20px;
    transform: translateY(-150%); transition: transform .25s ease;
  }
  .header__nav.is-open { transform: translateY(0); }
  .header__link { width: 100%; padding: 12px 0; }
  .header__search input { width: 110px; }
  .product-list > * { flex: 0 0 calc(50% - 12px); }       /* 2-up tablet/large phone */
  .shop__filter-btn { display: inline-flex; }
  .shop__body { display: block; }
  .filter-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,.4); opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 40; }
  .filter-overlay.is-open { opacity: 1; pointer-events: auto; }
  .filters {
    position: fixed; top: 0; right: 0; bottom: 0; width: 84%; max-width: 340px; z-index: 50;
    background: var(--bg); padding: 20px; overflow-y: auto; transform: translateX(100%);
    transition: transform .25s ease;
  }
  .filters.is-open { transform: translateX(0); }
  .filters__head { display: flex; }
}
@media (max-width: 480px) {
  .product-list { gap: 14px; }
  .product-list > * { flex: 0 0 calc(50% - 7px); }        /* 2-up phone */
  .pdp__main { gap: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 2: Verify the stylesheet contains no CSS Grid**

Run: `grep -n "display: *grid\|grid-template\|grid-area" src/index.css`
Expected: no matches (empty output). This enforces the flexbox-only constraint.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add design tokens and flat flexbox-only stylesheet"
```

---

### Task 3: Seed product data

**Files:**
- Create: `src/data/products.js`

- [ ] **Step 1: Write `src/data/products.js`**

```js
const img = (slug, n) => `https://picsum.photos/seed/${slug}-${n}/600/750`
const images = (slug) => [img(slug, 1), img(slug, 2), img(slug, 3)]

export const products = [
  {
    id: 'p-001', name: 'Boxy Logo Tee', slug: 'boxy-logo-tee', audience: 'unisex', type: 'tops',
    price: 48, compareAtPrice: null, description: 'Heavyweight cotton tee with a boxy fit and a tonal chest logo.',
    material: '100% organic cotton', images: images('boxy-logo-tee'),
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Bone', hex: '#e8e2d6' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.6, reviewCount: 42, isNew: true, isFeatured: true, inStock: true, createdAt: '2026-05-10',
  },
  {
    id: 'p-002', name: 'Heavyweight Hoodie', slug: 'heavyweight-hoodie', audience: 'unisex', type: 'tops',
    price: 95, compareAtPrice: null, description: 'A 450gsm fleece hoodie with a double-lined hood and kangaroo pocket.',
    material: '80% cotton, 20% polyester', images: images('heavyweight-hoodie'),
    colors: [{ name: 'Charcoal', hex: '#3a3a3a' }, { name: 'Orange', hex: '#e8742f' }],
    sizes: ['S', 'M', 'L', 'XL'], rating: 4.8, reviewCount: 67, isNew: false, isFeatured: true, inStock: true, createdAt: '2026-03-02',
  },
  {
    id: 'p-003', name: 'Oversized Denim Jacket', slug: 'oversized-denim-jacket', audience: 'unisex', type: 'outerwear',
    price: 140, compareAtPrice: 180, description: 'Rigid selvedge denim jacket with a dropped shoulder and boxy silhouette.',
    material: '100% cotton denim', images: images('oversized-denim-jacket'),
    colors: [{ name: 'Indigo', hex: '#2b3a55' }], sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.4, reviewCount: 19, isNew: false, isFeatured: true, inStock: true, createdAt: '2026-02-18',
  },
  {
    id: 'p-004', name: 'Tactical Cargo Pants', slug: 'tactical-cargo-pants', audience: 'men', type: 'bottoms',
    price: 110, compareAtPrice: null, description: 'Relaxed cargo pants with bellowed pockets and an adjustable hem.',
    material: '98% cotton, 2% elastane', images: images('tactical-cargo-pants'),
    colors: [{ name: 'Olive', hex: '#5b5d3a' }, { name: 'Black', hex: '#0a0a0a' }],
    sizes: ['28', '30', '32', '34', '36'], rating: 4.3, reviewCount: 28, isNew: true, isFeatured: false, inStock: true, createdAt: '2026-05-05',
  },
  {
    id: 'p-005', name: 'Pleated Midi Skirt', slug: 'pleated-midi-skirt', audience: 'women', type: 'bottoms',
    price: 85, compareAtPrice: null, description: 'A fluid pleated midi skirt with an elasticated waist.',
    material: '100% recycled polyester', images: images('pleated-midi-skirt'),
    colors: [{ name: 'Sand', hex: '#cbb79a' }, { name: 'Black', hex: '#0a0a0a' }],
    sizes: ['XS', 'S', 'M', 'L'], rating: 4.7, reviewCount: 33, isNew: false, isFeatured: false, inStock: true, createdAt: '2026-04-01',
  },
  {
    id: 'p-006', name: 'Bias Slip Dress', slug: 'bias-slip-dress', audience: 'women', type: 'dresses',
    price: 120, compareAtPrice: null, description: 'A bias-cut satin slip dress with adjustable straps.',
    material: '100% satin-finish viscose', images: images('bias-slip-dress'),
    colors: [{ name: 'Champagne', hex: '#e6d3b3' }, { name: 'Black', hex: '#0a0a0a' }],
    sizes: ['XS', 'S', 'M', 'L'], rating: 4.9, reviewCount: 51, isNew: true, isFeatured: true, inStock: true, createdAt: '2026-05-12',
  },
  {
    id: 'p-007', name: 'Ribbed Knit Top', slug: 'ribbed-knit-top', audience: 'women', type: 'tops',
    price: 60, compareAtPrice: null, description: 'A second-skin ribbed knit top with a high neck.',
    material: '92% viscose, 8% elastane', images: images('ribbed-knit-top'),
    colors: [{ name: 'Bone', hex: '#e8e2d6' }, { name: 'Rust', hex: '#a8462a' }],
    sizes: ['XS', 'S', 'M', 'L'], rating: 4.2, reviewCount: 14, isNew: false, isFeatured: false, inStock: true, createdAt: '2026-03-20',
  },
  {
    id: 'p-008', name: 'Nylon Track Jacket', slug: 'nylon-track-jacket', audience: 'men', type: 'outerwear',
    price: 130, compareAtPrice: null, description: 'A glossy nylon track jacket with contrast piping and a stand collar.',
    material: '100% nylon', images: images('nylon-track-jacket'),
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Orange', hex: '#e8742f' }],
    sizes: ['S', 'M', 'L', 'XL'], rating: 4.5, reviewCount: 22, isNew: true, isFeatured: false, inStock: true, createdAt: '2026-05-08',
  },
  {
    id: 'p-009', name: 'Canvas High-Tops', slug: 'canvas-high-tops', audience: 'unisex', type: 'shoes',
    price: 90, compareAtPrice: null, description: 'Vulcanised canvas high-top sneakers with a gum sole.',
    material: 'Canvas upper, rubber sole', images: images('canvas-high-tops'),
    colors: [{ name: 'Off-White', hex: '#f2f2ef' }, { name: 'Black', hex: '#0a0a0a' }],
    sizes: ['7', '8', '9', '10', '11', '12'], rating: 4.6, reviewCount: 38, isNew: false, isFeatured: true, inStock: true, createdAt: '2026-02-25',
  },
  {
    id: 'p-010', name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag', audience: 'women', type: 'accessories',
    price: 75, compareAtPrice: 95, description: 'A compact leather crossbody with an adjustable webbing strap.',
    material: 'Full-grain leather', images: images('leather-crossbody-bag'),
    colors: [{ name: 'Tan', hex: '#b07a47' }, { name: 'Black', hex: '#0a0a0a' }],
    sizes: ['OS'], rating: 4.7, reviewCount: 29, isNew: false, isFeatured: false, inStock: true, createdAt: '2026-04-15',
  },
  {
    id: 'p-011', name: 'Ribbed Beanie', slug: 'ribbed-beanie', audience: 'unisex', type: 'accessories',
    price: 30, compareAtPrice: null, description: 'A chunky ribbed beanie in soft merino wool.',
    material: '100% merino wool', images: images('ribbed-beanie'),
    colors: [{ name: 'Charcoal', hex: '#3a3a3a' }, { name: 'Orange', hex: '#e8742f' }, { name: 'Bone', hex: '#e8e2d6' }],
    sizes: ['OS'], rating: 4.4, reviewCount: 17, isNew: false, isFeatured: false, inStock: false, createdAt: '2026-01-30',
  },
  {
    id: 'p-012', name: 'Wide-Leg Trousers', slug: 'wide-leg-trousers', audience: 'women', type: 'bottoms',
    price: 98, compareAtPrice: null, description: 'High-waisted wide-leg trousers with a pressed crease.',
    material: '64% polyester, 34% viscose, 2% elastane', images: images('wide-leg-trousers'),
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Camel', hex: '#c19a6b' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.5, reviewCount: 24, isNew: true, isFeatured: false, inStock: true, createdAt: '2026-05-14',
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/products.js
git commit -m "feat: add seed product catalog"
```

---

### Task 4: Price formatting utilities (TDD)

**Files:**
- Create: `src/lib/format.js`
- Test: `src/lib/format.test.js`

- [ ] **Step 1: Write the failing test `src/lib/format.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { formatPrice, discountPercent } from './format.js'

describe('formatPrice', () => {
  it('formats whole numbers with two decimals and a $', () => {
    expect(formatPrice(48)).toBe('$48.00')
  })
  it('formats decimals to two places', () => {
    expect(formatPrice(19.9)).toBe('$19.90')
  })
})

describe('discountPercent', () => {
  it('returns null when there is no compareAtPrice', () => {
    expect(discountPercent(48, null)).toBe(null)
  })
  it('returns null when compareAtPrice is not higher than price', () => {
    expect(discountPercent(48, 40)).toBe(null)
  })
  it('returns the rounded percentage off', () => {
    expect(discountPercent(75, 100)).toBe(25)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- format`
Expected: FAIL — cannot import `formatPrice` / module not found.

- [ ] **Step 3: Write `src/lib/format.js`**

```js
export function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

export function discountPercent(price, compareAtPrice) {
  if (!compareAtPrice || compareAtPrice <= price) return null
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- format`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.js src/lib/format.test.js
git commit -m "feat: add price formatting utilities"
```

---

### Task 5: Filtering, sorting, and URL-param sync (TDD)

**Files:**
- Create: `src/lib/filters.js`
- Test: `src/lib/filters.test.js`

- [ ] **Step 1: Write the failing test `src/lib/filters.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { filterProducts, sortProducts, parseFilters, serializeFilters } from './filters.js'

const P = [
  { id: '1', audience: 'women', type: 'tops', price: 60, compareAtPrice: null, inStock: true, isNew: false, isFeatured: true, rating: 4.2, createdAt: '2026-01-01', sizes: ['S', 'M'], colors: [{ name: 'Black', hex: '#000' }] },
  { id: '2', audience: 'men', type: 'bottoms', price: 110, compareAtPrice: 130, inStock: true, isNew: true, isFeatured: false, rating: 4.8, createdAt: '2026-05-01', sizes: ['32', '34'], colors: [{ name: 'Olive', hex: '#5b5d3a' }] },
  { id: '3', audience: 'unisex', type: 'tops', price: 48, compareAtPrice: null, inStock: false, isNew: true, isFeatured: false, rating: 4.0, createdAt: '2026-03-01', sizes: ['M', 'L'], colors: [{ name: 'Black', hex: '#000' }] },
]

describe('filterProducts', () => {
  it('returns all products with empty filters', () => {
    expect(filterProducts(P, {})).toHaveLength(3)
  })
  it('filters by audience (strict)', () => {
    expect(filterProducts(P, { audience: 'women' }).map((p) => p.id)).toEqual(['1'])
  })
  it('filters by type', () => {
    expect(filterProducts(P, { types: ['tops'] }).map((p) => p.id)).toEqual(['1', '3'])
  })
  it('filters by size (any match)', () => {
    expect(filterProducts(P, { sizes: ['L'] }).map((p) => p.id)).toEqual(['3'])
  })
  it('filters by color name', () => {
    expect(filterProducts(P, { colors: ['Olive'] }).map((p) => p.id)).toEqual(['2'])
  })
  it('filters by price range', () => {
    expect(filterProducts(P, { minPrice: 50, maxPrice: 100 }).map((p) => p.id)).toEqual(['1'])
  })
  it('filters on sale only', () => {
    expect(filterProducts(P, { onSale: true }).map((p) => p.id)).toEqual(['2'])
  })
  it('filters in stock only', () => {
    expect(filterProducts(P, { inStock: true }).map((p) => p.id)).toEqual(['1', '2'])
  })
})

describe('sortProducts', () => {
  it('sorts price ascending', () => {
    expect(sortProducts(P, 'price-asc').map((p) => p.id)).toEqual(['3', '1', '2'])
  })
  it('sorts price descending', () => {
    expect(sortProducts(P, 'price-desc').map((p) => p.id)).toEqual(['2', '1', '3'])
  })
  it('sorts by rating', () => {
    expect(sortProducts(P, 'rating').map((p) => p.id)).toEqual(['2', '1', '3'])
  })
  it('sorts newest by createdAt desc', () => {
    expect(sortProducts(P, 'newest').map((p) => p.id)).toEqual(['2', '3', '1'])
  })
  it('does not mutate the input array', () => {
    const before = P.map((p) => p.id)
    sortProducts(P, 'price-asc')
    expect(P.map((p) => p.id)).toEqual(before)
  })
})

describe('parseFilters / serializeFilters', () => {
  it('parses an empty query to defaults', () => {
    const f = parseFilters(new URLSearchParams(''))
    expect(f).toEqual({ audience: null, types: [], sizes: [], colors: [], minPrice: null, maxPrice: null, onSale: false, inStock: false, sort: 'featured' })
  })
  it('parses csv and scalar params', () => {
    const f = parseFilters(new URLSearchParams('type=tops,shoes&size=M&min=20&sale=1&sort=price-asc'))
    expect(f.types).toEqual(['tops', 'shoes'])
    expect(f.sizes).toEqual(['M'])
    expect(f.minPrice).toBe(20)
    expect(f.onSale).toBe(true)
    expect(f.sort).toBe('price-asc')
  })
  it('serializes only the set values, omitting defaults', () => {
    const params = serializeFilters({ types: ['tops'], sizes: [], colors: [], minPrice: null, maxPrice: 100, onSale: true, inStock: false, sort: 'featured' })
    expect(params).toEqual({ type: 'tops', max: '100', sale: '1' })
  })
  it('round-trips through serialize then parse', () => {
    const original = { audience: null, types: ['tops'], sizes: ['M'], colors: ['Black'], minPrice: 20, maxPrice: null, onSale: false, inStock: true, sort: 'rating' }
    const parsed = parseFilters(new URLSearchParams(serializeFilters(original)))
    expect(parsed).toEqual(original)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- filters`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/filters.js`**

```js
export function filterProducts(products, filters = {}) {
  const {
    audience = null, types = [], sizes = [], colors = [],
    minPrice = null, maxPrice = null, onSale = false, inStock = false,
  } = filters

  return products.filter((p) => {
    if (audience && p.audience !== audience) return false
    if (types.length && !types.includes(p.type)) return false
    if (sizes.length && !sizes.some((s) => p.sizes.includes(s))) return false
    if (colors.length && !colors.some((c) => p.colors.some((pc) => pc.name === c))) return false
    if (minPrice != null && p.price < minPrice) return false
    if (maxPrice != null && p.price > maxPrice) return false
    if (onSale && !(p.compareAtPrice && p.compareAtPrice > p.price)) return false
    if (inStock && !p.inStock) return false
    return true
  })
}

export function sortProducts(products, sortKey = 'featured') {
  const list = [...products]
  switch (sortKey) {
    case 'price-asc': return list.sort((a, b) => a.price - b.price)
    case 'price-desc': return list.sort((a, b) => b.price - a.price)
    case 'rating': return list.sort((a, b) => b.rating - a.rating)
    case 'newest': return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'featured':
    default: return list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
  }
}

export function parseFilters(searchParams) {
  const csv = (key) => {
    const v = searchParams.get(key)
    return v ? v.split(',').filter(Boolean) : []
  }
  const num = (key) => {
    const v = searchParams.get(key)
    return v == null || v === '' ? null : Number(v)
  }
  return {
    audience: searchParams.get('audience') || null,
    types: csv('type'),
    sizes: csv('size'),
    colors: csv('color'),
    minPrice: num('min'),
    maxPrice: num('max'),
    onSale: searchParams.get('sale') === '1',
    inStock: searchParams.get('instock') === '1',
    sort: searchParams.get('sort') || 'featured',
  }
}

export function serializeFilters(filters) {
  const params = {}
  if (filters.audience) params.audience = filters.audience
  if (filters.types?.length) params.type = filters.types.join(',')
  if (filters.sizes?.length) params.size = filters.sizes.join(',')
  if (filters.colors?.length) params.color = filters.colors.join(',')
  if (filters.minPrice != null) params.min = String(filters.minPrice)
  if (filters.maxPrice != null) params.max = String(filters.maxPrice)
  if (filters.onSale) params.sale = '1'
  if (filters.inStock) params.instock = '1'
  if (filters.sort && filters.sort !== 'featured') params.sort = filters.sort
  return params
}
```

Note: `serializeFilters` includes `audience` only if present; on `/shop/:audience` routes the ShopPage keeps audience in the path and does not pass it into `serializeFilters`, so it stays out of the query string there.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- filters`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/filters.js src/lib/filters.test.js
git commit -m "feat: add product filtering, sorting, and URL-param sync"
```

---

### Task 6: CMS data layer (seed fallback) (TDD)

**Files:**
- Create: `src/lib/cms.js`
- Test: `src/lib/cms.test.js`

- [ ] **Step 1: Write the failing test `src/lib/cms.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { getProducts, getProductBySlug, getFeatured } from './cms.js'

describe('cms (seed data)', () => {
  it('getProducts resolves to a non-empty array of products', async () => {
    const products = await getProducts()
    expect(Array.isArray(products)).toBe(true)
    expect(products.length).toBeGreaterThan(0)
    expect(products[0]).toHaveProperty('slug')
  })
  it('getProductBySlug returns the matching product', async () => {
    const all = await getProducts()
    const found = await getProductBySlug(all[0].slug)
    expect(found).toEqual(all[0])
  })
  it('getProductBySlug returns null for an unknown slug', async () => {
    expect(await getProductBySlug('nope-not-real')).toBe(null)
  })
  it('getFeatured returns only featured products', async () => {
    const featured = await getFeatured()
    expect(featured.length).toBeGreaterThan(0)
    expect(featured.every((p) => p.isFeatured)).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- cms`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/cms.js`**

```js
import { products as seedProducts } from '../data/products.js'

// Phase 3 adds a Sanity branch here, gated on VITE_SANITY_PROJECT_ID.
// The seed path and the Sanity path must return the identical product shape.
async function fetchAll() {
  return seedProducts
}

export async function getProducts() {
  return fetchAll()
}

export async function getProductBySlug(slug) {
  const all = await fetchAll()
  return all.find((p) => p.slug === slug) || null
}

export async function getFeatured() {
  const all = await fetchAll()
  return all.filter((p) => p.isFeatured)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- cms`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/cms.js src/lib/cms.test.js
git commit -m "feat: add CMS data layer with seed fallback"
```

---

### Task 7: Icons and Logo

**Files:**
- Create: `src/icons.jsx`, `src/components/Logo.jsx`

- [ ] **Step 1: Write `src/icons.jsx`**

```jsx
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const Icon = {
  Search: (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>),
  Menu: (p) => (<svg {...base} {...p}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>),
  Close: (p) => (<svg {...base} {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  ChevronDown: (p) => (<svg {...base} {...p}><polyline points="6 9 12 15 18 9" /></svg>),
  ArrowRight: (p) => (<svg {...base} {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>),
  Star: (p) => (<svg {...base} fill="currentColor" stroke="none" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>),
  Check: (p) => (<svg {...base} {...p}><polyline points="20 6 9 17 4 12" /></svg>),
}
```

- [ ] **Step 2: Write `src/components/Logo.jsx`**

```jsx
export default function Logo({ variant = 'mark', className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <svg className="logo__mark" viewBox="0 0 100 100" role="img" aria-label="B2B">
        <circle className="logo__circle" cx="50" cy="50" r="50" />
        <path className="logo__mono" d="M30 30 H70 L50 50 L70 70 H30 L50 50 Z" />
        <line className="logo__mono" x1="46" y1="52" x2="46" y2="70" />
        <line className="logo__mono" x1="54" y1="52" x2="54" y2="70" />
      </svg>
      {variant === 'full' && <span className="logo__word">B2B</span>}
    </span>
  )
}
```

Note: this is a clean, rendering recreation of the circular hourglass monogram. Fidelity to `B2B.pdf` is verified visually in the browser during the final review of this phase and refined if needed; the SVG geometry is the only thing that changes.

- [ ] **Step 3: Verify it renders** (quick check)

Run: `npm run dev`, open http://localhost:5173 — the placeholder App still shows "B2B" (Logo not yet mounted; mounted in Task 8). No errors in console. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/icons.jsx src/components/Logo.jsx
git commit -m "feat: add icon set and B2B logo component"
```

---

### Task 8: App shell — router, Header, Footer, 404

**Files:**
- Create: `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/pages/NotFoundPage.jsx`, and temporary stub pages `src/pages/HomePage.jsx`, `src/pages/ShopPage.jsx`, `src/pages/ProductPage.jsx`
- Overwrite: `src/App.jsx`

- [ ] **Step 1: Write temporary stub pages** so routing compiles (real versions land in Tasks 11–13)

`src/pages/HomePage.jsx`:
```jsx
export default function HomePage() {
  return <div className="container"><h1>Home</h1></div>
}
```

`src/pages/ShopPage.jsx`:
```jsx
export default function ShopPage() {
  return <div className="container"><h1>Shop</h1></div>
}
```

`src/pages/ProductPage.jsx`:
```jsx
export default function ProductPage() {
  return <div className="container"><h1>Product</h1></div>
}
```

- [ ] **Step 2: Write `src/pages/NotFoundPage.jsx`**

```jsx
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <h1>404</h1>
      <p>This page wandered off.</p>
      <Link to="/" className="btn btn--primary">Back home</Link>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/Header.jsx`**

```jsx
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { Icon } from '../icons.jsx'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function submitSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
    setMenuOpen(false)
  }

  const close = () => setMenuOpen(false)

  return (
    <header className="header">
      <div className="header__bar">
        <button className="header__menu-btn" aria-label="Toggle menu" onClick={() => setMenuOpen((o) => !o)}>
          <Icon.Menu />
        </button>
        <Link to="/" className="header__logo" aria-label="B2B home" onClick={close}>
          <Logo variant="full" />
        </Link>
        <nav className={`header__nav ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/shop/women" className="header__link" onClick={close}>Women</NavLink>
          <NavLink to="/shop/men" className="header__link" onClick={close}>Men</NavLink>
          <NavLink to="/shop/unisex" className="header__link" onClick={close}>Unisex</NavLink>
          <NavLink to="/shop" end className="header__link" onClick={close}>Shop All</NavLink>
        </nav>
        <form className="header__search" onSubmit={submitSearch} role="search">
          <Icon.Search width={16} height={16} />
          <input type="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
        </form>
      </div>
    </header>
  )
}
```

Note: the search field navigates to `/search` which renders the 404 page until Phase 3 adds that route. This is expected and acceptable for Phase 1.

- [ ] **Step 4: Write `src/components/Footer.jsx`**

```jsx
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__col">
          <Logo variant="full" className="logo--invert" />
          <p style={{ color: '#bbb', maxWidth: 240, fontSize: '.85rem' }}>Bold basics, built to last. Streetwear staples for everyone.</p>
        </div>
        <div className="footer__col">
          <h4>Shop</h4>
          <a href="/shop/women">Women</a>
          <a href="/shop/men">Men</a>
          <a href="/shop/unisex">Unisex</a>
        </div>
        <div className="footer__col">
          <h4>Help</h4>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className="footer__bottom">© 2026 B2B. All rights reserved.</div>
    </footer>
  )
}
```

- [ ] **Step 5: Overwrite `src/App.jsx`**

```jsx
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:audience" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev`. Confirm: header with B2B logo + nav renders, footer renders (dark, inverted logo), clicking Women/Men/Unisex/Shop All routes to the stub shop page, a bad URL shows the 404 page. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/components/Header.jsx src/components/Footer.jsx src/pages/NotFoundPage.jsx src/pages/HomePage.jsx src/pages/ShopPage.jsx src/pages/ProductPage.jsx
git commit -m "feat: add app shell with header, footer, router, and 404"
```

---

### Task 9: ProductCard, Skeleton, EmptyState (with card test)

**Files:**
- Create: `src/components/ProductCard.jsx`, `src/components/Skeleton.jsx`, `src/components/EmptyState.jsx`
- Test: `src/components/ProductCard.test.jsx`

- [ ] **Step 1: Write the failing test `src/components/ProductCard.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from './ProductCard.jsx'

const base = {
  id: 'p-1', name: 'Boxy Tee', slug: 'boxy-tee', price: 48, compareAtPrice: null,
  images: ['/x.jpg'], isNew: false, inStock: true, colors: [], sizes: [],
}

const renderCard = (product) =>
  render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>)

describe('ProductCard', () => {
  it('shows the name and price', () => {
    renderCard(base)
    expect(screen.getByText('Boxy Tee')).toBeInTheDocument()
    expect(screen.getByText('$48.00')).toBeInTheDocument()
  })
  it('links to the product detail page', () => {
    renderCard(base)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/boxy-tee')
  })
  it('shows a sale badge and the old price when on sale', () => {
    renderCard({ ...base, price: 75, compareAtPrice: 100 })
    expect(screen.getByText('-25%')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
  })
  it('shows a sold-out badge when out of stock', () => {
    renderCard({ ...base, inStock: false })
    expect(screen.getByText('Sold out')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- ProductCard`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/components/ProductCard.jsx`**

```jsx
import { Link } from 'react-router-dom'
import { formatPrice, discountPercent } from '../lib/format.js'

export default function ProductCard({ product }) {
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price
  const off = discountPercent(product.price, product.compareAtPrice)
  return (
    <article className="card">
      <Link to={`/product/${product.slug}`} className="card__link">
        <div className="card__media">
          <img className="card__img" src={product.images[0]} alt={product.name} loading="lazy" />
          <div className="card__badges">
            {product.isNew && <span className="badge badge--new">New</span>}
            {onSale && <span className="badge badge--sale">-{off}%</span>}
            {!product.inStock && <span className="badge badge--out">Sold out</span>}
          </div>
        </div>
        <div className="card__info">
          <h3 className="card__name">{product.name}</h3>
          <div className="card__price">
            <span className={onSale ? 'price price--sale' : 'price'}>{formatPrice(product.price)}</span>
            {onSale && <span className="price price--old">{formatPrice(product.compareAtPrice)}</span>}
          </div>
        </div>
      </Link>
    </article>
  )
}
```

- [ ] **Step 4: Write `src/components/Skeleton.jsx`**

```jsx
export default function Skeleton() {
  return <div className="card"><div className="skeleton" /></div>
}
```

- [ ] **Step 5: Write `src/components/EmptyState.jsx`**

```jsx
export default function EmptyState({ message = 'Nothing here yet.' }) {
  return <div className="empty"><p>{message}</p></div>
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- ProductCard`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/ProductCard.jsx src/components/ProductCard.test.jsx src/components/Skeleton.jsx src/components/EmptyState.jsx
git commit -m "feat: add ProductCard, Skeleton, and EmptyState"
```

---

### Task 10: ProductGrid

**Files:**
- Create: `src/components/ProductGrid.jsx`

- [ ] **Step 1: Write `src/components/ProductGrid.jsx`**

```jsx
import ProductCard from './ProductCard.jsx'
import Skeleton from './Skeleton.jsx'
import EmptyState from './EmptyState.jsx'

export default function ProductGrid({ products = [], loading = false, emptyMessage = 'No products found.' }) {
  if (loading) {
    return (
      <div className="product-list">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    )
  }
  if (!products.length) return <EmptyState message={emptyMessage} />
  return (
    <div className="product-list">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProductGrid.jsx
git commit -m "feat: add ProductGrid (flex-wrap list with loading + empty states)"
```

---

### Task 11: Home page

**Files:**
- Overwrite: `src/pages/HomePage.jsx`

- [ ] **Step 1: Overwrite `src/pages/HomePage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeatured, getProducts } from '../lib/cms.js'
import ProductGrid from '../components/ProductGrid.jsx'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([getFeatured(), getProducts()]).then(([f, all]) => {
      if (!active) return
      setFeatured(f.slice(0, 4))
      setNewArrivals(all.filter((p) => p.isNew).slice(0, 8))
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Fall Collection 2026</p>
          <h1 className="hero__title">Bold<br />Basics.</h1>
          <p className="hero__sub">Streetwear staples, built to last.</p>
          <Link to="/shop" className="btn btn--primary">Shop the drop</Link>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Featured</h2>
          <Link to="/shop" className="section__more">View all</Link>
        </div>
        <ProductGrid products={featured} loading={loading} />
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">New Arrivals</h2>
        </div>
        <ProductGrid products={newArrivals} loading={loading} />
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify in the browser**

Run: `npm run dev`, open http://localhost:5173. Confirm: hero renders; Featured shows 4 products; New Arrivals shows the `isNew` products; cards link to product pages; product images load. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.jsx
git commit -m "feat: build home page with hero, featured, and new arrivals"
```

---

### Task 12: Shop page with filters and sorting

**Files:**
- Create: `src/components/FilterPanel.jsx`, `src/components/SortDropdown.jsx`
- Overwrite: `src/pages/ShopPage.jsx`

- [ ] **Step 1: Write `src/components/SortDropdown.jsx`**

```jsx
const OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export default function SortDropdown({ value, onChange }) {
  return (
    <label className="sort">
      <span className="sort__label">Sort</span>
      <select className="sort__select" value={value} onChange={(e) => onChange(e.target.value)}>
        {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}
```

- [ ] **Step 2: Write `src/components/FilterPanel.jsx`**

```jsx
import { Icon } from '../icons.jsx'

const TYPES = ['tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'accessories']

function FilterGroup({ title, children }) {
  return (
    <div className="filter-group">
      <h3 className="filter-group__title">{title}</h3>
      {children}
    </div>
  )
}

export default function FilterPanel({ products, filters, onChange, open, onClose }) {
  const sizeOptions = [...new Set(products.flatMap((p) => p.sizes))]
  const colorOptions = [...new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values()]

  function toggleList(key, value) {
    const current = filters[key] || []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    onChange({ [key]: next })
  }

  return (
    <>
      <div className={`filter-overlay ${open ? 'is-open' : ''}`} onClick={onClose} />
      <aside className={`filters ${open ? 'is-open' : ''}`}>
        <div className="filters__head">
          <h2>Filters</h2>
          <button className="filters__close" onClick={onClose} aria-label="Close filters"><Icon.Close /></button>
        </div>

        <FilterGroup title="Type">
          {TYPES.map((t) => (
            <label key={t} className="check">
              <input type="checkbox" checked={(filters.types || []).includes(t)} onChange={() => toggleList('types', t)} />
              <span className="check__label">{t}</span>
            </label>
          ))}
        </FilterGroup>

        <FilterGroup title="Size">
          <div className="size-row">
            {sizeOptions.map((s) => (
              <button key={s} type="button" className={`size-chip ${(filters.sizes || []).includes(s) ? 'is-active' : ''}`} onClick={() => toggleList('sizes', s)}>{s}</button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Color">
          <div className="swatch-row">
            {colorOptions.map((c) => (
              <button key={c.name} type="button" className={`swatch ${(filters.colors || []).includes(c.name) ? 'is-active' : ''}`} style={{ background: c.hex }} title={c.name} aria-label={c.name} onClick={() => toggleList('colors', c.name)} />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Price">
          <div className="price-inputs">
            <input type="number" placeholder="Min" value={filters.minPrice ?? ''} onChange={(e) => onChange({ minPrice: e.target.value === '' ? null : Number(e.target.value) })} />
            <span>–</span>
            <input type="number" placeholder="Max" value={filters.maxPrice ?? ''} onChange={(e) => onChange({ maxPrice: e.target.value === '' ? null : Number(e.target.value) })} />
          </div>
        </FilterGroup>

        <label className="check">
          <input type="checkbox" checked={!!filters.onSale} onChange={(e) => onChange({ onSale: e.target.checked })} />
          <span className="check__label">On sale</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={!!filters.inStock} onChange={(e) => onChange({ inStock: e.target.checked })} />
          <span className="check__label">In stock only</span>
        </label>
      </aside>
    </>
  )
}
```

- [ ] **Step 3: Overwrite `src/pages/ShopPage.jsx`**

```jsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getProducts } from '../lib/cms.js'
import { filterProducts, sortProducts, parseFilters, serializeFilters } from '../lib/filters.js'
import ProductGrid from '../components/ProductGrid.jsx'
import FilterPanel from '../components/FilterPanel.jsx'
import SortDropdown from '../components/SortDropdown.jsx'
import { Icon } from '../icons.jsx'

const AUDIENCE_LABELS = { women: 'Women', men: 'Men', unisex: 'Unisex' }

export default function ShopPage() {
  const { audience } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    let active = true
    getProducts().then((p) => { if (active) { setAllProducts(p); setLoading(false) } })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => {
    const parsed = parseFilters(searchParams)
    return { ...parsed, audience: audience || parsed.audience || null }
  }, [searchParams, audience])

  const visible = useMemo(
    () => sortProducts(filterProducts(allProducts, filters), filters.sort),
    [allProducts, filters],
  )

  function updateFilters(next) {
    const merged = { ...filters, ...next }
    // audience stays in the path, not the query string
    const { audience: _omit, ...queryable } = merged
    setSearchParams(serializeFilters(queryable), { replace: true })
  }

  const title = audience ? (AUDIENCE_LABELS[audience] || 'Shop') : 'Shop All'

  return (
    <div className="shop">
      <div className="shop__head">
        <h1 className="shop__title">{title}</h1>
        <div className="shop__controls">
          <button className="shop__filter-btn" onClick={() => setDrawerOpen(true)}><Icon.Menu width={16} height={16} /> Filters</button>
          <SortDropdown value={filters.sort} onChange={(sort) => updateFilters({ sort })} />
        </div>
      </div>
      <div className="shop__body">
        <FilterPanel
          products={allProducts}
          filters={filters}
          onChange={updateFilters}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        <div className="shop__results">
          <p className="shop__count">{visible.length} item{visible.length === 1 ? '' : 's'}</p>
          <ProductGrid products={visible} loading={loading} emptyMessage="No products match your filters." />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`. Go to `/shop`. Confirm: all 12 products show; checking a Type narrows results and updates the URL (`?type=tops`); size chips, color swatches, price min/max, On sale, In stock all work; the Sort dropdown reorders; `/shop/women` shows only women's items with the "Women" title. Resize to a phone width (DevTools) and confirm the Filters button opens the slide-in drawer and the overlay closes it. Reload a filtered URL and confirm filters persist. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterPanel.jsx src/components/SortDropdown.jsx src/pages/ShopPage.jsx
git commit -m "feat: build shop page with URL-synced filters and sorting"
```

---

### Task 13: Product detail page

**Files:**
- Overwrite: `src/pages/ProductPage.jsx`

- [ ] **Step 1: Overwrite `src/pages/ProductPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductBySlug, getProducts } from '../lib/cms.js'
import { formatPrice, discountPercent } from '../lib/format.js'
import ProductGrid from '../components/ProductGrid.jsx'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    getProductBySlug(slug).then(async (p) => {
      if (!active) return
      setProduct(p)
      setActiveImage(0)
      setColor(p?.colors?.[0]?.name ?? null)
      setSize(null)
      if (p) {
        const all = await getProducts()
        setRelated(all.filter((x) => x.type === p.type && x.id !== p.id).slice(0, 4))
      } else {
        setRelated([])
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [slug])

  if (loading) return <div className="container" style={{ padding: '60px 20px' }}><p>Loading…</p></div>
  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <h1>Product not found</h1>
        <Link to="/shop" className="btn btn--primary">Back to shop</Link>
      </div>
    )
  }

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price
  const off = discountPercent(product.price, product.compareAtPrice)

  return (
    <div className="pdp container">
      <div className="pdp__main">
        <div className="pdp__gallery">
          <div className="pdp__image">
            <img src={product.images[activeImage]} alt={product.name} />
          </div>
          <div className="pdp__thumbs">
            {product.images.map((src, i) => (
              <button key={i} type="button" className={`pdp__thumb ${i === activeImage ? 'is-active' : ''}`} onClick={() => setActiveImage(i)}>
                <img src={src} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp__info">
          <p className="pdp__eyebrow">{product.audience} · {product.type}</p>
          <h1 className="pdp__name">{product.name}</h1>
          <div className="pdp__price">
            <span className={onSale ? 'price price--sale' : 'price'}>{formatPrice(product.price)}</span>
            {onSale && <span className="price price--old">{formatPrice(product.compareAtPrice)}</span>}
            {onSale && <span className="badge badge--sale">-{off}%</span>}
          </div>

          <div className="pdp__field">
            <span className="pdp__label">Color: {color}</span>
            <div className="swatch-row">
              {product.colors.map((c) => (
                <button key={c.name} type="button" className={`swatch ${color === c.name ? 'is-active' : ''}`} style={{ background: c.hex }} aria-label={c.name} title={c.name} onClick={() => setColor(c.name)} />
              ))}
            </div>
          </div>

          <div className="pdp__field">
            <span className="pdp__label">Size</span>
            <div className="size-row">
              {product.sizes.map((s) => (
                <button key={s} type="button" className={`size-chip ${size === s ? 'is-active' : ''}`} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Add-to-cart button is added in Phase 2 once CartContext exists. */}

          <p className="pdp__desc">{product.description}</p>
          <ul className="pdp__meta">
            <li><strong>Material:</strong> {product.material}</li>
            <li><strong>Availability:</strong> {product.inStock ? 'In stock' : 'Sold out'}</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="section__head"><h2 className="section__title">You might also like</h2></div>
          <ProductGrid products={related} loading={false} />
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in the browser**

Run: `npm run dev`. From the shop, click a product. Confirm: gallery main image + thumbnails switch on click; color swatches and size chips select; price/sale badge correct; description + material + availability render; related products show and are clickable. Visit a bad slug like `/product/nope` and confirm the "Product not found" state. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProductPage.jsx
git commit -m "feat: build product detail page with gallery, selectors, and related items"
```

---

### Task 14: Full verification pass

**Files:** none (verification + logo fidelity check)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass (format, filters, cms, ProductCard).

- [ ] **Step 2: Verify no CSS Grid slipped in**

Run: `grep -rn "display: *grid\|grid-template\|grid-area\|grid-column\|grid-row" src/`
Expected: no matches.

- [ ] **Step 3: Production build sanity check**

Run: `npm run build`
Expected: build completes with no errors; `dist/` is produced.

- [ ] **Step 4: Responsive walkthrough**

Run: `npm run dev`. In DevTools device toolbar, check iPhone SE (375px), iPad (768px), and laptop (1280px) widths across Home, Shop, and Product pages. Confirm: 2-up phone / 3-up tablet / 4-up desktop product layout, hamburger nav on mobile, filter drawer on mobile. Stop the server.

- [ ] **Step 5: Logo fidelity check (visual companion)**

The brainstorming visual-companion server may still be running (it auto-stops after 30 min idle). Compare the rendered `<Logo>` against `B2B.pdf`. If the monogram geometry needs adjustment, edit only the `<path>`/`<line>` coordinates in `src/components/Logo.jsx` and `public/favicon.svg`, then commit:

```bash
git add src/components/Logo.jsx public/favicon.svg
git commit -m "fix: refine B2B logo monogram to match brand asset"
```

- [ ] **Step 6: Final phase commit (if any uncommitted verification fixes remain)**

```bash
git status   # confirm clean tree
```

---

## Self-Review

**Spec coverage (Phase 1 scope):**
- Brand/visual system → Task 2 (tokens), Task 7 (logo). ✓
- Routing (`/`, `/shop`, `/shop/:audience`, `/product/:slug`, 404) → Task 8. ✓ (cart/wishlist/search/checkout routes are Phase 2/3.)
- Data layer (seed fallback, identical shape) → Task 6. ✓
- Filters (type/size/color/price/sale/instock) + URL sync → Tasks 5, 12. ✓
- Sort (featured/newest/price/rating) → Tasks 5, 12. ✓
- Loading skeletons + empty states → Tasks 9, 10. ✓
- Responsive flexbox-only (4/3/2-up, drawers) → Task 2 + verified Task 14. ✓
- Testing (format, filters, cms, ProductCard) → Tasks 4, 5, 6, 9. ✓
- Deferred to later phases (correctly out of scope here): cart, wishlist, checkout, search results, quick-view, reviews, Sanity client/Studio.

**Placeholder scan:** No "TBD"/"TODO" left as work items. The two intentional deferrals (add-to-cart button, `/search` route) are explicitly documented as Phase 2/3 with reasons, not vague gaps. Logo SVG is real rendering code, with a visual-fidelity refinement step (Task 14 Step 5).

**Type/name consistency:** Product/Filters shapes defined in the header are used verbatim across `products.js`, `filters.js`, `cms.js`, `ProductCard`, `FilterPanel`, `ShopPage`, `ProductPage`. Function names (`formatPrice`, `discountPercent`, `filterProducts`, `sortProducts`, `parseFilters`, `serializeFilters`, `getProducts`, `getProductBySlug`, `getFeatured`) are consistent between definitions, tests, and call sites. CSS class names referenced in components all exist in `index.css`.
