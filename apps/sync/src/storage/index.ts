import type { StorageAdapterInterface } from '@automerge/automerge-repo'
import { createSqliteStorageAdapter } from './sqlite-adapter.js'
import { createPostgresStorageAdapter } from './postgres-adapter.js'

export type StorageConfig =
  | { kind: 'sqlite'; sqlitePath: string }
  | { kind: 'postgres'; postgresUrl: string }

export interface ManagedStorageAdapter {
  adapter: StorageAdapterInterface
  close: () => Promise<void>
}

export function readStorageConfigFromEnv(): StorageConfig {
  const kind = (process.env.SYNC_DB_KIND ?? "sqlite").toLowerCase();

  if (kind === 'sqlite') {
    return { kind: 'sqlite', sqlitePath: process.env.SYNC_SQLITE_PATH ?? './data/sync.db' }
  }

  if (kind === 'postgres') {
    if (!process.env.SYNC_PG_URL) {
      throw new Error('SYNC_PG_URL must be set when SYNC_DB_KIND=postgres')
    }
    return { kind: 'postgres', postgresUrl: process.env.SYNC_PG_URL }
  }

  throw new Error(`SYNC_DB_KIND must be "sqlite" or "postgres" (got "${process.env.SYNC_DB_KIND}")`)
}

export async function createStorageAdapter(config: StorageConfig): Promise<ManagedStorageAdapter> {
  switch (config.kind) {
    case 'sqlite':
      const sqliteAdapter = createSqliteStorageAdapter({ path: config.sqlitePath })
      return {
        adapter: sqliteAdapter,
        close: () => sqliteAdapter.close(),
      };
    case 'postgres': {
      const postgresAdapter = await createPostgresStorageAdapter({ connectionString: config.postgresUrl })
      return {
        adapter: postgresAdapter,
        close: () => postgresAdapter.close()
      }
    }
  }
}

export { createSqliteStorageAdapter } from './sqlite-adapter.js'
export { createPostgresStorageAdapter } from './postgres-adapter.js'
