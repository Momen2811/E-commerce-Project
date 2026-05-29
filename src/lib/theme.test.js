import { describe, it, expect } from 'vitest'
import { resolveInitialTheme, THEME_KEY } from './theme.js'

describe('resolveInitialTheme', () => {
  it('uses a stored dark theme', () => { expect(resolveInitialTheme('dark', false)).toBe('dark') })
  it('uses a stored light theme', () => { expect(resolveInitialTheme('light', true)).toBe('light') })
  it('falls back to system (dark) when nothing is stored', () => { expect(resolveInitialTheme(null, true)).toBe('dark') })
  it('falls back to system (light) when nothing is stored', () => { expect(resolveInitialTheme(undefined, false)).toBe('light') })
  it('ignores an invalid stored value and uses system', () => { expect(resolveInitialTheme('weird', true)).toBe('dark') })
})

describe('THEME_KEY', () => {
  it('is the storage key', () => { expect(THEME_KEY).toBe('b2b_theme') })
})
