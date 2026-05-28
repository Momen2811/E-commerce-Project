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
