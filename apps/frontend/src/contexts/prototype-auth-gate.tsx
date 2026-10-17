// PROTOTYPE — throwaway sign-in gate for Better Auth on the sync server. Branch prototype/better-auth-sync only.
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { createAuthClient } from 'better-auth/react'
import { connectSync, SYNC_URL } from './sync-repo'

const authClient = SYNC_URL
  ? createAuthClient({ baseURL: SYNC_URL.replace(/^ws/, 'http'), fetchOptions: { credentials: 'include' } })
  : undefined

export function PrototypeAuthGate({ children }: { children: ReactNode }) {
  if (!authClient) return children
  return <Gate client={authClient}>{children}</Gate>
}

function Gate({ client, children }: { client: NonNullable<typeof authClient>; children: ReactNode }) {
  const { data, isPending } = client.useSession()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (data) connectSync()
  }, [data])

  if (isPending) return <p className="p-4">Checking session…</p>

  if (data) {
    return (
      <>
        {children}
        <button
          className="fixed top-2 right-2 z-50 rounded bg-black/70 px-2 py-1 text-xs text-white"
          // Reload drops the socket and the in-memory peer id; the server also closes it on session delete.
          onClick={() => void client.signOut().then(() => location.reload())}
        >
          {data.user.email} · sign out
        </button>
      </>
    )
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email'))
    const password = String(f.get('password'))
    const res = mode === 'up'
      ? await client.signUp.email({ email, password, name: email })
      : await client.signIn.email({ email, password })
    setError(res.error?.message)
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mx-auto flex max-w-xs flex-col gap-2 p-6">
      <h1 className="text-lg font-semibold">{mode === 'in' ? 'Sign in' : 'Sign up'} (prototype)</h1>
      <input name="email" type="email" required placeholder="email" className="rounded border p-2" />
      <input name="password" type="password" required minLength={8} placeholder="password" className="rounded border p-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="rounded bg-black p-2 text-white">{mode === 'in' ? 'Sign in' : 'Sign up'}</button>
      <button type="button" className="text-sm underline" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
        {mode === 'in' ? 'No account? Sign up' : 'Have an account? Sign in'}
      </button>
    </form>
  )
}
