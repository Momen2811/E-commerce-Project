import { products as seedProducts } from '../data/products.js'
import { reviews as seedReviews } from '../data/reviews.js'

// Phase 3 adds a Sanity branch here, gated on VITE_SANITY_PROJECT_ID.
// The seed path and the Sanity path must return the identical product shape.
async function fetchAll() {
  return seedProducts
}

export async function getProducts() {
  return fetchAll()
}

export async function getProductBySlug(slug) {
  const all = await fetchAll()
  return all.find((p) => p.slug === slug) || null
}

export async function getFeatured() {
  const all = await fetchAll()
  return all.filter((p) => p.isFeatured)
}

export async function getReviews(productId) {
  return seedReviews.filter((r) => r.productId === productId)
}
