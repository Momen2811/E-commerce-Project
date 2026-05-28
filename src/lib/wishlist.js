export const initialWishlist = { ids: [] }

export function wishlistReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE':
      return state.ids.includes(action.id)
        ? { ids: state.ids.filter((i) => i !== action.id) }
        : { ids: [...state.ids, action.id] }
    case 'REMOVE':
      return { ids: state.ids.filter((i) => i !== action.id) }
    case 'CLEAR':
      return { ids: [] }
    default:
      return state
  }
}

export function inWishlist(state, id) {
  return state.ids.includes(id)
}
