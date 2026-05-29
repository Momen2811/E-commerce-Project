# B2B Storefront — Phase 5: Dark / Light Mode — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a header sun/moon toggle that switches the storefront between light and dark themes, defaulting to the OS preference on first visit and remembering the user's choice, with no flash of the wrong theme.

**Architecture:** Theme is a `data-theme` attribute on `<html>` driving CSS token overrides. A pure `resolveInitialTheme` decides the starting theme; `ThemeContext` applies/persists it; an inline `<head>` script sets it before React renders. No layout change — **flexbox only, no CSS Grid.**

**Tech Stack:** React 18, Vite 5, React Router v6, Vitest, plain CSS custom properties. JavaScript only.

**Builds on:** Phases 1–4 (on `main`). Reuses the `:root` token system, the provider pattern, `.icon-btn` styles, and `src/icons.jsx`.

**New localStorage key:** `b2b_theme` (`'light'` | `'dark'`).

---

### Task 1: Theme resolution logic (TDD)

**Files:**
- Create: `src/lib/theme.js`
- Test: `src/lib/theme.test.js`

- [ ] **Step 1: Write the failing test `src/lib/theme.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { resolveInitialTheme, THEME_KEY } from './theme.js'

describe('resolveInitialTheme', () => {
  it('uses a stored dark theme', () => { expect(resolveInitialTheme('dark', false)).toBe('dark') })
  it('uses a stored light theme', () => { expect(resolveInitialTheme('light', true)).toBe('light') })
  it('falls back to system (dark) when nothing is stored', () => { expect(resolveInitialTheme(null, true)).toBe('dark') })
  it('falls back to system (light) when nothing is stored', () => { expect(resolveInitialTheme(undefined, false)).toBe('light') })
  it('ignores an invalid stored value and uses system', () => { expect(resolveInitialTheme('weird', true)).toBe('dark') })
})

describe('THEME_KEY', () => {
  it('is the storage key', () => { expect(THEME_KEY).toBe('b2b_theme') })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- "lib/theme"`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/theme.js`**

```js
export const THEME_KEY = 'b2b_theme'

export function resolveInitialTheme(stored, prefersDark) {
  if (stored === 'light' || stored === 'dark') return stored
  return prefersDark ? 'dark' : 'light'
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- "lib/theme"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme.js src/lib/theme.test.js
git commit -m "feat: add theme resolution logic"
```

---

### Task 2: Dark-mode tokens and targeted overrides

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add `color-scheme` to `:root`** — change the existing first line of the `:root` block:

Change:
```css
:root {
  --bg: #f2f2ef;
```
to:
```css
:root {
  color-scheme: light;
  --bg: #f2f2ef;
```

- [ ] **Step 2: Append the dark theme block at the very end of `src/index.css`**

```css
/* ===== Phase 5: dark theme ===== */
[data-theme="dark"] {
  color-scheme: dark;
  --bg: #121212;
  --ink: #f2f2ef;
  --surface: #1c1c1c;
  --line: #2e2e2e;
  --muted: #9a9a9a;
  --accent: #f0853c;
}

/* Sections that use --ink as a dark fill stay dark (text is already light) */
[data-theme="dark"] .hero,
[data-theme="dark"] .footer { background: #000; }

/* Emphasis chips/badges whose fill (--ink) becomes light: flip their text to dark.
   NOTE: do NOT add .step.is-active .step__num here — its background is --accent and keeps white text. */
[data-theme="dark"] .badge--new,
[data-theme="dark"] .size-chip.is-active,
[data-theme="dark"] .step.is-done .step__num,
[data-theme="dark"] .card__quickview { color: #0a0a0a; }

/* Body copy that was hard-coded dark grey: lighten on dark backgrounds */
[data-theme="dark"] .pdp__desc,
[data-theme="dark"] .pdp__meta,
[data-theme="dark"] .review__body,
[data-theme="dark"] .review__block p { color: #c9c9c9; }
```

- [ ] **Step 2b: Verify no CSS Grid was introduced**

Run: `grep -n "display: *grid\|grid-template\|grid-area" src/index.css`
Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add dark theme tokens and readability overrides"
```

---

### Task 3: Sun and Moon icons

**Files:**
- Modify: `src/icons.jsx`

- [ ] **Step 1: Add these entries inside the `Icon = { ... }` object** (after the `EyeOff` entry, before the closing `}`)

```jsx
  Sun: (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" /><line x1="4.9" y1="4.9" x2="7" y2="7" /><line x1="17" y1="17" x2="19.1" y2="19.1" /><line x1="4.9" y1="19.1" x2="7" y2="17" /><line x1="17" y1="7" x2="19.1" y2="4.9" /></svg>),
  Moon: (p) => (<svg {...base} {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>),
```

- [ ] **Step 2: Commit**

```bash
git add src/icons.jsx
git commit -m "feat: add sun and moon icons"
```

---

### Task 4: ThemeContext

**Files:**
- Create: `src/context/ThemeContext.jsx`

- [ ] **Step 1: Write `src/context/ThemeContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { THEME_KEY, resolveInitialTheme } from '../lib/theme.js'

const ThemeCtx = createContext(null)

function getInitial() {
  if (typeof document !== 'undefined' && document.documentElement.dataset.theme) {
    return document.documentElement.dataset.theme
  }
  let stored = null
  try { stored = localStorage.getItem(THEME_KEY) } catch { /* ignore */ }
  const prefersDark = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return resolveInitialTheme(stored, prefersDark)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitial)

  useEffect(() => {
    try { document.documentElement.dataset.theme = theme } catch { /* ignore */ }
  }, [])

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try { document.documentElement.dataset.theme = next } catch { /* ignore */ }
      try { localStorage.setItem(THEME_KEY, next) } catch { /* ignore */ }
      return next
    })
  }

  const value = { theme, toggleTheme }
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/ThemeContext.jsx
git commit -m "feat: add ThemeContext (apply + persist data-theme)"
```

---

### Task 5: No-flash inline script

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the inline script in `<head>`** — insert it right after the opening `<title>...</title>` line:

```html
    <script>
      (function () {
        try {
          var t = localStorage.getItem('b2b_theme');
          if (t !== 'light' && t !== 'dark') {
            t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          document.documentElement.dataset.theme = t;
        } catch (e) {}
      })();
    </script>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: set initial theme before paint to avoid flash"
```

---

### Task 6: ThemeToggle component

**Files:**
- Create: `src/components/ThemeToggle.jsx`

- [ ] **Step 1: Write `src/components/ThemeToggle.jsx`**

```jsx
import { useTheme } from '../context/ThemeContext.jsx'
import { Icon } from '../icons.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Icon.Sun /> : <Icon.Moon />}
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThemeToggle.jsx
git commit -m "feat: add ThemeToggle button"
```

---

### Task 7: Wire ThemeProvider and place the toggle

**Files:**
- Modify: `src/App.jsx`, `src/components/Header.jsx`

- [ ] **Step 1: Wrap the app in `ThemeProvider`** — in `src/App.jsx`, add the import:

```jsx
import { ThemeProvider } from './context/ThemeContext.jsx'
```

Then make `ThemeProvider` the outermost provider. Change:
```jsx
  return (
    <AuthProvider>
```
to:
```jsx
  return (
    <ThemeProvider>
    <AuthProvider>
```
and change the matching closing:
```jsx
    </AuthProvider>
  )
}
```
to:
```jsx
    </AuthProvider>
    </ThemeProvider>
  )
}
```

- [ ] **Step 2: Add the toggle to the header** — in `src/components/Header.jsx`, add the import:

```jsx
import ThemeToggle from './ThemeToggle.jsx'
```

Then render it as the first child of `.header__actions`. Change:
```jsx
        <div className="header__actions">
          <Link
            to={isAuthenticated ? '/account' : '/login'}
```
to:
```jsx
        <div className="header__actions">
          <ThemeToggle />
          <Link
            to={isAuthenticated ? '/account' : '/login'}
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`. Confirm: a sun/moon button appears in the header; clicking it flips the whole site between light and dark; reload keeps the chosen theme; clear `localStorage` and reload to confirm it follows your OS setting with no flash. Check a product page (reviews readable), checkout, and the account/auth cards in dark mode. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/components/Header.jsx
git commit -m "feat: mount ThemeProvider and add theme toggle to header"
```

---

### Task 8: Full verification pass

**Files:** none

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass — Phases 1–4 plus `lib/theme`.

- [ ] **Step 2: Verify no CSS Grid**

Run: `grep -rn "display: *grid\|grid-template\|grid-area\|grid-column\|grid-row" src/`
Expected: no matches.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 4: Dark-mode readability check (browser)**

Run: `npm run dev`. In dark mode walk: home (hero stays dark, cards/text readable), shop (cards + filters), product (price, swatches, size chips, rating stars, reviews body text), cart/checkout (form fields, summary, step indicator), account + auth cards, footer. Confirm nothing renders dark-on-dark or light-on-light. Toggle back to light and confirm it's unchanged from before. Stop the server.

- [ ] **Step 5: Confirm clean tree**

Run: `git status` — expect only untracked tooling files (`.agents/`, `skills-lock.json`).

---

## Self-Review

**Spec coverage:**
- `resolveInitialTheme` + `THEME_KEY` (system fallback, remember choice) → Task 1. ✓
- Dark tokens + `color-scheme` + targeted `--ink`-fill and dark-text overrides → Task 2. ✓
- Sun/Moon icons → Task 3. ✓
- ThemeContext (apply `data-theme`, persist, `useTheme`) → Task 4, mounted Task 7. ✓
- No-flash inline script → Task 5. ✓
- Header sun/moon toggle, accessible → Tasks 6, 7. ✓
- Testing (`resolveInitialTheme`) → Task 1. ✓
- Flexbox-only / no layout change → Tasks 2, 8. ✓

**Placeholder scan:** No "TBD"/"TODO". Task 2 contains a self-correcting note that explicitly states the final selector list to use (excluding `.step.is-active`); the corrected block is unambiguous.

**Type/name consistency:** `resolveInitialTheme(stored, prefersDark)` and `THEME_KEY` (theme.js) ↔ ThemeContext + test. `useTheme()` exposes `{ theme, toggleTheme }` ↔ ThemeToggle. `data-theme` attribute name is consistent across the no-flash script (`index.html`), ThemeContext, and the CSS selectors (`[data-theme="dark"]`). `localStorage` key `b2b_theme` matches between the inline script, `THEME_KEY`, and the spec. New `Icon.Sun`/`Icon.Moon` ↔ ThemeToggle. `ThemeProvider` is outermost in `App.jsx`; `ThemeToggle` (a `useTheme` consumer) renders inside it via the Header.
