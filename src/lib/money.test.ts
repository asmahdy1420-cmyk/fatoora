import { describe, expect, it } from 'vitest'
import {
  formatMinor,
  minorToDecimal,
  mulDivRound,
  parseMoney,
  parseScaled,
  splitMinor,
} from './money'

describe('parseMoney', () => {
  it('uses two decimals for QAR, AED, SAR and USD', () => {
    expect(parseMoney('12.34', 'QAR')).toBe(1234)
    expect(parseMoney('0.1', 'AED')).toBe(10)
    expect(parseMoney('7', 'SAR')).toBe(700)
    expect(parseMoney('.5', 'USD')).toBe(50)
  })

  it('uses three decimals for BHD, KWD and OMR', () => {
    expect(parseMoney('1.5', 'BHD')).toBe(1500)
    expect(parseMoney('0.001', 'KWD')).toBe(1)
    expect(parseMoney('2.345', 'OMR')).toBe(2345)
  })

  it('rounds half up on extra digits and rejects non-numbers', () => {
    expect(parseMoney('1.005', 'QAR')).toBe(101)
    expect(parseMoney('1.0049', 'QAR')).toBe(100)
    expect(parseMoney('1.0005', 'BHD')).toBe(1001)
    expect(parseMoney('', 'QAR')).toBeNull()
    expect(parseMoney('-1', 'QAR')).toBeNull()
    expect(parseMoney('1e3', 'QAR')).toBeNull()
  })

  it('avoids binary floating point errors', () => {
    // 0.1 + 0.2 !== 0.3 in floats; in minor units it is exact.
    const sum = (parseMoney('0.1', 'QAR') ?? 0) + (parseMoney('0.2', 'QAR') ?? 0)
    expect(sum).toBe(parseMoney('0.3', 'QAR'))
    expect(parseScaled('1.15', 2)).toBe(115)
  })
})

describe('mulDivRound', () => {
  it('rounds half away from zero exactly', () => {
    expect(mulDivRound(5, 1, 2)).toBe(3)
    expect(mulDivRound(-5, 1, 2)).toBe(-3)
    expect(mulDivRound(333, 1500, 10000)).toBe(50) // 49.95 -> 50
    expect(mulDivRound(1234, 1, 3)).toBe(411)
  })
})

describe('formatting', () => {
  it('formats with grouping and the currency minor digits', () => {
    expect(formatMinor(123456789, 'QAR')).toBe('1,234,567.89')
    expect(formatMinor(1234500, 'BHD')).toBe('1,234.500')
    expect(formatMinor(5, 'KWD')).toBe('0.005')
    expect(minorToDecimal(11500, 'SAR')).toBe('115.00')
  })

  it('splits into major and minor parts', () => {
    expect(splitMinor(1250, 'QAR')).toEqual({ major: 12, minor: 50 })
    expect(splitMinor(1250, 'OMR')).toEqual({ major: 1, minor: 250 })
  })
})
