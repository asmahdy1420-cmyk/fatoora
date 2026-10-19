import { type CountryCode, DEFAULT_VAT_PRESETS, type Invoice } from './invoice'
import { invoiceSchema } from './schema'
import { z } from 'zod'

const DRAFT_KEY = 'fatoora:draft:v1'
const SETTINGS_KEY = 'fatoora:settings:v1'

export interface Settings {
  locale: 'en' | 'ar'
  theme: 'light' | 'dark'
  digits: 'latn' | 'arab'
  vatPresets: Record<CountryCode, string>
}

const settingsSchema = z.object({
  locale: z.enum(['en', 'ar']),
  theme: z.enum(['light', 'dark']),
  digits: z.enum(['latn', 'arab']),
  vatPresets: z.object({
    SA: z.string(),
    AE: z.string(),
    BH: z.string(),
    OM: z.string(),
    QA: z.string(),
    KW: z.string(),
  }),
})

function prefersDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function defaultSettings(): Settings {
  return {
    locale: 'en',
    theme: prefersDark() ? 'dark' : 'light',
    digits: 'latn',
    vatPresets: { ...DEFAULT_VAT_PRESETS },
  }
}

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function loadDraft(): Invoice | null {
  const parsed = invoiceSchema.safeParse(readJson(DRAFT_KEY))
  return parsed.success ? parsed.data : null
}

export function saveDraft(invoice: Invoice): boolean {
  return writeJson(DRAFT_KEY, invoice)
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY)
  } catch {
    // Storage unavailable (private mode, blocked site data): nothing to clear.
  }
}

export function loadSettings(): Settings {
  const parsed = settingsSchema.safeParse(readJson(SETTINGS_KEY))
  return parsed.success ? parsed.data : defaultSettings()
}

export function saveSettings(settings: Settings): boolean {
  return writeJson(SETTINGS_KEY, settings)
}
