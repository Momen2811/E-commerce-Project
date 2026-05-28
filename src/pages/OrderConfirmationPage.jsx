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
