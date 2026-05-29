import { useState } from 'react'
import { Icon } from '../icons.jsx'
import { passwordStrength } from '../lib/auth.js'

export default function PasswordField({ label = 'Password', value, onChange, error, showStrength = false, autoComplete = 'current-password', name }) {
  const [show, setShow] = useState(false)
  const strength = showStrength ? passwordStrength(value || '') : null
  return (
    <label className={`field ${error ? 'field--error' : ''}`}>
      <span className="field__label">{label}</span>
      <span className="pw">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          autoComplete={autoComplete}
        />
        <button type="button" className="pw__toggle" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}>
          {show ? <Icon.EyeOff width={18} height={18} /> : <Icon.Eye width={18} height={18} />}
        </button>
      </span>
      {showStrength && value && (
        <span className={`pw-meter pw-meter--${strength.score}`}>
          <span className="pw-meter__bar"><span className="pw-meter__fill" style={{ width: `${(strength.score / 4) * 100}%` }} /></span>
          <span className="pw-meter__label">{strength.label}</span>
        </span>
      )}
      {error && <span className="field__err">{error}</span>}
    </label>
  )
}
