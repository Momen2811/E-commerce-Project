export function searchProducts(products, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []
  return products.filter((p) => {
    const hay = [p.name, p.type, p.audience, p.description].join(' ').toLowerCase()
    return hay.includes(q)
  })
}
