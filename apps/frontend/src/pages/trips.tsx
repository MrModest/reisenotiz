import { Suspense } from 'react'
import { useTrips } from '@/store'
import { Trips } from '@/components/trip/trips'
import { Loader } from '@/components/ui/loader'
import { PageHeader } from '@/components/layout/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function TripsPage() {
  useDocumentTitle('Trips')
  return (
    <>
      <PageHeader title='Trips' />
      <div className='min-h-0 flex-1 overflow-y-auto p-4'>
        <Suspense fallback={<Loader />}>
          <TripsContent />
        </Suspense>
      </div>
    </>
  )
}

function TripsContent() {
  const trips = useTrips()
  return <Trips trips={trips} />
}
