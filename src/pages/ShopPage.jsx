import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getProducts } from '../lib/cms.js'
import { filterProducts, sortProducts, parseFilters, serializeFilters } from '../lib/filters.js'
import ProductGrid from '../components/ProductGrid.jsx'
import FilterPanel from '../components/FilterPanel.jsx'
import SortDropdown from '../components/SortDropdown.jsx'
import { Icon } from '../icons.jsx'

const AUDIENCE_LABELS = { women: 'Women', men: 'Men', unisex: 'Unisex' }

export default function ShopPage() {
  const { audience } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    let active = true
    getProducts().then((p) => { if (active) { setAllProducts(p); setLoading(false) } })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => {
    const parsed = parseFilters(searchParams)
    return { ...parsed, audience: audience || parsed.audience || null }
  }, [searchParams, audience])

  const visible = useMemo(
    () => sortProducts(filterProducts(allProducts, filters), filters.sort),
    [allProducts, filters],
  )

  function updateFilters(next) {
    const merged = { ...filters, ...next }
    // audience stays in the path, not the query string
    const { audience: _omit, ...queryable } = merged
    setSearchParams(serializeFilters(queryable), { replace: true })
  }

  const title = audience ? (AUDIENCE_LABELS[audience] || 'Shop') : 'Shop All'

  return (
    <div className="shop">
      <div className="shop__head">
        <h1 className="shop__title">{title}</h1>
        <div className="shop__controls">
          <button className="shop__filter-btn" onClick={() => setDrawerOpen(true)}><Icon.Menu width={16} height={16} /> Filters</button>
          <SortDropdown value={filters.sort} onChange={(sort) => updateFilters({ sort })} />
        </div>
      </div>
      <div className="shop__body">
        <FilterPanel
          products={allProducts}
          filters={filters}
          onChange={updateFilters}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        <div className="shop__results">
          <p className="shop__count">{visible.length} item{visible.length === 1 ? '' : 's'}</p>
          <ProductGrid products={visible} loading={loading} emptyMessage="No products match your filters." />
        </div>
      </div>
    </div>
  )
}
