import { useEffect, useRef, useState } from 'react'
import { useRepo } from '@automerge/react'

export type SyncStatus = 'disabled' | 'offline' | 'syncing' | 'synced'

const SYNCING_RESET_MS = 1000

export function useSyncStatus(): SyncStatus {
  const repo = useRepo()
  const hasAdapters = repo.networkSubsystem.adapters.length > 0
  const [connected, setConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const syncingResetRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!hasAdapters) return

    const { networkSubsystem } = repo

    function handlePeer() {
      setConnected(true)
    }

    function handlePeerDisconnected() {
      setConnected(false)
    }

    function handleMessage() {
      setSyncing(true)
      clearTimeout(syncingResetRef.current)
      syncingResetRef.current = setTimeout(() => setSyncing(false), SYNCING_RESET_MS)
    }

    networkSubsystem.on('peer', handlePeer)
    networkSubsystem.on('peer-disconnected', handlePeerDisconnected)
    networkSubsystem.on('message', handleMessage)

    return () => {
      networkSubsystem.off('peer', handlePeer)
      networkSubsystem.off('peer-disconnected', handlePeerDisconnected)
      networkSubsystem.off('message', handleMessage)
      clearTimeout(syncingResetRef.current)
    }
  }, [repo, hasAdapters])

  if (!hasAdapters) return 'disabled'
  if (!connected) return 'offline'
  if (syncing) return 'syncing'
  return 'synced'
}
