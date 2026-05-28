export default function Logo({ variant = 'mark', className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <svg className="logo__mark" viewBox="0 0 100 100" role="img" aria-label="B2B">
        <circle className="logo__circle" cx="50" cy="50" r="50" />
        <path className="logo__mono" d="M30 30 H70 L50 50 L70 70 H30 L50 50 Z" />
        <line className="logo__mono" x1="46" y1="52" x2="46" y2="70" />
        <line className="logo__mono" x1="54" y1="52" x2="54" y2="70" />
      </svg>
      {variant === 'full' && <span className="logo__word">B2B</span>}
    </span>
  )
}
