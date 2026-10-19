import { useI18n } from '../i18n/context'
import { computeLine, type LineItem } from '../lib/invoice'
import { type CurrencyCode, formatMinor } from '../lib/money'
import { DecimalField, TextField } from './Field'

interface Props {
  items: LineItem[]
  currency: CurrencyCode
  defaultRate: string
  onChange: (items: LineItem[]) => void
  onAdd: () => void
}

export function LineItemsEditor({ items, currency, defaultRate, onChange, onAdd }: Props) {
  const { t, num } = useI18n()

  const update = (id: string, patch: Partial<LineItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <fieldset className="panel">
      <legend>{t('sectionItems')}</legend>
      {items.length === 0 && <p className="muted">{t('noItems')}</p>}
      <ol className="line-list">
        {items.map((item, index) => {
          const line = computeLine(item, currency)
          return (
            <li key={item.id} className="line-row">
              <TextField
                className="line-desc"
                label={t('description')}
                value={item.description}
                onValueChange={(description) => {
                  update(item.id, { description })
                }}
              />
              <DecimalField
                label={t('quantity')}
                value={item.quantity}
                onValueChange={(quantity) => {
                  update(item.id, { quantity })
                }}
              />
              <DecimalField
                label={`${t('unitPrice')} (${currency})`}
                value={item.unitPrice}
                onValueChange={(unitPrice) => {
                  update(item.id, { unitPrice })
                }}
              />
              <DecimalField
                label={t('discount')}
                value={item.discountPercent}
                onValueChange={(discountPercent) => {
                  update(item.id, { discountPercent })
                }}
              />
              <DecimalField
                label={t('vatRate')}
                value={item.vatRate}
                onValueChange={(vatRate) => {
                  update(item.id, { vatRate })
                }}
              />
              <output className="line-total" aria-label={t('lineTotal')}>
                {num(formatMinor(line.net, currency))}
              </output>
              <button
                type="button"
                className="btn btn-icon"
                aria-label={t('removeLine', { n: index + 1 })}
                title={t('removeLine', { n: index + 1 })}
                onClick={() => {
                  onChange(items.filter((i) => i.id !== item.id))
                }}
              >
                ×
              </button>
            </li>
          )
        })}
      </ol>
      <div className="row-actions">
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          + {t('addLine')}
        </button>
        <button
          type="button"
          className="btn"
          disabled={items.length === 0}
          onClick={() => {
            onChange(items.map((item) => ({ ...item, vatRate: defaultRate })))
          }}
        >
          {t('applyPreset', { rate: num(defaultRate || '0') })}
        </button>
      </div>
    </fieldset>
  )
}
