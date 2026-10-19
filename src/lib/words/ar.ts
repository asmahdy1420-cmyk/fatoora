import { type CurrencyCode, splitMinor } from '../money'

/**
 * Arabic cardinal numbers and counted currency phrases.
 *
 * Grammar handled:
 *  - gender polarity for 1-19 and the units of compounds (masculine nouns take
 *    the ة form for 3-10: "ثلاثة ريالات"; feminine nouns drop it: "ثلاث هللات"),
 *  - singular / dual / plural / accusative-singular forms of the counted noun,
 *    chosen from the last two digits (3-10 -> plural, 11-99 -> accusative singular),
 *  - the same rule for thousand / million / billion,
 *  - construct form of duals before a noun ("مائتا ألف", "ألفا ريال").
 *
 * The output is the nominative form used on invoices and cheques.
 */

const ONES_M = [
  'صفر',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
  'عشرة',
]
const ONES_F = ['صفر', 'واحدة', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثماني', 'تسع', 'عشر']
const TEENS_M = [
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
]
const TEENS_F = [
  'إحدى عشرة',
  'اثنتا عشرة',
  'ثلاث عشرة',
  'أربع عشرة',
  'خمس عشرة',
  'ست عشرة',
  'سبع عشرة',
  'ثماني عشرة',
  'تسع عشرة',
]
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']
const HUNDREDS = [
  '',
  'مائة',
  'مائتان',
  'ثلاثمائة',
  'أربعمائة',
  'خمسمائة',
  'ستمائة',
  'سبعمائة',
  'ثمانمائة',
  'تسعمائة',
]

/** Forms of a counted noun. `acc` is the accusative singular used after 11-99. */
export interface CountedNoun {
  one: string
  two: string
  plural: string
  acc: string
  feminine: boolean
}

const SCALES: CountedNoun[] = [
  { one: 'ألف', two: 'ألفان', plural: 'آلاف', acc: 'ألفًا', feminine: false },
  { one: 'مليون', two: 'مليونان', plural: 'ملايين', acc: 'مليونًا', feminine: false },
  { one: 'مليار', two: 'ملياران', plural: 'مليارات', acc: 'مليارًا', feminine: false },
  { one: 'تريليون', two: 'تريليونان', plural: 'تريليونات', acc: 'تريليونًا', feminine: false },
]

export const MAX_WORDS_VALUE_AR = 999_999_999_999_999

const AND = ' و'

function below100(n: number, feminine: boolean): string {
  const ones = feminine ? ONES_F : ONES_M
  if (n <= 10) return ones[n] ?? ''
  if (n < 20) return (feminine ? TEENS_F : TEENS_M)[n - 11] ?? ''
  const unit = n % 10
  const tens = TENS[Math.floor(n / 10)] ?? ''
  if (unit === 0) return tens
  const unitWord = unit === 1 ? (feminine ? 'إحدى' : 'واحد') : (ones[unit] ?? '')
  return `${unitWord}${AND}${tens}`
}

function below1000(n: number, feminine: boolean): string {
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  const parts: string[] = []
  if (hundreds > 0) parts.push(HUNDREDS[hundreds] ?? '')
  if (rest > 0) parts.push(below100(rest, feminine))
  return parts.join(AND)
}

/**
 * Duals lose their final ن when they directly govern a noun (construct state):
 * "مائتا ألف", "ألفا ريال", "مليونا ريال".
 */
function construct(words: string): string {
  const duals = ['مائتان', ...SCALES.map((s) => s.two)]
  return duals.some((d) => words.endsWith(d)) ? words.slice(0, -1) : words
}

/**
 * Attach a count to its noun: "ألف", "ألفان", "ثلاثة آلاف", "أحد عشر ألفًا", "مائة ألف".
 * For n === 1 the noun stands alone (callers add واحد when they want it).
 */
function countNoun(n: number, noun: CountedNoun): string {
  if (n === 1) return noun.one
  if (n === 2) return noun.two
  const lastTwo = n % 100
  const words = numberToWordsAr(n, { feminine: noun.feminine })
  if (lastTwo >= 3 && lastTwo <= 10) return `${words} ${noun.plural}`
  if (lastTwo >= 11) return `${words} ${noun.acc}`
  return `${construct(words)} ${noun.one}`
}

/** Cardinal number in Arabic words, e.g. 1234 -> "ألف ومائتان وأربعة وثلاثون". */
export function numberToWordsAr(n: number, options: { feminine?: boolean } = {}): string {
  if (!Number.isSafeInteger(n) || n < 0 || n > MAX_WORDS_VALUE_AR) {
    throw new RangeError(`Cannot spell ${n}`)
  }
  if (n === 0) return 'صفر'
  const feminine = options.feminine ?? false
  const groups: string[] = []
  let rest = n
  let scale = 0
  while (rest > 0) {
    const chunk = rest % 1000
    if (chunk > 0) {
      const noun = SCALES[scale - 1]
      groups.unshift(noun ? countNoun(chunk, noun) : below1000(chunk, feminine))
    }
    rest = Math.floor(rest / 1000)
    scale += 1
  }
  return groups.join(AND)
}

const CURRENCY_NAMES_AR: Record<CurrencyCode, { major: CountedNoun; minor: CountedNoun }> = {
  QAR: {
    major: {
      one: 'ريال قطري',
      two: 'ريالان قطريان',
      plural: 'ريالات قطرية',
      acc: 'ريالًا قطريًا',
      feminine: false,
    },
    minor: { one: 'درهم', two: 'درهمان', plural: 'دراهم', acc: 'درهمًا', feminine: false },
  },
  AED: {
    major: {
      one: 'درهم إماراتي',
      two: 'درهمان إماراتيان',
      plural: 'دراهم إماراتية',
      acc: 'درهمًا إماراتيًا',
      feminine: false,
    },
    minor: { one: 'فلس', two: 'فلسان', plural: 'فلوس', acc: 'فلسًا', feminine: false },
  },
  SAR: {
    major: {
      one: 'ريال سعودي',
      two: 'ريالان سعوديان',
      plural: 'ريالات سعودية',
      acc: 'ريالًا سعوديًا',
      feminine: false,
    },
    minor: { one: 'هللة', two: 'هللتان', plural: 'هللات', acc: 'هللة', feminine: true },
  },
  BHD: {
    major: {
      one: 'دينار بحريني',
      two: 'ديناران بحرينيان',
      plural: 'دنانير بحرينية',
      acc: 'دينارًا بحرينيًا',
      feminine: false,
    },
    minor: { one: 'فلس', two: 'فلسان', plural: 'فلوس', acc: 'فلسًا', feminine: false },
  },
  KWD: {
    major: {
      one: 'دينار كويتي',
      two: 'ديناران كويتيان',
      plural: 'دنانير كويتية',
      acc: 'دينارًا كويتيًا',
      feminine: false,
    },
    minor: { one: 'فلس', two: 'فلسان', plural: 'فلوس', acc: 'فلسًا', feminine: false },
  },
  OMR: {
    major: {
      one: 'ريال عماني',
      two: 'ريالان عمانيان',
      plural: 'ريالات عمانية',
      acc: 'ريالًا عمانيًا',
      feminine: false,
    },
    minor: { one: 'بيسة', two: 'بيستان', plural: 'بيسات', acc: 'بيسة', feminine: true },
  },
  USD: {
    major: {
      one: 'دولار أمريكي',
      two: 'دولاران أمريكيان',
      plural: 'دولارات أمريكية',
      acc: 'دولارًا أمريكيًا',
      feminine: false,
    },
    minor: { one: 'سنت', two: 'سنتان', plural: 'سنتات', acc: 'سنتًا', feminine: false },
  },
}

/** "ريال قطري واحد", "ريالان قطريان", "ثلاثة ريالات قطرية", "خمسون درهمًا". */
export function countedPhraseAr(n: number, noun: CountedNoun): string {
  if (n === 1) return `${noun.one} ${noun.feminine ? 'واحدة' : 'واحد'}`
  return countNoun(n, noun)
}

/** Amount in Arabic words, e.g. 1250 QAR minor units -> "اثنا عشر ريالًا قطريًا وخمسون درهمًا". */
export function amountInWordsAr(totalMinor: number, code: CurrencyCode): string {
  const names = CURRENCY_NAMES_AR[code]
  const { major, minor } = splitMinor(totalMinor, code)
  if (major === 0 && minor === 0) return `صفر ${names.major.one}`
  const parts: string[] = []
  if (major > 0) parts.push(countedPhraseAr(major, names.major))
  if (minor > 0) parts.push(countedPhraseAr(minor, names.minor))
  return parts.join(AND)
}
