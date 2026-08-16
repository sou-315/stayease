import { describe, it, expect } from 'vitest'
import { calculateNights, calculateTotal } from './bookingCalculations'

describe('calculateNights', () => {
  it('returns correct nights for a normal date range', () => {
    expect(calculateNights('2027-06-10', '2027-06-15')).toBe(5)
  })

  it('returns 0 if checkIn is missing', () => {
    expect(calculateNights('', '2027-06-15')).toBe(0)
  })

  it('returns 0 if checkOut is missing', () => {
    expect(calculateNights('2027-06-10', '')).toBe(0)
  })

  it('returns 0 if checkOut is before checkIn', () => {
    expect(calculateNights('2027-06-15', '2027-06-10')).toBe(0)
  })

  it('returns 0 if checkOut equals checkIn', () => {
    expect(calculateNights('2027-06-10', '2027-06-10')).toBe(0)
  })

  it('handles a single night correctly', () => {
    expect(calculateNights('2027-06-10', '2027-06-11')).toBe(1)
  })
})

describe('calculateTotal', () => {
  it('multiplies nights by price correctly', () => {
    expect(calculateTotal(5, 120)).toBe(600)
  })

  it('returns 0 if nights is 0', () => {
    expect(calculateTotal(0, 120)).toBe(0)
  })

  it('returns 0 if price is missing', () => {
    expect(calculateTotal(5, 0)).toBe(0)
  })

  it('returns 0 if nights is negative', () => {
    expect(calculateTotal(-3, 120)).toBe(0)
  })

  it('handles a single night correctly', () => {
    expect(calculateTotal(1, 210)).toBe(210)
  })
})