import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { Repo, RepoContext } from '@automerge/react'
import { AppShell } from './app-shell'

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: '/', Component: AppShell, children: [{ path: '*', element: null }] }], {
    initialEntries: [path],
  })
  render(
    <RepoContext.Provider value={new Repo({ network: [] })}>
      <RouterProvider router={router} />
    </RepoContext.Provider>,
  )
  return within(screen.getByRole('navigation', { name: 'Primary' }))
}

describe('AppShell', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('keeps Trips lit inside a trip and lights Home only on the home screen', () => {
    const rail = renderAt('/trips/abc')
    expect(rail.getByRole('link', { name: 'Trips' }).getAttribute('aria-current')).toBe('page')
    expect(rail.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull()
  })

  it('remembers a collapsed rail across mounts', () => {
    fireEvent.click(renderAt('/').getByRole('button', { name: 'Collapse' }))
    cleanup()
    expect(renderAt('/').getByRole('button', { name: 'Expand' })).toBeDefined()
  })

  it('starts expanded', () => {
    expect(renderAt('/').getByRole('button', { name: 'Collapse' })).toBeDefined()
  })
})
