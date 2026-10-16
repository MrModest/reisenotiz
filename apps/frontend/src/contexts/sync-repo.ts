import { Repo, WebSocketClientAdapter, IndexedDBStorageAdapter } from '@automerge/react'
import { ensureRootDocUrl } from '@/store/automerge/root-doc'

const INDEXEDDB_NAME = 'reisenotiz-automerge'
export const SYNC_URL = import.meta.env.VITE_SYNC_SERVER_URL as string | undefined

// PROTOTYPE: no network at start; the auth gate connects once signed in.
export const repo = new Repo({
  network: [],
  storage: new IndexedDBStorageAdapter(INDEXEDDB_NAME),
  sharePolicy: async () => true,
})

let connected = false
export function connectSync(): void {
  if (!SYNC_URL || connected) return
  connected = true
  repo.networkSubsystem.addNetworkAdapter(new WebSocketClientAdapter(SYNC_URL))
}

export const rootDocUrl = ensureRootDocUrl(repo)
