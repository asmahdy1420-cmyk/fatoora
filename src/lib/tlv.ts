/**
 * TLV (tag-length-value) QR payload in the format used for simplified tax invoices:
 * each field is one tag byte, one length byte (UTF-8 byte count) and the UTF-8 value.
 * The concatenated bytes are Base64 encoded and the resulting text goes into the QR code.
 */

export interface QrInvoiceFields {
  sellerName: string
  vatNumber: string
  /** ISO 8601 timestamp, e.g. 2026-10-19T09:30:00Z */
  timestamp: string
  /** Invoice total including VAT, as a plain decimal string */
  total: string
  /** VAT total, as a plain decimal string */
  vatTotal: string
}

export const TLV_TAGS = {
  sellerName: 1,
  vatNumber: 2,
  timestamp: 3,
  total: 4,
  vatTotal: 5,
} as const satisfies Record<keyof QrInvoiceFields, number>

const encoder = new TextEncoder()

export function encodeTlvField(tag: number, value: string): Uint8Array {
  if (!Number.isInteger(tag) || tag < 1 || tag > 255) throw new RangeError(`Bad tag ${tag}`)
  const bytes = encoder.encode(value)
  if (bytes.length > 255) throw new RangeError(`Value for tag ${tag} exceeds 255 bytes`)
  const out = new Uint8Array(bytes.length + 2)
  out[0] = tag
  out[1] = bytes.length
  out.set(bytes, 2)
  return out
}

export function encodeTlv(fields: QrInvoiceFields): Uint8Array {
  const parts = (Object.keys(TLV_TAGS) as (keyof QrInvoiceFields)[]).map((key) =>
    encodeTlvField(TLV_TAGS[key], fields[key]),
  )
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/** Standard (RFC 4648) Base64 with padding. */
export function toBase64(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0
    const b1 = bytes[i + 1] ?? 0
    const b2 = bytes[i + 2] ?? 0
    const triple = (b0 << 16) | (b1 << 8) | b2
    out += B64.charAt((triple >> 18) & 63) + B64.charAt((triple >> 12) & 63)
    out += i + 1 < bytes.length ? B64.charAt((triple >> 6) & 63) : '='
    out += i + 2 < bytes.length ? B64.charAt(triple & 63) : '='
  }
  return out
}

export function buildQrPayload(fields: QrInvoiceFields): string {
  return toBase64(encodeTlv(fields))
}
