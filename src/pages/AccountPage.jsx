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
