/**
 * Money is always held as an integer count of minor units (fils, halala, baisa, cents).
 * Decimal input strings are parsed straight into scaled integers, and every multiplication
 * that needs rounding goes through BigInt so no binary floating point ever touches an amount.
 */

export const CURRENCY_CODES = ['QAR', 'AED', 'SAR', 'BHD', 'KWD', 'OMR', 'USD'] as const
export type CurrencyCode = (typeof CURRENCY_CODES)[number]

export interface CurrencyInfo {
  code: CurrencyCode
  /** Number of decimal places, i.e. log10 of minor units per major unit. */
  minorDigits: 2 | 3
  symbolAr: string
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  QAR: { code: 'QAR', minorDigits: 2, symbolAr: 'ر.ق' },
  AED: { code: 'AED', minorDigits: 2, symbolAr: 'د.إ' },
  SAR: { code: 'SAR', minorDigits: 2, symbolAr: 'ر.س' },
  BHD: { code: 'BHD', minorDigits: 3, symbolAr: 'د.ب' },
  KWD: { code: 'KWD', minorDigits: 3, symbolAr: 'د.ك' },
  OMR: { code: 'OMR', minorDigits: 3, symbolAr: 'ر.ع' },
  USD: { code: 'USD', minorDigits: 2, symbolAr: '$' },
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(value)
}

export function minorPerMajor(code: CurrencyCode): number {
  return 10 ** CURRENCIES[code].minorDigits
}

const DECIMAL_RE = /^\s*(\d*)(?:\.(\d*))?\s*$/

/**
 * Parse a non-negative decimal string into an integer scaled by 10^scale, rounding half up
 * on the first dropped digit. Returns null for anything that is not a plain decimal.
 *
 *   parseScaled('12.345', 2) === 1235
 *   parseScaled('7', 3) === 7000
 */
export function parseScaled(input: string, scale: number): number | null {
  const match = DECIMAL_RE.exec(input)
  if (!match) return null
  const whole = match[1] ?? ''
  const frac = match[2] ?? ''
  if (whole === '' && frac === '') return null
  const kept = frac.slice(0, scale).padEnd(scale, '0')
  let value = BigInt(whole || '0') * 10n ** BigInt(scale) + BigInt(kept || '0')
  const firstDropped = frac.charAt(scale)
  if (firstDropped !== '' && Number(firstDropped) >= 5) value += 1n
  const result = Number(value)
  return Number.isSafeInteger(result) ? result : null
}

/** Like parseScaled but treats blank or invalid input as zero (handy for half-typed fields). */
export function parseScaledOrZero(input: string, scale: number): number {
  return parseScaled(input, scale) ?? 0
}

export function parseMoney(input: string, code: CurrencyCode): number | null {
  return parseScaled(input, CURRENCIES[code].minorDigits)
}

/** Round (a * b) / c half away from zero, exactly, using BigInt. c must be positive. */
export function mulDivRound(a: number, b: number, c: number): number {
  if (c <= 0) throw new RangeError('Divisor must be positive')
  const product = BigInt(a) * BigInt(b)
  const divisor = BigInt(c)
  const negative = product < 0n
  const abs = negative ? -product : product
  const rounded = (abs * 2n + divisor) / (divisor * 2n)
  return Number(negative ? -rounded : rounded)
}

/** Render a scaled integer as a plain decimal string with a fixed number of places. */
export function scaledToDecimal(value: number, scale: number): string {
  const negative = value < 0
  const digits = Math.abs(value)
    .toString()
    .padStart(scale + 1, '0')
  const whole = scale === 0 ? digits : digits.slice(0, -scale)
  const frac = scale === 0 ? '' : digits.slice(-scale)
  return `${negative ? '-' : ''}${whole}${frac ? `.${frac}` : ''}`
}

/** Plain machine-readable decimal, e.g. 1234500 BHD minor units -> "1234.500". */
export function minorToDecimal(minor: number, code: CurrencyCode): string {
  return scaledToDecimal(minor, CURRENCIES[code].minorDigits)
}

/** Human-readable amount with thousands grouping, e.g. "1,234.500". */
export function formatMinor(minor: number, code: CurrencyCode): string {
  const plain = minorToDecimal(minor, code)
  const [whole = '0', frac] = plain.split('.')
  const sign = whole.startsWith('-') ? '-' : ''
  const unsigned = sign ? whole.slice(1) : whole
  const grouped = unsigned.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}${grouped}${frac ? `.${frac}` : ''}`
}

/** Split a non-negative minor amount into its major and minor parts. */
export function splitMinor(minor: number, code: CurrencyCode): { major: number; minor: number } {
  const per = minorPerMajor(code)
  return { major: Math.floor(minor / per), minor: minor % per }
}
