import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const PRODUCT_FIELDS = `{
  "id": _id, name, "slug": slug.current, audience, type, price, compareAtPrice,
  description, material, "images": images[].asset->url,
  colors, sizes, rating, reviewCount, isNew, isFeatured, inStock,
  "createdAt": coalesce(createdAt, _createdAt)
}`

export async function sanityGetProducts() {
  return client.fetch(`*[_type == "product"]${PRODUCT_FIELDS}`)
}

export async function sanityGetProductBySlug(slug) {
  return client.fetch(`*[_type == "product" && slug.current == $slug][0]${PRODUCT_FIELDS}`, { slug })
}

export async function sanityGetFeatured() {
  return client.fetch(`*[_type == "product" && isFeatured == true]${PRODUCT_FIELDS}`)
}

export async function sanityGetReviews(productId) {
  return client.fetch(
    `*[_type == "review" && product._ref == $id] | order(date desc){ "id": _id, author, rating, title, body, date }`,
    { id: productId },
  )
}
