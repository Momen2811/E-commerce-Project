import { createContext, useContext, useEffect, useReducer } from 'react'
import { wishlistReducer, initialWishlist, inWishlist } from '../lib/wishlist.js'

const KEY = 'b2b_wishlist'
const WishlistCtx = createContext(null)

function init() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : initialWishlist
  } catch {
    return initialWishlist
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, undefined, init)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const value = {
    ids: state.ids,
    count: state.ids.length,
    has: (id) => inWishlist(state, id),
    toggle: (id) => dispatch({ type: 'TOGGLE', id }),
    remove: (id) => dispatch({ type: 'REMOVE', id }),
  }
  return <WishlistCtx.Provider value={value}>{children}</WishlistCtx.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistCtx)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
