import { describe, it, expect } from 'vitest'
import { Suspense, type ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import {
  Repo,
  RepoContext,
  MessageChannelNetworkAdapter,
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
  useTrips,
} from './trips'
import { DateTime, TZ } from '@/lib/datetime'
import type { Trip, Flight } from '@/types'

interface Device {
  repo: Repo
  wrapper: ({ children }: { children: ReactNode }) => React.JSX.Element
}

function connectedDevices(): { deviceA: Device; deviceB: Device; rootHandle: DocHandle<RootDoc> } {
  const { port1, port2 } = new MessageChannel()
  const repoA = new Repo({ network: [new MessageChannelNetworkAdapter(port1)], sharePolicy: async () => true })
  const repoB = new Repo({ network: [new MessageChannelNetworkAdapter(port2)], sharePolicy: async () => true })

  const rootHandle = repoA.create<RootDoc>({ ...EMPTY_ROOT_DOC })

  function makeWrapper(repo: Repo) {
    return function wrapper({ children }: { children: ReactNode }) {
      return (
        <RepoContext.Provider value={repo}>
          <RootDocUrlContext.Provider value={rootHandle.url}>
            <Suspense fallback={null}>{children}</Suspense>
          </RootDocUrlContext.Provider>
        </RepoContext.Provider>
      )
    }
  }

  return {
    deviceA: { repo: repoA, wrapper: makeWrapper(repoA) },
    deviceB: { repo: repoB, wrapper: makeWrapper(repoB) },
    rootHandle,
  }
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

function getTripDoc(repo: Repo, url: AutomergeUrl) {
  const handle = repo.handles[interpretAsDocumentId(url)] as DocHandle<TripDoc>
  return handle.doc()
}

describe('trips sync across devices', () => {
  it('propagates a trip created on device A to device B', async () => {
    const { deviceA, deviceB } = connectedDevices()

    const { result: createTrip } = renderHook(() => useCreateTrip(), { wrapper: deviceA.wrapper })
    let tripId = ''
    await act(async () => {
      tripId = createTrip.current(tripFixture({ name: 'Tokyo' }))
    })

    const { result: tripsOnB } = renderHook(() => useTrips(), { wrapper: deviceB.wrapper })
    await waitFor(() => expect(tripsOnB.current.map((t) => t.id)).toContain(tripId))
    expect(tripsOnB.current.find((t) => t.id === tripId)?.name).toBe('Tokyo')
  })

  it('deletes a trip everywhere', async () => {
    const { deviceA, deviceB } = connectedDevices()

    const { result: createTrip } = renderHook(() => useCreateTrip(), { wrapper: deviceA.wrapper })
    let tripId = ''
    await act(async () => {
      tripId = createTrip.current(tripFixture())
    })

    const { result: tripsOnB } = renderHook(() => useTrips(), { wrapper: deviceB.wrapper })
    await waitFor(() => expect(tripsOnB.current.map((t) => t.id)).toContain(tripId))

    const { result: deleteTrip } = renderHook(() => useDeleteTrip(), { wrapper: deviceA.wrapper })
    await act(async () => {
      deleteTrip.current(tripId)
    })

    await waitFor(() => expect(tripsOnB.current.map((t) => t.id)).not.toContain(tripId))
  })

  it('merges concurrent edits to different trip items without data loss', async () => {
    const { deviceA, deviceB, rootHandle } = connectedDevices()

    const { result: createTrip } = renderHook(() => useCreateTrip(), { wrapper: deviceA.wrapper })
    let tripId = ''
    await act(async () => {
      tripId = createTrip.current(tripFixture())
    })

    const tripUrl = rootHandle.doc().tripIndex[tripId]
    await waitFor(() => expect(deviceB.repo.handles[interpretAsDocumentId(tripUrl)]?.doc()).toBeDefined())

    const { result: createItemOnA } = renderHook(() => useCreateTripItem(tripId), { wrapper: deviceA.wrapper })
    let itemA = ''
    await act(async () => {
      itemA = createItemOnA.current(flightFixture(tripId))
    })

    await waitFor(() => expect(getTripDoc(deviceB.repo, tripUrl).tripItems[itemA]).toBeDefined())

    const { result: createItemOnB } = renderHook(() => useCreateTripItem(tripId), { wrapper: deviceB.wrapper })
    let itemB = ''
    await act(async () => {
      itemB = createItemOnB.current(flightFixture(tripId))
    })

    await waitFor(() => {
      const items = getTripDoc(deviceA.repo, tripUrl).tripItems
      expect(items[itemA]).toBeDefined()
      expect(items[itemB]).toBeDefined()
    })
    expect(Object.keys(getTripDoc(deviceB.repo, tripUrl).tripItems).sort()).toEqual([itemA, itemB].sort())
  })

  it('replays offline edits once the device reconnects', async () => {
    const { port1, port2 } = new MessageChannel()
    const repoA = new Repo({ network: [], sharePolicy: async () => true })
    const repoB = new Repo({ network: [], sharePolicy: async () => true })

    const rootHandle = repoA.create<RootDoc>({ ...EMPTY_ROOT_DOC })
    function wrapperFor(repo: Repo) {
      return function wrapper({ children }: { children: ReactNode }) {
        return (
          <RepoContext.Provider value={repo}>
            <RootDocUrlContext.Provider value={rootHandle.url}>
              <Suspense fallback={null}>{children}</Suspense>
            </RootDocUrlContext.Provider>
          </RepoContext.Provider>
        )
      }
    }
    const wrapperA = wrapperFor(repoA)

    // create the trip while both devices are offline from each other
    const { result: createTrip } = renderHook(() => useCreateTrip(), { wrapper: wrapperA })
    let tripId = ''
    await act(async () => {
      tripId = createTrip.current(tripFixture({ name: 'Offline trip' }))
    })

    const { result: updateTrip } = renderHook(() => useUpdateTrip(tripId), { wrapper: wrapperA })
    await act(async () => {
      updateTrip.current({ name: 'Edited while offline' })
    })

    // device B was never told about this trip yet — now the devices reconnect
    repoA.networkSubsystem.addNetworkAdapter(new MessageChannelNetworkAdapter(port1))
    repoB.networkSubsystem.addNetworkAdapter(new MessageChannelNetworkAdapter(port2))

    const rootHandleB = await repoB.find<RootDoc>(rootHandle.url)
    await waitFor(() => expect(rootHandleB.doc().tripIndex[tripId]).toBeDefined())

    const tripUrl = rootHandleB.doc().tripIndex[tripId]
    await waitFor(() => {
      const handle = repoB.handles[interpretAsDocumentId(tripUrl)] as DocHandle<TripDoc> | undefined
      expect(handle?.doc()?.trip.name).toBe('Edited while offline')
    })
  })
})
