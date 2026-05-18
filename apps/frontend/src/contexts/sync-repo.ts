import { Repo, WebSocketClientAdapter, IndexedDBStorageAdapter } from '@automerge/react'
import { ensureRootDocUrl } from '@/store/automerge/root-doc'

const INDEXEDDB_NAME = 'reisenotiz-automerge'
const SYNC_URL = import.meta.env.VITE_SYNC_SERVER_URL as string | undefined

export const repo = new Repo({
  network: SYNC_URL ? [new WebSocketClientAdapter(SYNC_URL)] : [],
  storage: new IndexedDBStorageAdapter(INDEXEDDB_NAME),
  sharePolicy: async () => true,
})

export const rootDocUrl = ensureRootDocUrl(repo)

// Eagerly register the root handle so `repo.handles` is populated before any mutation runs.
// `find` registers synchronously; the returned promise resolves once hydration completes.
void repo.find(rootDocUrl)
