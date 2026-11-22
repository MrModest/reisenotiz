import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { Suspense } from 'react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { Repo, RepoContext } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from '@/store/automerge/types'
import { countryDictionary } from '@/services'
import type { Airport } from '@/types'
import { SavedPlacesPage } from './saved-places'

const airport = (code: string, name: string): Airport => ({
  id: `custom:${code}`,
  type: 'Airport',
  code,
  name,
  address: { countryCode: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
})

function renderPlaces() {
  const repo = new Repo({ network: [] })
  const ber = airport('BER', 'Berlin Brandenburg')
  const lis = airport('LIS', 'Lisbon')
  const root = repo.create<RootDoc>({ ...EMPTY_ROOT_DOC, savedPlaces: { [ber.id]: ber, [lis.id]: lis } })
  const router = createMemoryRouter(
    [{ path: '/saved-places', element: <Suspense fallback={null}><SavedPlacesPage /></Suspense> }],
    { initialEntries: ['/saved-places'] },
  )
  render(
    <RepoContext.Provider value={repo}>
      <RootDocUrlContext.Provider value={root.url}>
        <RouterProvider router={router} />
      </RootDocUrlContext.Provider>
    </RepoContext.Provider>,
  )
}

describe('SavedPlacesPage', () => {
  beforeAll(async () => {
    localStorage.setItem(
      'dict:countries',
      JSON.stringify({ fetchedAt: new Date().toISOString(), data: { DE: { code: 'DE', name: 'Germany' } } }),
    )
    await countryDictionary.load()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('deletes a place from its row', async () => {
    renderPlaces()
    await screen.findByText('Berlin Brandenburg')

    fireEvent.click(within(screen.getByText('Lisbon').closest('[role="listitem"]') as HTMLElement).getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(screen.queryByText('Lisbon')).toBeNull())
    expect(screen.getByText('Berlin Brandenburg')).toBeTruthy()
  })
})
