import { useRef, useSyncExternalStore } from 'react'
import { useRepo } from '@automerge/react'

export type SyncStatus = 'disabled' | 'offline' | 'syncing' | 'synced'

const SYNCING_RESET_MS = 1000

export function useSyncStatus(): SyncStatus {
  const repo = useRepo()
  const syncingUntilRef = useRef(0)

  function subscribe(onStoreChange: () => void) {
    // no adapters means no sync server is configured (local-only mode) — nothing to
    // subscribe to, and getSnapshot below will report 'disabled' regardless.
    if (repo.networkSubsystem.adapters.length === 0) return () => {}

    const { networkSubsystem } = repo
    let resetTimer: ReturnType<typeof setTimeout> | undefined

    function handleMessage() {
      syncingUntilRef.current = Date.now() + SYNCING_RESET_MS
      onStoreChange()
      clearTimeout(resetTimer)
      resetTimer = setTimeout(onStoreChange, SYNCING_RESET_MS)
    }

    networkSubsystem.on('peer', onStoreChange)
    networkSubsystem.on('peer-disconnected', onStoreChange)
    networkSubsystem.on('message', handleMessage)

    return () => {
      networkSubsystem.off('peer', onStoreChange)
      networkSubsystem.off('peer-disconnected', onStoreChange)
      networkSubsystem.off('message', handleMessage)
      clearTimeout(resetTimer)
    }
  }

  function getSnapshot(): SyncStatus {
    if (repo.networkSubsystem.adapters.length === 0) return 'disabled'
    if (Object.keys(repo.peerMetadataByPeerId).length === 0) return 'offline'
    // mutated directly by the 'message' handler above, outside React's render cycle —
    // getSnapshot just reads it, same as reading repo.peerMetadataByPeerId directly.
    if (Date.now() < syncingUntilRef.current) return 'syncing'
    return 'synced'
  }

  return useSyncExternalStore(subscribe, getSnapshot)
}
