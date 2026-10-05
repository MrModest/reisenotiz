import { afterEach, describe, expect, it } from 'vitest'
import { Suspense } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { Repo, RepoContext } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc, type TripDoc } from '@/store/automerge/types'
import { withoutUndefined } from '@/store/automerge/without-undefined'
import { createFlightDraft } from '@/components/trip-items/flight/draft'
import { createAccommodationDraft } from '@/components/trip-items/accommodation/draft'
import { DateTime, TZ } from '@/lib/datetime'
import { TripTimelinePage } from './trip-timeline'

function renderTimeline() {
  const repo = new Repo({ network: [] })
  const day = (d: number) => DateTime.fromObject({ year: 2026, month: 9, day: d }, TZ.local()).toZonedInstant()
  const flight = { ...createFlightDraft('trip-1'), flightNumber: 'LH 1953' }
  const stay = createAccommodationDraft('trip-1')
  stay.site.name = 'Hotel Weisses Kreuz'
  const trip = repo.create<TripDoc>({
    trip: { id: 'trip-1', name: 'Alps', description: '', startDate: day(5), endDate: day(16) },
    tripItems: { [flight.id]: flight, [stay.id]: withoutUndefined(stay) },
  })
  const root = repo.create<RootDoc>({ ...EMPTY_ROOT_DOC, tripIndex: { 'trip-1': trip.url } })
  const router = createMemoryRouter(
    [{ path: '/trips/:tripId', element: <Suspense fallback={null}><TripTimelinePage /></Suspense> }],
    { initialEntries: ['/trips/trip-1'] },
  )
  render(
    <RepoContext.Provider value={repo}>
      <RootDocUrlContext.Provider value={root.url}>
        <RouterProvider router={router} />
      </RootDocUrlContext.Provider>
    </RepoContext.Provider>,
  )
}

describe('TripTimelinePage filter chips', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('narrows the rows to the chosen type, and ALL brings them back', async () => {
    renderTimeline()
    const chips = within(await screen.findByRole('group', { name: 'Filter' }))
    expect(chips.getAllByRole('button').map((b) => b.textContent)).toEqual(['All', 'Flight', 'Stay'])
    expect(screen.getAllByText('LH 1953')).toHaveLength(2)
    expect(screen.getAllByText('Hotel Weisses Kreuz')).toHaveLength(2)

    fireEvent.click(chips.getByRole('button', { name: 'Flight' }))
    expect(chips.getByRole('button', { name: 'Flight' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getAllByText('LH 1953')).toHaveLength(2)
    expect(screen.queryByText('Hotel Weisses Kreuz')).toBeNull()

    fireEvent.click(chips.getByRole('button', { name: 'All' }))
    expect(screen.getAllByText('Hotel Weisses Kreuz')).toHaveLength(2)
  })
})
