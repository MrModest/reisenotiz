import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { Suspense } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { Repo, RepoContext } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc, type TripDoc } from '@/store/automerge/types'
import { countryDictionary } from '@/services'
import type { Airport, TripItem } from '@/types'
import { SavedPlacesPage } from './saved-places'

const airport = (code: string, name: string, archived?: boolean) => ({
  code,
  name,
  address: { countryCode: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
  ...(archived && { archived }),
}) as Airport

function renderPlaces() {
  const repo = new Repo({ network: [] })
  const flight = { id: 'f1', type: 'Flight', departure: { placeKey: 'BER' }, arrival: { placeKey: 'MUC' } } as unknown as TripItem
  const trip = repo.create<TripDoc>({ trip: { id: 'trip-1' } as TripDoc['trip'], tripItems: { f1: flight } })
  const root = repo.create<RootDoc>({
    ...EMPTY_ROOT_DOC,
    tripIndex: { 'trip-1': trip.url },
    savedAirports: {
      BER: airport('BER', 'Berlin Brandenburg'),
      LIS: airport('LIS', 'Lisbon'),
      MUC: airport('MUC', 'Munich', true),
    },
  })
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

const actionsOf = (name: string) =>
  within(screen.getByText(name).closest('[role="listitem"]') as HTMLElement).getAllByRole('button')

describe('SavedPlacesPage row actions', () => {
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

  it('offers Archive with a disabled Delete for a place in use, Delete for an unused one and Restore for an archived one', async () => {
    renderPlaces()
    await screen.findByText('Berlin Brandenburg')
    fireEvent.click(screen.getByRole('switch'))

    const inUse = actionsOf('Berlin Brandenburg')
    expect(inUse.map((b) => [b.textContent, (b as HTMLButtonElement).disabled])).toEqual([['Archive', false], ['Delete', true]])
    expect(screen.getByText('1 use')).toBeTruthy()
    expect(actionsOf('Lisbon').map((b) => b.textContent)).toEqual(['Delete'])
    expect(actionsOf('Munich').map((b) => b.textContent)).toEqual(['Restore'])
  })
})
