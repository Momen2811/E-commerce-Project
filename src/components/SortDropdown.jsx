const OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export default function SortDropdown({ value, onChange }) {
  return (
    <label className="sort">
      <span className="sort__label">Sort</span>
      <select className="sort__select" value={value} onChange={(e) => onChange(e.target.value)}>
        {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}
