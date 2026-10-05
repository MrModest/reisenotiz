import { describe, it, expect } from 'vitest'
import { Suspense, type ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { Repo, RepoContext, interpretAsDocumentId, type DocHandle } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from './automerge/types'
import { useSavedPlace, useSavedPlaceMutations, useSavedPlaces, type PlaceSaveResult } from './saved-places'
import type { AccommodationSite, Airport } from '@/types'

function setup() {
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

  const handle = repo.handles[interpretAsDocumentId(rootHandle.url)] as DocHandle<RootDoc>
  const doc = () => {
    const { savedAirports = {}, savedAccommodationSites = {} } = handle.doc()
    return { savedAirports, savedAccommodationSites }
  }
  const { result } = renderHook(() => ({ places: useSavedPlaces(), mutate: useSavedPlaceMutations() }), { wrapper })
  return { wrapper, doc, result }
}

const airport = (overrides: Partial<Airport> = {}): Airport => ({
  code: 'BER',
  name: 'Berlin Brandenburg',
  address: { countryCode: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
  ...overrides,
})

const site = (overrides: Partial<AccommodationSite> = {}): AccommodationSite => ({
  name: 'Hotel Adlon',
  kind: 'Hotel',
  address: { countryCode: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
  ...overrides,
})

function keyOf(result: PlaceSaveResult): string {
  if (!result.ok) throw new Error(`Not saved: ${result.reason}`)
  return result.key
}

describe('saved places', () => {
  it('adds an airport keyed by its IATA code', async () => {
    const { result, doc } = setup()
    let key = ''
    await act(async () => {
      key = keyOf(result.current.mutate.add('Airport', airport()))
    })

    expect(key).toBe('BER')
    expect(doc().savedAirports.BER.name).toBe('Berlin Brandenburg')
    expect(result.current.places).toEqual([{ type: 'Airport', key: 'BER', place: airport() }])
  })

  it('adds an accommodation site keyed by a fresh uuid, dropping empty optional fields', async () => {
    const { result, doc } = setup()
    let key = ''
    await act(async () => {
      key = keyOf(result.current.mutate.add('AccommodationSite', site({ contact: undefined })))
    })

    expect(key).toMatch(/^[0-9a-f-]{36}$/)
    expect(doc().savedAccommodationSites[key].name).toBe('Hotel Adlon')
    expect('contact' in doc().savedAccommodationSites[key]).toBe(false)
  })

  it('updates a place in place, keeping it archived', async () => {
    const { result, doc } = setup()
    let key = ''
    await act(async () => {
      key = keyOf(result.current.mutate.add('AccommodationSite', site()))
    })
    await act(async () => {
      result.current.mutate.archive('AccommodationSite', key)
    })
    await act(async () => {
      result.current.mutate.update('AccommodationSite', key, site({ name: 'Hotel Adlon Kempinski' }))
    })

    expect(doc().savedAccommodationSites[key]).toMatchObject({ name: 'Hotel Adlon Kempinski', archived: true })
  })

  it('archives and restores a place', async () => {
    const { result, doc } = setup()
    await act(async () => {
      result.current.mutate.add('Airport', airport())
    })

    await act(async () => {
      result.current.mutate.archive('Airport', 'BER')
    })
    expect(doc().savedAirports.BER.archived).toBe(true)

    await act(async () => {
      result.current.mutate.restore('Airport', 'BER')
    })
    expect('archived' in doc().savedAirports.BER).toBe(false)
  })

  it('removes a place', async () => {
    const { result, doc } = setup()
    await act(async () => {
      result.current.mutate.add('Airport', airport())
    })
    await act(async () => {
      result.current.mutate.remove('Airport', 'BER')
    })

    expect(doc().savedAirports.BER).toBeUndefined()
    expect(result.current.places).toEqual([])
  })

  it('materialises a dictionary airport under its IATA code', async () => {
    const { result, doc } = setup()
    let key = ''
    await act(async () => {
      key = result.current.mutate.materialiseAirport(airport({ address: { countryCode: 'DE', city: 'Berlin', line: '' } }))
    })

    expect(key).toBe('BER')
    expect(doc().savedAirports.BER.name).toBe('Berlin Brandenburg')
  })

  it('leaves an already saved airport untouched when it is picked again', async () => {
    const { result, doc } = setup()
    await act(async () => {
      result.current.mutate.add('Airport', airport({ name: 'BER, my spelling' }))
    })
    await act(async () => {
      result.current.mutate.materialiseAirport(airport())
    })

    expect(doc().savedAirports.BER.name).toBe('BER, my spelling')
  })

  it('refuses to add an airport whose code is already saved, keeping the saved one', async () => {
    const { result, doc } = setup()
    await act(async () => {
      result.current.mutate.add('Airport', airport({ name: 'BER, my spelling' }))
    })
    let second: PlaceSaveResult | undefined
    await act(async () => {
      second = result.current.mutate.add('Airport', airport())
    })

    expect(second).toEqual({ ok: false, reason: 'key-taken' })
    expect(doc().savedAirports.BER.name).toBe('BER, my spelling')
  })

  it('reports an update to a place deleted meanwhile as not found, and recreates nothing', async () => {
    const { result, doc } = setup()
    let key = ''
    await act(async () => {
      key = keyOf(result.current.mutate.add('AccommodationSite', site()))
    })
    await act(async () => {
      result.current.mutate.remove('AccommodationSite', key)
    })
    let update: PlaceSaveResult | undefined
    await act(async () => {
      update = result.current.mutate.update('AccommodationSite', key, site({ name: 'Renamed' }))
    })

    expect(update).toEqual({ ok: false, reason: 'not-found' })
    expect(doc().savedAccommodationSites[key]).toBeUndefined()
  })

  it('leaves the document alone when archiving, restoring or removing a missing place', async () => {
    const { result, doc } = setup()
    await act(async () => {
      result.current.mutate.archive('Airport', 'BER')
      result.current.mutate.restore('Airport', 'BER')
      result.current.mutate.remove('Airport', 'BER')
    })

    expect(doc().savedAirports).toEqual({})
  })

  it('resolves one saved place by its key', async () => {
    const { result, wrapper } = setup()
    let key = ''
    await act(async () => {
      key = keyOf(result.current.mutate.add('AccommodationSite', site()))
    })

    const { result: resolved } = renderHook(() => [useSavedPlace(key), useSavedPlace('NOPE')], { wrapper })
    expect(resolved.current[0]).toEqual({ type: 'AccommodationSite', key, place: site() })
    expect(resolved.current[1]).toBeUndefined()
  })
})

describe('saved places on a root document older than the place maps', () => {
  it('reads as empty and writes the first place', async () => {
    const repo = new Repo({ network: [] })
    const rootHandle = repo.create<Partial<RootDoc>>({ tripIndex: {} })
    function wrapper({ children }: { children: ReactNode }) {
      return (
        <RepoContext.Provider value={repo}>
          <RootDocUrlContext.Provider value={rootHandle.url}>
            <Suspense fallback={null}>{children}</Suspense>
          </RootDocUrlContext.Provider>
        </RepoContext.Provider>
      )
    }
    const { result } = renderHook(() => ({ places: useSavedPlaces(), mutate: useSavedPlaceMutations() }), { wrapper })
    expect(result.current.places).toEqual([])

    await act(async () => {
      result.current.mutate.materialiseAirport(airport())
    })
    expect(result.current.places.map((e) => e.key)).toEqual(['BER'])
  })
})
