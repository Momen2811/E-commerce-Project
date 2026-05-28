import { describe, it, expect } from 'vitest'
import { filterProducts, sortProducts, parseFilters, serializeFilters } from './filters.js'

const P = [
  { id: '1', audience: 'women', type: 'tops', price: 60, compareAtPrice: null, inStock: true, isNew: false, isFeatured: true, rating: 4.2, createdAt: '2026-01-01', sizes: ['S', 'M'], colors: [{ name: 'Black', hex: '#000' }] },
  { id: '2', audience: 'men', type: 'bottoms', price: 110, compareAtPrice: 130, inStock: true, isNew: true, isFeatured: false, rating: 4.8, createdAt: '2026-05-01', sizes: ['32', '34'], colors: [{ name: 'Olive', hex: '#5b5d3a' }] },
  { id: '3', audience: 'unisex', type: 'tops', price: 48, compareAtPrice: null, inStock: false, isNew: true, isFeatured: false, rating: 4.0, createdAt: '2026-03-01', sizes: ['M', 'L'], colors: [{ name: 'Black', hex: '#000' }] },
]

describe('filterProducts', () => {
  it('returns all products with empty filters', () => {
    expect(filterProducts(P, {})).toHaveLength(3)
  })
  it('filters by audience (strict)', () => {
    expect(filterProducts(P, { audience: 'women' }).map((p) => p.id)).toEqual(['1'])
  })
  it('filters by type', () => {
    expect(filterProducts(P, { types: ['tops'] }).map((p) => p.id)).toEqual(['1', '3'])
  })
  it('filters by size (any match)', () => {
    expect(filterProducts(P, { sizes: ['L'] }).map((p) => p.id)).toEqual(['3'])
  })
  it('filters by color name', () => {
    expect(filterProducts(P, { colors: ['Olive'] }).map((p) => p.id)).toEqual(['2'])
  })
  it('filters by price range', () => {
    expect(filterProducts(P, { minPrice: 50, maxPrice: 100 }).map((p) => p.id)).toEqual(['1'])
  })
  it('filters on sale only', () => {
    expect(filterProducts(P, { onSale: true }).map((p) => p.id)).toEqual(['2'])
  })
  it('filters in stock only', () => {
    expect(filterProducts(P, { inStock: true }).map((p) => p.id)).toEqual(['1', '2'])
  })
})

describe('sortProducts', () => {
  it('sorts price ascending', () => {
    expect(sortProducts(P, 'price-asc').map((p) => p.id)).toEqual(['3', '1', '2'])
  })
  it('sorts price descending', () => {
    expect(sortProducts(P, 'price-desc').map((p) => p.id)).toEqual(['2', '1', '3'])
  })
  it('sorts by rating', () => {
    expect(sortProducts(P, 'rating').map((p) => p.id)).toEqual(['2', '1', '3'])
  })
  it('sorts newest by createdAt desc', () => {
    expect(sortProducts(P, 'newest').map((p) => p.id)).toEqual(['2', '3', '1'])
  })
  it('does not mutate the input array', () => {
    const before = P.map((p) => p.id)
    sortProducts(P, 'price-asc')
    expect(P.map((p) => p.id)).toEqual(before)
  })
})

describe('parseFilters / serializeFilters', () => {
  it('parses an empty query to defaults', () => {
    const f = parseFilters(new URLSearchParams(''))
    expect(f).toEqual({ audience: null, types: [], sizes: [], colors: [], minPrice: null, maxPrice: null, onSale: false, inStock: false, sort: 'featured' })
  })
  it('parses csv and scalar params', () => {
    const f = parseFilters(new URLSearchParams('type=tops,shoes&size=M&min=20&sale=1&sort=price-asc'))
    expect(f.types).toEqual(['tops', 'shoes'])
    expect(f.sizes).toEqual(['M'])
    expect(f.minPrice).toBe(20)
    expect(f.onSale).toBe(true)
    expect(f.sort).toBe('price-asc')
  })
  it('serializes only the set values, omitting defaults', () => {
    const params = serializeFilters({ types: ['tops'], sizes: [], colors: [], minPrice: null, maxPrice: 100, onSale: true, inStock: false, sort: 'featured' })
    expect(params).toEqual({ type: 'tops', max: '100', sale: '1' })
  })
  it('round-trips through serialize then parse', () => {
    const original = { audience: null, types: ['tops'], sizes: ['M'], colors: ['Black'], minPrice: 20, maxPrice: null, onSale: false, inStock: true, sort: 'rating' }
    const parsed = parseFilters(new URLSearchParams(serializeFilters(original)))
    expect(parsed).toEqual(original)
  })
})
