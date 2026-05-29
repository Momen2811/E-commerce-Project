const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function validateEmail(email) {
  return EMAIL_RE.test(email || '')
}

export function passwordStrength(pw = '') {
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw)) score++
  if (/[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  score = Math.min(score, 4)
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score] }
}

export function validateRegister(values = {}, existingEmails = []) {
  const e = {}
  if (!values.name || !values.name.trim()) e.name = 'Name is required'
  if (!values.email) e.email = 'Email is required'
  else if (!validateEmail(values.email)) e.email = 'Enter a valid email'
  else if (existingEmails.map((x) => x.toLowerCase()).includes(values.email.toLowerCase())) e.email = 'An account with this email already exists'
  if (!values.password) e.password = 'Password is required'
  else if (values.password.length < 8) e.password = 'Use at least 8 characters'
  else if (!/[a-zA-Z]/.test(values.password) || !/\d/.test(values.password)) e.password = 'Include at least one letter and one number'
  if (values.confirm !== values.password) e.confirm = 'Passwords do not match'
  return e
}

export function validateLogin(values = {}) {
  const e = {}
  if (!values.email) e.email = 'Email is required'
  else if (!validateEmail(values.email)) e.email = 'Enter a valid email'
  if (!values.password) e.password = 'Password is required'
  return e
}

export function genSalt(bytes = 16) {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
