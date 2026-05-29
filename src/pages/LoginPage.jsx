import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PasswordField from '../components/PasswordField.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await login(values)
    setBusy(false)
    if (res.ok) navigate('/account')
    else setErrors(res.errors)
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">Sign in</h1>
        {errors.form && <p className="auth__error">{errors.form}</p>}
        <form className="form" onSubmit={submit} noValidate>
          <label className={`field ${errors.email ? 'field--error' : ''}`}>
            <span className="field__label">Email</span>
            <input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} autoComplete="email" />
            {errors.email && <span className="field__err">{errors.email}</span>}
          </label>
          <PasswordField value={values.password} onChange={(e) => set('password', e.target.value)} error={errors.password} autoComplete="current-password" />
          <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="auth__alt"><Link to="/forgot-password">Forgot password?</Link></p>
        <p className="auth__alt">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  )
}
