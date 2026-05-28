import { describe, it, expect } from 'vitest'
import { averageRating, ratingDistribution } from './reviews.js'

const R = [{ rating: 5 }, { rating: 4 }, { rating: 5 }, { rating: 3 }]

describe('averageRating', () => {
  it('returns 0 for no reviews', () => {
    expect(averageRating([])).toBe(0)
  })
  it('averages and rounds to one decimal', () => {
    expect(averageRating(R)).toBe(4.3)
  })
})

describe('ratingDistribution', () => {
  it('counts each star bucket 1–5', () => {
    expect(ratingDistribution(R)).toEqual({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 })
  })
})
