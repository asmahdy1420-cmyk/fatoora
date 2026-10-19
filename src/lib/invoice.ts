import { type CurrencyCode, CURRENCIES, mulDivRound, parseScaledOrZero } from './money'

export const COUNTRY_CODES = ['SA', 'AE', 'BH', 'OM', 'QA', 'KW'] as const
export type CountryCode = (typeof COUNTRY_CODES)[number]

/** Default standard VAT rates as percentage strings. Users can edit these in the app. */
export const DEFAULT_VAT_PRESETS: Record<CountryCode, string> = {
  SA: '15',
  AE: '5',
  BH: '10',
  OM: '5',
  QA: '0',
  KW: '0',
}

export const COUNTRY_CURRENCY: Record<CountryCode, CurrencyCode> = {
  SA: 'SAR',
  AE: 'AED',
  BH: 'BHD',
  OM: 'OMR',
  QA: 'QAR',
  KW: 'KWD',
}

export interface Party {
  name: string
  vatNumber: string
  address: string
}

/** Numeric fields stay as the decimal strings the user typed; they are parsed exactly. */
export interface LineItem {
  id: string
  description: string
  quantity: string
  unitPrice: string
  discountPercent: string
  vatRate: string
}

export interface Invoice {
  version: 1
  number: string
  /** Local date-time in the `YYYY-MM-DDTHH:mm` form used by datetime-local inputs. */
  issuedAt: string
  country: CountryCode
  currency: CurrencyCode
  seller: Party
  buyer: Party
  items: LineItem[]
  notes: string
}

/** Quantities keep three decimals (e.g. 1.5 hours = 1500). */
export const QUANTITY_SCALE = 3
/** Percentages keep two decimals, i.e. basis points (15% = 1500). */
export const PERCENT_SCALE = 2

export interface LineTotals {
  id: string
  gross: number
  discount: number
  net: number
  /** VAT rate in basis points. */
  rateBp: number
}

export interface VatBucket {
  rateBp: number
  taxable: number
  vat: number
}

export interface InvoiceTotals {
  lines: LineTotals[]
  subtotal: number
  discount: number
  taxable: number
  vat: number
  total: number
  breakdown: VatBucket[]
}

export function computeLine(item: LineItem, currency: CurrencyCode): LineTotals {
  const unit = parseScaledOrZero(item.unitPrice, CURRENCIES[currency].minorDigits)
  const qty = parseScaledOrZero(item.quantity, QUANTITY_SCALE)
  const discountBp = Math.min(parseScaledOrZero(item.discountPercent, PERCENT_SCALE), 10000)
  const rateBp = parseScaledOrZero(item.vatRate, PERCENT_SCALE)
  const gross = mulDivRound(unit, qty, 10 ** QUANTITY_SCALE)
  const discount = mulDivRound(gross, discountBp, 10000)
  return { id: item.id, gross, discount, net: gross - discount, rateBp }
}

/**
 * Totals with VAT rounded once per rate: line net amounts are summed per VAT rate and the
 * rate is applied to each sum. This keeps the breakdown and the grand total consistent.
 */
export function computeTotals(items: LineItem[], currency: CurrencyCode): InvoiceTotals {
  const lines = items.map((item) => computeLine(item, currency))
  const buckets = new Map<number, number>()
  for (const line of lines) {
    buckets.set(line.rateBp, (buckets.get(line.rateBp) ?? 0) + line.net)
  }
  const breakdown = [...buckets.entries()]
    .sort(([a], [b]) => b - a)
    .map(([rateBp, taxable]) => ({ rateBp, taxable, vat: mulDivRound(taxable, rateBp, 10000) }))

  const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0)
  const subtotal = sum(lines.map((l) => l.gross))
  const discount = sum(lines.map((l) => l.discount))
  const taxable = sum(lines.map((l) => l.net))
  const vat = sum(breakdown.map((b) => b.vat))
  return { lines, subtotal, discount, taxable, vat, total: taxable + vat, breakdown }
}

/** "1500" basis points -> "15", "550" -> "5.5". */
export function formatRate(rateBp: number): string {
  const whole = Math.floor(rateBp / 100)
  const frac = (rateBp % 100).toString().padStart(2, '0').replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : `${whole}`
}

let idCounter = 0
export function newId(): string {
  idCounter += 1
  return `li-${Date.now().toString(36)}-${idCounter.toString(36)}`
}

export function emptyLine(vatRate: string): LineItem {
  return {
    id: newId(),
    description: '',
    quantity: '1',
    unitPrice: '',
    discountPercent: '0',
    vatRate,
  }
}

function nowLocal(): string {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function sampleInvoice(): Invoice {
  return {
    version: 1,
    number: 'INV-0001',
    issuedAt: nowLocal(),
    country: 'QA',
    currency: 'QAR',
    seller: { name: 'Progma Tech', vatNumber: '', address: 'Doha, Qatar' },
    buyer: { name: '', vatNumber: '', address: '' },
    items: [
      {
        id: newId(),
        description: 'Consulting',
        quantity: '10',
        unitPrice: '350',
        discountPercent: '0',
        vatRate: DEFAULT_VAT_PRESETS.QA,
      },
    ],
    notes: '',
  }
}

/** datetime-local value -> ISO 8601 UTC without milliseconds, or the input if unparseable. */
export function toIsoTimestamp(localDateTime: string): string {
  const date = new Date(localDateTime)
  if (Number.isNaN(date.getTime())) return localDateTime
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}
