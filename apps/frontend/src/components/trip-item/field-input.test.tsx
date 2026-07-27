import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FieldInput } from './field-input'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
})

function Harness() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: '' } })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FieldInput name='name' label='Name' required />
        <button type='submit'>Save</button>
      </form>
    </FormProvider>
  )
}

describe('FieldInput validation surface', () => {
  afterEach(cleanup)

  it('renders no error and no aria-invalid before submission', () => {
    render(<Harness />)

    const input = screen.getByLabelText(/Name/)
    expect(input.getAttribute('aria-invalid')).not.toBe('true')
    expect(input.getAttribute('aria-describedby')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('renders the field error and links it to the invalid input', async () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const message = await screen.findByText('Name is required')
    const input = screen.getByLabelText(/Name/)

    await waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('true'))

    // the invalid input must point at the element that carries the message
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBe('name-error')
    expect(message.id).toBe(describedBy)
    expect(message.getAttribute('role')).toBe('alert')
  })
})
