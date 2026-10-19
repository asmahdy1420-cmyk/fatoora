import { COUNTRY_NAMES } from '../i18n/dictionaries'
import { useI18n } from '../i18n/context'
import { COUNTRY_CODES, type CountryCode, DEFAULT_VAT_PRESETS } from '../lib/invoice'
import { DecimalField } from './Field'

interface Props {
  presets: Record<CountryCode, string>
  onChange: (presets: Record<CountryCode, string>) => void
}

export function VatPresets({ presets, onChange }: Props) {
  const { t, locale } = useI18n()
  return (
    <details className="panel presets">
      <summary>{t('sectionPresets')}</summary>
      <p className="muted small">{t('presetsHint')}</p>
      <div className="grid-3">
        {COUNTRY_CODES.map((code) => (
          <DecimalField
            key={code}
            label={COUNTRY_NAMES[locale][code]}
            value={presets[code]}
            onValueChange={(value) => {
              onChange({ ...presets, [code]: value })
            }}
          />
        ))}
      </div>
      <button
        type="button"
        className="btn"
        onClick={() => {
          onChange({ ...DEFAULT_VAT_PRESETS })
        }}
      >
        {t('resetPresets')}
      </button>
    </details>
  )
}
