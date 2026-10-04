import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { Repo, RepoContext } from '@automerge/react'
import { PageHeader } from './page-header'

function Here() {
  return <p>at {useLocation().pathname}</p>
}

function renderAt(initialEntries: string[]) {
  const router = createMemoryRouter(
    [
      { path: '/trips/1', element: <PageHeader title='Trip' backTo='/trips' /> },
      { path: '*', element: <Here /> },
    ],
    { initialEntries, initialIndex: initialEntries.length - 1 },
  )
  render(
    <RepoContext.Provider value={new Repo({ network: [] })}>
      <RouterProvider router={router} />
    </RepoContext.Provider>,
  )
}

describe('PageHeader back control', () => {
  afterEach(cleanup)

  it('goes back in history when history exists', () => {
    renderAt(['/somewhere-else', '/trips/1'])
    fireEvent.click(screen.getByRole('link', { name: 'Back' }))
    expect(screen.getByText('at /somewhere-else')).toBeDefined()
  })

  it('goes to backTo on a cold start from a deep link', () => {
    renderAt(['/trips/1'])
    fireEvent.click(screen.getByRole('link', { name: 'Back' }))
    expect(screen.getByText('at /trips')).toBeDefined()
  })
})
