import { type CurrencyCode, splitMinor } from '../money'

const ONES = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const SCALES = ['', 'thousand', 'million', 'billion', 'trillion']

export const MAX_WORDS_VALUE = 999_999_999_999_999

function below1000(n: number): string {
  const parts: string[] = []
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  if (hundreds > 0) parts.push(`${ONES[hundreds] ?? ''} hundred`)
  if (rest > 0) {
    if (rest < 20) {
      parts.push(ONES[rest] ?? '')
    } else {
      const unit = rest % 10
      const tens = TENS[Math.floor(rest / 10)] ?? ''
      parts.push(unit ? `${tens}-${ONES[unit] ?? ''}` : tens)
    }
  }
  return parts.join(' ')
}

/** Cardinal number in English words, e.g. 1234 -> "one thousand two hundred thirty-four". */
export function numberToWordsEn(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0 || n > MAX_WORDS_VALUE) {
    throw new RangeError(`Cannot spell ${n}`)
  }
  if (n === 0) return 'zero'
  const groups: string[] = []
  let rest = n
  let scale = 0
  while (rest > 0) {
    const chunk = rest % 1000
    if (chunk > 0) {
      const scaleWord = SCALES[scale] ?? ''
      groups.unshift(scaleWord ? `${below1000(chunk)} ${scaleWord}` : below1000(chunk))
    }
    rest = Math.floor(rest / 1000)
    scale += 1
  }
  return groups.join(' ')
}

interface UnitNames {
  one: string
  many: string
}

const CURRENCY_NAMES_EN: Record<CurrencyCode, { major: UnitNames; minor: UnitNames }> = {
  QAR: {
    major: { one: 'Qatari riyal', many: 'Qatari riyals' },
    minor: { one: 'dirham', many: 'dirhams' },
  },
  AED: {
    major: { one: 'UAE dirham', many: 'UAE dirhams' },
    minor: { one: 'fils', many: 'fils' },
  },
  SAR: {
    major: { one: 'Saudi riyal', many: 'Saudi riyals' },
    minor: { one: 'halala', many: 'halalas' },
  },
  BHD: {
    major: { one: 'Bahraini dinar', many: 'Bahraini dinars' },
    minor: { one: 'fils', many: 'fils' },
  },
  KWD: {
    major: { one: 'Kuwaiti dinar', many: 'Kuwaiti dinars' },
    minor: { one: 'fils', many: 'fils' },
  },
  OMR: {
    major: { one: 'Omani rial', many: 'Omani rials' },
    minor: { one: 'baisa', many: 'baisa' },
  },
  USD: {
    major: { one: 'US dollar', many: 'US dollars' },
    minor: { one: 'cent', many: 'cents' },
  },
}

function counted(n: number, names: UnitNames): string {
  return `${numberToWordsEn(n)} ${n === 1 ? names.one : names.many}`
}

/**
 * Amount in English words, e.g. 1234.500 BHD (1234500 fils) ->
 * "One thousand two hundred thirty-four Bahraini dinars and five hundred fils".
 */
export function amountInWordsEn(totalMinor: number, code: CurrencyCode): string {
  const names = CURRENCY_NAMES_EN[code]
  const { major, minor } = splitMinor(totalMinor, code)
  let text: string
  if (major === 0 && minor > 0) text = counted(minor, names.minor)
  else if (minor === 0) text = counted(major, names.major)
  else text = `${counted(major, names.major)} and ${counted(minor, names.minor)}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}
