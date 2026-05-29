import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PasswordField from '../components/PasswordField.jsx'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await register(values)
    setBusy(false)
    if (res.ok) navigate('/')
    else setErrors(res.errors)
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">Create account</h1>
        <form className="form" onSubmit={submit} noValidate>
          <label className={`field ${errors.name ? 'field--error' : ''}`}>
            <span className="field__label">Full name</span>
            <input value={values.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} autoComplete="name" />
            {errors.name && <span className="field__err">{errors.name}</span>}
          </label>
          <label className={`field ${errors.email ? 'field--error' : ''}`}>
            <span className="field__label">Email</span>
            <input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} autoComplete="email" />
            {errors.email && <span className="field__err">{errors.email}</span>}
          </label>
          <PasswordField label="Password" value={values.password} onChange={(e) => set('password', e.target.value)} error={errors.password} showStrength autoComplete="new-password" />
          <PasswordField label="Confirm password" value={values.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} autoComplete="new-password" />
          <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="auth__alt">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}
