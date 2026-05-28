import ProductCard from './ProductCard.jsx'
import Skeleton from './Skeleton.jsx'
import EmptyState from './EmptyState.jsx'

export default function ProductGrid({ products = [], loading = false, emptyMessage = 'No products found.' }) {
  if (loading) {
    return (
      <div className="product-list">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    )
  }
  if (!products.length) return <EmptyState message={emptyMessage} />
  return (
    <div className="product-list">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
