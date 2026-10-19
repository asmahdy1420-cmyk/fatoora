import type { CountryCode } from '../lib/invoice'
import type { CurrencyCode } from '../lib/money'

export const LOCALES = ['en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]

/** English is the reference dictionary: its keys define the shape every locale must match. */
const en = {
  appTitle: 'Fatoora',
  appTagline: 'Bilingual invoice builder',
  toolbar: 'Toolbar',
  preview: 'Preview',
  switchLanguage: 'العربية',
  switchLanguageLabel: 'Switch to Arabic',
  themeDark: 'Dark',
  themeLight: 'Light',
  themeLabel: 'Toggle colour theme',
  digitsArabic: '٠١٢ digits',
  digitsLatin: '012 digits',
  digitsLabel: 'Toggle Arabic-Indic digits',
  newInvoice: 'New',
  exportJson: 'Export JSON',
  importJson: 'Import JSON',
  print: 'Print / PDF',
  confirmNew: 'Start a new invoice? The current draft will be replaced.',
  importFailed: 'Import failed: {error}',
  importDone: 'Invoice imported',
  draftSaved: 'Draft saved in this browser',
  draftNotSaved: 'Draft could not be saved (storage unavailable)',

  sectionInvoice: 'Invoice',
  invoiceNumber: 'Invoice number',
  issuedAt: 'Issue date and time',
  country: 'Country',
  currency: 'Currency',
  notes: 'Notes',

  sectionSeller: 'Seller',
  sectionBuyer: 'Buyer',
  name: 'Name',
  vatNumber: 'VAT number',
  address: 'Address',

  sectionItems: 'Line items',
  description: 'Description',
  quantity: 'Qty',
  unitPrice: 'Unit price',
  discount: 'Discount %',
  vatRate: 'VAT %',
  lineTotal: 'Line total',
  addLine: 'Add line',
  removeLine: 'Remove line {n}',
  applyPreset: 'Apply {rate}% to all lines',

  sectionPresets: 'VAT presets',
  presetsHint: 'Standard rates used for new lines. Check current rates with your tax adviser.',
  resetPresets: 'Reset to defaults',

  taxInvoice: 'Tax invoice',
  simplifiedInvoice: 'Simplified tax invoice',
  billTo: 'Bill to',
  from: 'From',
  subtotal: 'Subtotal',
  discountTotal: 'Discount',
  taxable: 'Taxable amount',
  vatAt: 'VAT {rate}%',
  vatTotal: 'Total VAT',
  grandTotal: 'Total due',
  amountInWords: 'Amount in words',
  qrAlt: 'QR code with seller, VAT number, time and totals',
  noItems: 'No line items yet',
  vatBreakdown: 'VAT breakdown',
  rate: 'Rate',
  vat: 'VAT',
} as const

export type MessageKey = keyof typeof en
export type Dictionary = Record<MessageKey, string>

const ar: Dictionary = {
  appTitle: 'فاتورة',
  appTagline: 'منشئ فواتير ثنائي اللغة',
  toolbar: 'شريط الأدوات',
  preview: 'معاينة',
  switchLanguage: 'English',
  switchLanguageLabel: 'التبديل إلى الإنجليزية',
  themeDark: 'داكن',
  themeLight: 'فاتح',
  themeLabel: 'تبديل المظهر',
  digitsArabic: 'أرقام ٠١٢',
  digitsLatin: 'أرقام 012',
  digitsLabel: 'تبديل الأرقام الهندية',
  newInvoice: 'جديدة',
  exportJson: 'تصدير JSON',
  importJson: 'استيراد JSON',
  print: 'طباعة / PDF',
  confirmNew: 'بدء فاتورة جديدة؟ ستُستبدل المسودة الحالية.',
  importFailed: 'فشل الاستيراد: {error}',
  importDone: 'تم استيراد الفاتورة',
  draftSaved: 'حُفظت المسودة في هذا المتصفح',
  draftNotSaved: 'تعذّر حفظ المسودة (التخزين غير متاح)',

  sectionInvoice: 'الفاتورة',
  invoiceNumber: 'رقم الفاتورة',
  issuedAt: 'تاريخ ووقت الإصدار',
  country: 'الدولة',
  currency: 'العملة',
  notes: 'ملاحظات',

  sectionSeller: 'البائع',
  sectionBuyer: 'المشتري',
  name: 'الاسم',
  vatNumber: 'الرقم الضريبي',
  address: 'العنوان',

  sectionItems: 'البنود',
  description: 'الوصف',
  quantity: 'الكمية',
  unitPrice: 'سعر الوحدة',
  discount: 'الخصم ٪',
  vatRate: 'الضريبة ٪',
  lineTotal: 'إجمالي البند',
  addLine: 'إضافة بند',
  removeLine: 'حذف البند {n}',
  applyPreset: 'تطبيق {rate}٪ على كل البنود',

  sectionPresets: 'نسب ضريبة القيمة المضافة',
  presetsHint: 'النسب القياسية للبنود الجديدة. تحقّق من النسب الحالية مع مستشارك الضريبي.',
  resetPresets: 'استعادة الافتراضي',

  taxInvoice: 'فاتورة ضريبية',
  simplifiedInvoice: 'فاتورة ضريبية مبسطة',
  billTo: 'فاتورة إلى',
  from: 'من',
  subtotal: 'المجموع الفرعي',
  discountTotal: 'الخصم',
  taxable: 'المبلغ الخاضع للضريبة',
  vatAt: 'ضريبة القيمة المضافة {rate}٪',
  vatTotal: 'إجمالي الضريبة',
  grandTotal: 'الإجمالي المستحق',
  amountInWords: 'المبلغ كتابةً',
  qrAlt: 'رمز QR يحتوي البائع والرقم الضريبي والوقت والإجماليات',
  noItems: 'لا توجد بنود بعد',
  vatBreakdown: 'تفصيل الضريبة',
  rate: 'النسبة',
  vat: 'الضريبة',
}

export const DICTIONARIES: Record<Locale, Dictionary> = { en, ar }

export const COUNTRY_NAMES: Record<Locale, Record<CountryCode, string>> = {
  en: {
    SA: 'Saudi Arabia',
    AE: 'United Arab Emirates',
    BH: 'Bahrain',
    OM: 'Oman',
    QA: 'Qatar',
    KW: 'Kuwait',
  },
  ar: {
    SA: 'السعودية',
    AE: 'الإمارات',
    BH: 'البحرين',
    OM: 'عُمان',
    QA: 'قطر',
    KW: 'الكويت',
  },
}

export const CURRENCY_NAMES: Record<Locale, Record<CurrencyCode, string>> = {
  en: {
    QAR: 'Qatari riyal',
    AED: 'UAE dirham',
    SAR: 'Saudi riyal',
    BHD: 'Bahraini dinar',
    KWD: 'Kuwaiti dinar',
    OMR: 'Omani rial',
    USD: 'US dollar',
  },
  ar: {
    QAR: 'ريال قطري',
    AED: 'درهم إماراتي',
    SAR: 'ريال سعودي',
    BHD: 'دينار بحريني',
    KWD: 'دينار كويتي',
    OMR: 'ريال عماني',
    USD: 'دولار أمريكي',
  },
}

/** Replace `{name}` placeholders with values. Unknown placeholders are left visible. */
export function interpolate(template: string, values: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}
