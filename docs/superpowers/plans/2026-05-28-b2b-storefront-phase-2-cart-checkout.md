# B2B Storefront — Phase 2: Cart, Wishlist & Checkout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the full purchase flow on top of the Phase 1 catalog: a persistent cart and wishlist, a slide-in cart drawer, cart and wishlist pages, add-to-cart from product pages/cards, and a 4-step simulated checkout ending in an order-confirmation page.

**Architecture:** Pure logic (cart reducer, wishlist reducer, checkout validation/order math) lives in testable modules under `src/lib/`. React state lives in three contexts (`CartContext`, `WishlistContext`, `UIContext`) that wrap those reducers and persist to `localStorage`. UI components consume the contexts via hooks. Routing and styling follow Phase 1 conventions; **flexbox only — never CSS Grid**.

**Tech Stack:** React 18, Vite 5, React Router v6, Vitest + React Testing Library, plain CSS. JavaScript (no TypeScript).

**Builds on Phase 1** (already on `main`): `src/lib/cms.js`, `src/lib/format.js` (`formatPrice`, `discountPercent`), `src/components/ProductGrid.jsx`, `ProductCard.jsx`, `EmptyState.jsx`, `Header.jsx`, `Footer.jsx`, `src/icons.jsx`, and the product shape (`id, slug, name, price, images[], colors[], sizes[], inStock, ...`).

**localStorage keys:** `b2b_cart`, `b2b_wishlist`, `b2b_last_order`.

**Cart line-item shape:**
```js
{
  id: 'p-001::M::Black',  // lineId(productId, size, color)
  productId: 'p-001', slug: 'boxy-logo-tee', name: 'Boxy Logo Tee',
  price: 48, image: 'https://...', size: 'M', color: 'Black', qty: 2,
}
```

---

### Task 1: Cart logic (TDD)

**Files:**
- Create: `src/lib/cart.js`
- Test: `src/lib/cart.test.js`

- [ ] **Step 1: Write the failing test `src/lib/cart.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { lineId, initialCart, cartReducer, cartCount, cartSubtotal } from './cart.js'

const item = (over = {}) => ({ productId: 'p1', slug: 's', name: 'Tee', price: 48, image: '/x', size: 'M', color: 'Black', qty: 1, ...over })

describe('lineId', () => {
  it('combines product, size, and color', () => {
    expect(lineId('p1', 'M', 'Black')).toBe('p1::M::Black')
  })
  it('handles missing size/color', () => {
    expect(lineId('p1', null, null)).toBe('p1::::')
  })
})

describe('cartReducer', () => {
  it('ADD inserts a new line with a derived id', () => {
    const s = cartReducer(initialCart, { type: 'ADD', item: item() })
    expect(s.items).toHaveLength(1)
    expect(s.items[0].id).toBe('p1::M::Black')
    expect(s.items[0].qty).toBe(1)
  })
  it('ADD merges quantity for the same product+size+color', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item({ qty: 1 }) })
    s = cartReducer(s, { type: 'ADD', item: item({ qty: 2 }) })
    expect(s.items).toHaveLength(1)
    expect(s.items[0].qty).toBe(3)
  })
  it('ADD keeps different sizes as separate lines', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item({ size: 'M' }) })
    s = cartReducer(s, { type: 'ADD', item: item({ size: 'L' }) })
    expect(s.items).toHaveLength(2)
  })
  it('UPDATE_QTY sets the quantity', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item() })
    s = cartReducer(s, { type: 'UPDATE_QTY', id: 'p1::M::Black', qty: 5 })
    expect(s.items[0].qty).toBe(5)
  })
  it('UPDATE_QTY to 0 removes the line', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item() })
    s = cartReducer(s, { type: 'UPDATE_QTY', id: 'p1::M::Black', qty: 0 })
    expect(s.items).toHaveLength(0)
  })
  it('REMOVE deletes the line', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item() })
    s = cartReducer(s, { type: 'REMOVE', id: 'p1::M::Black' })
    expect(s.items).toHaveLength(0)
  })
  it('CLEAR empties the cart', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item() })
    s = cartReducer(s, { type: 'CLEAR' })
    expect(s.items).toHaveLength(0)
  })
})

describe('selectors', () => {
  const state = { items: [item({ qty: 2, price: 50 }), item({ size: 'L', qty: 1, price: 30 })] }
  it('cartCount sums quantities', () => {
    expect(cartCount(state)).toBe(3)
  })
  it('cartSubtotal sums price * qty', () => {
    expect(cartSubtotal(state)).toBe(130)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- cart`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/cart.js`**

```js
export function lineId(productId, size, color) {
  return [productId, size || '', color || ''].join('::')
}

export const initialCart = { items: [] }

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { item } = action
      const id = lineId(item.productId, item.size, item.color)
      const existing = state.items.find((i) => i.id === id)
      if (existing) {
        return { items: state.items.map((i) => (i.id === id ? { ...i, qty: i.qty + (item.qty || 1) } : i)) }
      }
      return { items: [...state.items, { ...item, id, qty: item.qty || 1 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.id) }
    case 'UPDATE_QTY':
      if (action.qty <= 0) return { items: state.items.filter((i) => i.id !== action.id) }
      return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i)) }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

export function cartCount(state) {
  return state.items.reduce((n, i) => n + i.qty, 0)
}

export function cartSubtotal(state) {
  return state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- cart`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cart.js src/lib/cart.test.js
git commit -m "feat: add cart reducer and selectors"
```

---

### Task 2: Wishlist logic (TDD)

**Files:**
- Create: `src/lib/wishlist.js`
- Test: `src/lib/wishlist.test.js`

- [ ] **Step 1: Write the failing test `src/lib/wishlist.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { initialWishlist, wishlistReducer, inWishlist } from './wishlist.js'

describe('wishlistReducer', () => {
  it('TOGGLE adds an id when absent', () => {
    const s = wishlistReducer(initialWishlist, { type: 'TOGGLE', id: 'p1' })
    expect(s.ids).toEqual(['p1'])
  })
  it('TOGGLE removes an id when present', () => {
    let s = wishlistReducer(initialWishlist, { type: 'TOGGLE', id: 'p1' })
    s = wishlistReducer(s, { type: 'TOGGLE', id: 'p1' })
    expect(s.ids).toEqual([])
  })
  it('REMOVE deletes a specific id', () => {
    const s = wishlistReducer({ ids: ['p1', 'p2'] }, { type: 'REMOVE', id: 'p1' })
    expect(s.ids).toEqual(['p2'])
  })
  it('CLEAR empties the list', () => {
    const s = wishlistReducer({ ids: ['p1', 'p2'] }, { type: 'CLEAR' })
    expect(s.ids).toEqual([])
  })
})

describe('inWishlist', () => {
  it('reports membership', () => {
    expect(inWishlist({ ids: ['p1'] }, 'p1')).toBe(true)
    expect(inWishlist({ ids: ['p1'] }, 'p2')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- wishlist`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/wishlist.js`**

```js
export const initialWishlist = { ids: [] }

export function wishlistReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE':
      return state.ids.includes(action.id)
        ? { ids: state.ids.filter((i) => i !== action.id) }
        : { ids: [...state.ids, action.id] }
    case 'REMOVE':
      return { ids: state.ids.filter((i) => i !== action.id) }
    case 'CLEAR':
      return { ids: [] }
    default:
      return state
  }
}

export function inWishlist(state, id) {
  return state.ids.includes(id)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- wishlist`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/wishlist.js src/lib/wishlist.test.js
git commit -m "feat: add wishlist reducer"
```

---

### Task 3: Checkout logic (TDD)

**Files:**
- Create: `src/lib/checkout.js`
- Test: `src/lib/checkout.test.js`

- [ ] **Step 1: Write the failing test `src/lib/checkout.test.js`**

```js
import { describe, it, expect } from 'vitest'
import {
  shippingCost, orderTotal, validateShipping, validatePayment,
  formatCardNumber, formatExpiry, generateOrderNumber, createOrder,
} from './checkout.js'

describe('shippingCost', () => {
  it('standard is free at or above 150', () => {
    expect(shippingCost('standard', 150)).toBe(0)
  })
  it('standard is 8 below 150', () => {
    expect(shippingCost('standard', 149)).toBe(8)
  })
  it('express is always 20', () => {
    expect(shippingCost('express', 500)).toBe(20)
  })
})

describe('orderTotal', () => {
  it('adds shipping to subtotal', () => {
    expect(orderTotal(100, 'standard')).toBe(108)
    expect(orderTotal(200, 'standard')).toBe(200)
    expect(orderTotal(100, 'express')).toBe(120)
  })
})

describe('validateShipping', () => {
  const valid = { email: 'a@b.com', name: 'Mo', address: '1 St', city: 'Cairo', zip: '12345', country: 'EG' }
  it('passes a fully valid form', () => {
    expect(validateShipping(valid)).toEqual({})
  })
  it('flags a bad email', () => {
    expect(validateShipping({ ...valid, email: 'nope' }).email).toBeTruthy()
  })
  it('flags missing required fields', () => {
    const e = validateShipping({})
    expect(Object.keys(e).sort()).toEqual(['address', 'city', 'country', 'email', 'name', 'zip'])
  })
})

describe('validatePayment', () => {
  const valid = { card: '4242 4242 4242 4242', expiry: '12/30', cvc: '123', cardName: 'Mo' }
  it('passes a valid card', () => {
    expect(validatePayment(valid)).toEqual({})
  })
  it('flags a short card number', () => {
    expect(validatePayment({ ...valid, card: '4242' }).card).toBeTruthy()
  })
  it('flags a bad expiry format', () => {
    expect(validatePayment({ ...valid, expiry: '1330' }).expiry).toBeTruthy()
  })
  it('flags an invalid month', () => {
    expect(validatePayment({ ...valid, expiry: '13/30' }).expiry).toBeTruthy()
  })
  it('flags a short cvc', () => {
    expect(validatePayment({ ...valid, cvc: '1' }).cvc).toBeTruthy()
  })
})

describe('formatters', () => {
  it('groups card digits in fours', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
  })
  it('strips non-digits and caps at 16', () => {
    expect(formatCardNumber('4242-4242abc4242 4242 9999')).toBe('4242 4242 4242 4242')
  })
  it('formats expiry as MM/YY', () => {
    expect(formatExpiry('1230')).toBe('12/30')
    expect(formatExpiry('1')).toBe('1')
  })
})

describe('generateOrderNumber', () => {
  it('starts with B2B- and is stable for a given time', () => {
    const n = generateOrderNumber(1700000000000)
    expect(n.startsWith('B2B-')).toBe(true)
    expect(n).toBe(generateOrderNumber(1700000000000))
  })
})

describe('createOrder', () => {
  const items = [{ id: 'l1', name: 'Tee', price: 50, qty: 2 }]
  it('computes subtotal, shipping, and total', () => {
    const o = createOrder({ items, shipping: { email: 'a@b.com' }, method: 'express', now: 1700000000000 })
    expect(o.subtotal).toBe(100)
    expect(o.shippingCost).toBe(20)
    expect(o.total).toBe(120)
    expect(o.orderNumber.startsWith('B2B-')).toBe(true)
    expect(o.items).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- checkout`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/checkout.js`**

```js
export function shippingCost(method, subtotal) {
  if (method === 'express') return 20
  return subtotal >= 150 ? 0 : 8
}

export function orderTotal(subtotal, method) {
  return subtotal + shippingCost(method, subtotal)
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function validateShipping(v = {}) {
  const e = {}
  if (!v.email || !EMAIL_RE.test(v.email)) e.email = 'Enter a valid email'
  if (!v.name || !v.name.trim()) e.name = 'Name is required'
  if (!v.address || !v.address.trim()) e.address = 'Address is required'
  if (!v.city || !v.city.trim()) e.city = 'City is required'
  if (!v.zip || !/^\d{4,10}$/.test(String(v.zip).replace(/\s/g, ''))) e.zip = 'Enter a valid ZIP / postcode'
  if (!v.country || !v.country.trim()) e.country = 'Country is required'
  return e
}

export function validatePayment(v = {}) {
  const e = {}
  const digits = (v.card || '').replace(/\s/g, '')
  if (!/^\d{16}$/.test(digits)) e.card = 'Card number must be 16 digits'
  if (!/^\d{2}\/\d{2}$/.test(v.expiry || '')) {
    e.expiry = 'Use MM/YY'
  } else {
    const mm = Number(v.expiry.slice(0, 2))
    if (mm < 1 || mm > 12) e.expiry = 'Invalid month'
  }
  if (!/^\d{3,4}$/.test(v.cvc || '')) e.cvc = '3–4 digits'
  if (!v.cardName || !v.cardName.trim()) e.cardName = 'Name on card is required'
  return e
}

export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value) {
  const d = value.replace(/\D/g, '').slice(0, 4)
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`
}

export function generateOrderNumber(now = Date.now()) {
  return 'B2B-' + now.toString(36).toUpperCase().slice(-6)
}

export function createOrder({ items, shipping, method, now = Date.now() }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const ship = shippingCost(method, subtotal)
  return {
    orderNumber: generateOrderNumber(now),
    items,
    shipping,
    method,
    subtotal,
    shippingCost: ship,
    total: subtotal + ship,
    placedAt: new Date(now).toISOString(),
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- checkout`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/checkout.js src/lib/checkout.test.js
git commit -m "feat: add checkout validation, formatting, and order math"
```

---

### Task 4: Icons for Phase 2

**Files:**
- Modify: `src/icons.jsx`

- [ ] **Step 1: Add new icons to the `Icon` object in `src/icons.jsx`**

Insert these entries inside the `Icon = { ... }` object (after the existing `Check` entry, before the closing `}`):

```jsx
  Heart: (p) => (<svg {...base} {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></svg>),
  HeartFilled: (p) => (<svg {...base} fill="currentColor" stroke="currentColor" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></svg>),
  Bag: (p) => (<svg {...base} {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>),
  Trash: (p) => (<svg {...base} {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>),
  Plus: (p) => (<svg {...base} {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
  Minus: (p) => (<svg {...base} {...p}><line x1="5" y1="12" x2="19" y2="12" /></svg>),
```

- [ ] **Step 2: Commit**

```bash
git add src/icons.jsx
git commit -m "feat: add cart/wishlist/qty icons"
```

---

### Task 5: Append Phase 2 styles

**Files:**
- Modify: `src/index.css` (append at the end, before the `@media (prefers-reduced-motion)` block, OR simply at the very end — order is fine)

- [ ] **Step 1: Append the following CSS to `src/index.css`**

```css
/* ===== Phase 2: cart / wishlist / checkout ===== */
.header__actions { display: flex; align-items: center; gap: 6px; }
.icon-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 0; background: none; border-radius: 50%; color: var(--ink); }
.icon-btn:hover { background: rgba(0,0,0,.06); }
.badge-count { position: absolute; top: 4px; right: 4px; min-width: 16px; height: 16px; padding: 0 4px; background: var(--accent); color: #fff; font-size: .62rem; font-weight: 700; border-radius: 999px; display: flex; align-items: center; justify-content: center; }

/* Wishlist heart on cards */
.heart { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border: 0; border-radius: 50%; background: rgba(255,255,255,.9); color: var(--ink); display: flex; align-items: center; justify-content: center; }
.heart:hover { background: #fff; }
.heart.is-active { color: var(--accent); }
.heart--lg { position: static; width: 48px; height: 48px; border: 1px solid var(--line); background: var(--surface); flex: 0 0 auto; }

/* Cart drawer */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 60; }
.drawer-overlay.is-open { opacity: 1; pointer-events: auto; }
.drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 92%; max-width: 420px; background: var(--bg); z-index: 70; display: flex; flex-direction: column; transform: translateX(100%); transition: transform .25s ease; }
.drawer.is-open { transform: translateX(0); }
.drawer__head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--line); }
.drawer__head h2 { font-family: var(--font-display); text-transform: uppercase; margin: 0; font-size: 1.3rem; }
.drawer__items { flex: 1; overflow-y: auto; padding: 8px 20px; display: flex; flex-direction: column; }
.drawer__empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--muted); }
.drawer__foot { border-top: 1px solid var(--line); padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; }

/* Line item (drawer + cart page) */
.line-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--line); }
.line-item__img { width: 70px; height: 88px; object-fit: cover; border-radius: 6px; flex: 0 0 auto; }
.line-item--lg .line-item__img { width: 96px; height: 120px; }
.line-item__info { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.line-item__name { font-weight: 600; font-size: .95rem; }
.line-item__meta { color: var(--muted); font-size: .8rem; }
.line-item__unit { color: var(--muted); font-size: .85rem; }
.line-item__row { display: flex; align-items: center; gap: 14px; margin-top: 4px; }
.line-item__price { font-weight: 600; white-space: nowrap; }
.link-btn { background: none; border: 0; color: var(--muted); text-decoration: underline; font-size: .8rem; padding: 0; }
.link-btn:hover { color: var(--ink); }

/* Quantity stepper */
.qty { display: inline-flex; align-items: center; border: 1px solid var(--line); border-radius: 999px; }
.qty__btn { width: 30px; height: 30px; border: 0; background: none; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.qty__btn:hover { background: rgba(0,0,0,.06); }
.qty__val { min-width: 26px; text-align: center; font-weight: 600; font-size: .9rem; }

/* Order summary card */
.summary { flex: 0 0 320px; align-self: flex-start; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.summary__title { font-family: var(--font-display); text-transform: uppercase; margin: 0 0 4px; font-size: 1.2rem; }
.summary__items { list-style: none; margin: 0 0 8px; padding: 0 0 8px; border-bottom: 1px solid var(--line); display: flex; flex-direction: column; gap: 8px; }
.summary__items li { display: flex; justify-content: space-between; gap: 12px; font-size: .85rem; }
.summary__row { display: flex; justify-content: space-between; font-size: .9rem; }
.summary__row--muted { color: var(--muted); }
.summary__row--total { font-weight: 700; font-size: 1.05rem; border-top: 1px solid var(--line); padding-top: 10px; margin-top: 2px; }

/* Cart page */
.cart-page { padding: 28px 20px 60px; }
.cart-page__body { display: flex; align-items: flex-start; gap: 32px; flex-wrap: wrap; }
.cart-page__items { flex: 1 1 460px; }

/* PDP add-to-cart actions */
.pdp__actions { display: flex; align-items: center; gap: 12px; }
.pdp__actions .btn { flex: 1; }

/* Checkout */
.checkout { padding: 28px 20px 60px; }
.checkout__title { font-family: var(--font-display); text-transform: uppercase; font-size: 2.2rem; margin: 0 0 18px; }
.steps { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; padding: 0; margin: 0 0 24px; }
.step { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: .85rem; text-transform: uppercase; letter-spacing: .04em; }
.step__num { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; font-size: .75rem; }
.step.is-active { color: var(--ink); font-weight: 700; }
.step.is-active .step__num { background: var(--accent); border-color: var(--accent); color: #fff; }
.step.is-done .step__num { background: var(--ink); border-color: var(--ink); color: #fff; }
.checkout__body { display: flex; align-items: flex-start; gap: 32px; flex-wrap: wrap; }
.checkout__main { flex: 1 1 460px; }
.form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: flex; gap: 16px; flex-wrap: wrap; }
.form-row .field { flex: 1 1 160px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field__label { font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }
.field input { padding: 11px 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); font-size: .95rem; }
.field input:focus { outline: 2px solid var(--accent); outline-offset: -1px; border-color: var(--accent); }
.field--error input { border-color: #c8381f; }
.field__err { color: #c8381f; font-size: .78rem; }
.ship-option { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); cursor: pointer; }
.ship-option span:nth-of-type(1) { flex: 1; }
.ship-option.is-active { border-color: var(--accent); }
.checkout__note { color: var(--muted); font-size: .8rem; }
.checkout__nav { display: flex; gap: 12px; margin-top: 22px; }
.review { display: flex; flex-direction: column; gap: 18px; }
.review__block h3 { font-size: .85rem; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 6px; }
.review__block p { margin: 0; color: #333; line-height: 1.6; }

/* Confirmation */
.confirmation { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 60px 20px; }
.confirmation .summary { width: 100%; max-width: 420px; text-align: left; }
.confirmation__badge { width: 64px; height: 64px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 2rem; display: flex; align-items: center; justify-content: center; }
.confirmation h1 { font-family: var(--font-display); text-transform: uppercase; margin: 0; }
.confirmation__num { font-size: 1.1rem; }

@media (max-width: 768px) {
  .summary { flex: 1 1 100%; width: 100%; }
}
```

- [ ] **Step 2: Verify no CSS Grid was introduced**

Run: `grep -n "display: *grid\|grid-template\|grid-area" src/index.css`
Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add styles for cart, wishlist, drawer, and checkout"
```

---

### Task 6: Contexts (Cart, Wishlist, UI)

**Files:**
- Create: `src/context/CartContext.jsx`, `src/context/WishlistContext.jsx`, `src/context/UIContext.jsx`

- [ ] **Step 1: Write `src/context/CartContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useReducer } from 'react'
import { cartReducer, initialCart, cartCount, cartSubtotal } from '../lib/cart.js'

const KEY = 'b2b_cart'
const CartCtx = createContext(null)

function init() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : initialCart
  } catch {
    return initialCart
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, init)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(cart)) } catch { /* ignore */ }
  }, [cart])

  const value = {
    items: cart.items,
    addItem: (item) => dispatch({ type: 'ADD', item }),
    removeItem: (id) => dispatch({ type: 'REMOVE', id }),
    updateQty: (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty }),
    clear: () => dispatch({ type: 'CLEAR' }),
    count: cartCount(cart),
    subtotal: cartSubtotal(cart),
  }
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
```

- [ ] **Step 2: Write `src/context/WishlistContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useReducer } from 'react'
import { wishlistReducer, initialWishlist, inWishlist } from '../lib/wishlist.js'

const KEY = 'b2b_wishlist'
const WishlistCtx = createContext(null)

function init() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : initialWishlist
  } catch {
    return initialWishlist
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, undefined, init)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const value = {
    ids: state.ids,
    count: state.ids.length,
    has: (id) => inWishlist(state, id),
    toggle: (id) => dispatch({ type: 'TOGGLE', id }),
    remove: (id) => dispatch({ type: 'REMOVE', id }),
  }
  return <WishlistCtx.Provider value={value}>{children}</WishlistCtx.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistCtx)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
```

- [ ] **Step 3: Write `src/context/UIContext.jsx`**

```jsx
import { createContext, useContext, useState } from 'react'

const UICtx = createContext(null)

export function UIProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false)
  const value = {
    cartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
  }
  return <UICtx.Provider value={value}>{children}</UICtx.Provider>
}

export function useUI() {
  const ctx = useContext(UICtx)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
```

- [ ] **Step 4: Commit**

```bash
git add src/context/CartContext.jsx src/context/WishlistContext.jsx src/context/UIContext.jsx
git commit -m "feat: add cart, wishlist, and UI contexts with localStorage persistence"
```

---

### Task 7: QtyStepper (with test)

**Files:**
- Create: `src/components/QtyStepper.jsx`
- Test: `src/components/QtyStepper.test.jsx`

- [ ] **Step 1: Write the failing test `src/components/QtyStepper.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QtyStepper from './QtyStepper.jsx'

describe('QtyStepper', () => {
  it('renders the value', () => {
    render(<QtyStepper value={3} onChange={() => {}} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
  it('increments on +', async () => {
    const onChange = vi.fn()
    render(<QtyStepper value={2} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Increase'))
    expect(onChange).toHaveBeenCalledWith(3)
  })
  it('decrements on - but not below min (1)', async () => {
    const onChange = vi.fn()
    render(<QtyStepper value={1} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Decrease'))
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- QtyStepper`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/components/QtyStepper.jsx`**

```jsx
import { Icon } from '../icons.jsx'

export default function QtyStepper({ value, onChange, min = 1 }) {
  return (
    <div className="qty">
      <button type="button" className="qty__btn" aria-label="Decrease" onClick={() => onChange(Math.max(min, value - 1))}>
        <Icon.Minus width={14} height={14} />
      </button>
      <span className="qty__val">{value}</span>
      <button type="button" className="qty__btn" aria-label="Increase" onClick={() => onChange(value + 1)}>
        <Icon.Plus width={14} height={14} />
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- QtyStepper`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/QtyStepper.jsx src/components/QtyStepper.test.jsx
git commit -m "feat: add QtyStepper component"
```

---

### Task 8: CartDrawer

**Files:**
- Create: `src/components/CartDrawer.jsx`

- [ ] **Step 1: Write `src/components/CartDrawer.jsx`**

```jsx
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useUI } from '../context/UIContext.jsx'
import { formatPrice } from '../lib/format.js'
import { Icon } from '../icons.jsx'
import QtyStepper from './QtyStepper.jsx'

export default function CartDrawer() {
  const { items, subtotal, updateQty, removeItem, count } = useCart()
  const { cartOpen, closeCart } = useUI()

  return (
    <>
      <div className={`drawer-overlay ${cartOpen ? 'is-open' : ''}`} onClick={closeCart} />
      <aside className={`drawer ${cartOpen ? 'is-open' : ''}`} aria-hidden={!cartOpen}>
        <div className="drawer__head">
          <h2>Cart ({count})</h2>
          <button className="icon-btn" onClick={closeCart} aria-label="Close cart"><Icon.Close /></button>
        </div>

        {items.length === 0 ? (
          <div className="drawer__empty">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="btn btn--primary" onClick={closeCart}>Shop products</Link>
          </div>
        ) : (
          <>
            <div className="drawer__items">
              {items.map((i) => (
                <div className="line-item" key={i.id}>
                  <img className="line-item__img" src={i.image} alt={i.name} />
                  <div className="line-item__info">
                    <Link to={`/product/${i.slug}`} className="line-item__name" onClick={closeCart}>{i.name}</Link>
                    <span className="line-item__meta">{[i.size, i.color].filter(Boolean).join(' · ')}</span>
                    <div className="line-item__row">
                      <QtyStepper value={i.qty} onChange={(q) => updateQty(i.id, q)} />
                      <button className="link-btn" onClick={() => removeItem(i.id)}>Remove</button>
                    </div>
                  </div>
                  <span className="line-item__price">{formatPrice(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="drawer__foot">
              <div className="summary__row summary__row--total"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <Link to="/cart" className="btn btn--block" onClick={closeCart}>View cart</Link>
              <Link to="/checkout" className="btn btn--primary btn--block" onClick={closeCart}>Checkout</Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CartDrawer.jsx
git commit -m "feat: add slide-in cart drawer"
```

---

### Task 9: Wire providers, routes, stub pages, and mount the drawer

**Files:**
- Overwrite: `src/App.jsx`
- Create stub pages: `src/pages/CartPage.jsx`, `src/pages/WishlistPage.jsx`, `src/pages/CheckoutPage.jsx`, `src/pages/OrderConfirmationPage.jsx`

- [ ] **Step 1: Write stub pages** (real versions land in Tasks 13–16)

`src/pages/CartPage.jsx`:
```jsx
export default function CartPage() {
  return <div className="container" style={{ padding: '40px 20px' }}><h1>Cart</h1></div>
}
```

`src/pages/WishlistPage.jsx`:
```jsx
export default function WishlistPage() {
  return <div className="container" style={{ padding: '40px 20px' }}><h1>Wishlist</h1></div>
}
```

`src/pages/CheckoutPage.jsx`:
```jsx
export default function CheckoutPage() {
  return <div className="container" style={{ padding: '40px 20px' }}><h1>Checkout</h1></div>
}
```

`src/pages/OrderConfirmationPage.jsx`:
```jsx
export default function OrderConfirmationPage() {
  return <div className="container" style={{ padding: '40px 20px' }}><h1>Order confirmation</h1></div>
}
```

- [ ] **Step 2: Overwrite `src/App.jsx`**

```jsx
import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { UIProvider } from './context/UIContext.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import HomePage from './pages/HomePage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import CartPage from './pages/CartPage.jsx'
import WishlistPage from './pages/WishlistPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
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
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
          </div>
        </UIProvider>
      </WishlistProvider>
    </CartProvider>
  )
}
```

- [ ] **Step 3: Verify the app builds**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/pages/CartPage.jsx src/pages/WishlistPage.jsx src/pages/CheckoutPage.jsx src/pages/OrderConfirmationPage.jsx
git commit -m "feat: wire cart/wishlist/UI providers, new routes, and mount cart drawer"
```

---

### Task 10: Header cart + wishlist actions

**Files:**
- Modify: `src/components/Header.jsx`

- [ ] **Step 1: Overwrite `src/components/Header.jsx`** (adds the actions cluster; keeps existing nav/search/menu)

```jsx
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { Icon } from '../icons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useUI } from '../context/UIContext.jsx'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { count } = useCart()
  const wishlist = useWishlist()
  const { openCart } = useUI()

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
          <Logo />
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
        <div className="header__actions">
          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
            <Icon.Heart />
            {wishlist.count > 0 && <span className="badge-count">{wishlist.count}</span>}
          </Link>
          <button className="icon-btn" aria-label="Open cart" onClick={openCart}>
            <Icon.Bag />
            {count > 0 && <span className="badge-count">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`. Confirm the header shows a heart (links to `/wishlist`) and a bag icon that opens the (empty) cart drawer; the overlay closes it. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.jsx
git commit -m "feat: add cart and wishlist actions with badges to header"
```

---

### Task 11: Wishlist heart on ProductCard

**Files:**
- Modify: `src/components/ProductCard.jsx`
- Modify: `src/components/ProductCard.test.jsx` (wrap renders in `WishlistProvider`, since the card now uses `useWishlist`)

- [ ] **Step 1: Overwrite `src/components/ProductCard.jsx`**

```jsx
import { Link } from 'react-router-dom'
import { formatPrice, discountPercent } from '../lib/format.js'
import { useWishlist } from '../context/WishlistContext.jsx'
import { Icon } from '../icons.jsx'

export default function ProductCard({ product }) {
  const { has, toggle } = useWishlist()
  const saved = has(product.id)
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price
  const off = discountPercent(product.price, product.compareAtPrice)

  function toggleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
  }

  return (
    <article className="card">
      <Link to={`/product/${product.slug}`} className="card__link">
        <div className="card__media">
          <img className="card__img" src={product.images[0]} alt={product.name} loading="lazy" />
          <button
            className={`heart ${saved ? 'is-active' : ''}`}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            onClick={toggleWishlist}
          >
            {saved ? <Icon.HeartFilled width={18} height={18} /> : <Icon.Heart width={18} height={18} />}
          </button>
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

- [ ] **Step 2: Update `src/components/ProductCard.test.jsx`** so the render helper provides the wishlist context

Replace the imports and `renderCard` helper at the top of the file with:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { WishlistProvider } from '../context/WishlistContext.jsx'
import ProductCard from './ProductCard.jsx'

const base = {
  id: 'p-1', name: 'Boxy Tee', slug: 'boxy-tee', price: 48, compareAtPrice: null,
  images: ['/x.jpg'], isNew: false, inStock: true, colors: [], sizes: [],
}

const renderCard = (product) =>
  render(
    <WishlistProvider>
      <MemoryRouter><ProductCard product={product} /></MemoryRouter>
    </WishlistProvider>,
  )
```

(Keep the four existing `it(...)` test cases unchanged below the helper.)

- [ ] **Step 3: Run the ProductCard tests**

Run: `npm test -- ProductCard`
Expected: PASS (4 tests still green with the provider wrapper).

- [ ] **Step 4: Commit**

```bash
git add src/components/ProductCard.jsx src/components/ProductCard.test.jsx
git commit -m "feat: add wishlist heart toggle to product cards"
```

---

### Task 12: Add-to-cart and wishlist on the product page

**Files:**
- Overwrite: `src/pages/ProductPage.jsx`

- [ ] **Step 1: Overwrite `src/pages/ProductPage.jsx`** (Phase 1 version + add-to-cart, wishlist, and size-required logic)

```jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductBySlug, getProducts } from '../lib/cms.js'
import { formatPrice, discountPercent } from '../lib/format.js'
import ProductGrid from '../components/ProductGrid.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useUI } from '../context/UIContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { Icon } from '../icons.jsx'

export default function ProductPage() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const { openCart } = useUI()
  const { has, toggle } = useWishlist()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const [sizeError, setSizeError] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getProductBySlug(slug).then(async (p) => {
      if (!active) return
      setProduct(p)
      setActiveImage(0)
      setColor(p?.colors?.[0]?.name ?? null)
      setSize(null)
      setSizeError(false)
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
  const oneSize = product.sizes.length === 1 && product.sizes[0] === 'OS'
  const requiresSize = !oneSize && product.sizes.length > 0
  const saved = has(product.id)

  function handleAdd() {
    if (requiresSize && !size) {
      setSizeError(true)
      return
    }
    const effectiveSize = requiresSize ? size : (product.sizes[0] || null)
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: effectiveSize,
      color,
      qty: 1,
    })
    openCart()
  }

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

          {requiresSize && (
            <div className="pdp__field">
              <span className="pdp__label">Size</span>
              <div className="size-row">
                {product.sizes.map((s) => (
                  <button key={s} type="button" className={`size-chip ${size === s ? 'is-active' : ''}`} onClick={() => { setSize(s); setSizeError(false) }}>{s}</button>
                ))}
              </div>
              {sizeError && <span className="field__err">Please select a size.</span>}
            </div>
          )}

          <div className="pdp__actions">
            <button className="btn btn--primary" onClick={handleAdd} disabled={!product.inStock}>
              {product.inStock ? 'Add to cart' : 'Sold out'}
            </button>
            <button
              className={`heart heart--lg ${saved ? 'is-active' : ''}`}
              aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={saved}
              onClick={() => toggle(product.id)}
            >
              {saved ? <Icon.HeartFilled /> : <Icon.Heart />}
            </button>
          </div>

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

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`. On a product with sizes, confirm: clicking "Add to cart" without a size shows "Please select a size"; selecting a size then adding opens the drawer with the item; the wishlist heart toggles and reflects in the header badge; an accessory (sizes `['OS']`) adds without requiring a size; a sold-out product shows a disabled "Sold out" button. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProductPage.jsx
git commit -m "feat: add to cart and wishlist from the product page"
```

---

### Task 13: Cart page

**Files:**
- Overwrite: `src/pages/CartPage.jsx`

- [ ] **Step 1: Overwrite `src/pages/CartPage.jsx`**

```jsx
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../lib/format.js'
import QtyStepper from '../components/QtyStepper.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart()

  if (!items.length) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 className="shop__title">Your cart</h1>
        <EmptyState message="Your cart is empty." />
        <div style={{ textAlign: 'center' }}>
          <Link to="/shop" className="btn btn--primary">Shop products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page container">
      <h1 className="shop__title">Your cart</h1>
      <div className="cart-page__body">
        <div className="cart-page__items">
          {items.map((i) => (
            <div className="line-item line-item--lg" key={i.id}>
              <img className="line-item__img" src={i.image} alt={i.name} />
              <div className="line-item__info">
                <Link to={`/product/${i.slug}`} className="line-item__name">{i.name}</Link>
                <span className="line-item__meta">{[i.size, i.color].filter(Boolean).join(' · ')}</span>
                <span className="line-item__unit">{formatPrice(i.price)}</span>
                <div className="line-item__row">
                  <QtyStepper value={i.qty} onChange={(q) => updateQty(i.id, q)} />
                  <button className="link-btn" onClick={() => removeItem(i.id)}>Remove</button>
                </div>
              </div>
              <span className="line-item__price">{formatPrice(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h3 className="summary__title">Summary</h3>
          <div className="summary__row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="summary__row summary__row--muted"><span>Shipping</span><span>Calculated at checkout</span></div>
          <Link to="/checkout" className="btn btn--primary btn--block">Checkout</Link>
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`. Add items, open `/cart`, confirm line items, qty changes update totals, remove works, empty state shows when cleared, "Checkout" links to `/checkout`. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CartPage.jsx
git commit -m "feat: build full cart page"
```

---

### Task 14: Wishlist page

**Files:**
- Overwrite: `src/pages/WishlistPage.jsx`

- [ ] **Step 1: Overwrite `src/pages/WishlistPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../lib/cms.js'
import { useWishlist } from '../context/WishlistContext.jsx'
import ProductGrid from '../components/ProductGrid.jsx'

export default function WishlistPage() {
  const { ids } = useWishlist()
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getProducts().then((p) => { if (active) { setAll(p); setLoading(false) } })
    return () => { active = false }
  }, [])

  const saved = all.filter((p) => ids.includes(p.id))

  return (
    <div className="shop">
      <div className="shop__head"><h1 className="shop__title">Wishlist</h1></div>
      <ProductGrid products={saved} loading={loading} emptyMessage="No saved items yet — tap the heart on any product." />
      {!loading && ids.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/shop" className="btn btn--primary">Find something you love</Link>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`. Heart a few products, open `/wishlist`, confirm they appear; un-heart removes them; empty state shows the CTA. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/WishlistPage.jsx
git commit -m "feat: build wishlist page"
```

---

### Task 15: Checkout page (multi-step + validation)

**Files:**
- Overwrite: `src/pages/CheckoutPage.jsx`

- [ ] **Step 1: Overwrite `src/pages/CheckoutPage.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../lib/format.js'
import { shippingCost, validateShipping, validatePayment, formatCardNumber, formatExpiry, createOrder } from '../lib/checkout.js'

const STEPS = ['Shipping', 'Delivery', 'Payment', 'Review']
const LAST_ORDER_KEY = 'b2b_last_order'

function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? 'field--error' : ''}`}>
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__err">{error}</span>}
    </label>
  )
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState({ email: '', name: '', address: '', city: '', zip: '', country: '' })
  const [method, setMethod] = useState('standard')
  const [payment, setPayment] = useState({ card: '', expiry: '', cvc: '', cardName: '' })
  const [errors, setErrors] = useState({})

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <h1>Your cart is empty</h1>
        <Link to="/shop" className="btn btn--primary">Shop products</Link>
      </div>
    )
  }

  const ship = shippingCost(method, subtotal)
  const total = subtotal + ship
  const setShip = (k, v) => setShipping((s) => ({ ...s, [k]: v }))
  const setPay = (k, v) => setPayment((p) => ({ ...p, [k]: v }))

  function next() {
    if (step === 0) {
      const e = validateShipping(shipping)
      setErrors(e)
      if (Object.keys(e).length) return
    }
    if (step === 2) {
      const e = validatePayment(payment)
      setErrors(e)
      if (Object.keys(e).length) return
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setErrors({})
    setStep((s) => Math.max(s - 1, 0))
  }

  function placeOrder() {
    const order = createOrder({ items, shipping, method })
    try { localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order)) } catch { /* ignore */ }
    clear()
    navigate('/order-confirmation')
  }

  return (
    <div className="checkout container">
      <h1 className="checkout__title">Checkout</h1>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s} className={`step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}>
            <span className="step__num">{i + 1}</span>{s}
          </li>
        ))}
      </ol>

      <div className="checkout__body">
        <div className="checkout__main">
          {step === 0 && (
            <div className="form">
              <Field label="Email" error={errors.email}>
                <input type="email" value={shipping.email} onChange={(e) => setShip('email', e.target.value)} aria-invalid={!!errors.email} />
              </Field>
              <Field label="Full name" error={errors.name}>
                <input value={shipping.name} onChange={(e) => setShip('name', e.target.value)} aria-invalid={!!errors.name} />
              </Field>
              <Field label="Address" error={errors.address}>
                <input value={shipping.address} onChange={(e) => setShip('address', e.target.value)} aria-invalid={!!errors.address} />
              </Field>
              <div className="form-row">
                <Field label="City" error={errors.city}>
                  <input value={shipping.city} onChange={(e) => setShip('city', e.target.value)} aria-invalid={!!errors.city} />
                </Field>
                <Field label="ZIP / Postcode" error={errors.zip}>
                  <input value={shipping.zip} onChange={(e) => setShip('zip', e.target.value)} aria-invalid={!!errors.zip} />
                </Field>
              </div>
              <Field label="Country" error={errors.country}>
                <input value={shipping.country} onChange={(e) => setShip('country', e.target.value)} aria-invalid={!!errors.country} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="form">
              <label className={`ship-option ${method === 'standard' ? 'is-active' : ''}`}>
                <input type="radio" name="method" checked={method === 'standard'} onChange={() => setMethod('standard')} />
                <span><strong>Standard</strong> · 3–5 days</span>
                <span>{subtotal >= 150 ? 'Free' : formatPrice(8)}</span>
              </label>
              <label className={`ship-option ${method === 'express' ? 'is-active' : ''}`}>
                <input type="radio" name="method" checked={method === 'express'} onChange={() => setMethod('express')} />
                <span><strong>Express</strong> · 1–2 days</span>
                <span>{formatPrice(20)}</span>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="form">
              <Field label="Card number" error={errors.card}>
                <input inputMode="numeric" value={payment.card} onChange={(e) => setPay('card', formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" aria-invalid={!!errors.card} />
              </Field>
              <div className="form-row">
                <Field label="Expiry" error={errors.expiry}>
                  <input inputMode="numeric" value={payment.expiry} onChange={(e) => setPay('expiry', formatExpiry(e.target.value))} placeholder="MM/YY" aria-invalid={!!errors.expiry} />
                </Field>
                <Field label="CVC" error={errors.cvc}>
                  <input inputMode="numeric" value={payment.cvc} onChange={(e) => setPay('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" aria-invalid={!!errors.cvc} />
                </Field>
              </div>
              <Field label="Name on card" error={errors.cardName}>
                <input value={payment.cardName} onChange={(e) => setPay('cardName', e.target.value)} aria-invalid={!!errors.cardName} />
              </Field>
              <p className="checkout__note">Demo only — no real payment is processed. Try 4242 4242 4242 4242.</p>
            </div>
          )}

          {step === 3 && (
            <div className="review">
              <div className="review__block">
                <h3>Shipping to</h3>
                <p>{shipping.name}<br />{shipping.address}<br />{shipping.city}, {shipping.zip}<br />{shipping.country}<br />{shipping.email}</p>
              </div>
              <div className="review__block">
                <h3>Delivery</h3>
                <p>{method === 'express' ? 'Express · 1–2 days' : 'Standard · 3–5 days'}</p>
              </div>
              <div className="review__block">
                <h3>Payment</h3>
                <p>Card ending {payment.card.replace(/\s/g, '').slice(-4)}</p>
              </div>
            </div>
          )}

          <div className="checkout__nav">
            {step > 0 && <button className="btn" onClick={back}>Back</button>}
            {step < STEPS.length - 1
              ? <button className="btn btn--primary" onClick={next}>Continue</button>
              : <button className="btn btn--primary" onClick={placeOrder}>Place order</button>}
          </div>
        </div>

        <aside className="summary">
          <h3 className="summary__title">Order summary</h3>
          <ul className="summary__items">
            {items.map((i) => (
              <li key={i.id}>
                <span>{i.name}{i.size ? ` · ${i.size}` : ''} × {i.qty}</span>
                <span>{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="summary__row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="summary__row"><span>Shipping</span><span>{ship === 0 ? 'Free' : formatPrice(ship)}</span></div>
          <div className="summary__row summary__row--total"><span>Total</span><span>{formatPrice(total)}</span></div>
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`. With items in the cart, go to `/checkout`. Confirm: Continue with empty shipping shows inline field errors; valid shipping advances; delivery choice changes the summary shipping cost; payment validates card/expiry/CVC formats (and auto-formats as you type); review shows entered details; "Place order" routes to confirmation and the cart empties. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CheckoutPage.jsx
git commit -m "feat: build multi-step simulated checkout with validation"
```

---

### Task 16: Order confirmation page

**Files:**
- Overwrite: `src/pages/OrderConfirmationPage.jsx`

- [ ] **Step 1: Overwrite `src/pages/OrderConfirmationPage.jsx`**

```jsx
import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/format.js'

const LAST_ORDER_KEY = 'b2b_last_order'

export default function OrderConfirmationPage() {
  let order = null
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY)
    order = raw ? JSON.parse(raw) : null
  } catch {
    order = null
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <h1>No recent order</h1>
        <Link to="/shop" className="btn btn--primary">Shop products</Link>
      </div>
    )
  }

  return (
    <div className="confirmation container">
      <div className="confirmation__badge">✓</div>
      <h1>Order confirmed</h1>
      <p className="confirmation__num">Order <strong>{order.orderNumber}</strong></p>
      <p>A confirmation was “sent” to {order.shipping.email}. (Demo — no real email or charge.)</p>
      <div className="summary">
        <ul className="summary__items">
          {order.items.map((i) => (
            <li key={i.id}>
              <span>{i.name}{i.size ? ` · ${i.size}` : ''} × {i.qty}</span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="summary__row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
        <div className="summary__row"><span>Shipping</span><span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span></div>
        <div className="summary__row summary__row--total"><span>Total</span><span>{formatPrice(order.total)}</span></div>
      </div>
      <Link to="/shop" className="btn btn--primary">Continue shopping</Link>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`. After placing an order, confirm the confirmation page shows the order number, the items, and the totals; visiting `/order-confirmation` directly with no order shows the "No recent order" fallback. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/OrderConfirmationPage.jsx
git commit -m "feat: build order confirmation page"
```

---

### Task 17: Full verification pass

**Files:** none

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass — Phase 1 suites plus `cart`, `wishlist`, `checkout`, `QtyStepper`, and the updated `ProductCard`.

- [ ] **Step 2: Verify no CSS Grid**

Run: `grep -rn "display: *grid\|grid-template\|grid-area\|grid-column\|grid-row" src/`
Expected: no matches.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 4: End-to-end walkthrough (browser)**

Run: `npm run dev`. Full happy path: home → shop → product → select size → add to cart (drawer opens) → adjust qty → checkout → fill shipping → choose express → enter test card → review → place order → confirmation. Then verify cart is empty and the header badge cleared. Reload the page mid-flow to confirm the cart persists from `localStorage`. Check a phone width for the drawer and checkout layout. Stop the server.

- [ ] **Step 5: Confirm clean tree**

Run: `git status` — expect only untracked tooling files (`.agents/`, `skills-lock.json`); everything else committed.

---

## Self-Review

**Spec coverage (Phase 2 scope):**
- CartContext + reducer + persistence → Tasks 1, 6. ✓
- WishlistContext + reducer + persistence → Tasks 2, 6. ✓
- UIContext (cart drawer open/close) → Task 6. ✓
- Slide-in cart drawer → Task 8, mounted Task 9. ✓
- Cart page → Task 13. Wishlist page → Task 14. ✓
- Add-to-cart from product page (+ size-required) and wishlist heart on cards/PDP → Tasks 11, 12. ✓
- Header cart/wishlist badges → Task 10. ✓
- 4-step simulated checkout with validation + order math → Tasks 3, 15. ✓
- Order confirmation with generated order number → Tasks 3, 16. ✓
- Routes `/cart`, `/wishlist`, `/checkout`, `/order-confirmation` → Task 9. ✓
- Loading/empty states (cart, wishlist, drawer, checkout-empty) → Tasks 8, 13, 14, 15, 16. ✓
- Flexbox-only styling → Task 5 + verified Task 17. ✓
- Tests: cart, wishlist, checkout logic + QtyStepper + ProductCard provider update → Tasks 1, 2, 3, 7, 11. ✓
- Quick-view modal and reviews are correctly deferred to Phase 3 (not in this plan).

**Placeholder scan:** No "TBD"/"TODO" work items. Stub pages in Task 9 are explicitly replaced in Tasks 13–16. The `/search` route is still Phase 3 (header search remains a known no-op until then, as documented in Phase 1).

**Type/name consistency:** `lineId`/`cartReducer`/`cartCount`/`cartSubtotal` (cart.js) ↔ CartContext ↔ CartDrawer/CartPage. `wishlistReducer`/`inWishlist` ↔ WishlistContext (`has`, `toggle`, `remove`, `count`, `ids`) ↔ ProductCard/ProductPage/WishlistPage/Header. `useUI` (`cartOpen`, `openCart`, `closeCart`) ↔ Header/ProductPage/CartDrawer. checkout.js exports (`shippingCost`, `validateShipping`, `validatePayment`, `formatCardNumber`, `formatExpiry`, `createOrder`) ↔ CheckoutPage; order fields (`orderNumber`, `items`, `subtotal`, `shippingCost`, `total`, `shipping.email`) ↔ OrderConfirmationPage. Cart line-item shape (`id`, `slug`, `name`, `price`, `image`, `size`, `color`, `qty`) is produced in ProductPage `addItem` and consumed everywhere. `localStorage` keys (`b2b_cart`, `b2b_wishlist`, `b2b_last_order`) are consistent across contexts and checkout/confirmation. New `Icon` entries (`Heart`, `HeartFilled`, `Bag`, `Trash`, `Plus`, `Minus`) are used by Header/ProductCard/ProductPage/QtyStepper/CartDrawer.
