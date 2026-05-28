import { Link } from 'react-router-dom'
import { formatPrice, discountPercent } from '../lib/format.js'
import { useWishlist } from '../context/WishlistContext.jsx'
import { Icon } from '../icons.jsx'

export default function ProductCard({ product }) {
  const { has, toggle } = useWishlist()
  const saved = has(product.id)
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price
  const off = discountPercent(product.price, product.compareAtPrice)

  function toggleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
  }

  return (
    <article className="card">
      <Link to={`/product/${product.slug}`} className="card__link">
        <div className="card__media">
          <img className="card__img" src={product.images[0]} alt={product.name} loading="lazy" />
          <button
            className={`heart ${saved ? 'is-active' : ''}`}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            onClick={toggleWishlist}
          >
            {saved ? <Icon.HeartFilled width={18} height={18} /> : <Icon.Heart width={18} height={18} />}
          </button>
          <div className="card__badges">
            {product.isNew && <span className="badge badge--new">New</span>}
            {onSale && <span className="badge badge--sale">-{off}%</span>}
            {!product.inStock && <span className="badge badge--out">Sold out</span>}
          </div>
        </div>
        <div className="card__info">
          <h3 className="card__name">{product.name}</h3>
          <div className="card__price">
            <span className={onSale ? 'price price--sale' : 'price'}>{formatPrice(product.price)}</span>
            {onSale && <span className="price price--old">{formatPrice(product.compareAtPrice)}</span>}
          </div>
        </div>
      </Link>
    </article>
  )
}
