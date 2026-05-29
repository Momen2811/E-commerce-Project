# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

B2B — a fashion e-commerce storefront (React 18 + Vite) built as a freelance portfolio piece. JavaScript only (no TypeScript, intentional). It was built in phases; all are now merged on `main`:

1. **Catalog** — home, shop with filters + sorting, product detail.
2. **Cart, wishlist & checkout** — slide-in cart drawer, cart/wishlist pages, multi-step simulated checkout (no real payments).
3. **Search, quick-view, reviews & Sanity** — search results, quick-view modal, product ratings/reviews, optional live Sanity CMS.
4. **Auth** — client-side email login/registration, protected account page with per-user order history.
5. **Dark/light mode** — header toggle, follows OS on first visit, remembers choice.

Each phase has a spec in `docs/superpowers/specs/` and a step-by-step plan in `docs/superpowers/plans/`.

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173 (HMR)
npm run build        # production build → dist/
npm run preview      # serve the production build
npm test             # run the full Vitest suite once
npm test -- cart     # run a single test file by name substring (e.g. cart, checkout, auth, theme)
npm run test:watch   # Vitest in watch mode
npm run studio       # run the Sanity Studio (requires `cd studio && npm install` first)
```

There is no linter configured.

## Hard constraints

- **Flexbox only — never CSS Grid.** All layout uses `display:flex` (+ `flex-wrap`, `flex-basis`, media-query breakpoints). Do not introduce `display:grid`, `grid-template-*`, etc. Verify with: `grep -rn "display: *grid\|grid-template" src/`.
- **No TypeScript.** Keep everything plain `.js`/`.jsx`.
- **Logo is real brand artwork, not a recreation.** `public/logo.png` (dark wordmark, header), `public/logo-footer.png` (white wordmark, dark footer), and `public/logo-mark.png` (favicon) were extracted from the brand PDF. Don't replace them with hand-drawn SVG.

## Architecture

**Single-page app.** `src/main.jsx` mounts `<BrowserRouter><App/></BrowserRouter>`. `src/App.jsx` wraps the layout in five context providers (`ThemeProvider` → `AuthProvider` → `CartProvider` → `WishlistProvider` → `UIProvider`), defines all routes, and mounts the global `<CartDrawer/>` and `<QuickViewModal/>`. `/account` is wrapped in `<RequireAuth>`. Pages live in `src/pages/`, shared components in `src/components/`.

**Data layer is a single seam.** `src/lib/cms.js` is the *only* module the UI imports for product/review data (`getProducts`, `getProductBySlug`, `getFeatured`, `getReviews`). It returns local seed data from `src/data/` by default; when `VITE_SANITY_PROJECT_ID` is set it dynamically imports `src/lib/sanityClient.js` and queries Sanity instead — **both paths return the identical shape**. Filtering/sorting/search run client-side in pages via `src/lib/filters.js` and `src/lib/search.js`, not in the data layer.

**Pure logic is separated from React for testability.** Reducers and helpers live in `src/lib/` and are unit-tested directly (`cart.js`, `wishlist.js`, `checkout.js`, `filters.js`, `format.js`, `search.js`, `reviews.js`, `auth.js`, `userStore.js`, `theme.js`). The matching contexts in `src/context/` are thin wrappers: they run the logic, expose action helpers + derived selectors, and persist to `localStorage`. **When adding state logic, put the pure part in `src/lib/` (with a test) and wire it through a context.**

- **Cart:** line items keyed by `lineId(productId, size, color)` so the same product in different size/color is a separate line. Key `b2b_cart`.
- **Wishlist:** stores product ids only; pages resolve them against `getProducts()`. Key `b2b_wishlist`.
- **UI context:** cart-drawer open/close + the active quick-view product.
- **Checkout:** `src/lib/checkout.js` holds validation, card/expiry formatting, shipping/total math, and `createOrder()`. The placed order is written to `b2b_last_order` (confirmation page) and, if signed in, appended to the user's history via `addUserOrder`.
- **Auth (client-side, demo):** `src/lib/auth.js` (validation, password strength, Web Crypto SHA-256 + per-user salt hashing) + `src/lib/userStore.js` (users/orders in `localStorage`) behind `AuthContext`. Passwords are never stored in plaintext, but this is a portfolio demo — not production-secure (no server). Keys `b2b_users`, `b2b_session`, `b2b_orders`.
- **Theme:** `src/lib/theme.js` (`resolveInitialTheme`) + `ThemeContext` set a `data-theme` attribute on `<html>`; CSS `[data-theme="dark"]` overrides the `:root` tokens. An inline script in `index.html` sets the theme before paint (no flash). Key `b2b_theme`.

**Styling.** One flat stylesheet `src/index.css`. Design tokens are CSS custom properties on `:root` (`--bg`, `--ink`, `--accent`, etc.), overridden under `[data-theme="dark"]`. Class names are BEM-lite (`.card__media`, `.header__nav.is-open`). Responsive: product tiles change `flex-basis` per breakpoint (4-up ≥1025 / 3-up ≤1024 / 2-up ≤768/≤480); header collapses to a hamburger dropdown (search lives inside the menu on mobile); filters, cart, and modals are flex-based overlays. **Dark-mode caveat:** a few elements use `--ink` as a *dark fill* (hero, footer, "New" badge, active size-chip, quick-view button) — they have targeted `[data-theme="dark"]` overrides so they stay readable when `--ink` flips light.

**Icons.** All SVGs are in `src/icons.jsx` as `Icon.Search`, `Icon.Heart`, `Icon.Sun`, etc. Add new icons there; never inline SVG elsewhere.

**Routes:** `/`, `/shop`, `/shop/:audience`, `/product/:slug`, `/cart`, `/wishlist`, `/search`, `/checkout`, `/order-confirmation`, `/login`, `/register`, `/forgot-password`, `/account` (protected), `*` (404).

## Git workflow

Work goes on a `phase-N-*` (or feature) branch and is merged to `main` via PR (`origin` = github.com/Momen2811/E-commerce-Project). Branching off `main` (which only fast-forwards) keeps merges clean. Commits are small and frequent (one per plan task), TDD-first for logic modules. The untracked `.agents/` and `skills-lock.json` are local tooling files — leave them.

## Sanity (optional CMS)

The storefront runs on local seed data by default. To use the live CMS:
- **App:** copy `.env.example` to `.env` and set `VITE_SANITY_PROJECT_ID` (+ dataset). `src/lib/cms.js` then dynamically imports `src/lib/sanityClient.js` and queries Sanity; otherwise it returns seed data. Both paths return the identical shape, so no UI changes are needed.
- **Studio:** `cd studio && npm install`, set the project id in `studio/sanity.config.js` (or `SANITY_STUDIO_PROJECT_ID`), then `npm run studio` from the root. Schemas in `studio/schemas/` mirror the seed shape in `src/data/`.
