# Fashion E-Commerce Storefront — Design Spec

**Date:** 2026-05-28
**Status:** Approved (pending written-spec review)
**Purpose:** A fully functional fashion storefront to showcase front-end skills to freelance clients.

## Goal

Build a production-quality fashion e-commerce storefront (sells clothing for Women / Men / Unisex) that demonstrates state management, forms, routing, and headless-CMS integration. It must look distinctive, work end-to-end (browse → filter → cart → checkout → confirmation), and be fully responsive across iPhone, iPad/tablet, and laptop.

## Non-Goals

- No real payment processing. Checkout is simulated (no charges, no Stripe in v1).
- No user accounts / auth / order history backend.
- No CSS Grid — layout uses **flexbox only** (hard constraint).
- No TypeScript (matches the user's lean portfolio style).

## Tech Stack

- **React 18 + Vite** (JavaScript, no TypeScript)
- **React Router v6** for page routing
- **Cart & Wishlist state:** React Context + `useReducer`, persisted to `localStorage`
- **Styling:** plain flat CSS (BEM-lite class names), CSS custom properties for design tokens, **flexbox only**
- **CMS:** Sanity (headless) with a local seed-data fallback so the app runs with zero external setup
- **Testing:** Vitest + React Testing Library (focused on logic + key components)

## Brand & Visual System

- **Working brand name:** `VOLT` (single constant, trivial to rename).
- **Aesthetic:** bold, gallery-clean streetwear.
- **Palette (CSS variables):**
  - `--bg: #f2f2ef` (off-white page background)
  - `--ink: #0a0a0a` (near-black text / dark UI)
  - `--accent: #ff5a1f` (safety orange — CTAs, highlights, active states)
  - `--muted: #777` (secondary text), `--line: #ddddd8` (borders), `--surface: #ffffff` (cards/inputs)
- **Typography:**
  - Display/headings: heavy uppercase (Google font *Archivo Black* or *Anton*), tight letter-spacing.
  - Body/UI: clean sans (*Inter*), with system-font fallbacks.
- **Motion:** hover lift on cards, image zoom on product hover, smooth slide for drawers and fade/scale for modals. Respect `prefers-reduced-motion`.

## Information Architecture / Routes

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Hero, featured collections, new arrivals, featured products |
| `/shop` | Shop (all) | Full filters + sort over all products |
| `/shop/:audience` | Shop (women \| men \| unisex) | Pre-filtered by audience, same filter/sort UI |
| `/product/:slug` | Product detail | Gallery, size/color pickers, add-to-cart, reviews, related |
| `/cart` | Cart | Full cart view (line items, qty, totals) |
| `/checkout` | Checkout | Multi-step simulated flow |
| `/order-confirmation` | Confirmation | Order number + summary (reads last order from localStorage) |
| `/wishlist` | Wishlist | Saved items |
| `/search?q=` | Search results | Matches name / type / description |
| `*` | 404 | Not-found page |

A global **slide-in cart drawer** is available from the header on every page (separate from the full `/cart` page).

## Data Layer (Sanity + Local Fallback)

A single module `src/lib/cms.js` is the only thing the UI imports for data. It exposes:

- `getProducts(filters)` → array of products (filtering/sorting applied client-side over the dataset)
- `getProductBySlug(slug)` → single product
- `getFeatured()` → featured products for the home page
- `getReviews(productId)` → reviews for a product

**Source resolution:** if `VITE_SANITY_PROJECT_ID` (+ dataset) env vars are present, `cms.js` runs GROQ queries via `src/lib/sanityClient.js`. Otherwise it serves local seed data from `src/data/products.js` and `src/data/reviews.js`. **Both paths return the identical shape**, so the storefront is fully functional on first `npm run dev` with no Sanity account.

### Sanity Studio

Lives in a separate `studio/` workspace (its own `sanity.config.js` + schemas), run via `npm run studio` and deployable to `*.sanity.studio`. Chosen over embedding Studio in the storefront to keep the shipped bundle lean. (Can be switched to an in-app `/studio` route later if desired.)

### Schemas

**product**
- `name` (string), `slug` (slug from name)
- `audience` (string: `women` | `men` | `unisex`)
- `type` (string: `tops` | `bottoms` | `outerwear` | `dresses` | `shoes` | `accessories`)
- `price` (number), `compareAtPrice` (number, optional — presence = on sale)
- `description` (text), `material` (string)
- `images` (array of image, first = primary)
- `colors` (array of `{ name, hex }`)
- `sizes` (array of string, e.g. XS–XXL or shoe sizes)
- `rating` (number 0–5), `reviewCount` (number)
- `isNew` (bool), `isFeatured` (bool), `inStock` (bool)

**review**
- `product` (reference → product), `author` (string), `rating` (number 1–5)
- `title` (string), `body` (text), `date` (datetime)

## State Management

- **CartContext** (`useReducer`): line items keyed by `productId + size + color`; actions `ADD`, `REMOVE`, `UPDATE_QTY`, `CLEAR`. Derived selectors: item count, subtotal, total. Persisted to `localStorage`.
- **WishlistContext** (`useReducer`): set of product ids; `TOGGLE`; badge count; persisted to `localStorage`.
- **UIContext**: cart drawer open/close, active quick-view product, mobile nav + filter drawer open/close.

## Features

- **Filters:** type (multi), size (multi), color (swatch multi), price range, on-sale toggle, in-stock toggle. State is synced to URL query params (shareable, back-button friendly). Mobile = slide-in filter drawer.
- **Sort:** Featured, Newest, Price ↑, Price ↓, Top rated.
- **Search:** header search box → `/search?q=`, matches name/type/description.
- **Wishlist:** heart toggle on cards + product page; `/wishlist` page; header badge.
- **Quick-view modal:** open product preview (gallery, price, size/color, add-to-cart) from listing without navigating.
- **Reviews & ratings:** product page shows average rating, star distribution, and review list (seeded data).

## Checkout (Simulated, 4 Steps)

1. **Shipping** — contact email + shipping address (validated).
2. **Delivery** — shipping method (Standard / Express), affects order total.
3. **Payment** — card number / expiry / CVC with input formatting + live validation. **No real or test charge.**
4. **Review** — order summary, place order → generates an order number, clears cart, stores the order in `localStorage`, routes to `/order-confirmation`.

Validation is inline, accessible (labels, `aria-invalid`, error text), triggered on blur and on submit. This step is the primary forms showcase.

## Responsive Strategy (Flexbox Only)

- Product listings: `display:flex; flex-wrap:wrap` with `flex-basis` controlled by media queries — **no CSS Grid anywhere**.
- Breakpoints:
  - **Laptop / desktop ≥ 1025px:** 4 product tiles per row; filters as a left sidebar.
  - **iPad / tablet 768–1024px:** 2–3 tiles per row; filters in a drawer.
  - **iPhone ≤ 480px (and small phones):** 1–2 tiles per row; hamburger nav; filters + cart as slide-in drawers.
- All interactive targets meet comfortable tap sizes on mobile.

## Project Structure

```
e-commerce/
  package.json
  vite.config.js
  index.html
  .env.example                 # VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET
  .gitignore
  studio/                      # Sanity Studio workspace
    sanity.config.js
    schemas/{product,review,index}.js
  src/
    main.jsx                   # ReactDOM root
    App.jsx                    # Router + context providers + layout shell
    index.css                  # tokens (CSS vars) + base/reset
    icons.jsx                  # all SVG icon components
    lib/
      cms.js                   # data layer (Sanity-or-local)
      sanityClient.js
      format.js                # currency + helpers
      filters.js               # pure filter/sort logic
    data/
      products.js              # local seed (fallback)
      reviews.js
    context/
      CartContext.jsx
      WishlistContext.jsx
      UIContext.jsx
    components/
      Header.jsx, Footer.jsx, ProductCard.jsx, ProductGrid.jsx,
      FilterPanel.jsx, SortDropdown.jsx, CartDrawer.jsx,
      QuickViewModal.jsx, Rating.jsx, SizePicker.jsx,
      ColorSwatch.jsx, QtyStepper.jsx, Skeleton.jsx, EmptyState.jsx
    pages/
      HomePage.jsx, ShopPage.jsx, ProductPage.jsx, CartPage.jsx,
      CheckoutPage.jsx, OrderConfirmationPage.jsx, WishlistPage.jsx,
      SearchPage.jsx, NotFoundPage.jsx
  src/__tests__/               # Vitest specs
```

## Error / Empty / Loading States

- **Loading:** skeleton placeholders for product grid and product detail.
- **Empty:** dedicated empty states for cart, wishlist, no search results, no filter matches.
- **Error:** CMS fetch failure falls back to seed data silently (logged to console); 404 route for unknown URLs.

## Testing Plan

- **Unit (Vitest):** cart reducer (add/remove/qty/clear/totals), wishlist reducer (toggle/persist), filter & sort logic (`filters.js`), currency formatting (`format.js`).
- **Component (React Testing Library):** ProductCard (renders price/sale, wishlist toggle), FilterPanel (updates URL params), checkout form validation (errors on invalid input, success path).
- Tests focus on logic and critical interactions, not exhaustive coverage.

## Success Criteria

- `npm run dev` works immediately with no Sanity setup (seed data).
- Full happy path works: browse → filter/sort → product detail → add to cart → checkout → confirmation.
- Wishlist, search, quick-view, and reviews all functional.
- Layout is correct and usable on iPhone, iPad, and laptop widths, using flexbox only.
- Connecting Sanity (env vars + `npm run studio`) swaps the data source with no UI changes.

## Open Items / Future (Out of Scope for v1)

- Stripe test-mode integration (payment step is built behind a clear boundary so it can be added later).
- User accounts, persisted server-side orders, inventory decrements.
- Internationalization / multi-currency.
