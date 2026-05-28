import { describe, it, expect } from 'vitest'
import { initialWishlist, wishlistReducer, inWishlist } from './wishlist.js'

describe('wishlistReducer', () => {
  it('TOGGLE adds an id when absent', () => {
    const s = wishlistReducer(initialWishlist, { type: 'TOGGLE', id: 'p1' })
    expect(s.ids).toEqual(['p1'])
  })
  it('TOGGLE removes an id when present', () => {
    let s = wishlistReducer(initialWishlist, { type: 'TOGGLE', id: 'p1' })
    s = wishlistReducer(s, { type: 'TOGGLE', id: 'p1' })
    expect(s.ids).toEqual([])
  })
  it('REMOVE deletes a specific id', () => {
    const s = wishlistReducer({ ids: ['p1', 'p2'] }, { type: 'REMOVE', id: 'p1' })
    expect(s.ids).toEqual(['p2'])
  })
  it('CLEAR empties the list', () => {
    const s = wishlistReducer({ ids: ['p1', 'p2'] }, { type: 'CLEAR' })
    expect(s.ids).toEqual([])
  })
})

describe('inWishlist', () => {
  it('reports membership', () => {
    expect(inWishlist({ ids: ['p1'] }, 'p1')).toBe(true)
    expect(inWishlist({ ids: ['p1'] }, 'p2')).toBe(false)
  })
})
