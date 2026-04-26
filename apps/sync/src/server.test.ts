import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createServer } from 'node:net'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Repo, type DocHandle } from '@automerge/automerge-repo'
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'
import { startSyncServer, type SyncServerHandle } from './server.js'

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer()
    probe.unref()
    probe.on('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const addr = probe.address()
      if (addr && typeof addr === 'object') {
        const { port } = addr
        probe.close(() => resolve(port))
      } else {
        probe.close(() => reject(new Error('could not allocate port')))
      }
    })
  })
}

interface TestDoc {
  count: number
  tags: string[]
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

async function whenDocMatches<T>(handle: DocHandle<T>, predicate: (doc: T) => boolean, timeoutMs = 5000): Promise<T> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const doc = handle.doc()
    if (doc && predicate(doc)) return doc
    await wait(20)
  }
  throw new Error('timeout waiting for doc state')
}

describe('sync server end-to-end', () => {
  let server: SyncServerHandle
  let url: string

  beforeAll(async () => {
    const port = await getFreePort()
    server = await startSyncServer({
      port,
      host: '127.0.0.1',
      storage: { kind: 'sqlite', sqlitePath: ':memory:' },
    })
    url = `ws://127.0.0.1:${server.port}`
  })

  afterAll(async () => {
    await server.close()
  })

  it('propagates a change between two clients via the server', async () => {
    const repoA = new Repo({
      network: [new BrowserWebSocketClientAdapter(url)],
      sharePolicy: async () => true,
    })
    const repoB = new Repo({
      network: [new BrowserWebSocketClientAdapter(url)],
      sharePolicy: async () => true,
    })

    const handleA = repoA.create<TestDoc>({ count: 0, tags: [] })
    handleA.change((doc) => {
      doc.count = 7
      doc.tags.push('hello')
    })

    const handleB = await repoB.find<TestDoc>(handleA.url)
    const seenOnB = await whenDocMatches(handleB, (d) => d.count === 7 && d.tags.includes('hello'))

    expect(seenOnB.count).toBe(7)
    expect(seenOnB.tags).toEqual(['hello'])

    handleB.change((doc) => {
      doc.count = 42
    })

    const seenOnA = await whenDocMatches(handleA, (d) => d.count === 42)
    expect(seenOnA.count).toBe(42)

    repoA.shutdown()
    repoB.shutdown()
  }, 15000)
})

describe('sync server persists across restart', () => {
  const tempDirs: string[] = []

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('serves a doc previously written through a now-restarted server', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'sync-restart-'))
    tempDirs.push(tmp)
    const dbPath = join(tmp, 'sync.db')
    const port = await getFreePort()

    interface RestartDoc {
      message: string
    }

    let server = await startSyncServer({
      port,
      host: '127.0.0.1',
      storage: { kind: 'sqlite', sqlitePath: dbPath },
    })
    const url = `ws://127.0.0.1:${server.port}`

    const repoA = new Repo({
      network: [new BrowserWebSocketClientAdapter(url)],
      sharePolicy: async () => true,
    })
    const handleA = repoA.create<RestartDoc>({ message: 'hello' })
    handleA.change((doc) => {
      doc.message = 'persisted'
    })
    const docUrl = handleA.url

    // wait for the server-side repo to receive and persist the change
    const start = Date.now()
    let serverHandle: DocHandle<RestartDoc> | undefined
    while (Date.now() - start < 5000) {
      try {
        serverHandle = await server.repo.find<RestartDoc>(docUrl)
        break
      } catch {
        await wait(50)
      }
    }
    if (!serverHandle) throw new Error('server never received doc')
    await whenDocMatches(serverHandle, (d) => d.message === 'persisted')

    repoA.shutdown()
    await server.close()

    server = await startSyncServer({
      port,
      host: '127.0.0.1',
      storage: { kind: 'sqlite', sqlitePath: dbPath },
    })

    const repoB = new Repo({
      network: [new BrowserWebSocketClientAdapter(`ws://127.0.0.1:${server.port}`)],
      sharePolicy: async () => true,
    })
    const handleB = await repoB.find<RestartDoc>(docUrl)
    const seen = await whenDocMatches(handleB, (d) => d.message === 'persisted')
    expect(seen.message).toBe('persisted')

    repoB.shutdown()
    await server.close()
  }, 20000)
})
