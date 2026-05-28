import { Link } from 'react-router-dom'
import { formatPrice, discountPercent } from '../lib/format.js'

export default function ProductCard({ product }) {
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price
  const off = discountPercent(product.price, product.compareAtPrice)
  return (
    <article className="card">
      <Link to={`/product/${product.slug}`} className="card__link">
        <div className="card__media">
          <img className="card__img" src={product.images[0]} alt={product.name} loading="lazy" />
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
