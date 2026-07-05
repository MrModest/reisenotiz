import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'
import { ROOT_DOC_KEY } from '@/store/automerge/root-doc'

export function RouteErrorBoundary() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : 'Something went wrong.'

  function handleResetLocalData() {
    localStorage.removeItem(ROOT_DOC_KEY)
    window.location.reload()
  }

  return (
    <div className='p-4 w-default flex flex-col gap-4 items-start'>
      <p className='text-sm text-muted-foreground'>{message}</p>
      <div className='flex gap-2'>
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button variant='destructive' onClick={handleResetLocalData}>
          Reset local data
        </Button>
      </div>
    </div>
  )
}
