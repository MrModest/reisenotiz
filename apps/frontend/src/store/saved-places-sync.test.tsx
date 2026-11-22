import { describe, it, expect } from 'vitest'
import { Suspense, type ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Repo, RepoContext, MessageChannelNetworkAdapter } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from './automerge/types'
import { useSavedPlaceMutations, useSavedPlaces } from './saved-places'

function connectedDevices() {
  const { port1, port2 } = new MessageChannel()
  const repoA = new Repo({ network: [new MessageChannelNetworkAdapter(port1)], sharePolicy: async () => true })
  const repoB = new Repo({ network: [new MessageChannelNetworkAdapter(port2)], sharePolicy: async () => true })
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

  return { wrapperA: wrapperFor(repoA), wrapperB: wrapperFor(repoB) }
}

describe('saved places sync across devices', () => {
  it('propagates a place edited on device A to device B', async () => {
    const { wrapperA, wrapperB } = connectedDevices()
    const adlon = {
      id: 'custom:adlon',
      type: 'AccommodationSite',
      name: 'Hotel Adlon',
      kind: 'Hotel',
      address: { countryCode: 'DE', city: 'Berlin' },
      tzone: 'Europe/Berlin',
    } as const

    const { result: mutate } = renderHook(() => useSavedPlaceMutations(), { wrapper: wrapperA })
    await act(async () => mutate.current.save(adlon))
    await act(async () => mutate.current.save({ ...adlon, name: 'Adlon Kempinski' }))

    const { result: placesOnB } = renderHook(() => useSavedPlaces(), { wrapper: wrapperB })
    await waitFor(() => expect(placesOnB.current).toEqual([{ ...adlon, name: 'Adlon Kempinski' }]))
  })
})
