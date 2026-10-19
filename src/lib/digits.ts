const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export type DigitStyle = 'latn' | 'arab'

/**
 * Convert Western digits to Arabic-Indic digits. Inside numbers, "." becomes the Arabic
 * decimal separator (٫) and "," the Arabic thousands separator (٬); other text is untouched.
 */
export function toArabicIndic(text: string): string {
  return text
    .replace(/(?<=\d)\.(?=\d)/g, '٫')
    .replace(/(?<=\d),(?=\d)/g, '٬')
    .replace(/\d/g, (d) => ARABIC_INDIC[Number(d)] ?? d)
}

export function applyDigits(text: string, style: DigitStyle): string {
  return style === 'arab' ? toArabicIndic(text) : text
}

const EASTERN_TO_WESTERN: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
}

/**
 * Normalise what a user types into a numeric field: Arabic-Indic and Persian digits become
 * Western digits, the Arabic decimal separator becomes ".", and anything else (including
 * thousands separators) is dropped.
 * Only the first decimal point is kept.
 */
export function normalizeDecimalInput(text: string): string {
  const western = text
    .replace(/[٠-٩۰-۹]/g, (d) => EASTERN_TO_WESTERN[d] ?? d)
    .replace(/٫/g, '.')
    .replace(/[^\d.]/g, '')
  const dot = western.indexOf('.')
  return dot === -1
    ? western
    : western.slice(0, dot + 1) + western.slice(dot + 1).replace(/\./g, '')
}
