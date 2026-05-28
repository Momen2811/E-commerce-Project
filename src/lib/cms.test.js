import { describe, it, expect } from 'vitest'
import { getProducts, getProductBySlug, getFeatured } from './cms.js'

describe('cms (seed data)', () => {
  it('getProducts resolves to a non-empty array of products', async () => {
    const products = await getProducts()
    expect(Array.isArray(products)).toBe(true)
    expect(products.length).toBeGreaterThan(0)
    expect(products[0]).toHaveProperty('slug')
  })
  it('getProductBySlug returns the matching product', async () => {
    const all = await getProducts()
    const found = await getProductBySlug(all[0].slug)
    expect(found).toEqual(all[0])
  })
  it('getProductBySlug returns null for an unknown slug', async () => {
    expect(await getProductBySlug('nope-not-real')).toBe(null)
  })
  it('getFeatured returns only featured products', async () => {
    const featured = await getFeatured()
    expect(featured.length).toBeGreaterThan(0)
    expect(featured.every((p) => p.isFeatured)).toBe(true)
  })
})
