import { describe, expect, it } from 'vitest'
import { buildQrPayload, encodeTlv, encodeTlvField, toBase64 } from './tlv'

describe('TLV encoder', () => {
  it('produces tag, length and UTF-8 bytes for each field', () => {
    const bytes = encodeTlv({
      sellerName: 'A',
      vatNumber: '1',
      timestamp: 'T',
      total: '2',
      vatTotal: '3',
    })
    expect([...bytes]).toEqual([
      0x01, 0x01, 0x41, 0x02, 0x01, 0x31, 0x03, 0x01, 0x54, 0x04, 0x01, 0x32, 0x05, 0x01, 0x33,
    ])
  })

  it('matches a hand-computed Base64 payload', () => {
    // 01 01 41 | 02 01 31 | 03 01 54 | 04 01 32 | 05 01 33, grouped in 3-byte blocks:
    // AQFB AgEx AwFU BAEy BQEz
    expect(
      buildQrPayload({
        sellerName: 'A',
        vatNumber: '1',
        timestamp: 'T',
        total: '2',
        vatTotal: '3',
      }),
    ).toBe('AQFBAgExAwFUBAEyBQEz')
  })

  it('counts UTF-8 bytes, not characters, for Arabic names', () => {
    const field = encodeTlvField(1, 'متجر')
    expect(field[1]).toBe(8)
    expect(
      buildQrPayload({
        sellerName: 'متجر',
        vatNumber: '300000000000003',
        timestamp: '2026-10-19T09:30:00Z',
        total: '115.00',
        vatTotal: '15.00',
      }),
    ).toBe(
      'AQjZhdiq2KzYsQIPMzAwMDAwMDAwMDAwMDAzAxQyMDI2LTEwLTE5VDA5OjMwOjAwWgQGMTE1LjAwBQUxNS4wMA==',
    )
  })

  it('pads Base64 correctly and rejects values over 255 bytes', () => {
    expect(toBase64(new Uint8Array([0x4d]))).toBe('TQ==')
    expect(toBase64(new Uint8Array([0x4d, 0x61]))).toBe('TWE=')
    expect(() => encodeTlvField(1, 'x'.repeat(256))).toThrow(RangeError)
  })
})
