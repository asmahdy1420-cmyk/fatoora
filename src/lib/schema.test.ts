import { describe, expect, it } from 'vitest'
import { sampleInvoice } from './invoice'
import { parseInvoiceJson, serializeInvoice } from './schema'

describe('invoice import validation', () => {
  it('round-trips an exported invoice', () => {
    const invoice = sampleInvoice()
    const result = parseInvoiceJson(serializeInvoice(invoice))
    expect(result).toEqual({ ok: true, invoice })
  })

  it('rejects malformed JSON', () => {
    expect(parseInvoiceJson('{ not json')).toEqual({ ok: false, error: 'File is not valid JSON' })
  })

  it('rejects unknown currencies, float prices and out-of-range rates with a path', () => {
    const base = sampleInvoice()
    const badCurrency = parseInvoiceJson(JSON.stringify({ ...base, currency: 'EUR' }))
    expect(badCurrency.ok).toBe(false)
    if (!badCurrency.ok) expect(badCurrency.error).toMatch(/^currency/)

    const firstItem = base.items[0]
    if (!firstItem) throw new Error('sample has an item')
    const floatPrice = parseInvoiceJson(
      JSON.stringify({ ...base, items: [{ ...firstItem, unitPrice: 12.5 }] }),
    )
    expect(floatPrice.ok).toBe(false)

    const badRate = parseInvoiceJson(
      JSON.stringify({ ...base, items: [{ ...firstItem, vatRate: '150' }] }),
    )
    expect(badRate.ok).toBe(false)
    if (!badRate.ok) expect(badRate.error).toContain('items.0.vatRate')
  })
})
