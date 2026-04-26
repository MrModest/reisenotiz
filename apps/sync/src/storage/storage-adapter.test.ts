import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { StorageAdapterInterface, StorageKey } from '@automerge/automerge-repo'
import { createSqliteStorageAdapter, type SqliteStorageAdapter } from './sqlite-adapter.js'
import { createPostgresStorageAdapter, type PostgresStorageAdapter } from './postgres-adapter.js'
import type { ManagedStorageAdapter } from './index.js'

const bytes = (...nums: number[]): Uint8Array => Uint8Array.from(nums)

function findChunk(chunks: { key: StorageKey; data: Uint8Array | undefined }[], key: StorageKey) {
  return chunks.find((c) => c.key.join('/') === key.join('/'))
}

function runCommonAdapterTests(name: string, makeAdapter: () => Promise<ManagedStorageAdapter>) {
  describe(`${name} StorageAdapter`, () => {
    let adapter: StorageAdapterInterface
    let close: () => Promise<void>

    beforeEach(async () => {
      const adapterWrapper = await makeAdapter()
      adapter = adapterWrapper.adapter
      close = adapterWrapper.close
      await adapter.removeRange([])
    })

    afterEach(async () => {
      await close()
    })

    it('round-trips save and load', async () => {
      const key: StorageKey = ['doc-a', 'snapshot', 'h1']
      const data = bytes(1, 2, 3, 4, 5)
      await adapter.save(key, data)

      const out = await adapter.load(key)
      expect(out).toBeInstanceOf(Uint8Array)
      expect(Array.from(out!)).toEqual([1, 2, 3, 4, 5])
    })

    it('returns undefined for missing key', async () => {
      expect(await adapter.load(['nope'])).toBeUndefined()
    })

    it('overwrites on save with same key', async () => {
      const key: StorageKey = ['doc-a', 'snapshot', 'h1']
      await adapter.save(key, bytes(1))
      await adapter.save(key, bytes(9, 9))
      const out = await adapter.load(key)
      expect(Array.from(out!)).toEqual([9, 9])
    })

    it('loadRange returns chunks under the prefix and excludes siblings', async () => {
      await adapter.save(['doc-a', 'snapshot', 'h1'], bytes(1))
      await adapter.save(['doc-a', 'incremental', 'h2'], bytes(2))
      await adapter.save(['doc-a', 'incremental', 'h3'], bytes(3))
      await adapter.save(['doc-b', 'snapshot', 'h1'], bytes(9))

      const incrementals = await adapter.loadRange(['doc-a', 'incremental'])
      expect(incrementals).toHaveLength(2)
      const keys = incrementals.map((c) => c.key.join('/')).sort()
      expect(keys).toEqual(['doc-a/incremental/h2', 'doc-a/incremental/h3'])

      const allDocA = await adapter.loadRange(['doc-a'])
      expect(allDocA).toHaveLength(3)
      expect(findChunk(allDocA, ['doc-b', 'snapshot', 'h1'])).toBeUndefined()
    })

    it('loadRange does not match keys that share a prefix segment substring', async () => {
      await adapter.save(['doc-a', 'snapshot', 'h1'], bytes(1))
      await adapter.save(['doc-ab', 'snapshot', 'h1'], bytes(2))

      const docA = await adapter.loadRange(['doc-a'])
      expect(docA.map((c) => c.key.join('/'))).toEqual(['doc-a/snapshot/h1'])
    })

    it('remove deletes a single key', async () => {
      await adapter.save(['doc-a', 'snapshot', 'h1'], bytes(1))
      await adapter.save(['doc-a', 'snapshot', 'h2'], bytes(2))
      await adapter.remove(['doc-a', 'snapshot', 'h1'])

      expect(await adapter.load(['doc-a', 'snapshot', 'h1'])).toBeUndefined()
      expect(await adapter.load(['doc-a', 'snapshot', 'h2'])).toBeDefined()
    })

    it('removeRange deletes only matching prefix', async () => {
      await adapter.save(['doc-a', 'snapshot', 'h1'], bytes(1))
      await adapter.save(['doc-a', 'incremental', 'h2'], bytes(2))
      await adapter.save(['doc-b', 'snapshot', 'h1'], bytes(9))

      await adapter.removeRange(['doc-a'])

      expect(await adapter.load(['doc-a', 'snapshot', 'h1'])).toBeUndefined()
      expect(await adapter.load(['doc-a', 'incremental', 'h2'])).toBeUndefined()
      expect(await adapter.load(['doc-b', 'snapshot', 'h1'])).toBeDefined()
    })
  })
}

runCommonAdapterTests('SQLite', async () => {
  const adapter: SqliteStorageAdapter = createSqliteStorageAdapter({
    path: ':memory:',
  })
  return {
    adapter,
    close: async () => {
      adapter.close()
    },
  }
})

const pgUrl = process.env.SYNC_TEST_PG_URL
const describePg = pgUrl ? describe : describe.skip

describePg('Postgres adapter (SYNC_TEST_PG_URL set)', () => {
  runCommonAdapterTests('Postgres', async () => {
    const adapter: PostgresStorageAdapter = await createPostgresStorageAdapter({
      connectionString: pgUrl!,
    })
    return { adapter, close: () => adapter.close() }
  })
})
