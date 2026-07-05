import { describe, it, expect } from 'vitest'
import { Suspense, type ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { Repo, RepoContext } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from '@/store/automerge/types'
import { useUserAirportsStore } from './airports'
import { useUserAccommodationsStore } from './accommodations'
import type { Airport, AccommodationSite } from '@/types'

interface Setup {
  repo: Repo
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

  return { repo, wrapper }
}

const airportFixture = (overrides: Partial<Airport> = {}): Airport => ({
  code: 'TXL',
  name: 'Berlin',
  address: { country: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
  ...overrides,
})

const accommodationFixture = (overrides: Partial<AccommodationSite> = {}): AccommodationSite => ({
  name: 'Hotel Adlon',
  kind: 'Hotel',
  address: { country: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
  ...overrides,
})

describe('useUserAirportsStore', () => {
  it('adds and reads a user airport', async () => {
    const { wrapper } = setup()
    const { result: add } = renderHook(() => useUserAirportsStore((s) => s.addAirport), { wrapper })
    await act(async () => {
      add.current(airportFixture())
    })

    const { result: airports } = renderHook(() => useUserAirportsStore((s) => s.airports), { wrapper })
    expect(airports.current.TXL?.name).toBe('Berlin')
  })

  it('updates an airport, moving keys if the code changes', async () => {
    const { wrapper } = setup()
    const { result: add } = renderHook(() => useUserAirportsStore((s) => s.addAirport), { wrapper })
    await act(async () => {
      add.current(airportFixture())
    })

    const { result: update } = renderHook(() => useUserAirportsStore((s) => s.updateAirport), { wrapper })
    await act(async () => {
      update.current('TXL', airportFixture({ code: 'BER', name: 'Berlin Brandenburg' }))
    })

    const { result: airports } = renderHook(() => useUserAirportsStore((s) => s.airports), { wrapper })
    expect(airports.current.TXL).toBeUndefined()
    expect(airports.current.BER?.name).toBe('Berlin Brandenburg')
  })

  it('deletes an airport', async () => {
    const { wrapper } = setup()
    const { result: add } = renderHook(() => useUserAirportsStore((s) => s.addAirport), { wrapper })
    await act(async () => {
      add.current(airportFixture())
    })

    const { result: del } = renderHook(() => useUserAirportsStore((s) => s.deleteAirport), { wrapper })
    await act(async () => {
      del.current('TXL')
    })

    const { result: airports } = renderHook(() => useUserAirportsStore((s) => s.airports), { wrapper })
    expect(airports.current.TXL).toBeUndefined()
  })
})

describe('useUserAccommodationsStore', () => {
  it('adds an accommodation and returns the created record', async () => {
    const { wrapper } = setup()
    const { result: add } = renderHook(() => useUserAccommodationsStore((s) => s.addAccommodation), { wrapper })

    let recordId = ''
    await act(async () => {
      recordId = add.current(accommodationFixture()).id
    })

    const { result: accommodations } = renderHook(() => useUserAccommodationsStore((s) => s.accommodations), {
      wrapper,
    })
    expect(accommodations.current[recordId]?.name).toBe('Hotel Adlon')
  })

  it('updates an accommodation in place', async () => {
    const { wrapper } = setup()
    const { result: add } = renderHook(() => useUserAccommodationsStore((s) => s.addAccommodation), { wrapper })

    let recordId = ''
    await act(async () => {
      recordId = add.current(accommodationFixture()).id
    })

    const { result: update } = renderHook(() => useUserAccommodationsStore((s) => s.updateAccommodation), { wrapper })
    await act(async () => {
      update.current(recordId, accommodationFixture({ name: 'Renamed Hotel' }))
    })

    const { result: accommodations } = renderHook(() => useUserAccommodationsStore((s) => s.accommodations), {
      wrapper,
    })
    expect(accommodations.current[recordId]?.name).toBe('Renamed Hotel')
  })

  it('deletes an accommodation', async () => {
    const { wrapper } = setup()
    const { result: add } = renderHook(() => useUserAccommodationsStore((s) => s.addAccommodation), { wrapper })

    let recordId = ''
    await act(async () => {
      recordId = add.current(accommodationFixture()).id
    })

    const { result: del } = renderHook(() => useUserAccommodationsStore((s) => s.deleteAccommodation), { wrapper })
    await act(async () => {
      del.current(recordId)
    })

    const { result: accommodations } = renderHook(() => useUserAccommodationsStore((s) => s.accommodations), {
      wrapper,
    })
    expect(accommodations.current[recordId]).toBeUndefined()
  })
})
