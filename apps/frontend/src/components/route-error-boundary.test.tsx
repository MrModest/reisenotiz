import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { RouteErrorBoundary } from './route-error-boundary'
import { ROOT_DOC_KEY } from '@/store/automerge/root-doc'

function ThrowingPage(): never {
  throw new Error('Document automerge:abc123 is unavailable')
}

function renderWithError() {
  const router = createMemoryRouter([
    {
      path: '/',
      ErrorBoundary: RouteErrorBoundary,
      Component: ThrowingPage,
    },
  ])
  return render(<RouterProvider router={router} />)
}

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    localStorage.setItem(ROOT_DOC_KEY, 'automerge:existing')
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the error message instead of crashing', () => {
    renderWithError()
    expect(screen.getByText(/Document automerge:abc123 is unavailable/)).toBeDefined()
  })

  it('clears the stored root doc URL and reloads on "Reset local data"', () => {
    const reload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload },
      writable: true,
    })

    renderWithError()
    fireEvent.click(screen.getByRole('button', { name: /reset local data/i }))

    expect(localStorage.getItem(ROOT_DOC_KEY)).toBeNull()
    expect(reload).toHaveBeenCalled()
  })
})
