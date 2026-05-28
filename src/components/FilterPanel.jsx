import { Icon } from '../icons.jsx'

const TYPES = ['tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'accessories']

function FilterGroup({ title, children }) {
  return (
    <div className="filter-group">
      <h3 className="filter-group__title">{title}</h3>
      {children}
    </div>
  )
}

export default function FilterPanel({ products, filters, onChange, open, onClose }) {
  const sizeOptions = [...new Set(products.flatMap((p) => p.sizes))]
  const colorOptions = [...new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values()]

  function toggleList(key, value) {
    const current = filters[key] || []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    onChange({ [key]: next })
  }

  return (
    <>
      <div className={`filter-overlay ${open ? 'is-open' : ''}`} onClick={onClose} />
      <aside className={`filters ${open ? 'is-open' : ''}`}>
        <div className="filters__head">
          <h2>Filters</h2>
          <button className="filters__close" onClick={onClose} aria-label="Close filters"><Icon.Close /></button>
        </div>

        <FilterGroup title="Type">
          {TYPES.map((t) => (
            <label key={t} className="check">
              <input type="checkbox" checked={(filters.types || []).includes(t)} onChange={() => toggleList('types', t)} />
              <span className="check__label">{t}</span>
            </label>
          ))}
        </FilterGroup>

        <FilterGroup title="Size">
          <div className="size-row">
            {sizeOptions.map((s) => (
              <button key={s} type="button" className={`size-chip ${(filters.sizes || []).includes(s) ? 'is-active' : ''}`} onClick={() => toggleList('sizes', s)}>{s}</button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Color">
          <div className="swatch-row">
            {colorOptions.map((c) => (
              <button key={c.name} type="button" className={`swatch ${(filters.colors || []).includes(c.name) ? 'is-active' : ''}`} style={{ background: c.hex }} title={c.name} aria-label={c.name} onClick={() => toggleList('colors', c.name)} />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Price">
          <div className="price-inputs">
            <input type="number" placeholder="Min" value={filters.minPrice ?? ''} onChange={(e) => onChange({ minPrice: e.target.value === '' ? null : Number(e.target.value) })} />
            <span>–</span>
            <input type="number" placeholder="Max" value={filters.maxPrice ?? ''} onChange={(e) => onChange({ maxPrice: e.target.value === '' ? null : Number(e.target.value) })} />
          </div>
        </FilterGroup>

        <label className="check">
          <input type="checkbox" checked={!!filters.onSale} onChange={(e) => onChange({ onSale: e.target.checked })} />
          <span className="check__label">On sale</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={!!filters.inStock} onChange={(e) => onChange({ inStock: e.target.checked })} />
          <span className="check__label">In stock only</span>
        </label>
      </aside>
    </>
  )
}
