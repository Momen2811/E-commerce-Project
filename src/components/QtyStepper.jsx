import { Icon } from '../icons.jsx'

export default function QtyStepper({ value, onChange, min = 1 }) {
  return (
    <div className="qty">
      <button type="button" className="qty__btn" aria-label="Decrease" onClick={() => onChange(Math.max(min, value - 1))}>
        <Icon.Minus width={14} height={14} />
      </button>
      <span className="qty__val">{value}</span>
      <button type="button" className="qty__btn" aria-label="Increase" onClick={() => onChange(value + 1)}>
        <Icon.Plus width={14} height={14} />
      </button>
    </div>
  )
}
