import { z } from 'zod'
import { COUNTRY_CODES, type Invoice } from './invoice'
import { CURRENCY_CODES } from './money'

/** Non-negative decimal as typed into a field; empty is allowed for half-filled drafts. */
const decimalString = z
  .string()
  .max(24)
  .regex(/^(\d{1,15}(\.\d{0,6})?)?$/, 'Expected a non-negative decimal number')

const shortText = z.string().max(200)

const partySchema = z.object({
  name: shortText,
  vatNumber: z.string().max(40),
  address: z.string().max(500),
})

const lineItemSchema = z.object({
  id: z.string().min(1).max(64),
  description: z.string().max(500),
  quantity: decimalString,
  unitPrice: decimalString,
  discountPercent: decimalString.refine((v) => v === '' || Number(v) <= 100, {
    message: 'Discount cannot exceed 100%',
  }),
  vatRate: decimalString.refine((v) => v === '' || Number(v) <= 100, {
    message: 'VAT rate cannot exceed 100%',
  }),
})

export const invoiceSchema = z.object({
  version: z.literal(1),
  number: z.string().max(64),
  issuedAt: z.string().max(40),
  country: z.enum(COUNTRY_CODES),
  currency: z.enum(CURRENCY_CODES),
  seller: partySchema,
  buyer: partySchema,
  items: z.array(lineItemSchema).max(500),
  notes: z.string().max(2000),
}) satisfies z.ZodType<Invoice>

export type ImportResult = { ok: true; invoice: Invoice } | { ok: false; error: string }

export function parseInvoiceJson(text: string): ImportResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'File is not valid JSON' }
  }
  const result = invoiceSchema.safeParse(data)
  if (!result.success) {
    const issue = result.error.issues[0]
    const where = issue?.path.join('.') ?? ''
    return {
      ok: false,
      error: `${where ? `${where}: ` : ''}${issue?.message ?? 'Invalid invoice'}`,
    }
  }
  return { ok: true, invoice: result.data }
}

export function serializeInvoice(invoice: Invoice): string {
  return `${JSON.stringify(invoice, null, 2)}\n`
}
