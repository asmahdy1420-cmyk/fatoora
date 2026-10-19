import { describe, expect, it } from 'vitest'
import { amountInWordsAr, numberToWordsAr } from './ar'

describe('numberToWordsAr', () => {
  it.each([
    [0, 'صفر'],
    [1, 'واحد'],
    [2, 'اثنان'],
    [3, 'ثلاثة'],
    [11, 'أحد عشر'],
    [12, 'اثنا عشر'],
    [21, 'واحد وعشرون'],
    [100, 'مائة'],
    [125, 'مائة وخمسة وعشرون'],
    [1000, 'ألف'],
    [2000, 'ألفان'],
    [3000, 'ثلاثة آلاف'],
    [11000, 'أحد عشر ألفًا'],
    [200_000, 'مائتا ألف'],
    [1_000_000, 'مليون'],
    [2_000_000, 'مليونان'],
    [5_000_000, 'خمسة ملايين'],
    [1234, 'ألف ومائتان وأربعة وثلاثون'],
  ])('%i -> %s', (n, words) => {
    expect(numberToWordsAr(n)).toBe(words)
  })

  it('switches numerals to agree with feminine nouns', () => {
    expect(numberToWordsAr(3, { feminine: true })).toBe('ثلاث')
    expect(numberToWordsAr(11, { feminine: true })).toBe('إحدى عشرة')
    expect(numberToWordsAr(21, { feminine: true })).toBe('إحدى وعشرون')
  })
})

describe('amountInWordsAr', () => {
  it('uses singular, dual, plural and accusative forms of the currency', () => {
    expect(amountInWordsAr(100, 'QAR')).toBe('ريال قطري واحد')
    expect(amountInWordsAr(200, 'QAR')).toBe('ريالان قطريان')
    expect(amountInWordsAr(500, 'QAR')).toBe('خمسة ريالات قطرية')
    expect(amountInWordsAr(1500, 'QAR')).toBe('خمسة عشر ريالًا قطريًا')
    expect(amountInWordsAr(100_000, 'SAR')).toBe('ألف ريال سعودي')
    expect(amountInWordsAr(200_000, 'SAR')).toBe('ألفا ريال سعودي')
    expect(amountInWordsAr(200_000_000, 'SAR')).toBe('مليونا ريال سعودي')
  })

  it('spells fractional minor units with their own gender', () => {
    expect(amountInWordsAr(1250, 'QAR')).toBe('اثنا عشر ريالًا قطريًا وخمسون درهمًا')
    expect(amountInWordsAr(1_250, 'BHD')).toBe('دينار بحريني واحد ومائتان وخمسون فلسًا')
    expect(amountInWordsAr(3, 'SAR')).toBe('ثلاث هللات')
    expect(amountInWordsAr(2_011, 'OMR')).toBe('ريالان عمانيان وإحدى عشرة بيسة')
  })

  it('handles zero', () => {
    expect(amountInWordsAr(0, 'KWD')).toBe('صفر دينار كويتي')
  })
})
