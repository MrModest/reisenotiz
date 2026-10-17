// PROTOTYPE check: two users, own docs sync, the other user's doc is unavailable.
import { afterAll, beforeAll, expect, it } from 'vitest'
import http from 'node:http'
import { Repo, type DocHandle, type PeerId } from '@automerge/automerge-repo'
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'
import { startSyncServer, type SyncServerHandle } from './server.js'

const PORT = 4917
const base = `http://127.0.0.1:${PORT}`
const cookies: Record<string, string> = {}

// The ws client can't take headers through the adapter; inject the cookie per `?u=` user.
const origRequest = http.request
http.request = ((opts: http.RequestOptions, cb?: () => void) => {
  const u = new URLSearchParams(String(opts.path).split('?')[1] ?? '').get('u')
  if (u && cookies[u]) opts.headers = { ...opts.headers, cookie: cookies[u] }
  return origRequest(opts, cb)
}) as typeof http.request

async function signUp(name: string): Promise<void> {
  const res = await fetch(`${base}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:5173' },
    body: JSON.stringify({ email: `${name}@example.org`, password: 'password1234', name }),
  })
  expect(res.status).toBe(200)
  cookies[name] = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ')
}

const repoFor = (u: string, peerId?: string) =>
  new Repo({
    network: [new BrowserWebSocketClientAdapter(`ws://127.0.0.1:${PORT}/?u=${u}`, 200)],
    sharePolicy: async () => true,
    peerId: peerId as PeerId | undefined,
  })

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
async function until<T>(h: DocHandle<T>, pred: (d: T) => boolean): Promise<void> {
  for (let i = 0; i < 100; i++) {
    const d = h.doc()
    if (d && pred(d)) return
    await wait(50)
  }
  throw new Error('timeout')
}

let server: SyncServerHandle
beforeAll(async () => {
  server = await startSyncServer({ port: PORT, host: '127.0.0.1', storage: { kind: 'sqlite', sqlitePath: ':memory:' } })
  await signUp('alice')
  await signUp('bob')
})
afterAll(async () => {
  http.request = origRequest
  await server.close()
})

it('returns 401 on / without a session', async () => {
  expect((await fetch(base)).status).toBe(401)
})

it('syncs a user\'s doc to their second device and denies another user', async () => {
  const alice1 = repoFor('alice')
  const h = alice1.create({ n: 1 })
  // let the server claim it for alice
  await wait(500)

  const alice2 = repoFor('alice')
  const h2 = await alice2.find<{ n: number }>(h.url)
  await until(h2, (d) => d.n === 1)

  const bob = repoFor('bob')
  await expect(bob.find(h.url)).rejects.toThrow(/unavailable/)

  // bob reusing alice's peer id gets kicked instead of hijacking her binding
  const bobSpoof = repoFor('bob', alice1.peerId)
  await expect(bobSpoof.find(h.url)).rejects.toThrow(/unavailable/)
  await wait(500)
  h.change((d) => { d.n = 2 })
  await until(h2, (d) => d.n === 2)

  for (const r of [alice1, alice2, bob, bobSpoof]) r.shutdown()
}, 20000)
