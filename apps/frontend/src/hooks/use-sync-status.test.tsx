import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { Repo, RepoContext, MessageChannelNetworkAdapter } from '@automerge/react'
import { useSyncStatus } from './use-sync-status'

// These tests wait on real timers driven by real MessageChannel traffic, so the budgets
// have to cover a loaded CI runner, not just a warm laptop. The settle wait in particular
// needs the sync exchange to go fully quiet *and then* the hook's 1000ms SYNCING_RESET_MS
// debounce to elapse — every message pushes that window out again. Locally it lands in
// ~1.05s; the old 3000ms budget left almost no headroom and flaked on CI.
const CONNECT_TIMEOUT_MS = 5000
const SETTLE_TIMEOUT_MS = 8000
const TEST_TIMEOUT_MS = 15000

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

  it('reports synced immediately when the repo already had a peer before the hook mounted', async () => {
    // regression: the shared `repo` singleton connects at module load, before any
    // component mounts — if the hook only reacted to future 'peer' events it would
    // miss one that already fired and get stuck showing "offline" forever.
    const { port1, port2 } = new MessageChannel()
    const repoA = new Repo({ network: [new MessageChannelNetworkAdapter(port1)], sharePolicy: async () => true })
    new Repo({ network: [new MessageChannelNetworkAdapter(port2)], sharePolicy: async () => true })

    await waitFor(() => expect(Object.keys(repoA.peerMetadataByPeerId).length).toBeGreaterThan(0), {
      timeout: CONNECT_TIMEOUT_MS,
    })

    const { result } = renderHook(() => useSyncStatus(), { wrapper: wrapperFor(repoA) })
    expect(result.current).toBe('synced')
  })

  it('becomes synced once a peer connects, then syncing then synced again as changes propagate', async () => {
    const { port1, port2 } = new MessageChannel()
    const repoA = new Repo({ network: [new MessageChannelNetworkAdapter(port1)], sharePolicy: async () => true })
    const repoB = new Repo({ network: [new MessageChannelNetworkAdapter(port2)], sharePolicy: async () => true })

    const { result } = renderHook(() => useSyncStatus(), { wrapper: wrapperFor(repoA) })
    await waitFor(() => expect(result.current).toBe('synced'), { timeout: CONNECT_TIMEOUT_MS })

    const handleA = repoA.create<{ count: number }>({ count: 0 })
    const handleB = await repoB.find<{ count: number }>(handleA.url)

    await act(async () => {
      handleB.change((doc) => {
        doc.count = 1
      })
    })

    await waitFor(() => expect(result.current).toBe('synced'), { timeout: SETTLE_TIMEOUT_MS })
  }, TEST_TIMEOUT_MS)

  it('goes back to offline when the peer disconnects', async () => {
    // regression: Repo.peerMetadataByPeerId is populated on 'peer' but never
    // cleared on 'peer-disconnected' (it's kept around to look up a departed
    // peer's storageId). Relying on it directly would get the indicator stuck
    // showing "synced" forever after the very first disconnect.
    const { port1, port2 } = new MessageChannel()
    const repoA = new Repo({ network: [new MessageChannelNetworkAdapter(port1)], sharePolicy: async () => true })
    const repoB = new Repo({ network: [new MessageChannelNetworkAdapter(port2)], sharePolicy: async () => true })

    const { result } = renderHook(() => useSyncStatus(), { wrapper: wrapperFor(repoA) })
    await waitFor(() => expect(result.current).toBe('synced'), { timeout: CONNECT_TIMEOUT_MS })

    // Simulate a disconnect the way the production WebSocketClientAdapter reports
    // one: a bare 'peer-disconnected' event, adapter still present. (Calling
    // MessageChannelNetworkAdapter's own disconnect() also emits 'close', which
    // removes the adapter from the repo entirely — WebSocketClientAdapter never
    // emits 'close', so that's not representative of the real disconnect path.)
    const [adapter] = repoA.networkSubsystem.adapters
    adapter.emit('peer-disconnected', { peerId: repoB.networkSubsystem.peerId })

    await waitFor(() => expect(result.current).toBe('offline'))
  })
})
