import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('recalculates totals and saves the draft as line items change', async () => {
    const user = userEvent.setup()
    render(<App />)

    const preview = screen.getByRole('article')
    // Sample invoice: 10 x 350 QAR at 0% VAT.
    expect(preview.querySelector('.grand dd')).toHaveTextContent('3,500.00')

    const price = screen.getByLabelText('Unit price (QAR)')
    await user.clear(price)
    await user.type(price, '١٢٫٥')
    expect(price).toHaveValue('12.5')
    expect(preview.querySelector('.grand dd')).toHaveTextContent('125.00')
    expect(within(preview).getByText('One hundred twenty-five Qatari riyals only')).toBeVisible()
    expect(within(preview).getByText('فقط مائة وخمسة وعشرون ريالًا قطريًا لا غير')).toBeVisible()

    const saved = window.localStorage.getItem('fatoora:draft:v1') ?? ''
    expect(saved).toContain('"unitPrice":"12.5"')
  })
})
