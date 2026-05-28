import { describe, it, expect } from 'vitest'
import {
  shippingCost, orderTotal, validateShipping, validatePayment,
  formatCardNumber, formatExpiry, generateOrderNumber, createOrder,
} from './checkout.js'

describe('shippingCost', () => {
  it('standard is free at or above 150', () => {
    expect(shippingCost('standard', 150)).toBe(0)
  })
  it('standard is 8 below 150', () => {
    expect(shippingCost('standard', 149)).toBe(8)
  })
  it('express is always 20', () => {
    expect(shippingCost('express', 500)).toBe(20)
  })
})

describe('orderTotal', () => {
  it('adds shipping to subtotal', () => {
    expect(orderTotal(100, 'standard')).toBe(108)
    expect(orderTotal(200, 'standard')).toBe(200)
    expect(orderTotal(100, 'express')).toBe(120)
  })
})

describe('validateShipping', () => {
  const valid = { email: 'a@b.com', name: 'Mo', address: '1 St', city: 'Cairo', zip: '12345', country: 'EG' }
  it('passes a fully valid form', () => {
    expect(validateShipping(valid)).toEqual({})
  })
  it('flags a bad email', () => {
    expect(validateShipping({ ...valid, email: 'nope' }).email).toBeTruthy()
  })
  it('flags missing required fields', () => {
    const e = validateShipping({})
    expect(Object.keys(e).sort()).toEqual(['address', 'city', 'country', 'email', 'name', 'zip'])
  })
})

describe('validatePayment', () => {
  const valid = { card: '4242 4242 4242 4242', expiry: '12/30', cvc: '123', cardName: 'Mo' }
  it('passes a valid card', () => {
    expect(validatePayment(valid)).toEqual({})
  })
  it('flags a short card number', () => {
    expect(validatePayment({ ...valid, card: '4242' }).card).toBeTruthy()
  })
  it('flags a bad expiry format', () => {
    expect(validatePayment({ ...valid, expiry: '1330' }).expiry).toBeTruthy()
  })
  it('flags an invalid month', () => {
    expect(validatePayment({ ...valid, expiry: '13/30' }).expiry).toBeTruthy()
  })
  it('flags a short cvc', () => {
    expect(validatePayment({ ...valid, cvc: '1' }).cvc).toBeTruthy()
  })
})

describe('formatters', () => {
  it('groups card digits in fours', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
  })
  it('strips non-digits and caps at 16', () => {
    expect(formatCardNumber('4242-4242abc4242 4242 9999')).toBe('4242 4242 4242 4242')
  })
  it('formats expiry as MM/YY', () => {
    expect(formatExpiry('1230')).toBe('12/30')
    expect(formatExpiry('1')).toBe('1')
  })
})

describe('generateOrderNumber', () => {
  it('starts with B2B- and is stable for a given time', () => {
    const n = generateOrderNumber(1700000000000)
    expect(n.startsWith('B2B-')).toBe(true)
    expect(n).toBe(generateOrderNumber(1700000000000))
  })
})

describe('createOrder', () => {
  const items = [{ id: 'l1', name: 'Tee', price: 50, qty: 2 }]
  it('computes subtotal, shipping, and total', () => {
    const o = createOrder({ items, shipping: { email: 'a@b.com' }, method: 'express', now: 1700000000000 })
    expect(o.subtotal).toBe(100)
    expect(o.shippingCost).toBe(20)
    expect(o.total).toBe(120)
    expect(o.orderNumber.startsWith('B2B-')).toBe(true)
    expect(o.items).toHaveLength(1)
  })
})
