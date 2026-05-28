import { describe, it, expect } from 'vitest'
import { lineId, initialCart, cartReducer, cartCount, cartSubtotal } from './cart.js'

const item = (over = {}) => ({ productId: 'p1', slug: 's', name: 'Tee', price: 48, image: '/x', size: 'M', color: 'Black', qty: 1, ...over })

describe('lineId', () => {
  it('combines product, size, and color', () => {
    expect(lineId('p1', 'M', 'Black')).toBe('p1::M::Black')
  })
  it('handles missing size/color', () => {
    expect(lineId('p1', null, null)).toBe('p1::::')
  })
})

describe('cartReducer', () => {
  it('ADD inserts a new line with a derived id', () => {
    const s = cartReducer(initialCart, { type: 'ADD', item: item() })
    expect(s.items).toHaveLength(1)
    expect(s.items[0].id).toBe('p1::M::Black')
    expect(s.items[0].qty).toBe(1)
  })
  it('ADD merges quantity for the same product+size+color', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item({ qty: 1 }) })
    s = cartReducer(s, { type: 'ADD', item: item({ qty: 2 }) })
    expect(s.items).toHaveLength(1)
    expect(s.items[0].qty).toBe(3)
  })
  it('ADD keeps different sizes as separate lines', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item({ size: 'M' }) })
    s = cartReducer(s, { type: 'ADD', item: item({ size: 'L' }) })
    expect(s.items).toHaveLength(2)
  })
  it('UPDATE_QTY sets the quantity', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item() })
    s = cartReducer(s, { type: 'UPDATE_QTY', id: 'p1::M::Black', qty: 5 })
    expect(s.items[0].qty).toBe(5)
  })
  it('UPDATE_QTY to 0 removes the line', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item() })
    s = cartReducer(s, { type: 'UPDATE_QTY', id: 'p1::M::Black', qty: 0 })
    expect(s.items).toHaveLength(0)
  })
  it('REMOVE deletes the line', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item() })
    s = cartReducer(s, { type: 'REMOVE', id: 'p1::M::Black' })
    expect(s.items).toHaveLength(0)
  })
  it('CLEAR empties the cart', () => {
    let s = cartReducer(initialCart, { type: 'ADD', item: item() })
    s = cartReducer(s, { type: 'CLEAR' })
    expect(s.items).toHaveLength(0)
  })
})

describe('selectors', () => {
  const state = { items: [item({ qty: 2, price: 50 }), item({ size: 'L', qty: 1, price: 30 })] }
  it('cartCount sums quantities', () => {
    expect(cartCount(state)).toBe(3)
  })
  it('cartSubtotal sums price * qty', () => {
    expect(cartSubtotal(state)).toBe(130)
  })
})
