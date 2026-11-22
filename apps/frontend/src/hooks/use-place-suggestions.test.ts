import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { PlaceProvider } from '@/services'
import type { Airport, PlaceType } from '@/types'
import { useProviderResults } from './use-place-suggestions'

const airport = (code: string): Airport => ({
  id: `iata:${code}`,
  type: 'Airport',
  code,
  name: code,
  address: { countryCode: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
})

// Answers each query only when the test says so, in whatever order it likes
function controlledProvider() {
  const pending = new Map<string, (places: Airport[]) => void>()
  const provider = {
    search: (_type: PlaceType, query: string) => new Promise<Airport[]>((resolve) => pending.set(query, resolve)),
  } as PlaceProvider
  const answer = async (query: string, places: Airport[]) => act(async () => pending.get(query)!(places))
  return { provider, answer }
}

describe('useProviderResults', () => {
  it("shows the answer for the current query and never a late one for an earlier query", async () => {
    const { provider, answer } = controlledProvider()
    const { result, rerender } = renderHook(({ query }) => useProviderResults(provider, 'Airport', query), {
      initialProps: { query: 'BER' },
    })

    rerender({ query: 'LIS' })
    await answer('LIS', [airport('LIS')])
    await answer('BER', [airport('BER')])

    expect(result.current).toEqual([airport('LIS')])
  })

  it('shows nothing while the current query has no answer yet', async () => {
    const { provider, answer } = controlledProvider()
    const { result, rerender } = renderHook(({ query }) => useProviderResults(provider, 'Airport', query), {
      initialProps: { query: 'BER' },
    })
    await answer('BER', [airport('BER')])

    rerender({ query: 'LIS' })

    expect(result.current).toEqual([])
  })
})
