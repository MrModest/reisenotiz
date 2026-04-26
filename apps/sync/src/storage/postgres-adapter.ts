import pg from 'pg'
import type { Chunk, StorageAdapterInterface, StorageKey } from '@automerge/automerge-repo'
import { LIKE_ESCAPE_CLAUSE, decodeKey, encodeKey, prefixMatch } from './key.js'

const { Pool } = pg

export interface PostgresAdapterOptions {
  connectionString: string
  poolMax?: number
}

export interface PostgresStorageAdapter extends StorageAdapterInterface {
  close: () => Promise<void>
}

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS automerge_chunks (
    key  TEXT PRIMARY KEY,
    data BYTEA NOT NULL
  );
`

export async function createPostgresStorageAdapter(
  options: PostgresAdapterOptions,
): Promise<PostgresStorageAdapter> {
  const pool = new Pool({
    connectionString: options.connectionString,
    max: options.poolMax ?? 10,
  })
  await pool.query(SCHEMA_SQL)

  function bufToBytes(buf: Buffer): Uint8Array {
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  }

  return {
    async load(key: StorageKey): Promise<Uint8Array | undefined> {
      const res = await pool.query<{ data: Buffer }>(
        'SELECT data FROM automerge_chunks WHERE key = $1',
        [encodeKey(key)],
      )
      const row = res.rows[0]
      return row ? bufToBytes(row.data) : undefined
    },

    async save(key: StorageKey, data: Uint8Array): Promise<void> {
      await pool.query(
        `INSERT INTO automerge_chunks (key, data) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data`,
        [encodeKey(key), Buffer.from(data.buffer, data.byteOffset, data.byteLength)],
      )
    },

    async remove(key: StorageKey): Promise<void> {
      await pool.query('DELETE FROM automerge_chunks WHERE key = $1', [encodeKey(key)])
    },

    async loadRange(keyPrefix: StorageKey): Promise<Chunk[]> {
      const match = prefixMatch(keyPrefix)
      const res = match.matchAll
        ? await pool.query<{ key: string; data: Buffer }>('SELECT key, data FROM automerge_chunks')
        : await pool.query<{ key: string; data: Buffer }>(
            `SELECT key, data FROM automerge_chunks
             WHERE key = $1 OR key LIKE $2 ESCAPE '${LIKE_ESCAPE_CLAUSE}'`,
            [match.exact, match.likePattern],
          )
      return res.rows.map((row) => ({
        key: decodeKey(row.key),
        data: bufToBytes(row.data),
      }))
    },

    async removeRange(keyPrefix: StorageKey): Promise<void> {
      const match = prefixMatch(keyPrefix)
      if (match.matchAll) {
        await pool.query('DELETE FROM automerge_chunks')
        return
      }
      await pool.query(
        `DELETE FROM automerge_chunks
         WHERE key = $1 OR key LIKE $2 ESCAPE '${LIKE_ESCAPE_CLAUSE}'`,
        [match.exact, match.likePattern],
      )
    },

    async close(): Promise<void> {
      await pool.end()
    },
  }
}
