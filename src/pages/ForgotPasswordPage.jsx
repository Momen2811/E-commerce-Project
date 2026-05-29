import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PasswordField from '../components/PasswordField.jsx'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [values, setValues] = useState({ email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await resetPassword(values)
    setBusy(false)
    if (res.ok) setDone(true)
    else setErrors(res.errors)
  }

  if (done) {
    return (
      <div className="auth">
        <div className="auth__card">
          <h1 className="auth__title">Password updated</h1>
          <p className="auth__alt">Your password has been reset. <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">Reset password</h1>
        <p className="auth__alt" style={{ textAlign: 'left' }}>Enter your email and a new password. (Demo — no email is sent.)</p>
        {errors.form && <p className="auth__error">{errors.form}</p>}
        <form className="form" onSubmit={submit} noValidate>
          <label className={`field ${errors.email ? 'field--error' : ''}`}>
            <span className="field__label">Email</span>
            <input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} autoComplete="email" />
            {errors.email && <span className="field__err">{errors.email}</span>}
          </label>
          <PasswordField label="New password" value={values.password} onChange={(e) => set('password', e.target.value)} error={errors.password} showStrength autoComplete="new-password" />
          <PasswordField label="Confirm new password" value={values.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} autoComplete="new-password" />
          <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
        </form>
        <p className="auth__alt"><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  )
}
