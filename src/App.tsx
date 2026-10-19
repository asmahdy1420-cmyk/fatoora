import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { InvoicePreview } from './components/InvoicePreview'
import { LanguageToggle } from './components/LanguageToggle'
import { LineItemsEditor } from './components/LineItemsEditor'
import { PartyFields } from './components/PartyFields'
import { TextField } from './components/Field'
import { VatPresets } from './components/VatPresets'
import { useI18n } from './i18n/context'
import { COUNTRY_NAMES, CURRENCY_NAMES, type Locale } from './i18n/dictionaries'
import { I18nProvider } from './i18n/I18nProvider'
import {
  COUNTRY_CODES,
  COUNTRY_CURRENCY,
  computeTotals,
  emptyLine,
  type Invoice,
  sampleInvoice,
} from './lib/invoice'
import { CURRENCY_CODES, isCurrencyCode } from './lib/money'
import { parseInvoiceJson, serializeInvoice } from './lib/schema'
import { loadDraft, loadSettings, saveDraft, saveSettings, type Settings } from './lib/storage'

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    saveSettings(settings)
  }, [settings])

  return (
    <I18nProvider
      initialLocale={settings.locale}
      digits={settings.digits}
      onLocaleChange={(locale: Locale) => {
        setSettings((s) => ({ ...s, locale }))
      }}
    >
      <Workspace settings={settings} setSettings={setSettings} />
    </I18nProvider>
  )
}

interface WorkspaceProps {
  settings: Settings
  setSettings: (update: (s: Settings) => Settings) => void
}

function Workspace({ settings, setSettings }: WorkspaceProps) {
  const { t, locale } = useI18n()
  const [invoice, setInvoice] = useState<Invoice>(() => loadDraft() ?? sampleInvoice())
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [saved, setSaved] = useState(true)
  const fileInput = useRef<HTMLInputElement>(null)

  // Every edit goes through commit, which persists the draft and records whether that worked.
  const commit = (next: Invoice) => {
    setInvoice(next)
    setSaved(saveDraft(next))
  }

  const totals = useMemo(
    () => computeTotals(invoice.items, invoice.currency),
    [invoice.items, invoice.currency],
  )
  const defaultRate = settings.vatPresets[invoice.country]
  const patch = (changes: Partial<Invoice>) => {
    commit({ ...invoice, ...changes })
  }

  const exportJson = () => {
    const blob = new Blob([serializeInvoice(invoice)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.number.replace(/[^\w-]+/g, '_') || 'draft'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const result = parseInvoiceJson(await file.text())
    if (result.ok) {
      commit(result.invoice)
      setStatus({ kind: 'ok', text: t('importDone') })
    } else {
      setStatus({ kind: 'error', text: t('importFailed', { error: result.error }) })
    }
  }

  const newInvoice = () => {
    if (!window.confirm(t('confirmNew'))) return
    const fresh = sampleInvoice()
    commit({
      ...fresh,
      seller: invoice.seller,
      country: invoice.country,
      currency: invoice.currency,
      items: [emptyLine(defaultRate)],
      notes: '',
    })
    setStatus(null)
  }

  return (
    <div className="app">
      <header className="toolbar no-print">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ف
          </span>
          <div>
            <h1>{t('appTitle')}</h1>
            <p className="muted small">{t('appTagline')}</p>
          </div>
        </div>
        <nav className="actions" aria-label={t('toolbar')}>
          <LanguageToggle />
          <button
            type="button"
            className="btn"
            aria-label={t('digitsLabel')}
            aria-pressed={settings.digits === 'arab'}
            onClick={() => {
              setSettings((s) => ({ ...s, digits: s.digits === 'arab' ? 'latn' : 'arab' }))
            }}
          >
            {settings.digits === 'arab' ? t('digitsLatin') : t('digitsArabic')}
          </button>
          <button
            type="button"
            className="btn"
            aria-label={t('themeLabel')}
            onClick={() => {
              setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
            }}
          >
            {settings.theme === 'dark' ? t('themeLight') : t('themeDark')}
          </button>
          <button type="button" className="btn" onClick={newInvoice}>
            {t('newInvoice')}
          </button>
          <button type="button" className="btn" onClick={exportJson}>
            {t('exportJson')}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              fileInput.current?.click()
            }}
          >
            {t('importJson')}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => void importJson(e)}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              window.print()
            }}
          >
            {t('print')}
          </button>
        </nav>
      </header>

      <p className="status no-print" role="status">
        {status ? (
          <span className={status.kind === 'error' ? 'error' : 'ok'}>{status.text}</span>
        ) : (
          <span className="muted small">{saved ? t('draftSaved') : t('draftNotSaved')}</span>
        )}
      </p>

      <main className="layout">
        <section className="editor no-print" aria-label={t('sectionInvoice')}>
          <fieldset className="panel">
            <legend>{t('sectionInvoice')}</legend>
            <div className="grid-2">
              <TextField
                label={t('invoiceNumber')}
                value={invoice.number}
                onValueChange={(number) => {
                  patch({ number })
                }}
              />
              <TextField
                label={t('issuedAt')}
                type="datetime-local"
                value={invoice.issuedAt}
                onValueChange={(issuedAt) => {
                  patch({ issuedAt })
                }}
              />
              <label className="field">
                <span className="field-label">{t('country')}</span>
                <select
                  value={invoice.country}
                  onChange={(e) => {
                    const country = COUNTRY_CODES.find((c) => c === e.target.value)
                    if (country) patch({ country, currency: COUNTRY_CURRENCY[country] })
                  }}
                >
                  {COUNTRY_CODES.map((code) => (
                    <option key={code} value={code}>
                      {COUNTRY_NAMES[locale][code]} · {settings.vatPresets[code] || '0'}%
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label">{t('currency')}</span>
                <select
                  value={invoice.currency}
                  onChange={(e) => {
                    if (isCurrencyCode(e.target.value)) patch({ currency: e.target.value })
                  }}
                >
                  {CURRENCY_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code} · {CURRENCY_NAMES[locale][code]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <div className="grid-2 gap">
            <PartyFields
              legend={t('sectionSeller')}
              party={invoice.seller}
              onChange={(seller) => {
                patch({ seller })
              }}
            />
            <PartyFields
              legend={t('sectionBuyer')}
              party={invoice.buyer}
              onChange={(buyer) => {
                patch({ buyer })
              }}
            />
          </div>

          <LineItemsEditor
            items={invoice.items}
            currency={invoice.currency}
            defaultRate={defaultRate}
            onChange={(items) => {
              patch({ items })
            }}
            onAdd={() => {
              patch({ items: [...invoice.items, emptyLine(defaultRate)] })
            }}
          />

          <fieldset className="panel">
            <legend>{t('notes')}</legend>
            <TextField
              label={t('notes')}
              value={invoice.notes}
              multiline
              onValueChange={(notes) => {
                patch({ notes })
              }}
            />
          </fieldset>

          <VatPresets
            presets={settings.vatPresets}
            onChange={(vatPresets) => {
              setSettings((s) => ({ ...s, vatPresets }))
            }}
          />
        </section>

        <section className="preview" aria-label={t('preview')}>
          <InvoicePreview invoice={invoice} totals={totals} />
        </section>
      </main>
    </div>
  )
}
