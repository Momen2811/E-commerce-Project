export function averageRating(reviews) {
  if (!reviews.length) return 0
  const sum = reviews.reduce((s, r) => s + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export function ratingDistribution(reviews) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach((r) => { if (dist[r.rating] != null) dist[r.rating] += 1 })
  return dist
}
