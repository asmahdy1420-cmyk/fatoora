import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useI18n } from '../i18n/context'
import { I18nProvider } from '../i18n/I18nProvider'
import { LanguageToggle } from './LanguageToggle'

function Heading() {
  const { t, num } = useI18n()
  return (
    <h1>
      {t('grandTotal')} {num('1,250.00')}
    </h1>
  )
}

describe('LanguageToggle', () => {
  it('switches the document between LTR English and RTL Arabic', async () => {
    const user = userEvent.setup()
    render(
      <I18nProvider initialLocale="en">
        <LanguageToggle />
        <Heading />
      </I18nProvider>,
    )

    expect(document.documentElement.dir).toBe('ltr')
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('heading')).toHaveTextContent('Total due')

    await user.click(screen.getByRole('button', { name: 'Switch to Arabic' }))
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')
    expect(screen.getByRole('heading')).toHaveTextContent('الإجمالي المستحق')
    expect(screen.getByRole('button', { name: 'التبديل إلى الإنجليزية' })).toHaveTextContent(
      'English',
    )

    await user.click(screen.getByRole('button', { name: 'التبديل إلى الإنجليزية' }))
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('renders Arabic-Indic digits when that style is selected', () => {
    render(
      <I18nProvider initialLocale="ar" digits="arab">
        <Heading />
      </I18nProvider>,
    )
    expect(screen.getByRole('heading')).toHaveTextContent('الإجمالي المستحق ١٬٢٥٠٫٠٠')
  })
})
