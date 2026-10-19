import { CURRENCY_NAMES } from '../i18n/dictionaries'
import { useI18n } from '../i18n/context'
import {
  computeTotals,
  formatRate,
  type Invoice,
  type InvoiceTotals,
  toIsoTimestamp,
} from '../lib/invoice'
import { CURRENCIES, formatMinor, minorToDecimal } from '../lib/money'
import { buildQrPayload } from '../lib/tlv'
import { amountInWordsAr } from '../lib/words/ar'
import { amountInWordsEn } from '../lib/words/en'
import { QrCode } from './QrCode'

interface Props {
  invoice: Invoice
  totals?: InvoiceTotals
}

export function InvoicePreview({ invoice, totals: given }: Props) {
  const { t, num, locale } = useI18n()
  const totals = given ?? computeTotals(invoice.items, invoice.currency)
  const { currency } = invoice
  const symbol = locale === 'ar' ? CURRENCIES[currency].symbolAr : currency
  const money = (minor: number) => num(formatMinor(minor, currency))
  const isTaxInvoice = invoice.buyer.vatNumber.trim() !== ''

  const qrPayload = buildQrPayload({
    sellerName: invoice.seller.name,
    vatNumber: invoice.seller.vatNumber,
    timestamp: toIsoTimestamp(invoice.issuedAt),
    total: minorToDecimal(totals.total, currency),
    vatTotal: minorToDecimal(totals.vat, currency),
  })

  // Gulf invoices are commonly bilingual, so both spellings are always printed.
  const wordsAr = `فقط ${amountInWordsAr(totals.total, currency)} لا غير`
  const wordsEn = `${amountInWordsEn(totals.total, currency)} only`

  return (
    <article className="invoice" aria-label={t('sectionInvoice')}>
      <header className="invoice-head">
        <div>
          <h2 className="invoice-title">
            {isTaxInvoice ? t('taxInvoice') : t('simplifiedInvoice')}
          </h2>
          <dl className="meta">
            <div>
              <dt>{t('invoiceNumber')}</dt>
              <dd dir="ltr">{num(invoice.number)}</dd>
            </div>
            <div>
              <dt>{t('issuedAt')}</dt>
              <dd dir="ltr">{num(invoice.issuedAt.replace('T', ' '))}</dd>
            </div>
            <div>
              <dt>{t('currency')}</dt>
              <dd>{CURRENCY_NAMES[locale][currency]}</dd>
            </div>
          </dl>
        </div>
        <QrCode payload={qrPayload} alt={t('qrAlt')} />
      </header>

      <section className="parties">
        <div>
          <h3>{t('from')}</h3>
          <p className="party-name">{invoice.seller.name || '—'}</p>
          {invoice.seller.vatNumber && (
            <p>
              {t('vatNumber')}: <span dir="ltr">{num(invoice.seller.vatNumber)}</span>
            </p>
          )}
          <p className="pre">{invoice.seller.address}</p>
        </div>
        <div>
          <h3>{t('billTo')}</h3>
          <p className="party-name">{invoice.buyer.name || '—'}</p>
          {invoice.buyer.vatNumber && (
            <p>
              {t('vatNumber')}: <span dir="ltr">{num(invoice.buyer.vatNumber)}</span>
            </p>
          )}
          <p className="pre">{invoice.buyer.address}</p>
        </div>
      </section>

      <table className="items">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">{t('description')}</th>
            <th scope="col" className="num">
              {t('quantity')}
            </th>
            <th scope="col" className="num">
              {t('unitPrice')}
            </th>
            <th scope="col" className="num">
              {t('discount')}
            </th>
            <th scope="col" className="num">
              {t('vatRate')}
            </th>
            <th scope="col" className="num">
              {t('lineTotal')}
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.length === 0 && (
            <tr>
              <td colSpan={7} className="muted">
                {t('noItems')}
              </td>
            </tr>
          )}
          {invoice.items.map((item, index) => {
            const line = totals.lines[index]
            return (
              <tr key={item.id}>
                <td>{num(index + 1)}</td>
                <td>{item.description}</td>
                <td className="num">{num(item.quantity || '0')}</td>
                <td className="num">{num(item.unitPrice || '0')}</td>
                <td className="num">{num(item.discountPercent || '0')}</td>
                <td className="num">{num(item.vatRate || '0')}</td>
                <td className="num">{line ? money(line.net) : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <section className="summary">
        <table className="breakdown" aria-label={t('vatBreakdown')}>
          <thead>
            <tr>
              <th scope="col">{t('rate')}</th>
              <th scope="col" className="num">
                {t('taxable')}
              </th>
              <th scope="col" className="num">
                {t('vat')}
              </th>
            </tr>
          </thead>
          <tbody>
            {totals.breakdown.map((bucket) => (
              <tr key={bucket.rateBp}>
                <td>{num(`${formatRate(bucket.rateBp)}%`)}</td>
                <td className="num">{money(bucket.taxable)}</td>
                <td className="num">{money(bucket.vat)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="totals">
          <div>
            <dt>{t('subtotal')}</dt>
            <dd>{money(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <div>
              <dt>{t('discountTotal')}</dt>
              <dd>−{money(totals.discount)}</dd>
            </div>
          )}
          <div>
            <dt>{t('taxable')}</dt>
            <dd>{money(totals.taxable)}</dd>
          </div>
          {totals.breakdown.map((bucket) => (
            <div key={bucket.rateBp}>
              <dt>{t('vatAt', { rate: num(formatRate(bucket.rateBp)) })}</dt>
              <dd>{money(bucket.vat)}</dd>
            </div>
          ))}
          <div>
            <dt>{t('vatTotal')}</dt>
            <dd>{money(totals.vat)}</dd>
          </div>
          <div className="grand">
            <dt>{t('grandTotal')}</dt>
            <dd>
              {money(totals.total)} <span className="currency">{symbol}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="words">
        <h3>{t('amountInWords')}</h3>
        <p lang="ar" dir="rtl">
          {wordsAr}
        </p>
        <p lang="en" dir="ltr">
          {wordsEn}
        </p>
      </section>

      {invoice.notes && (
        <section className="notes">
          <h3>{t('notes')}</h3>
          <p className="pre">{invoice.notes}</p>
        </section>
      )}
    </article>
  )
}
