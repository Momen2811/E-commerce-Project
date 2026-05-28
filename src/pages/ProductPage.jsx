import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductBySlug, getProducts } from '../lib/cms.js'
import { formatPrice, discountPercent } from '../lib/format.js'
import ProductGrid from '../components/ProductGrid.jsx'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    getProductBySlug(slug).then(async (p) => {
      if (!active) return
      setProduct(p)
      setActiveImage(0)
      setColor(p?.colors?.[0]?.name ?? null)
      setSize(null)
      if (p) {
        const all = await getProducts()
        setRelated(all.filter((x) => x.type === p.type && x.id !== p.id).slice(0, 4))
      } else {
        setRelated([])
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [slug])

  if (loading) return <div className="container" style={{ padding: '60px 20px' }}><p>Loading…</p></div>
  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <h1>Product not found</h1>
        <Link to="/shop" className="btn btn--primary">Back to shop</Link>
      </div>
    )
  }

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price
  const off = discountPercent(product.price, product.compareAtPrice)

  return (
    <div className="pdp container">
      <div className="pdp__main">
        <div className="pdp__gallery">
          <div className="pdp__image">
            <img src={product.images[activeImage]} alt={product.name} />
          </div>
          <div className="pdp__thumbs">
            {product.images.map((src, i) => (
              <button key={i} type="button" className={`pdp__thumb ${i === activeImage ? 'is-active' : ''}`} onClick={() => setActiveImage(i)}>
                <img src={src} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp__info">
          <p className="pdp__eyebrow">{product.audience} · {product.type}</p>
          <h1 className="pdp__name">{product.name}</h1>
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

          <div className="pdp__field">
            <span className="pdp__label">Size</span>
            <div className="size-row">
              {product.sizes.map((s) => (
                <button key={s} type="button" className={`size-chip ${size === s ? 'is-active' : ''}`} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Add-to-cart button is added in Phase 2 once CartContext exists. */}

          <p className="pdp__desc">{product.description}</p>
          <ul className="pdp__meta">
            <li><strong>Material:</strong> {product.material}</li>
            <li><strong>Availability:</strong> {product.inStock ? 'In stock' : 'Sold out'}</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="section__head"><h2 className="section__title">You might also like</h2></div>
          <ProductGrid products={related} loading={false} />
        </section>
      )}
    </div>
  )
}
