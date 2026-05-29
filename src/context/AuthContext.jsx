import { createContext, useContext, useState } from 'react'
import { validateRegister, validateLogin, validateEmail, genSalt, hashPassword } from '../lib/auth.js'
import { getUsers, findUserByEmail, saveUser, updateUserPassword } from '../lib/userStore.js'

const SESSION_KEY = 'b2b_session'
const AuthCtx = createContext(null)

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

  function startSession(record) {
    const session = { id: record.id, name: record.name, email: record.email }
    setUser(session)
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch { /* ignore */ }
    return session
  }

  async function register(values) {
    const existing = getUsers().map((u) => u.email)
    const errors = validateRegister(values, existing)
    if (Object.keys(errors).length) return { ok: false, errors }
    const salt = genSalt()
    const passwordHash = await hashPassword(values.password, salt)
    const record = {
      id: `u-${Date.now().toString(36)}`,
      name: values.name.trim(),
      email: values.email.trim(),
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    saveUser(record)
    startSession(record)
    return { ok: true, errors: {} }
  }

  async function login(values) {
    const errors = validateLogin(values)
    if (Object.keys(errors).length) return { ok: false, errors }
    const record = findUserByEmail(values.email)
    const fail = { ok: false, errors: { form: 'Email or password is incorrect' } }
    if (!record) return fail
    const hash = await hashPassword(values.password, record.salt)
    if (hash !== record.passwordHash) return fail
    startSession(record)
    return { ok: true, errors: {} }
  }

  function logout() {
    setUser(null)
    try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
  }

  async function resetPassword(values) {
    const errors = {}
    if (!values.email || !validateEmail(values.email)) errors.email = 'Enter a valid email'
    if (!values.password || values.password.length < 8 || !/[a-zA-Z]/.test(values.password) || !/\d/.test(values.password)) {
      errors.password = 'Use at least 8 characters, with a letter and a number'
    }
    if (values.confirm !== values.password) errors.confirm = 'Passwords do not match'
    if (Object.keys(errors).length) return { ok: false, errors }
    const record = findUserByEmail(values.email)
    if (!record) return { ok: false, errors: { form: "We couldn't find an account with that email." } }
    const salt = genSalt()
    const passwordHash = await hashPassword(values.password, salt)
    updateUserPassword(record.email, salt, passwordHash)
    return { ok: true, errors: {} }
  }

  const value = { user, isAuthenticated: !!user, register, login, logout, resetPassword }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
