import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../lib/cms.js'
import { searchProducts } from '../lib/search.js'
import ProductGrid from '../components/ProductGrid.jsx'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getProducts().then((p) => { if (active) { setAll(p); setLoading(false) } })
    return () => { active = false }
  }, [])

  const results = useMemo(() => searchProducts(all, query), [all, query])

  return (
    <div className="shop">
      <div className="shop__head">
        <h1 className="shop__title">Search</h1>
      </div>
      {query
        ? <p className="shop__count">{results.length} result{results.length === 1 ? '' : 's'} for “{query}”</p>
        : <p className="shop__count">Type in the search box to find products.</p>}
      {query && (
        <ProductGrid products={results} loading={loading} emptyMessage={`No products match “${query}”.`} />
      )}
      {query && !loading && results.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/shop" className="btn btn--primary">Browse all products</Link>
        </div>
      )}
    </div>
  )
}
