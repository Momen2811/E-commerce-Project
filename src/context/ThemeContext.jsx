import { createContext, useContext, useEffect, useState } from 'react'
import { THEME_KEY, resolveInitialTheme } from '../lib/theme.js'

const ThemeCtx = createContext(null)

function getInitial() {
  if (typeof document !== 'undefined' && document.documentElement.dataset.theme) {
    return document.documentElement.dataset.theme
  }
  let stored = null
  try { stored = localStorage.getItem(THEME_KEY) } catch { /* ignore */ }
  const prefersDark = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return resolveInitialTheme(stored, prefersDark)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitial)

  useEffect(() => {
    try { document.documentElement.dataset.theme = theme } catch { /* ignore */ }
  }, [])

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try { document.documentElement.dataset.theme = next } catch { /* ignore */ }
      try { localStorage.setItem(THEME_KEY, next) } catch { /* ignore */ }
      return next
    })
  }

  const value = { theme, toggleTheme }
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
