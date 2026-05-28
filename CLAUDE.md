# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

B2B — a fashion e-commerce storefront (React 18 + Vite) built as a freelance portfolio piece. JavaScript only (no TypeScript, intentional). It is being built in phases; each phase has a spec and a plan under `docs/superpowers/`.

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173 (HMR)
npm run build        # production build → dist/
npm run preview      # serve the production build
npm test             # run the full Vitest suite once
npm test -- cart     # run a single test file by name substring (e.g. cart, checkout, filters)
npm run test:watch   # Vitest in watch mode
```

There is no linter configured.

## Hard constraints

- **Flexbox only — never CSS Grid.** All layout uses `display:flex` (+ `flex-wrap`, `flex-basis`, media-query breakpoints). Do not introduce `display:grid`, `grid-template-*`, etc. Verify with: `grep -rn "display: *grid\|grid-template" src/`.
- **No TypeScript.** Keep everything plain `.js`/`.jsx`.
- **Logo is real brand artwork, not a recreation.** `public/logo.png` (dark wordmark, header), `public/logo-footer.png` (white wordmark, dark footer), and `public/logo-mark.png` (favicon) were extracted from the brand PDF. Don't replace them with hand-drawn SVG.

## Architecture

**Single-page app.** `src/main.jsx` mounts `<BrowserRouter><App/></BrowserRouter>`. `src/App.jsx` wraps the layout in three context providers (`CartProvider` → `WishlistProvider` → `UIProvider`), defines all routes, and mounts the global `<CartDrawer/>`. Pages live in `src/pages/`, shared components in `src/components/`.

**Data layer is a single seam.** `src/lib/cms.js` is the *only* module the UI imports for product data (`getProducts`, `getProductBySlug`, `getFeatured`). It currently returns local seed data from `src/data/products.js`; the Sanity branch (gated on `VITE_SANITY_PROJECT_ID`) is planned for Phase 3 and must return the **identical product shape**. Filtering/sorting is done client-side in pages via `src/lib/filters.js`, not in the data layer.

**Pure logic is separated from React for testability.** Reducers and helpers live in `src/lib/` and are unit-tested directly (`cart.js`, `wishlist.js`, `checkout.js`, `filters.js`, `format.js`). The matching contexts in `src/context/` are thin wrappers: they run the reducer via `useReducer`, expose action helpers + derived selectors, and persist to `localStorage`. When adding state logic, put the pure part in `src/lib/` (with a test) and wire it through the context.

- **Cart:** line items are keyed by `lineId(productId, size, color)` so the same product in different size/color is a separate line. localStorage key `b2b_cart`.
- **Wishlist:** stores product ids only; pages resolve them against `getProducts()`. Key `b2b_wishlist`.
- **UI context:** just the cart-drawer open/close state.
- **Checkout:** `src/lib/checkout.js` holds validation, input formatting, shipping/total math, and `createOrder()`. The placed order is written to `localStorage` key `b2b_last_order`, which the confirmation page reads.

**Styling.** One flat stylesheet `src/index.css`. Design tokens are CSS custom properties on `:root` (`--bg` off-white, `--ink` near-black, `--accent` brand orange, etc.). Class names are BEM-lite (`.card__media`, `.header__nav.is-open`). Responsive: product tiles change `flex-basis` per breakpoint (4-up ≥1025 / 3-up ≤1024 / 2-up ≤768/≤480); header collapses to a hamburger dropdown (search lives inside the menu on mobile); filters and cart become slide-in drawers.

**Icons.** All SVGs are in `src/icons.jsx` as `Icon.Search`, `Icon.Heart`, etc. Add new icons there; never inline SVG elsewhere.

## Phased delivery & git workflow

Specs are in `docs/superpowers/specs/` and step-by-step plans in `docs/superpowers/plans/`. Phase 1 (catalog: home, shop with filters/sort, product detail) is on `main`. Phase 2 (cart, wishlist, multi-step simulated checkout) is built on `phase-2-cart-checkout`. Phase 3 (search results, quick-view modal, product reviews, live Sanity client + Studio) is planned.

Work for each phase goes on a `phase-N-*` branch and is merged via PR (`origin` = github.com/Momen2811/E-commerce-Project). Commits are small and frequent (one per plan task), TDD-first for logic modules.

## Sanity (optional CMS)

The storefront runs on local seed data by default. To use the live CMS:
- **App:** copy `.env.example` to `.env` and set `VITE_SANITY_PROJECT_ID` (+ dataset). `src/lib/cms.js` then dynamically imports `src/lib/sanityClient.js` and queries Sanity; otherwise it returns seed data. Both paths return the identical shape, so no UI changes are needed.
- **Studio:** `cd studio && npm install`, set the project id in `studio/sanity.config.js` (or `SANITY_STUDIO_PROJECT_ID`), then `npm run studio` from the root. Schemas in `studio/schemas/` mirror the seed shape in `src/data/`.
