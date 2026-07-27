import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { FieldChipsView } from './field-chips-view'

describe('FieldChipsView links', () => {
  afterEach(cleanup)

  it('gives every rendered link an accessible name from its chip text', async () => {
    render(
      <FieldChipsView
        label='Booking'
        icon='document'
        items={[
          { value: 'Booking reference AB12CD', link: 'https://example.com/booking' },
          { value: 'No link chip' },
        ]}
      />,
    )

    const link = await screen.findByRole('link', { name: /Booking reference AB12CD/ })
    expect(link.getAttribute('href')).toBe('https://example.com/booking')

    // chips without a link must not become links at all
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})
