import { Icon } from '../icons.jsx'

export default function Stars({ value = 0, size = 16 }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  const row = [0, 1, 2, 3, 4]
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      <span className="stars__base">{row.map((i) => <Icon.Star key={i} width={size} height={size} />)}</span>
      <span className="stars__fill" style={{ width: `${pct}%` }}>{row.map((i) => <Icon.Star key={i} width={size} height={size} />)}</span>
    </span>
  )
}
