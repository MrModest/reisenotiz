import { describe, it, expect } from 'vitest'
import { Suspense, type ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { Repo, RepoContext, interpretAsDocumentId, type DocHandle } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from './automerge/types'
import { placesOf, useSavedPlace, useSavedPlaceMutations, useSavedPlaces } from './saved-places'
import type { AccommodationSite, Airport, TripItem } from '@/types'

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
  const saved = () => handle.doc().savedPlaces
  const { result } = renderHook(() => ({ places: useSavedPlaces(), mutate: useSavedPlaceMutations() }), { wrapper })
  return { wrapper, saved, result }
}

const site = (overrides: Partial<AccommodationSite> = {}): AccommodationSite => ({
  id: 'custom:adlon',
  type: 'AccommodationSite',
  name: 'Hotel Adlon',
  kind: 'Hotel',
  address: { countryCode: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
  ...overrides,
})

const ber: Airport = {
  id: 'iata:BER',
  type: 'Airport',
  code: 'BER',
  name: 'Berlin Brandenburg',
  address: { countryCode: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
}

describe('saved places', () => {
  it('saves a custom place under its id', async () => {
    const { result, saved } = setup()
    await act(async () => result.current.mutate.save(site()))

    expect(saved()['custom:adlon']).toEqual(site())
    expect(result.current.places).toEqual([site()])
  })

  it('overwrites the place saved under the same id, dropping a field the new one lacks', async () => {
    const { result, saved } = setup()
    await act(async () => result.current.mutate.save(site({ contact: '+49 30 2261 0' })))
    await act(async () => result.current.mutate.save(site({ name: 'Adlon Kempinski' })))

    expect(saved()['custom:adlon']).toEqual(site({ name: 'Adlon Kempinski' }))
  })

  it("never saves a provider's place", async () => {
    const { result, saved } = setup()
    await act(async () => result.current.mutate.save(ber))

    expect(saved()).toEqual({})
  })

  it('deletes a place, and deleting a missing one changes nothing', async () => {
    const { result, saved } = setup()
    await act(async () => result.current.mutate.save(site()))
    await act(async () => result.current.mutate.remove('custom:adlon'))
    await act(async () => result.current.mutate.remove('custom:adlon'))

    expect(saved()).toEqual({})
  })

  it('reads one place by id, and nothing for no id', async () => {
    const { result, wrapper } = setup()
    await act(async () => result.current.mutate.save(site()))

    expect(renderHook(() => useSavedPlace('custom:adlon'), { wrapper }).result.current).toEqual(site())
    expect(renderHook(() => useSavedPlace(undefined), { wrapper }).result.current).toBeUndefined()
  })
})

describe('placesOf', () => {
  it('lists the places a trip item holds', () => {
    const flight = { type: 'Flight', departure: { place: ber }, arrival: { place: site() } } as unknown as TripItem
    expect(placesOf(flight)).toEqual([ber, site()])
  })

  it('lists none for an item of a type this build does not know', () => {
    expect(placesOf({ type: 'Train' } as unknown as TripItem)).toEqual([])
  })
})
