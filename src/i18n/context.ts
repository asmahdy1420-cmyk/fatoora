import { createContext, useContext } from 'react'
import type { DigitStyle } from '../lib/digits'
import type { Locale, MessageKey } from './dictionaries'

export interface I18nValue {
  locale: Locale
  dir: 'ltr' | 'rtl'
  digits: DigitStyle
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, values?: Record<string, string | number>) => string
  /** Apply the selected digit style to any text containing numbers. */
  num: (text: string | number) => string
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>')
  return value
}
