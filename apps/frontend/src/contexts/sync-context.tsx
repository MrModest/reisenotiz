import type { ReactNode } from 'react'
import { Repo, RepoContext, WebSocketClientAdapter, IndexedDBStorageAdapter } from '@automerge/react'

const INDEXEDDB_NAME = 'reisenotiz-automerge'
const SYNC_URL = import.meta.env.VITE_SYNC_SERVER_URL as string | undefined

const repo = new Repo({
  network: SYNC_URL ? [new WebSocketClientAdapter(SYNC_URL)] : [],
  storage: new IndexedDBStorageAdapter(INDEXEDDB_NAME),
  sharePolicy: async () => true,
})

interface SyncProviderProps {
  children: ReactNode
}

export function SyncProvider({ children }: SyncProviderProps) {
  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>
}
