import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeatured, getProducts } from '../lib/cms.js'
import ProductGrid from '../components/ProductGrid.jsx'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([getFeatured(), getProducts()]).then(([f, all]) => {
      if (!active) return
      setFeatured(f.slice(0, 4))
      setNewArrivals(all.filter((p) => p.isNew).slice(0, 8))
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Fall Collection 2026</p>
          <h1 className="hero__title">Bold<br />Basics.</h1>
          <p className="hero__sub">Streetwear staples, built to last.</p>
          <Link to="/shop" className="btn btn--primary">Shop the drop</Link>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Featured</h2>
          <Link to="/shop" className="section__more">View all</Link>
        </div>
        <ProductGrid products={featured} loading={loading} />
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">New Arrivals</h2>
        </div>
        <ProductGrid products={newArrivals} loading={loading} />
      </section>
    </div>
  )
}
