import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

interface Props {
  payload: string
  alt: string
  size?: number
}

/** Renders text as a QR code image. The payload itself is built by lib/tlv. */
export function QrCode({ payload, alt, size = 148 }: Props) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, width: size * 2 })
      .then((url) => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        if (!cancelled) setSrc(null)
      })
    return () => {
      cancelled = true
    }
  }, [payload, size])

  if (!src) return <div className="qr qr-empty" style={{ width: size, height: size }} />
  return <img className="qr" src={src} alt={alt} width={size} height={size} />
}
