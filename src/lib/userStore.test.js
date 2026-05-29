import { describe, it, expect, beforeEach } from 'vitest'
import { getUsers, findUserByEmail, saveUser, updateUserPassword, getUserOrders, addUserOrder } from './userStore.js'

beforeEach(() => { localStorage.clear() })

const user = { id: 'u1', name: 'Mo', email: 'mo@b.com', salt: 'aa', passwordHash: 'h1', createdAt: '2026-01-01' }

describe('userStore', () => {
  it('starts empty', () => { expect(getUsers()).toEqual([]) })
  it('saves and finds a user case-insensitively', () => {
    saveUser(user)
    expect(getUsers()).toHaveLength(1)
    expect(findUserByEmail('MO@B.COM').id).toBe('u1')
    expect(findUserByEmail('nobody@x.com')).toBe(null)
  })
  it('updates a password', () => {
    saveUser(user)
    updateUserPassword('mo@b.com', 'bb', 'h2')
    expect(findUserByEmail('mo@b.com').passwordHash).toBe('h2')
    expect(findUserByEmail('mo@b.com').salt).toBe('bb')
  })
  it('stores orders per user, newest first', () => {
    expect(getUserOrders('u1')).toEqual([])
    addUserOrder('u1', { orderNumber: 'A' })
    addUserOrder('u1', { orderNumber: 'B' })
    expect(getUserOrders('u1').map((o) => o.orderNumber)).toEqual(['B', 'A'])
  })
})
