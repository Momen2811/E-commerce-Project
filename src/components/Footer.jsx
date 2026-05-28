import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__col">
          <Logo variant="full" className="logo--invert" />
          <p style={{ color: '#bbb', maxWidth: 240, fontSize: '.85rem' }}>Bold basics, built to last. Streetwear staples for everyone.</p>
        </div>
        <div className="footer__col">
          <h4>Shop</h4>
          <a href="/shop/women">Women</a>
          <a href="/shop/men">Men</a>
          <a href="/shop/unisex">Unisex</a>
        </div>
        <div className="footer__col">
          <h4>Help</h4>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className="footer__bottom">© 2026 B2B. All rights reserved.</div>
    </footer>
  )
}
