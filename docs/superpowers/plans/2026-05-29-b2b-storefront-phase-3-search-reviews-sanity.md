# B2B Storefront — Phase 3: Search, Quick-View, Reviews & Sanity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the storefront's remaining features: a search results page, a quick-view modal launched from product cards, product reviews with ratings, and the live Sanity CMS integration (client + Studio workspace) behind the existing seed fallback.

**Architecture:** Same conventions as Phases 1–2. New pure logic (`search.js`, `reviews.js`) lives in `src/lib/` and is unit-tested. Reviews data follows the `cms.js` seam (`getReviews`), which gains a Sanity branch alongside the product functions. Quick-view state is added to `UIContext`. **Flexbox only — never CSS Grid.**

**Tech Stack:** React 18, Vite 5, React Router v6, Vitest + RTL, plain CSS, `@sanity/client` (app), Sanity Studio v3 (separate `studio/` workspace). JavaScript only.

**Builds on:** Phase 1 + Phase 2 (now on `main`). Reuses `cms.js`, `format.js`, `ProductGrid`, `ProductCard`, `UIContext`/`CartContext`/`WishlistContext`, `Icon`, and the product shape (incl. `rating`, `reviewCount`).

**Review shape:**
```js
{ id: 'r-001', productId: 'p-001', author: 'Lena R.', rating: 5, title: 'Perfect fit', body: '…', date: '2026-04-10' }
```

**Sanity note:** The live CMS activates only when `VITE_SANITY_PROJECT_ID` is set; until then everything runs on seed data (and all tests use seed). The `studio/` workspace is delivered as ready-to-run files; installing its heavy deps (`cd studio && npm install`) and creating a Sanity project are the user's setup steps and are NOT done in this plan.

---

### Task 1: Search logic (TDD)

**Files:**
- Create: `src/lib/search.js`
- Test: `src/lib/search.test.js`

- [ ] **Step 1: Write the failing test `src/lib/search.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { searchProducts } from './search.js'

const P = [
  { id: '1', name: 'Boxy Logo Tee', type: 'tops', audience: 'unisex', description: 'Heavyweight cotton tee' },
  { id: '2', name: 'Cargo Pants', type: 'bottoms', audience: 'men', description: 'Relaxed cargo with pockets' },
  { id: '3', name: 'Slip Dress', type: 'dresses', audience: 'women', description: 'Bias-cut satin' },
]

describe('searchProducts', () => {
  it('returns [] for an empty query', () => {
    expect(searchProducts(P, '')).toEqual([])
    expect(searchProducts(P, '   ')).toEqual([])
  })
  it('matches on name, case-insensitive', () => {
    expect(searchProducts(P, 'boxy').map((p) => p.id)).toEqual(['1'])
  })
  it('matches on type', () => {
    expect(searchProducts(P, 'dresses').map((p) => p.id)).toEqual(['3'])
  })
  it('matches on description words', () => {
    expect(searchProducts(P, 'cotton').map((p) => p.id)).toEqual(['1'])
  })
  it('returns multiple matches', () => {
    expect(searchProducts(P, 'a').length).toBeGreaterThan(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- search`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/search.js`**

```js
export function searchProducts(products, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []
  return products.filter((p) => {
    const hay = [p.name, p.type, p.audience, p.description].join(' ').toLowerCase()
    return hay.includes(q)
  })
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- search`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/search.js src/lib/search.test.js
git commit -m "feat: add product search logic"
```

---

### Task 2: Append Phase 3 styles

**Files:**
- Modify: `src/index.css` (append at the very end)

- [ ] **Step 1: Append the following CSS to `src/index.css`**

```css
/* ===== Phase 3: search / reviews / quick-view ===== */

/* Stars */
.stars { position: relative; display: inline-flex; line-height: 0; vertical-align: middle; }
.stars__base { display: inline-flex; color: #d4d0c8; }
.stars__fill { position: absolute; top: 0; left: 0; display: inline-flex; overflow: hidden; white-space: nowrap; color: var(--accent); }

/* Product card rating + quick view */
.card__rating { display: flex; align-items: center; gap: 6px; }
.card__rating-n { font-size: .75rem; color: var(--muted); }
.card__quickview {
  position: absolute; left: 10px; right: 10px; bottom: 10px; padding: 9px 0; border: 0; border-radius: 6px;
  background: var(--ink); color: #fff; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
  opacity: 0; transform: translateY(8px); transition: opacity .18s ease, transform .18s ease;
}
.card:hover .card__quickview { opacity: 1; transform: translateY(0); }
@media (hover: none) { .card__quickview { opacity: 1; transform: none; } }

/* PDP rating line */
.pdp__rating { display: flex; align-items: center; gap: 8px; font-size: .85rem; color: var(--muted); }

/* Reviews */
.reviews__body { display: flex; align-items: flex-start; gap: 40px; flex-wrap: wrap; }
.reviews__summary { flex: 0 0 240px; display: flex; flex-direction: column; gap: 8px; }
.reviews__avg { font-family: var(--font-display); font-size: 3rem; line-height: 1; }
.reviews__count { color: var(--muted); font-size: .85rem; margin: 0; }
.reviews__bars { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.reviews__bar { display: flex; align-items: center; gap: 8px; font-size: .78rem; }
.reviews__bar-label { width: 12px; color: var(--muted); }
.reviews__bar-track { flex: 1; height: 6px; background: var(--line); border-radius: 999px; overflow: hidden; }
.reviews__bar-fill { display: block; height: 100%; background: var(--accent); }
.reviews__bar-n { width: 20px; text-align: right; color: var(--muted); }
.reviews__list { flex: 1 1 360px; list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 22px; }
.review { border-bottom: 1px solid var(--line); padding-bottom: 18px; }
.review__head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.review__author { font-weight: 600; font-size: .85rem; }
.review__date { color: var(--muted); font-size: .78rem; margin-left: auto; }
.review__title { margin: 4px 0; font-size: 1rem; }
.review__body { margin: 0; color: #333; font-size: .9rem; }
.reviews__empty { color: var(--muted); }

/* Quick-view modal */
.modal-overlay { position: fixed; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0,0,0,.5); }
.modal { position: relative; display: flex; gap: 0; width: 100%; max-width: 760px; max-height: 90vh; overflow: hidden; background: var(--bg); border-radius: var(--radius); }
.modal__close { position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,.85); z-index: 2; }
.modal__media { flex: 1 1 50%; background: var(--surface); }
.modal__media img { width: 100%; height: 100%; object-fit: cover; }
.modal__info { flex: 1 1 50%; padding: 28px 24px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
.modal__name { font-family: var(--font-display); text-transform: uppercase; margin: 0; font-size: 1.6rem; line-height: 1.05; }
.modal__details { font-size: .8rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; border-bottom: 2px solid var(--accent); align-self: flex-start; }

@media (max-width: 640px) {
  .modal { flex-direction: column; max-height: 92vh; overflow-y: auto; }
  .modal__media { flex: 0 0 auto; height: 240px; }
  .reviews__summary { flex: 1 1 100%; }
}
```

- [ ] **Step 2: Verify no CSS Grid was introduced**

Run: `grep -n "display: *grid\|grid-template\|grid-area" src/index.css`
Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add styles for search, reviews, and quick-view"
```

---

### Task 3: Search results page

**Files:**
- Create: `src/pages/SearchPage.jsx`
- Modify: `src/App.jsx` (add the `/search` route)

- [ ] **Step 1: Write `src/pages/SearchPage.jsx`**

```jsx
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../lib/cms.js'
import { searchProducts } from '../lib/search.js'
import ProductGrid from '../components/ProductGrid.jsx'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getProducts().then((p) => { if (active) { setAll(p); setLoading(false) } })
    return () => { active = false }
  }, [])

  const results = useMemo(() => searchProducts(all, query), [all, query])

  return (
    <div className="shop">
      <div className="shop__head">
        <h1 className="shop__title">Search</h1>
      </div>
      {query
        ? <p className="shop__count">{results.length} result{results.length === 1 ? '' : 's'} for “{query}”</p>
        : <p className="shop__count">Type in the search box to find products.</p>}
      {query && (
        <ProductGrid products={results} loading={loading} emptyMessage={`No products match “${query}”.`} />
      )}
      {query && !loading && results.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/shop" className="btn btn--primary">Browse all products</Link>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add the route to `src/App.jsx`**

Add the import near the other page imports:
```jsx
import SearchPage from './pages/SearchPage.jsx'
```
Add the route inside `<Routes>` (e.g. right after the `/wishlist` route):
```jsx
                <Route path="/search" element={<SearchPage />} />
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`. Use the header search (e.g. "hoodie", "dress", "cargo"); confirm `/search?q=…` shows matching products, the result count, and a no-match state for gibberish. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/SearchPage.jsx src/App.jsx
git commit -m "feat: add search results page and route"
```

---

### Task 4: Review data, getReviews, and review math (TDD)

**Files:**
- Create: `src/data/reviews.js`, `src/lib/reviews.js`
- Test: `src/lib/reviews.test.js`
- Modify: `src/lib/cms.js` (add `getReviews`)

- [ ] **Step 1: Write `src/data/reviews.js`**

```js
export const reviews = [
  { id: 'r-001', productId: 'p-001', author: 'Lena R.', rating: 5, title: 'Perfect everyday tee', body: 'Heavy, boxy, holds its shape after washing. Bought two.', date: '2026-04-18' },
  { id: 'r-002', productId: 'p-001', author: 'Marcus T.', rating: 4, title: 'Great fit, runs a touch big', body: 'Size down if you like it fitted. Quality is excellent.', date: '2026-03-30' },
  { id: 'r-003', productId: 'p-001', author: 'Priya S.', rating: 5, title: 'Love it', body: 'The tonal logo is subtle and clean.', date: '2026-05-02' },
  { id: 'r-004', productId: 'p-002', author: 'Dan K.', rating: 5, title: 'Warmest hoodie I own', body: 'The fleece is unreal. Worth every penny.', date: '2026-04-10' },
  { id: 'r-005', productId: 'p-002', author: 'Sofia M.', rating: 4, title: 'Cozy', body: 'Slightly long in the sleeves for me but I love it.', date: '2026-02-21' },
  { id: 'r-006', productId: 'p-006', author: 'Hana L.', rating: 5, title: 'Stunning drape', body: 'Wore it to a wedding and got endless compliments.', date: '2026-05-09' },
  { id: 'r-007', productId: 'p-006', author: 'Amelia W.', rating: 5, title: 'Elegant', body: 'The satin feels luxe and the bias cut is flattering.', date: '2026-04-27' },
  { id: 'r-008', productId: 'p-009', author: 'Theo B.', rating: 4, title: 'Solid high-tops', body: 'Gum sole grips well. Took a day to break in.', date: '2026-03-15' },
  { id: 'r-009', productId: 'p-003', author: 'Noah F.', rating: 4, title: 'Great jacket', body: 'Rigid at first, breaks in beautifully.', date: '2026-04-02' },
]
```

- [ ] **Step 2: Write the failing test `src/lib/reviews.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { averageRating, ratingDistribution } from './reviews.js'

const R = [{ rating: 5 }, { rating: 4 }, { rating: 5 }, { rating: 3 }]

describe('averageRating', () => {
  it('returns 0 for no reviews', () => {
    expect(averageRating([])).toBe(0)
  })
  it('averages and rounds to one decimal', () => {
    expect(averageRating(R)).toBe(4.3)
  })
})

describe('ratingDistribution', () => {
  it('counts each star bucket 1–5', () => {
    expect(ratingDistribution(R)).toEqual({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 })
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- "lib/reviews"`
Expected: FAIL — module not found.

- [ ] **Step 4: Write `src/lib/reviews.js`**

```js
export function averageRating(reviews) {
  if (!reviews.length) return 0
  const sum = reviews.reduce((s, r) => s + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export function ratingDistribution(reviews) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach((r) => { if (dist[r.rating] != null) dist[r.rating] += 1 })
  return dist
}
```

- [ ] **Step 5: Add `getReviews` to `src/lib/cms.js`**

Add the seed import at the top, next to the products import:
```js
import { reviews as seedReviews } from '../data/reviews.js'
```
Add this exported function at the end of the file:
```js
export async function getReviews(productId) {
  return seedReviews.filter((r) => r.productId === productId)
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- "lib/reviews"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/reviews.js src/lib/reviews.js src/lib/reviews.test.js src/lib/cms.js
git commit -m "feat: add reviews data, getReviews, and rating math"
```

---

### Task 5: Stars component

**Files:**
- Create: `src/components/Stars.jsx`

- [ ] **Step 1: Write `src/components/Stars.jsx`**

```jsx
import { Icon } from '../icons.jsx'

export default function Stars({ value = 0, size = 16 }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  const row = [0, 1, 2, 3, 4]
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      <span className="stars__base">{row.map((i) => <Icon.Star key={i} width={size} height={size} />)}</span>
      <span className="stars__fill" style={{ width: `${pct}%` }}>{row.map((i) => <Icon.Star key={i} width={size} height={size} />)}</span>
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Stars.jsx
git commit -m "feat: add Stars rating display component"
```

---

### Task 6: Reviews on the product page

**Files:**
- Create: `src/components/Reviews.jsx`
- Modify: `src/pages/ProductPage.jsx` (rating line near the name + `<Reviews/>` section)

- [ ] **Step 1: Write `src/components/Reviews.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { getReviews } from '../lib/cms.js'
import { averageRating, ratingDistribution } from '../lib/reviews.js'
import Stars from './Stars.jsx'

export default function Reviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getReviews(productId).then((r) => { if (active) { setReviews(r); setLoading(false) } })
    return () => { active = false }
  }, [productId])

  if (loading) return null
  const avg = averageRating(reviews)
  const dist = ratingDistribution(reviews)

  return (
    <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="section__head"><h2 className="section__title">Reviews</h2></div>
      {reviews.length === 0 ? (
        <p className="reviews__empty">No reviews yet.</p>
      ) : (
        <div className="reviews__body">
          <div className="reviews__summary">
            <div className="reviews__avg">{avg.toFixed(1)}</div>
            <Stars value={avg} size={20} />
            <p className="reviews__count">{reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
            <div className="reviews__bars">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = dist[star]
                const pct = reviews.length ? (n / reviews.length) * 100 : 0
                return (
                  <div className="reviews__bar" key={star}>
                    <span className="reviews__bar-label">{star}</span>
                    <span className="reviews__bar-track"><span className="reviews__bar-fill" style={{ width: `${pct}%` }} /></span>
                    <span className="reviews__bar-n">{n}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <ul className="reviews__list">
            {reviews.map((r) => (
              <li className="review" key={r.id}>
                <div className="review__head">
                  <Stars value={r.rating} size={14} />
                  <span className="review__author">{r.author}</span>
                  <span className="review__date">{new Date(r.date).toLocaleDateString()}</span>
                </div>
                <h4 className="review__title">{r.title}</h4>
                <p className="review__body">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Wire into `src/pages/ProductPage.jsx`**

Add imports near the top:
```jsx
import Stars from '../components/Stars.jsx'
import Reviews from '../components/Reviews.jsx'
```
Add a rating line directly under the `<h1 className="pdp__name">…</h1>` line:
```jsx
          <div className="pdp__rating">
            <Stars value={product.rating} size={16} />
            <span>{product.rating} · {product.reviewCount} reviews</span>
          </div>
```
Add the reviews section just before the closing `</div>` of `.pdp` (after the related-products `{related.length > 0 && (…)}` block):
```jsx
      <Reviews productId={product.id} />
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`. Open a product with reviews (e.g. the Boxy Logo Tee, Bias Slip Dress): confirm the rating stars under the title, and a Reviews section with the average, the distribution bars, and the review list. Open a product with no seeded reviews and confirm "No reviews yet." Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/components/Reviews.jsx src/pages/ProductPage.jsx
git commit -m "feat: show ratings and reviews on the product page"
```

---

### Task 7: Quick-view modal

**Files:**
- Modify: `src/context/UIContext.jsx` (add quick-view state)
- Create: `src/components/QuickViewModal.jsx`
- Modify: `src/App.jsx` (mount the modal)
- Modify: `src/components/ProductCard.jsx` (quick-view button + rating)
- Modify: `src/components/ProductCard.test.jsx` (wrap in `UIProvider`)

- [ ] **Step 1: Extend `src/context/UIContext.jsx`**

Replace the `UIProvider` body so it also manages a quick-view product:

```jsx
import { createContext, useContext, useState } from 'react'

const UICtx = createContext(null)

export function UIProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)
  const value = {
    cartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    quickView,
    openQuickView: (product) => setQuickView(product),
    closeQuickView: () => setQuickView(null),
  }
  return <UICtx.Provider value={value}>{children}</UICtx.Provider>
}

export function useUI() {
  const ctx = useContext(UICtx)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
```

- [ ] **Step 2: Write `src/components/QuickViewModal.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUI } from '../context/UIContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice, discountPercent } from '../lib/format.js'
import { Icon } from '../icons.jsx'

export default function QuickViewModal() {
  const { quickView: product, closeQuickView, openCart } = useUI()
  const { addItem } = useCart()
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const [sizeError, setSizeError] = useState(false)

  useEffect(() => {
    if (product) {
      setColor(product.colors?.[0]?.name ?? null)
      setSize(null)
      setSizeError(false)
    }
  }, [product])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') closeQuickView() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeQuickView])

  if (!product) return null

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price
  const off = discountPercent(product.price, product.compareAtPrice)
  const oneSize = product.sizes.length === 1 && product.sizes[0] === 'OS'
  const requiresSize = !oneSize && product.sizes.length > 0

  function add() {
    if (requiresSize && !size) { setSizeError(true); return }
    const effectiveSize = requiresSize ? size : (product.sizes[0] || null)
    addItem({
      productId: product.id, slug: product.slug, name: product.name, price: product.price,
      image: product.images[0], size: effectiveSize, color, qty: 1,
    })
    closeQuickView()
    openCart()
  }

  return (
    <div className="modal-overlay" onClick={closeQuickView}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={product.name} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn modal__close" aria-label="Close quick view" onClick={closeQuickView}><Icon.Close /></button>
        <div className="modal__media"><img src={product.images[0]} alt={product.name} /></div>
        <div className="modal__info">
          <h2 className="modal__name">{product.name}</h2>
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
            <button className="btn btn--primary" onClick={add} disabled={!product.inStock}>
              {product.inStock ? 'Add to cart' : 'Sold out'}
            </button>
          </div>
          <Link to={`/product/${product.slug}`} className="modal__details" onClick={closeQuickView}>View full details →</Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Mount the modal in `src/App.jsx`**

Add the import:
```jsx
import QuickViewModal from './components/QuickViewModal.jsx'
```
Render it right after `<CartDrawer />`:
```jsx
            <CartDrawer />
            <QuickViewModal />
```

- [ ] **Step 4: Overwrite `src/components/ProductCard.jsx`** (adds rating stars + quick-view button)

```jsx
import { Link } from 'react-router-dom'
import { formatPrice, discountPercent } from '../lib/format.js'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useUI } from '../context/UIContext.jsx'
import { Icon } from '../icons.jsx'
import Stars from './Stars.jsx'

export default function ProductCard({ product }) {
  const { has, toggle } = useWishlist()
  const { openQuickView } = useUI()
  const saved = has(product.id)
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price
  const off = discountPercent(product.price, product.compareAtPrice)

  function toggleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
  }

  function quickView(e) {
    e.preventDefault()
    e.stopPropagation()
    openQuickView(product)
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
          <button className="card__quickview" onClick={quickView}>Quick view</button>
        </div>
        <div className="card__info">
          <h3 className="card__name">{product.name}</h3>
          {typeof product.rating === 'number' && (
            <div className="card__rating">
              <Stars value={product.rating} size={13} />
              <span className="card__rating-n">{product.rating}</span>
            </div>
          )}
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

- [ ] **Step 5: Update `src/components/ProductCard.test.jsx`** so the render helper also provides `UIProvider`

Replace the imports + `renderCard` helper block with:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { WishlistProvider } from '../context/WishlistContext.jsx'
import { UIProvider } from '../context/UIContext.jsx'
import ProductCard from './ProductCard.jsx'

const base = {
  id: 'p-1', name: 'Boxy Tee', slug: 'boxy-tee', price: 48, compareAtPrice: null,
  images: ['/x.jpg'], isNew: false, inStock: true, colors: [], sizes: [], rating: 4.5,
}

const renderCard = (product) =>
  render(
    <UIProvider>
      <WishlistProvider>
        <MemoryRouter><ProductCard product={product} /></MemoryRouter>
      </WishlistProvider>
    </UIProvider>,
  )
```

(Keep the four existing `it(...)` cases. Note `base` now includes `rating`.)

- [ ] **Step 6: Run the ProductCard tests**

Run: `npm test -- ProductCard`
Expected: PASS (4 tests).

- [ ] **Step 7: Verify in browser**

Run: `npm run dev`. Hover a product card → a "Quick view" button appears; click it → modal opens with image, price, color/size, add-to-cart; adding closes the modal and opens the cart drawer; Escape and overlay-click close it; "View full details" navigates to the product. Stop the server.

- [ ] **Step 8: Commit**

```bash
git add src/context/UIContext.jsx src/components/QuickViewModal.jsx src/App.jsx src/components/ProductCard.jsx src/components/ProductCard.test.jsx
git commit -m "feat: add quick-view modal launched from product cards"
```

---

### Task 8: Sanity integration (client + Studio)

**Files:**
- Modify: `package.json` (add `@sanity/client`, `studio` script)
- Create: `src/lib/sanityClient.js`, `.env.example`
- Modify: `src/lib/cms.js` (Sanity branch with seed fallback)
- Create: `studio/package.json`, `studio/sanity.config.js`, `studio/schemas/index.js`, `studio/schemas/product.js`, `studio/schemas/review.js`, `studio/README.md`
- Modify: `CLAUDE.md` (Sanity setup note)

- [ ] **Step 1: Install the Sanity client (app only)**

Run: `npm install @sanity/client@^6.21.3`
Expected: adds the dependency; `package-lock.json` updates.

- [ ] **Step 2: Add a `studio` script to the root `package.json`**

In the `"scripts"` block add:
```json
    "studio": "npm --prefix studio run dev"
```

- [ ] **Step 3: Write `src/lib/sanityClient.js`**

```js
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const PRODUCT_FIELDS = `{
  "id": _id, name, "slug": slug.current, audience, type, price, compareAtPrice,
  description, material, "images": images[].asset->url,
  colors, sizes, rating, reviewCount, isNew, isFeatured, inStock,
  "createdAt": coalesce(createdAt, _createdAt)
}`

export async function sanityGetProducts() {
  return client.fetch(`*[_type == "product"]${PRODUCT_FIELDS}`)
}

export async function sanityGetProductBySlug(slug) {
  return client.fetch(`*[_type == "product" && slug.current == $slug][0]${PRODUCT_FIELDS}`, { slug })
}

export async function sanityGetFeatured() {
  return client.fetch(`*[_type == "product" && isFeatured == true]${PRODUCT_FIELDS}`)
}

export async function sanityGetReviews(productId) {
  return client.fetch(
    `*[_type == "review" && product._ref == $id] | order(date desc){ "id": _id, author, rating, title, body, date }`,
    { id: productId },
  )
}
```

- [ ] **Step 4: Overwrite `src/lib/cms.js`** to branch on Sanity with seed fallback

```js
import { products as seedProducts } from '../data/products.js'
import { reviews as seedReviews } from '../data/reviews.js'

const useSanity = Boolean(import.meta.env.VITE_SANITY_PROJECT_ID)

export async function getProducts() {
  if (useSanity) {
    const { sanityGetProducts } = await import('./sanityClient.js')
    return sanityGetProducts()
  }
  return seedProducts
}

export async function getProductBySlug(slug) {
  if (useSanity) {
    const { sanityGetProductBySlug } = await import('./sanityClient.js')
    return (await sanityGetProductBySlug(slug)) || null
  }
  return seedProducts.find((p) => p.slug === slug) || null
}

export async function getFeatured() {
  if (useSanity) {
    const { sanityGetFeatured } = await import('./sanityClient.js')
    return sanityGetFeatured()
  }
  return seedProducts.filter((p) => p.isFeatured)
}

export async function getReviews(productId) {
  if (useSanity) {
    const { sanityGetReviews } = await import('./sanityClient.js')
    return sanityGetReviews(productId)
  }
  return seedReviews.filter((r) => r.productId === productId)
}
```

- [ ] **Step 5: Create `.env.example`**

```
# Copy to .env and fill in to switch the storefront from seed data to your Sanity project.
VITE_SANITY_PROJECT_ID=
VITE_SANITY_DATASET=production
```

- [ ] **Step 6: Create the Studio workspace**

`studio/package.json`:
```json
{
  "name": "b2b-studio",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "sanity dev",
    "build": "sanity build",
    "deploy": "sanity deploy"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "sanity": "^3.57.0",
    "styled-components": "^6.1.13"
  }
}
```

`studio/sanity.config.js`:
```js
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas/index.js'

export default defineConfig({
  name: 'b2b',
  title: 'B2B',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'replace-with-your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
})
```

`studio/schemas/product.js`:
```js
export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'audience', title: 'Audience', type: 'string', options: { list: ['women', 'men', 'unisex'] } },
    { name: 'type', title: 'Type', type: 'string', options: { list: ['tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'accessories'] } },
    { name: 'price', title: 'Price', type: 'number' },
    { name: 'compareAtPrice', title: 'Compare-at price (sale)', type: 'number' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'material', title: 'Material', type: 'string' },
    { name: 'images', title: 'Images', type: 'array', of: [{ type: 'image' }] },
    {
      name: 'colors', title: 'Colors', type: 'array',
      of: [{ type: 'object', fields: [{ name: 'name', type: 'string' }, { name: 'hex', type: 'string' }] }],
    },
    { name: 'sizes', title: 'Sizes', type: 'array', of: [{ type: 'string' }] },
    { name: 'rating', title: 'Rating', type: 'number' },
    { name: 'reviewCount', title: 'Review count', type: 'number' },
    { name: 'isNew', title: 'New', type: 'boolean' },
    { name: 'isFeatured', title: 'Featured', type: 'boolean' },
    { name: 'inStock', title: 'In stock', type: 'boolean' },
    { name: 'createdAt', title: 'Created at', type: 'datetime' },
  ],
}
```

`studio/schemas/review.js`:
```js
export default {
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    { name: 'product', title: 'Product', type: 'reference', to: [{ type: 'product' }] },
    { name: 'author', title: 'Author', type: 'string' },
    { name: 'rating', title: 'Rating', type: 'number', validation: (Rule) => Rule.min(1).max(5) },
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'body', title: 'Body', type: 'text' },
    { name: 'date', title: 'Date', type: 'datetime' },
  ],
}
```

`studio/schemas/index.js`:
```js
import product from './product.js'
import review from './review.js'

export const schemaTypes = [product, review]
```

`studio/README.md`:
```md
# B2B Sanity Studio

Content workspace for the B2B storefront.

## Setup
1. Create a free project at https://sanity.io and note the **project ID**.
2. `cd studio && npm install`
3. Set `SANITY_STUDIO_PROJECT_ID` (env or in `sanity.config.js`).
4. `npm run dev` — Studio runs at http://localhost:3333
5. Add products/reviews, then in the storefront set `VITE_SANITY_PROJECT_ID` (in `.env`) to the same project ID and restart `npm run dev`. The storefront switches from seed data to Sanity automatically.
```

- [ ] **Step 7: Add a Sanity section to `CLAUDE.md`**

Append under the "Data layer" discussion (or at the end):
```md
## Sanity (optional CMS)

The storefront runs on local seed data by default. To use the live CMS:
- App: copy `.env.example` to `.env`, set `VITE_SANITY_PROJECT_ID` (+ dataset). `src/lib/cms.js` then dynamically imports `src/lib/sanityClient.js` and queries Sanity; otherwise it returns seed data. Both paths return the identical shape.
- Studio: `cd studio && npm install`, set the project id in `studio/sanity.config.js`, `npm run studio` (root) or `npm run dev` (in studio). Schemas in `studio/schemas/` mirror the seed data shape.
```

- [ ] **Step 8: Verify the app still builds and runs on seed data**

Run: `npm run build`
Expected: build succeeds (Sanity client is code-split into its own chunk and is not loaded when `VITE_SANITY_PROJECT_ID` is unset).
Run: `npm test`
Expected: all tests pass (no env set → seed path).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/lib/sanityClient.js src/lib/cms.js .env.example studio CLAUDE.md
git commit -m "feat: wire Sanity client with seed fallback and add Studio workspace"
```

---

### Task 9: Full verification pass

**Files:** none

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass — Phases 1–2 plus `search`, `lib/reviews`, and the updated `ProductCard`.

- [ ] **Step 2: Verify no CSS Grid**

Run: `grep -rn "display: *grid\|grid-template\|grid-area\|grid-column\|grid-row" src/`
Expected: no matches.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 4: End-to-end walkthrough (browser)**

Run: `npm run dev`. Check: header search → results page; hover card → quick-view → add to cart; product page shows rating + reviews (avg, bars, list); a no-review product shows the empty state. Check a phone width for the quick-view modal (stacks vertically) and reviews layout. Stop the server.

- [ ] **Step 5: Confirm clean tree**

Run: `git status` — expect only untracked tooling files (`.agents/`, `skills-lock.json`).

---

## Self-Review

**Spec coverage (Phase 3 scope):**
- Search (header → `/search?q=`, name/type/description match) → Tasks 1, 3. ✓
- Quick-view modal (from cards, add-to-cart, full-details link, Escape/overlay close) → Task 7. ✓
- Reviews & ratings (avg, distribution, list; stars on PDP + cards) → Tasks 4, 5, 6, 7. ✓
- Sanity client + cms branch (seed fallback, identical shape) + Studio workspace + `.env.example` + docs → Task 8. ✓
- Loading/empty states (search no-match, no-reviews) → Tasks 3, 6. ✓
- Flexbox-only → Task 2 + verified Task 9. ✓
- Tests: search + review math (TDD) + ProductCard provider update → Tasks 1, 4, 7. ✓

**Placeholder scan:** No "TBD"/"TODO" work items. The Studio's heavy install and Sanity project creation are explicit user setup steps (documented), not gaps — the app and tests run fully on seed data without them.

**Type/name consistency:** `searchProducts` (search.js) ↔ SearchPage. `averageRating`/`ratingDistribution` (reviews.js) ↔ Reviews.jsx. `getReviews` added to cms.js ↔ Reviews.jsx and `sanityGetReviews`. Review shape (`id, productId, author, rating, title, body, date`) consistent between `data/reviews.js`, the math, and the Sanity query (which aliases `_id`→`id` and resolves `product._ref`). `UIContext` now exposes `quickView`/`openQuickView`/`closeQuickView` ↔ ProductCard + QuickViewModal + App mount. `Stars` props (`value`, `size`) ↔ all callers. cms.js Sanity functions return the same product shape as seed (GROQ projection mirrors `data/products.js`). ProductCard now consumes `useUI`, so its test wraps `UIProvider`.
