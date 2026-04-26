import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import type { Chunk, StorageAdapterInterface, StorageKey } from '@automerge/automerge-repo'
import { LIKE_ESCAPE_CLAUSE, decodeKey, encodeKey, prefixMatch } from './key.js'

export interface SqliteAdapterOptions {
  path: string
}

export interface SqliteStorageAdapter extends StorageAdapterInterface {
  close: () => Promise<void>;
}

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS automerge_chunks (
    key  TEXT PRIMARY KEY,
    data BLOB NOT NULL
  );
`

function ensureParentDir(path: string): void {
  if (path === ':memory:' || path.startsWith('file::memory:')) return
  mkdirSync(dirname(path), { recursive: true })
}

export function createSqliteStorageAdapter(options: SqliteAdapterOptions): SqliteStorageAdapter {
  ensureParentDir(options.path)
  const db = new Database(options.path)
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')
  db.exec(SCHEMA_SQL)

  const loadStmt = db.prepare<[string], { data: Buffer }>(
    'SELECT data FROM automerge_chunks WHERE key = ?',
  )
  const saveStmt = db.prepare(
    'INSERT INTO automerge_chunks (key, data) VALUES (?, ?) ' +
      'ON CONFLICT(key) DO UPDATE SET data = excluded.data',
  )
  const removeStmt = db.prepare('DELETE FROM automerge_chunks WHERE key = ?')
  const loadAllStmt = db.prepare<[], { key: string; data: Buffer }>(
    'SELECT key, data FROM automerge_chunks',
  )
  const removeAllStmt = db.prepare('DELETE FROM automerge_chunks')
  const loadRangeStmt = db.prepare<[string, string], { key: string; data: Buffer }>(
    `SELECT key, data FROM automerge_chunks
     WHERE key = ? OR key LIKE ? ESCAPE '${LIKE_ESCAPE_CLAUSE}'`,
  )
  const removeRangeStmt = db.prepare(
    `DELETE FROM automerge_chunks
     WHERE key = ? OR key LIKE ? ESCAPE '${LIKE_ESCAPE_CLAUSE}'`,
  )

  function bufToBytes(buf: Buffer): Uint8Array {
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  }

  return {
    async load(key: StorageKey): Promise<Uint8Array | undefined> {
      const row = loadStmt.get(encodeKey(key))
      return row ? bufToBytes(row.data) : undefined
    },

    async save(key: StorageKey, data: Uint8Array): Promise<void> {
      saveStmt.run(encodeKey(key), Buffer.from(data.buffer, data.byteOffset, data.byteLength))
    },

    async remove(key: StorageKey): Promise<void> {
      removeStmt.run(encodeKey(key))
    },

    async loadRange(keyPrefix: StorageKey): Promise<Chunk[]> {
      const match = prefixMatch(keyPrefix)
      const rows = match.matchAll
        ? loadAllStmt.all()
        : loadRangeStmt.all(match.exact, match.likePattern)
      return rows.map((row) => ({
        key: decodeKey(row.key),
        data: bufToBytes(row.data),
      }))
    },

    async removeRange(keyPrefix: StorageKey): Promise<void> {
      const match = prefixMatch(keyPrefix)
      if (match.matchAll) {
        removeAllStmt.run()
        return
      }
      removeRangeStmt.run(match.exact, match.likePattern)
    },

    async close(): Promise<void> {
      db.close()
    },
  }
}
