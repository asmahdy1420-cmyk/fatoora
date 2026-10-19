import { describe, expect, it } from 'vitest'
import { computeLine, computeTotals, formatRate, type LineItem } from './invoice'

const line = (overrides: Partial<LineItem>): LineItem => ({
  id: Math.random().toString(36),
  description: 'item',
  quantity: '1',
  unitPrice: '0',
  discountPercent: '0',
  vatRate: '15',
  ...overrides,
})

describe('computeLine', () => {
  it('applies quantity and discount in minor units', () => {
    const result = computeLine(
      line({ quantity: '3', unitPrice: '19.99', discountPercent: '10' }),
      'SAR',
    )
    expect(result.gross).toBe(5997)
    expect(result.discount).toBe(600) // 599.7 rounds to 600
    expect(result.net).toBe(5397)
    expect(result.rateBp).toBe(1500)
  })

  it('supports fractional quantities and three-decimal currencies', () => {
    const result = computeLine(line({ quantity: '1.5', unitPrice: '2.333' }), 'BHD')
    expect(result.gross).toBe(3500) // 3.4995 -> 3.500
  })

  it('treats half-typed fields as zero', () => {
    expect(computeLine(line({ quantity: '', unitPrice: '10' }), 'QAR').net).toBe(0)
  })
})

describe('computeTotals', () => {
  it('builds a per-rate VAT breakdown, highest rate first', () => {
    const totals = computeTotals(
      [
        line({ unitPrice: '100', vatRate: '15' }),
        line({ unitPrice: '50', vatRate: '5' }),
        line({ unitPrice: '20', quantity: '2', vatRate: '15' }),
        line({ unitPrice: '10', vatRate: '0' }),
      ],
      'SAR',
    )
    expect(totals.breakdown).toEqual([
      { rateBp: 1500, taxable: 14000, vat: 2100 },
      { rateBp: 500, taxable: 5000, vat: 250 },
      { rateBp: 0, taxable: 1000, vat: 0 },
    ])
    expect(totals.taxable).toBe(20000)
    expect(totals.vat).toBe(2350)
    expect(totals.total).toBe(22350)
  })

  it('rounds VAT once per rate rather than per line', () => {
    // Three lines of 0.10 at 5%: per line 0.005 would round to 0.01 each (0.03),
    // per rate 0.30 * 5% = 0.015 rounds to 0.02.
    const items = [1, 2, 3].map(() => line({ unitPrice: '0.10', vatRate: '5' }))
    const totals = computeTotals(items, 'AED')
    expect(totals.vat).toBe(2)
    expect(totals.total).toBe(32)
  })

  it('handles three-decimal currencies end to end', () => {
    const totals = computeTotals(
      [line({ unitPrice: '1.255', quantity: '3', vatRate: '10' })],
      'BHD',
    )
    expect(totals.taxable).toBe(3765)
    expect(totals.vat).toBe(377) // 376.5 -> 377 fils
    expect(totals.total).toBe(4142)
  })

  it('formats rates from basis points', () => {
    expect(formatRate(1500)).toBe('15')
    expect(formatRate(550)).toBe('5.5')
    expect(formatRate(0)).toBe('0')
  })
})
