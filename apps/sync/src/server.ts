import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'
import { Repo } from '@automerge/automerge-repo'
import { NodeWSServerAdapter } from '@automerge/automerge-repo-network-websocket'

export interface SyncServerOptions {
  port: number
  host: string
}

export interface SyncServerHandle {
  port: number
  repo: Repo
  close: () => Promise<void>
}

export async function startSyncServer(options: SyncServerOptions): Promise<SyncServerHandle> {
  const app = new Hono()
  const { injectWebSocket, upgradeWebSocket, wss } = createNodeWebSocket({ app })

  app.get('/health', (c) => c.json({ status: 'ok' }))

  app.get(
    '/',
    upgradeWebSocket(() => ({
      onError: () => {},
    })),
  )

  const repo = new Repo({
    // `wss` is a `ws.WebSocketServer` (from @hono/node-ws). NodeWSServerAdapter
    // typed it via `isomorphic-ws`, whose `export = WebSocket` defaults the
    // generic param to the ws *namespace* instead of the class. Same runtime
    // class, incompatible inferred generics — cast to the adapter's own param.
    network: [new NodeWSServerAdapter(wss as unknown as ConstructorParameters<typeof NodeWSServerAdapter>[0])],
    sharePolicy: async () => true,
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
  }

  return { port: options.port, repo, close }
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  startSyncServer({
    port: Number(process.env.SYNC_PORT ?? 4000),
    host: process.env.SYNC_HOST ?? '0.0.0.0'
  })
    .then(({ port }) => {
      console.log(`[sync] listening on :${port}`);
    })
    .catch((err) => {
      console.error('[sync] failed to start', err);
      process.exit(1);
    });
}
