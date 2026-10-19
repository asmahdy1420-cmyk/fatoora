import { describe, expect, it } from 'vitest'
import { amountInWordsEn, numberToWordsEn } from './en'

describe('numberToWordsEn', () => {
  it.each([
    [0, 'zero'],
    [1, 'one'],
    [2, 'two'],
    [11, 'eleven'],
    [21, 'twenty-one'],
    [100, 'one hundred'],
    [115, 'one hundred fifteen'],
    [1000, 'one thousand'],
    [2000, 'two thousand'],
    [1_000_000, 'one million'],
    [1_234_567, 'one million two hundred thirty-four thousand five hundred sixty-seven'],
  ])('%i -> %s', (n, words) => {
    expect(numberToWordsEn(n)).toBe(words)
  })

  it('rejects negatives and fractions', () => {
    expect(() => numberToWordsEn(-1)).toThrow(RangeError)
    expect(() => numberToWordsEn(1.5)).toThrow(RangeError)
  })
})

describe('amountInWordsEn', () => {
  it('spells major and minor units with singular and plural names', () => {
    expect(amountInWordsEn(100, 'QAR')).toBe('One Qatari riyal')
    expect(amountInWordsEn(1250, 'QAR')).toBe('Twelve Qatari riyals and fifty dirhams')
    expect(amountInWordsEn(1, 'SAR')).toBe('One halala')
  })

  it('uses three-digit minor units for BHD, KWD and OMR', () => {
    expect(amountInWordsEn(2_000_500, 'BHD')).toBe(
      'Two thousand Bahraini dinars and five hundred fils',
    )
    expect(amountInWordsEn(1_000_001, 'OMR')).toBe('One thousand Omani rials and one baisa')
  })
})
