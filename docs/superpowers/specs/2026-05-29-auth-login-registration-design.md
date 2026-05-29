# Auth: Login & Registration — Design Spec

**Date:** 2026-05-29
**Status:** Approved (pending written-spec review)
**Purpose:** Add email-based login, registration, and account features to the B2B storefront, with full validation rules.

## Goal

Give the storefront fully functional email auth — register, log in, log out, a persistent session, protected routes, an account page with order history, a simulated password reset, and a password strength meter — with thorough, accessible validation. It must run with zero backend (consistent with the rest of the app) and follow the existing design system (flexbox-only, flat CSS tokens).

## Approach & Non-Goals

- **Client-side auth.** Users and sessions live in `localStorage`. Passwords are hashed (Web Crypto SHA-256 + a random per-user salt) and **never stored in plaintext**.
- **Documented limitation:** because there is no server, this is a portfolio demo, not production-grade security (client-side hashing can't be truly secure). The auth layer is kept behind a clean interface so a real provider (e.g. Supabase) can replace it later without touching the UI.
- **Login is optional.** It never blocks browsing or checkout; guest checkout is unchanged.
- Non-goals: real email delivery, OAuth/social login, server sessions, multi-device sync.

## Architecture

### Pure logic — `src/lib/auth.js`
- `validateEmail(email)` → boolean (shared email regex).
- `passwordStrength(pw)` → `{ score: 0–4, label }` from length + character variety (length ≥ 8, lowercase, uppercase, number, symbol).
- `validateRegister(values, existingEmails)` → errors object. Rules: `name` required; `email` required + valid format + not already in `existingEmails`; `password` required + ≥ 8 chars + ≥ 1 letter + ≥ 1 number; `confirm` must equal `password`.
- `validateLogin(values)` → errors object (email valid, password present).
- `genSalt()` → random hex string (Web Crypto `getRandomValues`).
- `hashPassword(password, salt)` → async, returns hex digest (Web Crypto `subtle.digest('SHA-256', salt + password)`). Deterministic for a given (password, salt).

### Storage — `src/lib/userStore.js`
- Users under key `b2b_users` (array of `{ id, name, email, salt, passwordHash, createdAt }`).
- Per-user orders under key `b2b_orders` (object map `{ [userId]: Order[] }`).
- Functions: `getUsers()`, `findUserByEmail(email)`, `saveUser(user)`, `updateUserPassword(email, salt, passwordHash)`, `getUserOrders(userId)`, `addUserOrder(userId, order)`.

### State — `src/context/AuthContext.jsx`
- Holds `user` (session shape `{ id, name, email }` — never the hash), `isAuthenticated`, and `loading`.
- Actions (async where hashing is involved):
  - `register({ name, email, password, confirm })` → validate → check duplicate → `genSalt` + `hashPassword` → `saveUser` → start session. Returns `{ ok, errors }`.
  - `login({ email, password })` → find user → hash input with stored salt → compare → start session or return a single neutral error `{ form: 'Email or password is incorrect' }`.
  - `logout()` → clear session.
  - `resetPassword({ email, password, confirm })` → if email exists, set new salt+hash; else neutral error.
- Session persists to `b2b_session`; restored on mount.
- Mounted **outermost** in the provider tree (`AuthProvider > CartProvider > WishlistProvider > UIProvider`) so header, checkout, and account can consume it.

### Routing & protection
- New routes: `/login`, `/register`, `/forgot-password`, `/account`.
- `src/components/RequireAuth.jsx` wraps protected elements; if not authenticated, it redirects to `/login` (preserving intended destination is out of scope — redirect to `/login` is enough).
- Only `/account` is protected. Checkout remains open to guests.

## Components / Pages
- `src/components/PasswordField.jsx` — labeled password input with an eye show/hide toggle and an optional strength bar (driven by `passwordStrength`).
- `src/components/RequireAuth.jsx` — auth gate/redirect.
- `src/pages/LoginPage.jsx` — email + password (show/hide), submit, links to register and forgot-password, neutral failure error.
- `src/pages/RegisterPage.jsx` — name, email, password (+ strength), confirm; inline rule errors; on success, logs in and redirects home.
- `src/pages/ForgotPasswordPage.jsx` — enter email; if it exists, show set-new-password fields; on success, confirmation + link to login. (Simulated; no email is sent.)
- `src/pages/AccountPage.jsx` — protected; shows name/email, a logout button, and order history (order number, date, item count, total) from `getUserOrders`.
- New icons in `src/icons.jsx`: `User`, `Eye`, `EyeOff`.

## Header & checkout integration
- **Header:** add a user action in `header__actions`. When authenticated, it links to `/account` and shows the user's first name/initial; otherwise it links to `/login` ("Sign in"). Works within the existing mobile/desktop header layout.
- **Checkout:** if authenticated, prefill the shipping `email` and `name` from the session. On placing an order, in addition to the existing `b2b_last_order` write, append the order to the user's order list via `addUserOrder`. Guest behavior is unchanged.

## Validation & error handling
- Standard rules (above), enforced in `auth.js` and surfaced inline with `aria-invalid` + error text, matching the checkout form pattern (errors on blur and on submit).
- Login and reset use neutral messaging to avoid revealing whether an email is registered.
- Empty/edge states: account with no orders shows an empty state; reset for an unknown email shows the neutral message.

## Styling
- Auth screens use a centered card (`.auth`) reusing `.field`, `.form`, `.btn`. Add styles for the card, the password eye toggle, and the strength bar. **Flexbox only — no CSS Grid.** Tokens from `:root` (off-white / ink / accent).

## Testing
- Vitest (pure logic + storage):
  - `validateEmail` (valid/invalid).
  - `passwordStrength` (weak → strong scoring).
  - `validateRegister` (missing fields, bad email, weak password, mismatch, duplicate email, happy path).
  - `validateLogin` (missing/invalid, valid).
  - `hashPassword` (same password+salt → same hash; different salt → different hash; output is hex, not the original).
  - `userStore` save/find/orders round-trip via jsdom `localStorage`.

## localStorage keys
`b2b_users`, `b2b_session`, `b2b_orders` (in addition to existing `b2b_cart`, `b2b_wishlist`, `b2b_last_order`).

## Success Criteria
- Register with valid input creates a user (hashed password), logs in, and persists across reload.
- Invalid input shows the correct inline errors; duplicate email is blocked; wrong login credentials show the neutral error.
- `/account` is reachable only when signed in; logout returns to a signed-out state.
- A signed-in user's checkout prefills their details and their order appears in account order history.
- Show/hide toggle and strength meter work; simulated reset lets an existing user set a new password and log in with it.
- App still builds, all tests pass, and no CSS Grid is used.
