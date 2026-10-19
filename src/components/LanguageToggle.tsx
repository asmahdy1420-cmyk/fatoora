import { useI18n } from '../i18n/context'

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()
  return (
    <button
      type="button"
      className="btn"
      lang={locale === 'ar' ? 'en' : 'ar'}
      aria-label={t('switchLanguageLabel')}
      onClick={() => {
        setLocale(locale === 'ar' ? 'en' : 'ar')
      }}
    >
      {t('switchLanguage')}
    </button>
  )
}
