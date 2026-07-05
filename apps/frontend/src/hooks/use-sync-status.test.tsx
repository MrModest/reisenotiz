import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { Repo, RepoContext, MessageChannelNetworkAdapter } from '@automerge/react'
import { useSyncStatus } from './use-sync-status'

function wrapperFor(repo: Repo) {
  return function wrapper({ children }: { children: ReactNode }) {
    return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>
  }
}

describe('useSyncStatus', () => {
  it('is disabled when the repo has no network adapters', () => {
    const repo = new Repo({ network: [] })
    const { result } = renderHook(() => useSyncStatus(), { wrapper: wrapperFor(repo) })
    expect(result.current).toBe('disabled')
  })

  it('is offline before any peer has connected', () => {
    const { port1 } = new MessageChannel()
    const repo = new Repo({ network: [new MessageChannelNetworkAdapter(port1)], sharePolicy: async () => true })
    const { result } = renderHook(() => useSyncStatus(), { wrapper: wrapperFor(repo) })
    expect(result.current).toBe('offline')
  })

  it('becomes synced once a peer connects, then syncing then synced again as changes propagate', async () => {
    const { port1, port2 } = new MessageChannel()
    const repoA = new Repo({ network: [new MessageChannelNetworkAdapter(port1)], sharePolicy: async () => true })
    const repoB = new Repo({ network: [new MessageChannelNetworkAdapter(port2)], sharePolicy: async () => true })

    const { result } = renderHook(() => useSyncStatus(), { wrapper: wrapperFor(repoA) })
    await waitFor(() => expect(result.current).toBe('synced'))

    const handleA = repoA.create<{ count: number }>({ count: 0 })
    const handleB = await repoB.find<{ count: number }>(handleA.url)

    await act(async () => {
      handleB.change((doc) => {
        doc.count = 1
      })
    })

    await waitFor(() => expect(result.current).toBe('synced'), { timeout: 3000 })
  })
})
