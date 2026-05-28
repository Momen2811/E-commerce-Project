export function lineId(productId, size, color) {
  return [productId, size || '', color || ''].join('::')
}

export const initialCart = { items: [] }

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { item } = action
      const id = lineId(item.productId, item.size, item.color)
      const existing = state.items.find((i) => i.id === id)
      if (existing) {
        return { items: state.items.map((i) => (i.id === id ? { ...i, qty: i.qty + (item.qty || 1) } : i)) }
      }
      return { items: [...state.items, { ...item, id, qty: item.qty || 1 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.id) }
    case 'UPDATE_QTY':
      if (action.qty <= 0) return { items: state.items.filter((i) => i.id !== action.id) }
      return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i)) }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

export function cartCount(state) {
  return state.items.reduce((n, i) => n + i.qty, 0)
}

export function cartSubtotal(state) {
  return state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
}
