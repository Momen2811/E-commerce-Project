# B2B Storefront — Phase 4: Login & Registration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email login, registration, logout, a persistent session, protected `/account` with per-user order history, a simulated password reset, and a password strength meter — all client-side with full validation.

**Architecture:** Pure logic (validation, password strength, Web Crypto hashing) lives in `src/lib/auth.js`; `localStorage` persistence for users/orders in `src/lib/userStore.js`. `AuthContext` wraps them and is mounted outermost. Auth UI reuses the existing form/token styles. Passwords are hashed (SHA-256 + per-user salt), never stored plaintext. **Flexbox only — never CSS Grid.**

**Tech Stack:** React 18, Vite 5, React Router v6, Vitest + RTL, Web Crypto API, plain CSS. JavaScript only.

**Builds on:** Phases 1–3 (on `main`). Reuses `format.js` (`formatPrice`), `.field`/`.form`/`.btn` styles, `Icon`, the provider pattern, and the existing checkout order shape (`orderNumber`, `placedAt`, `items[]`, `total`).

**New localStorage keys:** `b2b_users`, `b2b_session`, `b2b_orders`.

**User record:** `{ id, name, email, salt, passwordHash, createdAt }`. **Session:** `{ id, name, email }` (no hash).

---

### Task 1: Auth logic — validation, strength, hashing (TDD)

**Files:**
- Create: `src/lib/auth.js`
- Test: `src/lib/auth.test.js`

- [ ] **Step 1: Write the failing test `src/lib/auth.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { validateEmail, passwordStrength, validateRegister, validateLogin, genSalt, hashPassword } from './auth.js'

describe('validateEmail', () => {
  it('accepts a valid email', () => { expect(validateEmail('a@b.com')).toBe(true) })
  it('rejects an invalid email', () => { expect(validateEmail('nope')).toBe(false) })
})

describe('passwordStrength', () => {
  it('scores empty as 0', () => { expect(passwordStrength('').score).toBe(0) })
  it('scores a lowercase-only short pw low', () => { expect(passwordStrength('abc').score).toBe(1) })
  it('scores a strong pw 4', () => { expect(passwordStrength('Abcd1234!').score).toBe(4) })
  it('returns a label', () => { expect(typeof passwordStrength('Abcd1234!').label).toBe('string') })
})

describe('validateRegister', () => {
  const ok = { name: 'Mo', email: 'mo@b.com', password: 'abcd1234', confirm: 'abcd1234' }
  it('passes a valid form', () => { expect(validateRegister(ok, [])).toEqual({}) })
  it('requires name', () => { expect(validateRegister({ ...ok, name: '' }, []).name).toBeTruthy() })
  it('rejects a bad email', () => { expect(validateRegister({ ...ok, email: 'x' }, []).email).toBeTruthy() })
  it('blocks a duplicate email (case-insensitive)', () => {
    expect(validateRegister(ok, ['MO@B.COM']).email).toBeTruthy()
  })
  it('rejects a weak password (too short)', () => { expect(validateRegister({ ...ok, password: 'a1', confirm: 'a1' }, []).password).toBeTruthy() })
  it('rejects a password without a number', () => { expect(validateRegister({ ...ok, password: 'abcdefgh', confirm: 'abcdefgh' }, []).password).toBeTruthy() })
  it('flags a confirm mismatch', () => { expect(validateRegister({ ...ok, confirm: 'different1' }, []).confirm).toBeTruthy() })
})

describe('validateLogin', () => {
  it('passes valid', () => { expect(validateLogin({ email: 'a@b.com', password: 'x' })).toEqual({}) })
  it('requires email and password', () => {
    const e = validateLogin({})
    expect(e.email).toBeTruthy()
    expect(e.password).toBeTruthy()
  })
})

describe('hashPassword / genSalt', () => {
  it('genSalt returns a hex string', () => { expect(genSalt()).toMatch(/^[0-9a-f]+$/) })
  it('is deterministic for the same salt', async () => {
    expect(await hashPassword('secret123', 'aa')).toBe(await hashPassword('secret123', 'aa'))
  })
  it('differs by salt', async () => {
    expect(await hashPassword('secret123', 'aa')).not.toBe(await hashPassword('secret123', 'bb'))
  })
  it('produces a 64-char hex digest that is not the password', async () => {
    const h = await hashPassword('secret123', 'aa')
    expect(h).toMatch(/^[0-9a-f]{64}$/)
    expect(h).not.toContain('secret123')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- "lib/auth"`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/auth.js`**

```js
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function validateEmail(email) {
  return EMAIL_RE.test(email || '')
}

export function passwordStrength(pw = '') {
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw)) score++
  if (/[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  score = Math.min(score, 4)
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score] }
}

export function validateRegister(values = {}, existingEmails = []) {
  const e = {}
  if (!values.name || !values.name.trim()) e.name = 'Name is required'
  if (!values.email) e.email = 'Email is required'
  else if (!validateEmail(values.email)) e.email = 'Enter a valid email'
  else if (existingEmails.map((x) => x.toLowerCase()).includes(values.email.toLowerCase())) e.email = 'An account with this email already exists'
  if (!values.password) e.password = 'Password is required'
  else if (values.password.length < 8) e.password = 'Use at least 8 characters'
  else if (!/[a-zA-Z]/.test(values.password) || !/\d/.test(values.password)) e.password = 'Include at least one letter and one number'
  if (values.confirm !== values.password) e.confirm = 'Passwords do not match'
  return e
}

export function validateLogin(values = {}) {
  const e = {}
  if (!values.email) e.email = 'Email is required'
  else if (!validateEmail(values.email)) e.email = 'Enter a valid email'
  if (!values.password) e.password = 'Password is required'
  return e
}

export function genSalt(bytes = 16) {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- "lib/auth"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.js src/lib/auth.test.js
git commit -m "feat: add auth validation, password strength, and Web Crypto hashing"
```

---

### Task 2: User store (TDD)

**Files:**
- Create: `src/lib/userStore.js`
- Test: `src/lib/userStore.test.js`

- [ ] **Step 1: Write the failing test `src/lib/userStore.test.js`**

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { getUsers, findUserByEmail, saveUser, updateUserPassword, getUserOrders, addUserOrder } from './userStore.js'

beforeEach(() => { localStorage.clear() })

const user = { id: 'u1', name: 'Mo', email: 'mo@b.com', salt: 'aa', passwordHash: 'h1', createdAt: '2026-01-01' }

describe('userStore', () => {
  it('starts empty', () => { expect(getUsers()).toEqual([]) })
  it('saves and finds a user case-insensitively', () => {
    saveUser(user)
    expect(getUsers()).toHaveLength(1)
    expect(findUserByEmail('MO@B.COM').id).toBe('u1')
    expect(findUserByEmail('nobody@x.com')).toBe(null)
  })
  it('updates a password', () => {
    saveUser(user)
    updateUserPassword('mo@b.com', 'bb', 'h2')
    expect(findUserByEmail('mo@b.com').passwordHash).toBe('h2')
    expect(findUserByEmail('mo@b.com').salt).toBe('bb')
  })
  it('stores orders per user, newest first', () => {
    expect(getUserOrders('u1')).toEqual([])
    addUserOrder('u1', { orderNumber: 'A' })
    addUserOrder('u1', { orderNumber: 'B' })
    expect(getUserOrders('u1').map((o) => o.orderNumber)).toEqual(['B', 'A'])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- userStore`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/userStore.js`**

```js
const USERS_KEY = 'b2b_users'
const ORDERS_KEY = 'b2b_orders'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

export function getUsers() {
  return read(USERS_KEY, [])
}

export function findUserByEmail(email) {
  const e = (email || '').toLowerCase()
  return getUsers().find((u) => u.email.toLowerCase() === e) || null
}

export function saveUser(user) {
  const users = getUsers()
  users.push(user)
  write(USERS_KEY, users)
  return user
}

export function updateUserPassword(email, salt, passwordHash) {
  const e = (email || '').toLowerCase()
  const users = getUsers().map((u) => (u.email.toLowerCase() === e ? { ...u, salt, passwordHash } : u))
  write(USERS_KEY, users)
}

export function getUserOrders(userId) {
  return read(ORDERS_KEY, {})[userId] || []
}

export function addUserOrder(userId, order) {
  const map = read(ORDERS_KEY, {})
  map[userId] = [order, ...(map[userId] || [])]
  write(ORDERS_KEY, map)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- userStore`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/userStore.js src/lib/userStore.test.js
git commit -m "feat: add localStorage user and order store"
```

---

### Task 3: Icons (User, Eye, EyeOff)

**Files:**
- Modify: `src/icons.jsx`

- [ ] **Step 1: Add these entries inside the `Icon = { ... }` object** (after the existing `Minus` entry, before the closing `}`)

```jsx
  User: (p) => (<svg {...base} {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>),
  Eye: (p) => (<svg {...base} {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>),
  EyeOff: (p) => (<svg {...base} {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>),
```

- [ ] **Step 2: Commit**

```bash
git add src/icons.jsx
git commit -m "feat: add user and eye icons"
```

---

### Task 4: Auth styles

**Files:**
- Modify: `src/index.css` (append at the very end)

- [ ] **Step 1: Append the following CSS**

```css
/* ===== Phase 4: auth / account ===== */
.auth { display: flex; justify-content: center; padding: 48px 20px; }
.auth__card { width: 100%; max-width: 420px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 32px 28px; display: flex; flex-direction: column; gap: 18px; }
.auth__title { font-family: var(--font-display); text-transform: uppercase; margin: 0; font-size: 1.8rem; }
.auth__error { background: #fde8e3; color: #c8381f; padding: 10px 12px; border-radius: 6px; font-size: .85rem; margin: 0; }
.auth__alt { font-size: .85rem; margin: 0; text-align: center; color: var(--muted); }
.auth__alt a { color: var(--accent); font-weight: 600; }

.pw { position: relative; display: flex; align-items: center; }
.pw input { flex: 1; padding-right: 44px; }
.pw__toggle { position: absolute; right: 8px; background: none; border: 0; color: var(--muted); display: flex; padding: 6px; }
.pw__toggle:hover { color: var(--ink); }
.pw-meter { display: flex; align-items: center; gap: 8px; }
.pw-meter__bar { flex: 1; height: 6px; background: var(--line); border-radius: 999px; overflow: hidden; }
.pw-meter__fill { display: block; height: 100%; background: var(--accent); transition: width .2s ease; }
.pw-meter__label { font-size: .72rem; color: var(--muted); width: 64px; text-align: right; }
.pw-meter--0 .pw-meter__fill, .pw-meter--1 .pw-meter__fill { background: #c8381f; }
.pw-meter--2 .pw-meter__fill { background: #e0922f; }
.pw-meter--3 .pw-meter__fill, .pw-meter--4 .pw-meter__fill { background: #4a9e5c; }

.user-link { display: inline-flex; align-items: center; gap: 6px; padding: 0 10px; height: 40px; border-radius: 999px; color: var(--ink); }
.user-link:hover { background: rgba(0,0,0,.06); }
.header__user { font-size: .8rem; font-weight: 600; }

.account { padding: 28px 20px 60px; }
.account__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.account__email { color: var(--muted); margin: 4px 0 0; }
.account__sub { font-family: var(--font-display); text-transform: uppercase; font-size: 1.3rem; margin: 0 0 16px; }
.account__orders { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.account__order { display: flex; align-items: center; gap: 16px; justify-content: space-between; flex-wrap: wrap; border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px; background: var(--surface); }
.account__order-date { color: var(--muted); font-size: .8rem; margin-left: 10px; }

@media (max-width: 768px) { .header__user { display: none; } }
```

- [ ] **Step 2: Verify no CSS Grid was introduced**

Run: `grep -n "display: *grid\|grid-template\|grid-area" src/index.css`
Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add styles for auth, password field, and account"
```

---

### Task 5: AuthContext

**Files:**
- Create: `src/context/AuthContext.jsx`

- [ ] **Step 1: Write `src/context/AuthContext.jsx`**

```jsx
import { createContext, useContext, useState } from 'react'
import { validateRegister, validateLogin, validateEmail, genSalt, hashPassword } from '../lib/auth.js'
import { getUsers, findUserByEmail, saveUser, updateUserPassword } from '../lib/userStore.js'

const SESSION_KEY = 'b2b_session'
const AuthCtx = createContext(null)

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

  function startSession(record) {
    const session = { id: record.id, name: record.name, email: record.email }
    setUser(session)
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch { /* ignore */ }
    return session
  }

  async function register(values) {
    const existing = getUsers().map((u) => u.email)
    const errors = validateRegister(values, existing)
    if (Object.keys(errors).length) return { ok: false, errors }
    const salt = genSalt()
    const passwordHash = await hashPassword(values.password, salt)
    const record = {
      id: `u-${Date.now().toString(36)}`,
      name: values.name.trim(),
      email: values.email.trim(),
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    saveUser(record)
    startSession(record)
    return { ok: true, errors: {} }
  }

  async function login(values) {
    const errors = validateLogin(values)
    if (Object.keys(errors).length) return { ok: false, errors }
    const record = findUserByEmail(values.email)
    const fail = { ok: false, errors: { form: 'Email or password is incorrect' } }
    if (!record) return fail
    const hash = await hashPassword(values.password, record.salt)
    if (hash !== record.passwordHash) return fail
    startSession(record)
    return { ok: true, errors: {} }
  }

  function logout() {
    setUser(null)
    try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
  }

  async function resetPassword(values) {
    const errors = {}
    if (!values.email || !validateEmail(values.email)) errors.email = 'Enter a valid email'
    if (!values.password || values.password.length < 8 || !/[a-zA-Z]/.test(values.password) || !/\d/.test(values.password)) {
      errors.password = 'Use at least 8 characters, with a letter and a number'
    }
    if (values.confirm !== values.password) errors.confirm = 'Passwords do not match'
    if (Object.keys(errors).length) return { ok: false, errors }
    const record = findUserByEmail(values.email)
    if (!record) return { ok: false, errors: { form: "We couldn't find an account with that email." } }
    const salt = genSalt()
    const passwordHash = await hashPassword(values.password, salt)
    updateUserPassword(record.email, salt, passwordHash)
    return { ok: true, errors: {} }
  }

  const value = { user, isAuthenticated: !!user, register, login, logout, resetPassword }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/AuthContext.jsx
git commit -m "feat: add AuthContext (register/login/logout/reset, session persistence)"
```

---

### Task 6: PasswordField and RequireAuth

**Files:**
- Create: `src/components/PasswordField.jsx`, `src/components/RequireAuth.jsx`

- [ ] **Step 1: Write `src/components/PasswordField.jsx`**

```jsx
import { useState } from 'react'
import { Icon } from '../icons.jsx'
import { passwordStrength } from '../lib/auth.js'

export default function PasswordField({ label = 'Password', value, onChange, error, showStrength = false, autoComplete = 'current-password', name }) {
  const [show, setShow] = useState(false)
  const strength = showStrength ? passwordStrength(value || '') : null
  return (
    <label className={`field ${error ? 'field--error' : ''}`}>
      <span className="field__label">{label}</span>
      <span className="pw">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          autoComplete={autoComplete}
        />
        <button type="button" className="pw__toggle" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}>
          {show ? <Icon.EyeOff width={18} height={18} /> : <Icon.Eye width={18} height={18} />}
        </button>
      </span>
      {showStrength && value && (
        <span className={`pw-meter pw-meter--${strength.score}`}>
          <span className="pw-meter__bar"><span className="pw-meter__fill" style={{ width: `${(strength.score / 4) * 100}%` }} /></span>
          <span className="pw-meter__label">{strength.label}</span>
        </span>
      )}
      {error && <span className="field__err">{error}</span>}
    </label>
  )
}
```

- [ ] **Step 2: Write `src/components/RequireAuth.jsx`**

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PasswordField.jsx src/components/RequireAuth.jsx
git commit -m "feat: add PasswordField and RequireAuth components"
```

---

### Task 7: Login and Register pages

**Files:**
- Create: `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`

- [ ] **Step 1: Write `src/pages/LoginPage.jsx`**

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PasswordField from '../components/PasswordField.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await login(values)
    setBusy(false)
    if (res.ok) navigate('/account')
    else setErrors(res.errors)
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">Sign in</h1>
        {errors.form && <p className="auth__error">{errors.form}</p>}
        <form className="form" onSubmit={submit} noValidate>
          <label className={`field ${errors.email ? 'field--error' : ''}`}>
            <span className="field__label">Email</span>
            <input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} autoComplete="email" />
            {errors.email && <span className="field__err">{errors.email}</span>}
          </label>
          <PasswordField value={values.password} onChange={(e) => set('password', e.target.value)} error={errors.password} autoComplete="current-password" />
          <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="auth__alt"><Link to="/forgot-password">Forgot password?</Link></p>
        <p className="auth__alt">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/pages/RegisterPage.jsx`**

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PasswordField from '../components/PasswordField.jsx'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await register(values)
    setBusy(false)
    if (res.ok) navigate('/')
    else setErrors(res.errors)
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">Create account</h1>
        <form className="form" onSubmit={submit} noValidate>
          <label className={`field ${errors.name ? 'field--error' : ''}`}>
            <span className="field__label">Full name</span>
            <input value={values.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} autoComplete="name" />
            {errors.name && <span className="field__err">{errors.name}</span>}
          </label>
          <label className={`field ${errors.email ? 'field--error' : ''}`}>
            <span className="field__label">Email</span>
            <input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} autoComplete="email" />
            {errors.email && <span className="field__err">{errors.email}</span>}
          </label>
          <PasswordField label="Password" value={values.password} onChange={(e) => set('password', e.target.value)} error={errors.password} showStrength autoComplete="new-password" />
          <PasswordField label="Confirm password" value={values.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} autoComplete="new-password" />
          <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="auth__alt">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/LoginPage.jsx src/pages/RegisterPage.jsx
git commit -m "feat: add login and register pages"
```

---

### Task 8: Forgot-password and Account pages

**Files:**
- Create: `src/pages/ForgotPasswordPage.jsx`, `src/pages/AccountPage.jsx`

- [ ] **Step 1: Write `src/pages/ForgotPasswordPage.jsx`**

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PasswordField from '../components/PasswordField.jsx'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [values, setValues] = useState({ email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await resetPassword(values)
    setBusy(false)
    if (res.ok) setDone(true)
    else setErrors(res.errors)
  }

  if (done) {
    return (
      <div className="auth">
        <div className="auth__card">
          <h1 className="auth__title">Password updated</h1>
          <p className="auth__alt">Your password has been reset. <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">Reset password</h1>
        <p className="auth__alt" style={{ textAlign: 'left' }}>Enter your email and a new password. (Demo — no email is sent.)</p>
        {errors.form && <p className="auth__error">{errors.form}</p>}
        <form className="form" onSubmit={submit} noValidate>
          <label className={`field ${errors.email ? 'field--error' : ''}`}>
            <span className="field__label">Email</span>
            <input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} autoComplete="email" />
            {errors.email && <span className="field__err">{errors.email}</span>}
          </label>
          <PasswordField label="New password" value={values.password} onChange={(e) => set('password', e.target.value)} error={errors.password} showStrength autoComplete="new-password" />
          <PasswordField label="Confirm new password" value={values.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} autoComplete="new-password" />
          <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
        </form>
        <p className="auth__alt"><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/pages/AccountPage.jsx`**

```jsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserOrders } from '../lib/userStore.js'
import { formatPrice } from '../lib/format.js'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const orders = getUserOrders(user.id)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="container account">
      <div className="account__head">
        <div>
          <h1 className="shop__title">Hi, {user.name}</h1>
          <p className="account__email">{user.email}</p>
        </div>
        <button className="btn" onClick={handleLogout}>Log out</button>
      </div>
      <h2 className="account__sub">Order history</h2>
      {orders.length === 0 ? (
        <p className="reviews__empty">No orders yet.</p>
      ) : (
        <ul className="account__orders">
          {orders.map((o) => (
            <li className="account__order" key={o.orderNumber}>
              <div>
                <strong>{o.orderNumber}</strong>
                <span className="account__order-date">{new Date(o.placedAt).toLocaleDateString()}</span>
              </div>
              <span>{o.items.reduce((n, i) => n + i.qty, 0)} item(s)</span>
              <span>{formatPrice(o.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/ForgotPasswordPage.jsx src/pages/AccountPage.jsx
git commit -m "feat: add forgot-password and account pages"
```

---

### Task 9: Wire AuthProvider and routes

**Files:**
- Overwrite: `src/App.jsx`

- [ ] **Step 1: Overwrite `src/App.jsx`** (adds `AuthProvider` outermost and the four auth routes; `/account` wrapped in `RequireAuth`)

```jsx
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { UIProvider } from './context/UIContext.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import QuickViewModal from './components/QuickViewModal.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import HomePage from './pages/HomePage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import CartPage from './pages/CartPage.jsx'
import WishlistPage from './pages/WishlistPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <UIProvider>
            <div className="app">
              <Header />
              <main className="main">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/shop/:audience" element={<ShopPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
              <CartDrawer />
              <QuickViewModal />
            </div>
          </UIProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
```

- [ ] **Step 2: Verify the app builds**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`. Register a new account (try a weak password and a mismatch to see errors; watch the strength meter); on success you land on home and the header shows your name. Visit `/account` (orders empty), log out, then `/account` redirects to `/login`. Log back in with the same credentials; try a wrong password (neutral error). Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: mount AuthProvider and auth routes (account protected)"
```

---

### Task 10: Header account link

**Files:**
- Modify: `src/components/Header.jsx`

- [ ] **Step 1: Add the auth import** near the other context imports

```jsx
import { useAuth } from '../context/AuthContext.jsx'
```

- [ ] **Step 2: Read the session** — add inside the component, next to the other hooks (e.g. after `const { openCart } = useUI()`)

```jsx
  const { isAuthenticated, user } = useAuth()
```

- [ ] **Step 3: Add the account link as the first child of `.header__actions`** — change the opening of that block:

```jsx
        <div className="header__actions">
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className="user-link"
            aria-label={isAuthenticated ? 'Account' : 'Sign in'}
            onClick={close}
          >
            <Icon.User />
            {isAuthenticated && <span className="header__user">{user.name.split(' ')[0]}</span>}
          </Link>
          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist" onClick={close}>
```

(The rest of `.header__actions` — the wishlist and cart buttons — stays unchanged.)

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`. Signed out → header shows a person icon linking to `/login`. Signed in → it shows your first name and links to `/account`. Check mobile width: the name hides, the icon remains. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.jsx
git commit -m "feat: add account/sign-in link to header"
```

---

### Task 11: Checkout prefill + per-user order history

**Files:**
- Modify: `src/pages/CheckoutPage.jsx`

- [ ] **Step 1: Add imports** near the top of `src/pages/CheckoutPage.jsx`

```jsx
import { useAuth } from '../context/AuthContext.jsx'
import { addUserOrder } from '../lib/userStore.js'
```

- [ ] **Step 2: Read the user and prefill shipping** — replace the existing `const { items, subtotal, clear } = useCart()` and the `shipping` state initializer:

Change:
```jsx
  const { items, subtotal, clear } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState({ email: '', name: '', address: '', city: '', zip: '', country: '' })
```
to:
```jsx
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState({ email: user?.email || '', name: user?.name || '', address: '', city: '', zip: '', country: '' })
```

- [ ] **Step 3: Save the order to the account** — in `placeOrder`, after the order is created and stored to `b2b_last_order`, add the per-user write:

Change:
```jsx
  function placeOrder() {
    const order = createOrder({ items, shipping, method })
    try { localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order)) } catch { /* ignore */ }
    clear()
    navigate('/order-confirmation')
  }
```
to:
```jsx
  function placeOrder() {
    const order = createOrder({ items, shipping, method })
    try { localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order)) } catch { /* ignore */ }
    if (user) addUserOrder(user.id, order)
    clear()
    navigate('/order-confirmation')
  }
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`. Signed in, add an item and go to checkout — confirm the email/name are prefilled. Complete the order, then open `/account` and confirm the order appears in history with the right number, date, item count, and total. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/pages/CheckoutPage.jsx
git commit -m "feat: prefill checkout for signed-in users and save orders to account"
```

---

### Task 12: Full verification pass

**Files:** none

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass — Phases 1–3 plus `lib/auth` and `userStore`.

- [ ] **Step 2: Verify no CSS Grid**

Run: `grep -rn "display: *grid\|grid-template\|grid-area\|grid-column\|grid-row" src/`
Expected: no matches.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 4: End-to-end walkthrough (browser)**

Run: `npm run dev`. Full path: register (watch validation + strength) → header shows name → add to cart → checkout (prefilled) → place order → `/account` shows the order → log out → `/account` redirects to login → sign in again → forgot-password sets a new password → sign in with the new password. Check a phone width for the auth card and header. Stop the server.

- [ ] **Step 5: Confirm clean tree**

Run: `git status` — expect only untracked tooling files (`.agents/`, `skills-lock.json`).

---

## Self-Review

**Spec coverage:**
- Pure logic (`validateEmail`, `passwordStrength`, `validateRegister`, `validateLogin`, `genSalt`, `hashPassword`) → Task 1. ✓
- User/order storage → Task 2. ✓
- AuthContext (register/login/logout/reset, session, outermost) → Task 5, mounted Task 9. ✓
- Standard validation rules (email, ≥8 + letter + number, confirm match, required, duplicate block, neutral login error) → Tasks 1, 5. ✓
- Pages: login, register, forgot-password, account → Tasks 7, 8; routes + `RequireAuth` protection → Tasks 6, 9. ✓
- Header user/sign-in link with name → Task 10. ✓
- Checkout prefill + per-user order history → Task 11. ✓
- Show/hide + strength meter → Task 6 (PasswordField). ✓
- Styling (flexbox-only) → Task 4 + verified Task 12. ✓
- Tests (auth + userStore, TDD) → Tasks 1, 2. ✓

**Placeholder scan:** No "TBD"/"TODO" work items. Security limitation (client-side hashing) is a documented design decision, not a gap.

**Type/name consistency:** `validateRegister/validateLogin/passwordStrength/genSalt/hashPassword/validateEmail` (auth.js) ↔ AuthContext + PasswordField + tests. `getUsers/findUserByEmail/saveUser/updateUserPassword/getUserOrders/addUserOrder` (userStore.js) ↔ AuthContext + AccountPage + CheckoutPage + tests. `useAuth` exposes `user`, `isAuthenticated`, `register`, `login`, `logout`, `resetPassword` ↔ Header/RequireAuth/all auth pages/CheckoutPage. Session shape `{id,name,email}` ↔ AccountPage (`user.id`, `user.name`, `user.email`) and Header (`user.name`). Order shape consumed by AccountPage (`orderNumber`, `placedAt`, `items[].qty`, `total`) matches `createOrder` output from Phase 2. New `Icon` entries (`User`, `Eye`, `EyeOff`) ↔ PasswordField + Header. Provider order `AuthProvider > CartProvider > WishlistProvider > UIProvider` ↔ Task 9; `useAuth` consumers all render inside it.
