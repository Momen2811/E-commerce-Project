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
