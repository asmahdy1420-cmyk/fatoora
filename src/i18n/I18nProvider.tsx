import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { applyDigits, type DigitStyle } from '../lib/digits'
import { I18nContext, type I18nValue } from './context'
import { DICTIONARIES, interpolate, type Locale } from './dictionaries'

interface Props {
  initialLocale?: Locale
  digits?: DigitStyle
  onLocaleChange?: (locale: Locale) => void
  children: ReactNode
}

export function I18nProvider({
  initialLocale = 'en',
  digits = 'latn',
  onLocaleChange,
  children,
}: Props) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = dir
  }, [locale, dir])

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next)
      onLocaleChange?.(next)
    },
    [onLocaleChange],
  )

  const value = useMemo<I18nValue>(() => {
    const dict = DICTIONARIES[locale]
    return {
      locale,
      dir,
      digits,
      setLocale,
      t: (key, values) => interpolate(dict[key], values),
      num: (text) => applyDigits(String(text), digits),
    }
  }, [locale, dir, digits, setLocale])

  return <I18nContext value={value}>{children}</I18nContext>
}
