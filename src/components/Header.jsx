import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { Icon } from '../icons.jsx'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

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
      </div>
    </header>
  )
}
