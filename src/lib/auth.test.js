import { describe, it, expect } from 'vitest'
import { validateEmail, passwordStrength, validateRegister, validateLogin, genSalt, hashPassword } from './auth.js'

describe('validateEmail', () => {
  it('accepts a valid email', () => { expect(validateEmail('a@b.com')).toBe(true) })
  it('rejects an invalid email', () => { expect(validateEmail('nope')).toBe(false) })
})

describe('passwordStrength', () => {
  it('scores empty as 0', () => { expect(passwordStrength('').score).toBe(0) })
  it('scores a lowercase-only short pw low', () => { expect(passwordStrength('abc').score).toBe(1) })
  it('scores a strong pw 4', () => { expect(passwordStrength('Abcd1234!').score).toBe(4) })
  it('returns a label', () => { expect(typeof passwordStrength('Abcd1234!').label).toBe('string') })
})

describe('validateRegister', () => {
  const ok = { name: 'Mo', email: 'mo@b.com', password: 'abcd1234', confirm: 'abcd1234' }
  it('passes a valid form', () => { expect(validateRegister(ok, [])).toEqual({}) })
  it('requires name', () => { expect(validateRegister({ ...ok, name: '' }, []).name).toBeTruthy() })
  it('rejects a bad email', () => { expect(validateRegister({ ...ok, email: 'x' }, []).email).toBeTruthy() })
  it('blocks a duplicate email (case-insensitive)', () => {
    expect(validateRegister(ok, ['MO@B.COM']).email).toBeTruthy()
  })
  it('rejects a weak password (too short)', () => { expect(validateRegister({ ...ok, password: 'a1', confirm: 'a1' }, []).password).toBeTruthy() })
  it('rejects a password without a number', () => { expect(validateRegister({ ...ok, password: 'abcdefgh', confirm: 'abcdefgh' }, []).password).toBeTruthy() })
  it('flags a confirm mismatch', () => { expect(validateRegister({ ...ok, confirm: 'different1' }, []).confirm).toBeTruthy() })
})

describe('validateLogin', () => {
  it('passes valid', () => { expect(validateLogin({ email: 'a@b.com', password: 'x' })).toEqual({}) })
  it('requires email and password', () => {
    const e = validateLogin({})
    expect(e.email).toBeTruthy()
    expect(e.password).toBeTruthy()
  })
})

describe('hashPassword / genSalt', () => {
  it('genSalt returns a hex string', () => { expect(genSalt()).toMatch(/^[0-9a-f]+$/) })
  it('is deterministic for the same salt', async () => {
    expect(await hashPassword('secret123', 'aa')).toBe(await hashPassword('secret123', 'aa'))
  })
  it('differs by salt', async () => {
    expect(await hashPassword('secret123', 'aa')).not.toBe(await hashPassword('secret123', 'bb'))
  })
  it('produces a 64-char hex digest that is not the password', async () => {
    const h = await hashPassword('secret123', 'aa')
    expect(h).toMatch(/^[0-9a-f]{64}$/)
    expect(h).not.toContain('secret123')
  })
})
