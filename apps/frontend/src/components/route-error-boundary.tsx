import { useEffect, useRef, type ReactNode } from 'react'
import { useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { useSyncStatus } from '@/hooks/use-sync-status'
import { isDocumentUnavailableError } from '@/store/automerge/document-unavailable'

export function RouteErrorBoundary() {
  const error = useRouteError()
  if (isDocumentUnavailableError(error)) return <NotSyncedYet />
  return <UnexpectedError error={error} />
}

function NotSyncedYet() {
  const status = useSyncStatus()
  const connected = status === 'synced' || status === 'syncing'
  const wasConnected = useRef(connected)
  const reloaded = useRef(false)

  // reload on the first transition to connected, at most once per mount, so a flapping
  // connection cannot loop
  useEffect(() => {
    if (connected && !wasConnected.current && !reloaded.current) {
      reloaded.current = true
      window.location.reload()
    }
    wasConnected.current = connected
  }, [connected])

  return (
    <ErrorScreen title='Not synced yet'>
      <p className='text-sm text-muted-foreground'>This trip hasn't reached this device yet.</p>
    </ErrorScreen>
  )
}

function UnexpectedError({ error }: { error: unknown }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorScreen title='Error'>
      <p className='text-sm text-muted-foreground'>Something went wrong on this screen.</p>
      <Button variant='outline' onClick={() => window.location.reload()}>Reload</Button>
    </ErrorScreen>
  )
}

function ErrorScreen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageHeader title={title} />
      <div className='flex min-h-0 flex-1 flex-col items-start gap-3 overflow-y-auto p-4'>{children}</div>
    </>
  )
}
