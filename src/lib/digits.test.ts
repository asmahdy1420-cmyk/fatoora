import { describe, expect, it } from 'vitest'
import { applyDigits, normalizeDecimalInput, toArabicIndic } from './digits'

describe('digit conversion', () => {
  it('converts digits and numeric separators to Arabic-Indic', () => {
    expect(toArabicIndic('1,234.50')).toBe('١٬٢٣٤٫٥٠')
    expect(toArabicIndic('INV-0042')).toBe('INV-٠٠٤٢')
    expect(toArabicIndic('VAT 15%')).toBe('VAT ١٥%')
    expect(applyDigits('2026', 'latn')).toBe('2026')
  })

  it('normalises typed Arabic-Indic input back to a plain decimal', () => {
    expect(normalizeDecimalInput('١٢٫٥')).toBe('12.5')
    expect(normalizeDecimalInput('۳.۲۵')).toBe('3.25')
    expect(normalizeDecimalInput('1,000.5.0')).toBe('1000.50')
    expect(normalizeDecimalInput('abc')).toBe('')
  })
})
