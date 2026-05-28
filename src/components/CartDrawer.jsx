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
