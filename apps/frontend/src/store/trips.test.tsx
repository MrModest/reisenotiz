import { describe, it, expect } from 'vitest'
import { Suspense, type ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import {
  Repo,
  RepoContext,
  interpretAsDocumentId,
  type AutomergeUrl,
  type DocHandle,
} from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc, type TripDoc } from './automerge/types'
import {
  useCreateTrip,
  useUpdateTrip,
  useDeleteTrip,
  useCreateTripItem,
  useUpdateTripItem,
  useDeleteTripItem,
  useTrips,
  useTrip,
  useTripItems,
  useTripItem,
} from './trips'
import { DateTime, TZ } from '@/lib/datetime'
import type { Trip, Flight } from '@/types'

interface Setup {
  repo: Repo
  rootHandle: DocHandle<RootDoc>
  wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element
}

function setup(): Setup {
  const repo = new Repo({ network: [] })
  const rootHandle = repo.create<RootDoc>({ ...EMPTY_ROOT_DOC })

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <RepoContext.Provider value={repo}>
        <RootDocUrlContext.Provider value={rootHandle.url}>
          <Suspense fallback={null}>{children}</Suspense>
        </RootDocUrlContext.Provider>
      </RepoContext.Provider>
    )
  }

  return { repo, rootHandle, wrapper }
}

function getTripDoc(repo: Repo, url: AutomergeUrl) {
  const handle = repo.handles[interpretAsDocumentId(url)] as DocHandle<TripDoc>
  return handle.doc()
}

function tripFixture(overrides: Partial<Trip> = {}): Omit<Trip, 'id'> {
  const zone = TZ.local()
  return {
    name: 'Berlin trip',
    description: '',
    startDate: DateTime.fromObject({ year: 2026, month: 5, day: 1 }, zone).toZonedInstant(),
    endDate: DateTime.fromObject({ year: 2026, month: 5, day: 7 }, zone).toZonedInstant(),
    ...overrides,
  }
}

function flightFixture(tripId: string): Omit<Flight, 'id'> {
  const zone = TZ.local()
  const t = (h: number) =>
    DateTime.fromObject({ year: 2026, month: 5, day: 1, hour: h }, zone).toZonedInstant()
  return {
    tripId,
    type: 'Flight',
    note: '',
    attachments: [],
    flightNumber: 'LH123',
    carrier: 'Lufthansa',
    bookingCode: 'ABC123',
    seat: '12A',
    passengers: [],
    departure: {
      airport: { code: 'TXL', name: 'Berlin', address: { country: 'DE', city: 'Berlin' }, tzone: 'Europe/Berlin' },
      time: t(8),
    },
    arrival: {
      airport: { code: 'MUC', name: 'Munich', address: { country: 'DE', city: 'Munich' }, tzone: 'Europe/Berlin' },
      time: t(10),
    },
  }
}

async function createTrip(wrapper: Setup['wrapper'], trip = tripFixture()): Promise<string> {
  const { result } = renderHook(() => useCreateTrip(), { wrapper })
  let id = ''
  await act(async () => {
    id = result.current(trip)
  })
  return id
}

async function createItem(
  wrapper: Setup['wrapper'],
  tripId: string,
  item = flightFixture(tripId),
): Promise<string> {
  const { result } = renderHook(() => useCreateTripItem(tripId), { wrapper })
  let id = ''
  await act(async () => {
    id = result.current(item)
  })
  return id
}

describe('trips store hooks', () => {
  it('useCreateTrip creates a per-trip doc and registers URL in root index', async () => {
    const { repo, rootHandle, wrapper } = setup()
    const id = await createTrip(wrapper)

    const url = rootHandle.doc().tripIndex[id]
    expect(url).toMatch(/^automerge:/)
    const tripDoc = getTripDoc(repo, url)
    expect(tripDoc.trip.id).toBe(id)
    expect(tripDoc.trip.name).toBe('Berlin trip')
    expect(tripDoc.tripItems).toEqual({})
  })

  it('useUpdateTrip mutates trip fields', async () => {
    const { repo, rootHandle, wrapper } = setup()
    const id = await createTrip(wrapper)

    const { result } = renderHook(() => useUpdateTrip(id), { wrapper })
    await act(async () => {
      result.current({ name: 'Renamed' })
    })

    const url = rootHandle.doc().tripIndex[id]
    expect(getTripDoc(repo, url).trip.name).toBe('Renamed')
  })

  it('useDeleteTrip removes URL from root index', async () => {
    const { rootHandle, wrapper } = setup()
    const id = await createTrip(wrapper)
    expect(rootHandle.doc().tripIndex[id]).toBeDefined()

    const { result } = renderHook(() => useDeleteTrip(), { wrapper })
    await act(async () => {
      result.current(id)
    })
    expect(rootHandle.doc().tripIndex[id]).toBeUndefined()
  })

  it('useCreateTripItem writes into the right TripDoc', async () => {
    const { repo, rootHandle, wrapper } = setup()
    const tripId = await createTrip(wrapper)
    const itemId = await createItem(wrapper, tripId)

    const url = rootHandle.doc().tripIndex[tripId]
    const item = getTripDoc(repo, url).tripItems[itemId] as Flight
    expect(item.id).toBe(itemId)
    expect(item.tripId).toBe(tripId)
    expect(item.type).toBe('Flight')
  })

  it('useUpdateTripItem mutates a single item field', async () => {
    const { repo, rootHandle, wrapper } = setup()
    const tripId = await createTrip(wrapper)
    const itemId = await createItem(wrapper, tripId)

    const updated: Flight = { ...flightFixture(tripId), id: itemId, seat: '1A' }
    const { result } = renderHook(() => useUpdateTripItem(tripId), { wrapper })
    await act(async () => {
      result.current(itemId, updated)
    })

    const url = rootHandle.doc().tripIndex[tripId]
    const item = getTripDoc(repo, url).tripItems[itemId] as Flight
    expect(item.seat).toBe('1A')
  })

  it('useDeleteTripItem removes the item from its TripDoc', async () => {
    const { repo, rootHandle, wrapper } = setup()
    const tripId = await createTrip(wrapper)
    const itemId = await createItem(wrapper, tripId)

    const { result } = renderHook(() => useDeleteTripItem(tripId), { wrapper })
    await act(async () => {
      result.current(itemId)
    })

    const url = rootHandle.doc().tripIndex[tripId]
    expect(getTripDoc(repo, url).tripItems[itemId]).toBeUndefined()
  })

  it('keeps items isolated between two trips', async () => {
    const { repo, rootHandle, wrapper } = setup()
    const tripA = await createTrip(wrapper, tripFixture({ name: 'A' }))
    const tripB = await createTrip(wrapper, tripFixture({ name: 'B' }))
    const itemA = await createItem(wrapper, tripA)
    const itemB = await createItem(wrapper, tripB)

    const urlA = rootHandle.doc().tripIndex[tripA]
    const urlB = rootHandle.doc().tripIndex[tripB]
    expect(Object.keys(getTripDoc(repo, urlA).tripItems)).toEqual([itemA])
    expect(Object.keys(getTripDoc(repo, urlB).tripItems)).toEqual([itemB])
  })

  it('useTrips returns sorted trip list and useTrip returns the trip', async () => {
    const { wrapper } = setup()
    const id = await createTrip(wrapper, tripFixture({ name: 'Tokyo' }))

    const { result: trips } = renderHook(() => useTrips(), { wrapper })
    expect(trips.current.map((t) => t.name)).toEqual(['Tokyo'])

    const { result: trip } = renderHook(() => useTrip(id), { wrapper })
    expect(trip.current.name).toBe('Tokyo')
  })

  it('useTripItems and useTripItem read from the trip doc', async () => {
    const { wrapper } = setup()
    const tripId = await createTrip(wrapper)
    const itemId = await createItem(wrapper, tripId)

    const { result: items } = renderHook(() => useTripItems(tripId), { wrapper })
    expect(items.current).toHaveLength(1)
    expect(items.current[0]?.id).toBe(itemId)

    const { result: item } = renderHook(() => useTripItem(tripId, itemId), { wrapper })
    expect(item.current.id).toBe(itemId)
  })
})
