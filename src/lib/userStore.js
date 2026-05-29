const USERS_KEY = 'b2b_users'
const ORDERS_KEY = 'b2b_orders'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

export function getUsers() {
  return read(USERS_KEY, [])
}

export function findUserByEmail(email) {
  const e = (email || '').toLowerCase()
  return getUsers().find((u) => u.email.toLowerCase() === e) || null
}

export function saveUser(user) {
  const users = getUsers()
  users.push(user)
  write(USERS_KEY, users)
  return user
}

export function updateUserPassword(email, salt, passwordHash) {
  const e = (email || '').toLowerCase()
  const users = getUsers().map((u) => (u.email.toLowerCase() === e ? { ...u, salt, passwordHash } : u))
  write(USERS_KEY, users)
}

export function getUserOrders(userId) {
  return read(ORDERS_KEY, {})[userId] || []
}

export function addUserOrder(userId, order) {
  const map = read(ORDERS_KEY, {})
  map[userId] = [order, ...(map[userId] || [])]
  write(ORDERS_KEY, map)
}
