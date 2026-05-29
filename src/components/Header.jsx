import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { Icon } from '../icons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useUI } from '../context/UIContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { count } = useCart()
  const wishlist = useWishlist()
  const { openCart } = useUI()
  const { isAuthenticated, user } = useAuth()

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
        <button className="header__menu-btn" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <Icon.Close /> : <Icon.Menu />}
        </button>
        <Link to="/" className="header__logo" aria-label="B2B home" onClick={close}>
          <Logo />
        </Link>
        <nav className={`header__nav ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/shop/women" className="header__link" onClick={close}>Women</NavLink>
          <NavLink to="/shop/men" className="header__link" onClick={close}>Men</NavLink>
          <NavLink to="/shop/unisex" className="header__link" onClick={close}>Unisex</NavLink>
          <NavLink to="/shop" end className="header__link" onClick={close}>Shop All</NavLink>
          <form className="header__search" onSubmit={submitSearch} role="search">
            <Icon.Search width={16} height={16} />
            <input type="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
          </form>
        </nav>
        <div className="header__actions">
          <ThemeToggle />
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
