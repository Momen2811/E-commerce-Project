export function filterProducts(products, filters = {}) {
  const {
    audience = null, types = [], sizes = [], colors = [],
    minPrice = null, maxPrice = null, onSale = false, inStock = false,
  } = filters

  return products.filter((p) => {
    if (audience && p.audience !== audience) return false
    if (types.length && !types.includes(p.type)) return false
    if (sizes.length && !sizes.some((s) => p.sizes.includes(s))) return false
    if (colors.length && !colors.some((c) => p.colors.some((pc) => pc.name === c))) return false
    if (minPrice != null && p.price < minPrice) return false
    if (maxPrice != null && p.price > maxPrice) return false
    if (onSale && !(p.compareAtPrice && p.compareAtPrice > p.price)) return false
    if (inStock && !p.inStock) return false
    return true
  })
}

export function sortProducts(products, sortKey = 'featured') {
  const list = [...products]
  switch (sortKey) {
    case 'price-asc': return list.sort((a, b) => a.price - b.price)
    case 'price-desc': return list.sort((a, b) => b.price - a.price)
    case 'rating': return list.sort((a, b) => b.rating - a.rating)
    case 'newest': return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'featured':
    default: return list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
  }
}

export function parseFilters(searchParams) {
  const csv = (key) => {
    const v = searchParams.get(key)
    return v ? v.split(',').filter(Boolean) : []
  }
  const num = (key) => {
    const v = searchParams.get(key)
    return v == null || v === '' ? null : Number(v)
  }
  return {
    audience: searchParams.get('audience') || null,
    types: csv('type'),
    sizes: csv('size'),
    colors: csv('color'),
    minPrice: num('min'),
    maxPrice: num('max'),
    onSale: searchParams.get('sale') === '1',
    inStock: searchParams.get('instock') === '1',
    sort: searchParams.get('sort') || 'featured',
  }
}

export function serializeFilters(filters) {
  const params = {}
  if (filters.audience) params.audience = filters.audience
  if (filters.types?.length) params.type = filters.types.join(',')
  if (filters.sizes?.length) params.size = filters.sizes.join(',')
  if (filters.colors?.length) params.color = filters.colors.join(',')
  if (filters.minPrice != null) params.min = String(filters.minPrice)
  if (filters.maxPrice != null) params.max = String(filters.maxPrice)
  if (filters.onSale) params.sale = '1'
  if (filters.inStock) params.instock = '1'
  if (filters.sort && filters.sort !== 'featured') params.sort = filters.sort
  return params
}
