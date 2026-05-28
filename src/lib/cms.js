import { products as seedProducts } from '../data/products.js'
import { reviews as seedReviews } from '../data/reviews.js'

const useSanity = Boolean(import.meta.env.VITE_SANITY_PROJECT_ID)

// When VITE_SANITY_PROJECT_ID is set, fetch from Sanity (code-split so the
// client isn't bundled otherwise). Otherwise serve local seed data. Both
// paths return the identical product/review shape.

export async function getProducts() {
  if (useSanity) {
    const { sanityGetProducts } = await import('./sanityClient.js')
    return sanityGetProducts()
  }
  return seedProducts
}

export async function getProductBySlug(slug) {
  if (useSanity) {
    const { sanityGetProductBySlug } = await import('./sanityClient.js')
    return (await sanityGetProductBySlug(slug)) || null
  }
  return seedProducts.find((p) => p.slug === slug) || null
}

export async function getFeatured() {
  if (useSanity) {
    const { sanityGetFeatured } = await import('./sanityClient.js')
    return sanityGetFeatured()
  }
  return seedProducts.filter((p) => p.isFeatured)
}

export async function getReviews(productId) {
  if (useSanity) {
    const { sanityGetReviews } = await import('./sanityClient.js')
    return sanityGetReviews(productId)
  }
  return seedReviews.filter((r) => r.productId === productId)
}
