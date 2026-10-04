import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { TripForm } from './trip-form'

afterEach(cleanup)

const noop = () => {}

describe('TripForm', () => {
  it('keeps Save disabled until a field changes', async () => {
    render(
      <TripForm
        defaultValues={{ name: 'Tokyo', description: '', startDate: '2026-09-05', endDate: '2026-09-16' }}
        onSubmit={noop}
        onCancel={noop}
      />,
    )
    const save = screen.getByRole('button', { name: 'Save' })
    expect(save).toHaveProperty('disabled', true)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Tokyo and Kyoto' } })
    await waitFor(() => expect(save).toHaveProperty('disabled', false))

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Tokyo' } })
    await waitFor(() => expect(save).toHaveProperty('disabled', true))
  })
})
