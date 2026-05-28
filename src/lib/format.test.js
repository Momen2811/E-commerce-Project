import { describe, it, expect } from 'vitest'
import { formatPrice, discountPercent } from './format.js'

describe('formatPrice', () => {
  it('formats whole numbers with two decimals and a $', () => {
    expect(formatPrice(48)).toBe('$48.00')
  })
  it('formats decimals to two places', () => {
    expect(formatPrice(19.9)).toBe('$19.90')
  })
})

describe('discountPercent', () => {
  it('returns null when there is no compareAtPrice', () => {
    expect(discountPercent(48, null)).toBe(null)
  })
  it('returns null when compareAtPrice is not higher than price', () => {
    expect(discountPercent(48, 40)).toBe(null)
  })
  it('returns the rounded percentage off', () => {
    expect(discountPercent(75, 100)).toBe(25)
  })
})
