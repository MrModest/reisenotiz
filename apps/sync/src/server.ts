import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'
import { Repo } from '@automerge/automerge-repo'
import { NodeWSServerAdapter } from '@automerge/automerge-repo-network-websocket'
import { cors } from 'hono/cors'
import { createPrototypeAuth, TRUSTED_ORIGINS } from './prototype-auth.js'
import { createStorageAdapter, readStorageConfigFromEnv, type StorageConfig } from './storage/index.js'

export interface SyncServerOptions {
  port: number
  host: string
  storage: StorageConfig
}

export interface SyncServerHandle {
  port: number
  repo: Repo
  close: () => Promise<void>
}

export async function startSyncServer(options: SyncServerOptions): Promise<SyncServerHandle> {
  const app = new Hono<{ Bindings: { incoming: import('node:http').IncomingMessage & { userId?: string; sessionToken?: string } } }>()
  const { injectWebSocket, upgradeWebSocket, wss } = createNodeWebSocket({ app })

  const { adapter: storageAdapter, close: closeStorage } = await createStorageAdapter(options.storage)

  // PROTOTYPE: auth DB shares the sqlite file (in-memory when storage is postgres).
  const proto = await createPrototypeAuth(options.storage.kind === 'sqlite' ? options.storage.sqlitePath : ':memory:')
  proto.trackSockets(wss)

  app.get('/health', (c) => c.json({ status: 'ok' }))

  app.use('/api/auth/*', cors({ origin: TRUSTED_ORIGINS, credentials: true, allowMethods: ['GET', 'POST', 'OPTIONS'] }))
  app.on(['GET', 'POST'], '/api/auth/*', (c) => proto.auth.handler(c.req.raw))

  app.get(
    '/',
    async (c, next) => {
      const session = await proto.auth.api.getSession({ headers: c.req.raw.headers })
      if (!session) return c.text('unauthorized', 401)
      c.env.incoming.userId = session.user.id
      c.env.incoming.sessionToken = session.session.token
      await next()
    },
    upgradeWebSocket(() => ({
      onError: () => {},
    })),
  )

  const repo = new Repo({
    // `wss` is a `ws.WebSocketServer` (from @hono/node-ws). NodeWSServerAdapter
    // typed it via `isomorphic-ws`, whose `export = WebSocket` defaults the
    // generic param to the ws *namespace* instead of the class. Same runtime
    // class, incompatible inferred generics — cast to the adapter's own param.
    network: [new proto.AuthedWSServerAdapter(wss as unknown as ConstructorParameters<typeof NodeWSServerAdapter>[0])],
    storage: storageAdapter,
    // announce false: otherwise the server pushes every loaded doc to every new peer.
    shareConfig: { announce: async () => false, access: proto.access },
  })

  const server = serve({
    fetch: app.fetch,
    port: options.port,
    hostname: options.host,
  })
  injectWebSocket(server)

  const close = async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      wss.close((err) => (err ? reject(err) : resolve()))
    })
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()))
    })
    await repo.flush()
    await repo.shutdown()
    await closeStorage()
    proto.close()
  }

  return { port: options.port, repo, close }
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  startSyncServer({
    port: Number(process.env.SYNC_PORT ?? 4000),
    host: process.env.SYNC_HOST ?? '0.0.0.0',
    storage: readStorageConfigFromEnv(),
  })
    .then(({ port }) => {
      console.log(`[sync] listening on :${port}`)
    })
    .catch((err) => {
      console.error('[sync] failed to start', err)
      process.exit(1)
    })
}
