import { createContext, useContext, useState } from 'react'

const UICtx = createContext(null)

export function UIProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)
  const value = {
    cartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    quickView,
    openQuickView: (product) => setQuickView(product),
    closeQuickView: () => setQuickView(null),
  }
  return <UICtx.Provider value={value}>{children}</UICtx.Provider>
}

export function useUI() {
  const ctx = useContext(UICtx)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
