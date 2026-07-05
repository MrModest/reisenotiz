import { describe, it, expect } from 'vitest'
import { Suspense, type ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Repo, RepoContext, MessageChannelNetworkAdapter } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from '@/store/automerge/types'
import { useUserAirportsStore } from './airports'
import { useUserAccommodationsStore } from './accommodations'
import type { Airport } from '@/types'

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

const airportFixture: Airport = {
  code: 'TXL',
  name: 'Berlin',
  address: { country: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
}

describe('user records sync across devices', () => {
  it('propagates a user airport added on device A to device B', async () => {
    const { wrapperA, wrapperB } = connectedDevices()

    const { result: add } = renderHook(() => useUserAirportsStore((s) => s.addAirport), { wrapper: wrapperA })
    await act(async () => {
      add.current(airportFixture)
    })

    const { result: airportsOnB } = renderHook(() => useUserAirportsStore((s) => s.airports), { wrapper: wrapperB })
    await waitFor(() => expect(airportsOnB.current.TXL?.name).toBe('Berlin'))
  })

  it('propagates a user accommodation added on device A to device B', async () => {
    const { wrapperA, wrapperB } = connectedDevices()

    const { result: add } = renderHook(() => useUserAccommodationsStore((s) => s.addAccommodation), {
      wrapper: wrapperA,
    })
    let recordId = ''
    await act(async () => {
      recordId = add.current({
        name: 'Hotel Adlon',
        kind: 'Hotel',
        address: { country: 'DE', city: 'Berlin' },
        tzone: 'Europe/Berlin',
      }).id
    })

    const { result: accommodationsOnB } = renderHook(() => useUserAccommodationsStore((s) => s.accommodations), {
      wrapper: wrapperB,
    })
    await waitFor(() => expect(accommodationsOnB.current[recordId]?.name).toBe('Hotel Adlon'))
  })
})
