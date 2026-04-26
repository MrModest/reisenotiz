import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createServer } from 'node:net'
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
    server = await startSyncServer({ port, host: '127.0.0.1' })
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
