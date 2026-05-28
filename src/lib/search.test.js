import { describe, it, expect } from 'vitest'
import { searchProducts } from './search.js'

const P = [
  { id: '1', name: 'Boxy Logo Tee', type: 'tops', audience: 'unisex', description: 'Heavyweight cotton tee' },
  { id: '2', name: 'Cargo Pants', type: 'bottoms', audience: 'men', description: 'Relaxed cargo with pockets' },
  { id: '3', name: 'Slip Dress', type: 'dresses', audience: 'women', description: 'Bias-cut satin' },
]

describe('searchProducts', () => {
  it('returns [] for an empty query', () => {
    expect(searchProducts(P, '')).toEqual([])
    expect(searchProducts(P, '   ')).toEqual([])
  })
  it('matches on name, case-insensitive', () => {
    expect(searchProducts(P, 'boxy').map((p) => p.id)).toEqual(['1'])
  })
  it('matches on type', () => {
    expect(searchProducts(P, 'dresses').map((p) => p.id)).toEqual(['3'])
  })
  it('matches on description words', () => {
    expect(searchProducts(P, 'cotton').map((p) => p.id)).toEqual(['1'])
  })
  it('returns multiple matches', () => {
    expect(searchProducts(P, 'a').length).toBeGreaterThan(1)
  })
})
