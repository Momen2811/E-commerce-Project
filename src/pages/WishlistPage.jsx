import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../lib/cms.js'
import { useWishlist } from '../context/WishlistContext.jsx'
import ProductGrid from '../components/ProductGrid.jsx'

export default function WishlistPage() {
  const { ids } = useWishlist()
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getProducts().then((p) => { if (active) { setAll(p); setLoading(false) } })
    return () => { active = false }
  }, [])

  const saved = all.filter((p) => ids.includes(p.id))

  return (
    <div className="shop">
      <div className="shop__head"><h1 className="shop__title">Wishlist</h1></div>
      <ProductGrid products={saved} loading={loading} emptyMessage="No saved items yet — tap the heart on any product." />
      {!loading && ids.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/shop" className="btn btn--primary">Find something you love</Link>
        </div>
      )}
    </div>
  )
}
