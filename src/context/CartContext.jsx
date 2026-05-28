import { createContext, useContext, useEffect, useReducer } from 'react'
import { cartReducer, initialCart, cartCount, cartSubtotal } from '../lib/cart.js'

const KEY = 'b2b_cart'
const CartCtx = createContext(null)

function init() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : initialCart
  } catch {
    return initialCart
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, init)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(cart)) } catch { /* ignore */ }
  }, [cart])

  const value = {
    items: cart.items,
    addItem: (item) => dispatch({ type: 'ADD', item }),
    removeItem: (id) => dispatch({ type: 'REMOVE', id }),
    updateQty: (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty }),
    clear: () => dispatch({ type: 'CLEAR' }),
    count: cartCount(cart),
    subtotal: cartSubtotal(cart),
  }
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
