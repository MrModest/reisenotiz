// PROTOTYPE — throwaway. Better Auth (email + password) gating Automerge sync per user.
// Lives on branch prototype/better-auth-sync only. Not for main.
import Database from 'better-sqlite3'
import { betterAuth } from 'better-auth'
import { getMigrations } from 'better-auth/db/migration'
import type { DocumentId, PeerId } from '@automerge/automerge-repo'
import { cbor } from '@automerge/automerge-repo'
import { NodeWSServerAdapter } from '@automerge/automerge-repo-network-websocket'
import type { WebSocket, WebSocketServer } from 'ws'
import type { IncomingMessage } from 'node:http'

export const TRUSTED_ORIGINS = (process.env.SYNC_TRUSTED_ORIGINS ?? 'http://localhost:5173,http://localhost:8080').split(',')

export async function createPrototypeAuth(dbPath: string) {
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  const sessionSockets = new Map<string, Set<WebSocket>>()

  const auth = betterAuth({
    database: db,
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4000',
    secret: process.env.BETTER_AUTH_SECRET ?? 'PROTOTYPE-dev-secret-do-not-ship-0123456789',
    trustedOrigins: TRUSTED_ORIGINS,
    emailAndPassword: { enabled: true },
    databaseHooks: {
      session: {
        delete: {
          // Sign-out deletes the session row; close its sockets so revocation reaches open syncs.
          after: async (session) => {
            console.log(`[auth] session deleted, closing ${sessionSockets.get(session.token)?.size ?? 0} socket(s)`)
            for (const ws of sessionSockets.get(session.token) ?? []) ws.close(4401, 'signed out')
            sessionSockets.delete(session.token)
          },
        },
      },
    },
  })

  const { runMigrations } = await getMigrations(auth.options)
  await runMigrations()
  db.exec(`CREATE TABLE IF NOT EXISTS document_owner (
    document_id TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL
  )`)

  const findOwner = db.prepare<[string], { user_id: string }>('SELECT user_id FROM document_owner WHERE document_id = ?')
  const claim = db.prepare('INSERT OR IGNORE INTO document_owner (document_id, user_id) VALUES (?, ?)')

  const socketUser = new WeakMap<WebSocket, string>()
  const peerUser = new Map<PeerId, string>()

  // ponytail: first requester claims an unowned doc. Docs synced before auth existed are claimable by anyone who knows the ID.
  const access = async (peerId: PeerId, documentId: DocumentId): Promise<boolean> => {
    const userId = peerUser.get(peerId)
    if (!userId) return false
    claim.run(documentId, userId)
    const allowed = findOwner.get(documentId)?.user_id === userId
    console.log(`[auth] access peer=${peerId} user=${userId} doc=${documentId} -> ${allowed}`)
    return allowed
  }

  // Runs on every upgraded socket before the adapter's own listener: tag it with the user from the upgrade request.
  const trackSockets = (wss: WebSocketServer) => {
    wss.on('connection', (ws: WebSocket, req: IncomingMessage & { userId?: string; sessionToken?: string }) => {
      if (!req.userId || !req.sessionToken) return ws.close(4401, 'no session')
      socketUser.set(ws, req.userId)
      const set = sessionSockets.get(req.sessionToken) ?? new Set()
      set.add(ws)
      sessionSockets.set(req.sessionToken, set)
      ws.on('close', () => set.delete(ws))
    })
  }

  class AuthedWSServerAdapter extends NodeWSServerAdapter {
    receiveMessage(messageBytes: Uint8Array, socket: WebSocket): void {
      let message: { type?: string; senderId?: PeerId }
      try {
        message = cbor.decode(messageBytes)
      } catch {
        return socket.close()
      }
      if (message.type === 'join' && message.senderId) {
        const userId = socketUser.get(socket)
        const bound = peerUser.get(message.senderId)
        if (!userId || (bound && bound !== userId)) {
          console.log(`[auth] reject join peer=${message.senderId} user=${userId} bound=${bound}`)
          return socket.close(4403, 'peer id bound to another user')
        }
        peerUser.set(message.senderId, userId)
      }
      super.receiveMessage(messageBytes, socket as never)
    }
  }

  return { auth, access, trackSockets, AuthedWSServerAdapter, close: () => db.close() }
}
