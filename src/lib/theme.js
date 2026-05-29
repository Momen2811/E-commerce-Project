export const THEME_KEY = 'b2b_theme'

export function resolveInitialTheme(stored, prefersDark) {
  if (stored === 'light' || stored === 'dark') return stored
  return prefersDark ? 'dark' : 'light'
}
