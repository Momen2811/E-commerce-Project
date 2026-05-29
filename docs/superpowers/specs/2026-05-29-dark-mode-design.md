# Dark / Light Mode Toggle — Design Spec

**Date:** 2026-05-29
**Status:** Approved (pending written-spec review)
**Purpose:** Add a dark/light theme toggle to the B2B storefront.

## Goal

Let visitors switch between light and dark themes with a header toggle. On first visit the theme follows the OS preference (`prefers-color-scheme`); once the user toggles, their choice is remembered across visits. No layout changes — theming is driven entirely by the existing CSS custom-property tokens. No flash of the wrong theme on load.

## Approach & Non-Goals

- Theme is a `data-theme` attribute on `<html>` (`"light"` | `"dark"`), driving token overrides in CSS.
- The current design already centralizes colors as `:root` tokens, so dark mode is a token override plus a small number of targeted component fixes.
- Non-goals: per-component theme settings, more than two themes, server-side persistence, animated theme transitions.

## Architecture

### Tokens — `src/index.css`
- `:root` gets `color-scheme: light` (existing tokens unchanged).
- New `[data-theme="dark"]` block overrides:
  - `--bg: #121212`, `--ink: #f2f2ef` (primary text), `--surface: #1c1c1c`, `--line: #2e2e2e`, `--muted: #9a9a9a`, `--accent: #f0853c` (brand orange, brightened slightly for dark contrast), `color-scheme: dark`.
- **Targeted dark-mode overrides** for spots that use `--ink` as a *dark fill with light text* (because `--ink` flips to light in dark mode):
  - `.hero`, `.footer` → keep a near-black background (`#000`); their text is already hard-coded light, so it stays readable.
  - `.badge--new`, `.size-chip.is-active`, `.step.is-done .step__num`, `.card__quickview` → these now render as a light fill; override their text `color` to `#0a0a0a` so the label stays readable (an inverted-emphasis look).
- All overrides verified visually (Quick Look render) before commit.

### Pure logic — `src/lib/theme.js`
- `THEME_KEY = 'b2b_theme'`.
- `resolveInitialTheme(stored, prefersDark)` → returns `stored` when it is `'light'`/`'dark'`; otherwise `prefersDark ? 'dark' : 'light'`. (Pure, fully unit-testable.)

### State — `src/context/ThemeContext.jsx`
- On mount, reads `document.documentElement.dataset.theme` (set by the no-flash script) as the initial value, falling back to `resolveInitialTheme`.
- `toggleTheme()` flips light/dark, sets `document.documentElement.dataset.theme`, and writes `localStorage[THEME_KEY]`.
- Exposes `{ theme, toggleTheme }` via `useTheme()`. Mounted in the provider tree in `App.jsx` (outside or alongside the other providers — order doesn't matter since it only touches the document element).

### No-flash — `index.html`
- A small inline script in `<head>` runs before React: reads `localStorage['b2b_theme']`; if absent, uses `matchMedia('(prefers-color-scheme: dark)')`; sets `document.documentElement.dataset.theme` accordingly. This prevents a light→dark flash on first paint.

### Toggle — `src/components/ThemeToggle.jsx`
- A button in the header actions cluster. Shows `Icon.Moon` in light mode (click → dark) and `Icon.Sun` in dark mode (click → light). `aria-label` reflects the action; `aria-pressed` reflects dark state. Uses the existing `.icon-btn` style. New icons `Sun`, `Moon` added to `src/icons.jsx`.

## Components / Files
- Create: `src/lib/theme.js`, `src/lib/theme.test.js`, `src/context/ThemeContext.jsx`, `src/components/ThemeToggle.jsx`.
- Modify: `src/index.css` (dark tokens + overrides), `src/icons.jsx` (Sun/Moon), `index.html` (no-flash script), `src/App.jsx` (mount `ThemeProvider`), `src/components/Header.jsx` (place `ThemeToggle`).

## Testing
- Vitest for `resolveInitialTheme`: returns `'dark'`/`'light'` when stored; ignores an invalid stored value and falls back to the system preference (`prefersDark` true → `'dark'`, false → `'light'`).

## Styling
- **Flexbox only — no CSS Grid.** No layout changes; only color tokens and a header button.

## Success Criteria
- First visit matches the OS theme; toggling switches instantly and persists across reloads.
- No flash of the wrong theme on load.
- Both themes are readable across all pages (catalog, product, cart, checkout, account, auth) — hero/footer stay dark, emphasis chips/badges stay legible, the accent stays on-brand.
- App builds, tests pass, no CSS Grid.

## localStorage keys
`b2b_theme` (in addition to existing `b2b_cart`, `b2b_wishlist`, `b2b_last_order`, `b2b_users`, `b2b_session`, `b2b_orders`).
