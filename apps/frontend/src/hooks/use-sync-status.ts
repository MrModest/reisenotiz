import { useSyncExternalStore } from 'react'
import { useRepo, type Repo } from '@automerge/react'

export type SyncStatus = 'disabled' | 'offline' | 'syncing' | 'synced'

const SYNCING_RESET_MS = 1000

interface TrackedRepoState {
  connectedPeers: Set<string>
  syncingUntil: number
  listeners: Set<() => void>
}

// `Repo.peerMetadataByPeerId` is populated on 'peer' but is NEVER cleared on
// 'peer-disconnected' (it's used elsewhere to look up a peer's storageId after
// it's gone) — it cannot tell us whether a peer is *currently* connected. We
// track that ourselves from the raw events instead. Tracking is keyed by repo
// (not by hook instance) and starts the first time it's read for a given repo,
// which happens during the very first render of the first mounted consumer —
// closing the race between the repo connecting and a component subscribing.
const tracked = new WeakMap<Repo, TrackedRepoState>()

function trackRepo(repo: Repo): TrackedRepoState {
  const existing = tracked.get(repo)
  if (existing) return existing

  // seed from whatever the repo already knows about on our first read — covers a
  // peer that connected before we started tracking. Everything after this comes
  // purely from our own events; peerMetadataByPeerId is never consulted again,
  // since Repo never removes an entry from it on disconnect.
  const state: TrackedRepoState = {
    connectedPeers: new Set(Object.keys(repo.peerMetadataByPeerId)),
    syncingUntil: 0,
    listeners: new Set(),
  }
  tracked.set(repo, state)

  const { networkSubsystem } = repo
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  function notify() {
    state.listeners.forEach((listener) => listener())
  }

  networkSubsystem.on('peer', ({ peerId }) => {
    state.connectedPeers.add(peerId)
    notify()
  })

  networkSubsystem.on('peer-disconnected', ({ peerId }) => {
    state.connectedPeers.delete(peerId)
    notify()
  })

  networkSubsystem.on('message', () => {
    state.syncingUntil = Date.now() + SYNCING_RESET_MS
    notify()
    clearTimeout(resetTimer)
    resetTimer = setTimeout(notify, SYNCING_RESET_MS)
  })

  return state
}

export function useSyncStatus(): SyncStatus {
  const repo = useRepo()
  const hasAdapters = repo.networkSubsystem.adapters.length > 0

  function subscribe(onStoreChange: () => void) {
    if (!hasAdapters) return () => {}
    const state = trackRepo(repo)
    state.listeners.add(onStoreChange)
    return () => state.listeners.delete(onStoreChange)
  }

  function getSnapshot(): SyncStatus {
    if (!hasAdapters) return 'disabled'
    const state = trackRepo(repo)
    if (state.connectedPeers.size === 0) return 'offline'
    if (Date.now() < state.syncingUntil) return 'syncing'
    return 'synced'
  }

  return useSyncExternalStore(subscribe, getSnapshot)
}
