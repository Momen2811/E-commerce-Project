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
