import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { addUserOrder } from '../lib/userStore.js'
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
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState({ email: user?.email || '', name: user?.name || '', address: '', city: '', zip: '', country: '' })
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
    if (user) addUserOrder(user.id, order)
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
